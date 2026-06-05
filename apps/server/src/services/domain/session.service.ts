import ms from 'ms';
import { randomBytes } from 'node:crypto';
import { EntitySubscriberInterface, InsertEvent, RemoveEvent, UpdateEvent } from 'typeorm';
import { RequestContext } from '../../api/request-context/request-context';
import { getUserPermissions } from '../../api/utils/get-user-permissions';
import { race } from '../../common/helpers/race';
import { SessionCacheEntry, SessionCacheStrategy } from '../../config/auth/session-cache-strategy.interface';
import { ConfigService } from '../../config/config.service';
import { Role } from '../../entities/role/role.entity';
import { Session } from '../../entities/session/session.entity';
import { User } from '../../entities/users/user.entity';
import { DatabaseService } from '../../infra/database/database.service';
import { Injectable } from '../../infra/ioc-container/injectable.decorator';

@Injectable()
export class SessionService implements EntitySubscriberInterface {
    private readonly sessionDurationInMs: number;
    private cache: SessionCacheStrategy;
    private readonly sessionCacheTimeoutMs = 50;

    constructor(
        private readonly databaseService: DatabaseService,
        private readonly configService: ConfigService,
    ) {
        const { sessionDuration } = configService.authOptions;
        this.sessionDurationInMs =
            typeof sessionDuration === 'string' ? ms(sessionDuration) : sessionDuration;
        this.cache = configService.authOptions.sessionCacheStrategy;
    }

    /** @internal */
    async afterInsert(event: InsertEvent<any>): Promise<any> {
        await this.clearSessionCacheOnDataChange(event);
    }

    /** @internal */
    async afterRemove(event: RemoveEvent<any>): Promise<any> {
        await this.clearSessionCacheOnDataChange(event);
    }

    /** @internal */
    async afterUpdate(event: UpdateEvent<any>): Promise<any> {
        await this.clearSessionCacheOnDataChange(event);
    }

    public async createSession(ctx: RequestContext, user: User, authStrategyName: string) {
        const authenticatedSession = new Session({
            token: await this.createToken(),
            invalidated: false,
            authenticationStrategy: authStrategyName,
            user,
            expiresAt: this.calculateExpiry(this.sessionDurationInMs),
        });
        const savedSession = await this.databaseService
            .getRepository(ctx, Session)
            .save(authenticatedSession);
        await race(this.cache.set(this.toCacheEntry(savedSession)), this.sessionCacheTimeoutMs);
        return savedSession;
    }

    /**
     * @description
     * Deletes all sessions for a user.
     */
    public async deleteSessionsByUser(ctx: RequestContext, user: User): Promise<void> {
        const userSessions = await this.databaseService
            .getRepository(ctx, Session)
            .find({ where: { user: { id: user.id } } });
        await this.databaseService.getRepository(ctx, Session).remove(userSessions);
        for (const session of userSessions) {
            await race(this.cache.delete(session.token), this.sessionCacheTimeoutMs);
        }
    }

    public async getSessionByToken(token: string): Promise<SessionCacheEntry | undefined> {
        let sessionCacheEntry = await race(this.cache.get(token), this.sessionCacheTimeoutMs);
        const isCacheStale = !!(sessionCacheEntry && sessionCacheEntry.cacheExpiry < Date.now() / 1000);
        const isSessionExpired = !!(sessionCacheEntry && sessionCacheEntry.sessionExpiry < new Date());

        if (!sessionCacheEntry || isCacheStale || isSessionExpired) {
            const validSession = await this.findValidSessionByToken(token);
            // the session(in db) exists, and not expired so we should update the cache
            if (validSession) {
                const sessionCacheEntry = this.toCacheEntry(validSession);
                await race(this.cache.set(sessionCacheEntry), this.sessionCacheTimeoutMs);
                return sessionCacheEntry;
            }
            return undefined;
        }
        return sessionCacheEntry;
    }

    private async findValidSessionByToken(token: string): Promise<Session | undefined> {
        const session = await this.databaseService.getRepository(Session).findOne({
            where: {
                token,
                invalidated: false,
            },
            relations: ['user', 'user.roles'],
        });

        if (session && session.expiresAt > new Date()) {
            await this.extendSessionExpiry(session);
            return session;
        }
        return undefined;
    }

    private toCacheEntry(session: Session) {
        const { sessionCacheTTL } = this.configService.authOptions;
        const sessionCacheTTLInS =
            typeof sessionCacheTTL === 'string' ? ms(sessionCacheTTL) / 1000 : sessionCacheTTL;

        const expiry = Date.now() / 1000 + sessionCacheTTLInS;
        const { user } = session;

        const sessionCacheEntry: SessionCacheEntry = {
            cacheExpiry: expiry,
            id: session.id,
            token: session.token,
            sessionExpiry: session.expiresAt,
            authStrategyName: session.authenticationStrategy,
            user: {
                id: user.id,
                identifier: user.identifier,
                isVerified: user.isVerified,
                permissions: getUserPermissions(user),
            },
        };
        return sessionCacheEntry;
    }

    private calculateExpiry(durationMs: number): Date {
        return new Date(Date.now() + durationMs);
    }

    private async createToken(): Promise<string> {
        return new Promise((resolve, reject) => {
            randomBytes(32, (err, buf) => {
                if (err) return reject(err);
                resolve(buf.toString('hex'));
            });
        });
    }

    /**
     * @description
     * Extends the expiry of a session if it's past halfway through its lifetime.
     */
    private async extendSessionExpiry(session: Session) {
        const now = Date.now();
        const isOverHalfDuration = session.expiresAt.getTime() - now < this.sessionDurationInMs / 2;
        if (isOverHalfDuration) {
            const newExpiryDate = this.calculateExpiry(this.sessionDurationInMs);
            session.expiresAt = newExpiryDate;
            await this.databaseService
                .getRepository(Session)
                .update({ id: session.id }, { expiresAt: newExpiryDate });
        }
    }

    private async clearSessionCacheOnDataChange(
        event: InsertEvent<any> | RemoveEvent<any> | UpdateEvent<any>,
    ) {
        if (event.entity) {
            // If Role changes, potentially all the cached permissions in the
            // session cache will be wrong, so we just clear the entire cache.
            if (event.entity instanceof Role) {
                await race(this.cache.clear(), this.sessionCacheTimeoutMs);
            }
        }
    }
}
