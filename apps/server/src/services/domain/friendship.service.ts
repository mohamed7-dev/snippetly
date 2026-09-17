import {
    CurrentUserFriendsListDtoType,
    CurrentUserInboxListDtoType,
    CurrentUserOutboxListDtoType,
    FriendshipStatus,
} from '@snippetly/common/dto';
import { RequestContext } from '../../api/request-context/request-context';
import { isApiError } from '../../common/errors/api-error';
import { InvalidFriendshipActionError } from '../../common/errors/generated-developer-errors';
import { Friendship } from '../../entities/friendships/friendship.entity';
import { DatabaseService } from '../../infra/database/database.service';
import { Injectable } from '../../infra/ioc-container/injectable.decorator';
import { ListQueryBuilder } from '../helpers/list-query-builder/list-query-builder.service';

type FriendshipSendInput = {
    requesterId: string;
    addresseeId: string;
};

type FriendshipActionInput = {
    requesterId: string;
    addresseeId: string;
    actorId: string;
};

@Injectable()
export class FriendshipService {
    constructor(
        private readonly databaseService: DatabaseService,
        private readonly listQueryBuilder: ListQueryBuilder,
    ) {}

    public async sendFriendshipRequest(
        ctx: RequestContext,
        input: FriendshipSendInput,
    ): Promise<Friendship | InvalidFriendshipActionError> {
        const assertionResult = this.assertNotSelfRequest(input.requesterId, input.addresseeId);
        if (isApiError(assertionResult)) return assertionResult;

        const existingFriendship = await this.findFriendshipBetween(
            ctx,
            input.requesterId,
            input.addresseeId,
        );

        if (existingFriendship) {
            if (existingFriendship.status === FriendshipStatus.Pending) {
                return new InvalidFriendshipActionError({
                    reason: 'A pending friendship request already exists between these developers.',
                });
            }

            if (existingFriendship.status === FriendshipStatus.Accepted) {
                return new InvalidFriendshipActionError({
                    reason: 'This friendship has already been accepted.',
                });
            }

            existingFriendship.status = FriendshipStatus.Pending;
            existingFriendship.acceptedAt = null;
            existingFriendship.rejectedAt = null;
            existingFriendship.cancelledAt = null;

            return await this.databaseService.getRepository(ctx, Friendship).save(existingFriendship);
        }

        const repo = this.databaseService.getRepository(ctx, Friendship);
        const friendship = new Friendship({
            requester: { id: input.requesterId },
            addressee: { id: input.addresseeId },
            status: FriendshipStatus.Pending,
            acceptedAt: null,
            rejectedAt: null,
            cancelledAt: null,
        });

        return await repo.save(friendship);
    }

    public async acceptFriendshipRequest(
        ctx: RequestContext,
        input: FriendshipActionInput,
    ): Promise<Friendship | InvalidFriendshipActionError> {
        const assertionResult = this.assertNotSelfRequest(input.requesterId, input.addresseeId);
        if (isApiError(assertionResult)) return assertionResult;

        const friendship = await this.findFriendshipBetween(ctx, input.requesterId, input.addresseeId);

        if (!friendship) {
            return new InvalidFriendshipActionError({
                reason: 'Cannot accept a friendship request that does not exist.',
            });
        }

        if (friendship.addressee.id !== input.actorId) {
            return new InvalidFriendshipActionError({
                reason: 'Only the addressee of a friendship request can accept it.',
            });
        }

        if (friendship.status !== FriendshipStatus.Pending) {
            return new InvalidFriendshipActionError({
                reason: 'Only a pending friendship request can be accepted.',
            });
        }

        friendship.status = FriendshipStatus.Accepted;
        friendship.acceptedAt = new Date();
        friendship.rejectedAt = null;
        friendship.cancelledAt = null;

        return await this.databaseService.getRepository(ctx, Friendship).save(friendship);
    }

    public async rejectFriendshipRequest(
        ctx: RequestContext,
        input: FriendshipActionInput,
    ): Promise<Friendship | InvalidFriendshipActionError> {
        const assertionResult = this.assertNotSelfRequest(input.requesterId, input.addresseeId);
        if (isApiError(assertionResult)) return assertionResult;

        const friendship = await this.findFriendshipBetween(ctx, input.requesterId, input.addresseeId);

        if (!friendship) {
            return new InvalidFriendshipActionError({
                reason: 'Cannot reject a friendship request that does not exist.',
            });
        }

        if (friendship.addressee.id !== input.actorId) {
            return new InvalidFriendshipActionError({
                reason: 'Only the addressee of a friendship request can reject it.',
            });
        }

        if (friendship.status !== FriendshipStatus.Pending) {
            return new InvalidFriendshipActionError({
                reason: 'Only a pending friendship request can be rejected.',
            });
        }

        friendship.status = FriendshipStatus.Rejected;
        friendship.rejectedAt = new Date();
        friendship.cancelledAt = null;

        return await this.databaseService.getRepository(ctx, Friendship).save(friendship);
    }

    public async cancelFriendshipRequest(
        ctx: RequestContext,
        input: FriendshipActionInput,
    ): Promise<Friendship | InvalidFriendshipActionError> {
        const assertionResult = this.assertNotSelfRequest(input.requesterId, input.addresseeId);
        if (isApiError(assertionResult)) return assertionResult;

        const friendship = await this.findFriendshipBetween(ctx, input.requesterId, input.addresseeId);

        if (!friendship) {
            return new InvalidFriendshipActionError({
                reason: 'Cannot cancel a friendship request that does not exist.',
            });
        }

        if (friendship.requester.id !== input.actorId) {
            return new InvalidFriendshipActionError({
                reason: 'Only the requester can cancel a pending friendship request.',
            });
        }

        if (friendship.status !== FriendshipStatus.Pending) {
            return new InvalidFriendshipActionError({
                reason: 'Only a pending friendship request can be cancelled.',
            });
        }

        friendship.status = FriendshipStatus.Cancelled;
        friendship.cancelledAt = new Date();
        friendship.acceptedAt = null;
        friendship.rejectedAt = null;

        return await this.databaseService.getRepository(ctx, Friendship).save(friendship);
    }

    public async getCurrentUserFriends(
        ctx: RequestContext,
        userId: string,
        input: CurrentUserFriendsListDtoType['input'],
    ) {
        const qb = this.listQueryBuilder.build(Friendship, input, {
            ctx,
            where: [
                { requester: { id: userId }, status: FriendshipStatus.Accepted },
                { addressee: { id: userId }, status: FriendshipStatus.Accepted },
            ],
            relations: {
                requester: true,
                addressee: true,
            },
            orderBy: {
                updatedAt: 'DESC',
            },
        });
        const [items, itemsCount] = await qb.getManyAndCount();
        return { items, itemsCount };
    }

    public async getCurrentUserInbox(
        ctx: RequestContext,
        userId: string,
        input: CurrentUserInboxListDtoType['input'],
    ) {
        const qb = this.listQueryBuilder.build(Friendship, input, {
            ctx,
            where: {
                addressee: { id: userId },
                status: FriendshipStatus.Pending,
            },
            relations: {
                requester: true,
                addressee: true,
            },
            orderBy: {
                createdAt: 'DESC',
            },
        });
        const [items, itemsCount] = await qb.getManyAndCount();
        return { items, itemsCount };
    }

    public async getCurrentUserOutbox(
        ctx: RequestContext,
        userId: string,
        input: CurrentUserOutboxListDtoType['input'],
    ) {
        const qb = this.listQueryBuilder.build(Friendship, input, {
            ctx,
            where: {
                requester: { id: userId },
                status: FriendshipStatus.Pending,
            },
            relations: {
                requester: true,
                addressee: true,
            },
            orderBy: {
                createdAt: 'DESC',
            },
        });
        const [items, itemsCount] = await qb.getManyAndCount();
        return { items, itemsCount };
    }

    private async findFriendshipBetween(
        ctx: RequestContext,
        requesterId: string,
        addresseeId: string,
    ): Promise<Friendship | null> {
        const repo = this.databaseService.getRepository(ctx, Friendship);

        return repo.findOne({
            where: [
                {
                    requester: { id: requesterId },
                    addressee: { id: addresseeId },
                },
                {
                    requester: { id: addresseeId },
                    addressee: { id: requesterId },
                },
            ],
            relations: {
                requester: true,
                addressee: true,
            },
        });
    }

    private assertNotSelfRequest(requesterId: string, addresseeId: string) {
        if (requesterId === addresseeId) {
            return new InvalidFriendshipActionError({
                reason: 'A developer cannot send a friendship request to themselves.',
            });
        }
    }
}
