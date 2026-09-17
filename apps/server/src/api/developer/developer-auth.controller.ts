import {
    authenticateDeveloperDto,
    AuthenticateDeveloperDtoType,
    changeEmailAddressDto,
    logoutDeveloperDto,
    LogoutDeveloperDtoType,
    Permission,
    refreshVerificationTokenDto,
    registerDeveloperAccountDto,
    requestEmailAddressChangeDto,
    requestPasswordResetDto,
    resetPasswordDto,
    updatePasswordDto,
    verifyAccountDto,
} from '@snippetly/common/dto';
import { Router } from 'express';
import { isApiError } from '../../common/errors/api-error';
import { ForbiddenError } from '../../common/errors/errors';
import { NativeAuthStrategyError } from '../../common/errors/generated-developer-errors';
import { AppRouter } from '../../common/types/app-router.interface';
import { ConfigService } from '../../config';
import { NATIVE_AUTH_STRATEGY_NAME } from '../../config/auth/native-auth.strategy';
import { Logger } from '../../infra';
import { Controller } from '../../infra/ioc-container/controller.decorator';
import { AdministratorService } from '../../services/domain/administrator.service';
import { AuthService } from '../../services/domain/auth.service';
import { DeveloperService } from '../../services/domain/developer.service';
import { UserService } from '../../services/domain/user.service';
import { CommonAuth } from '../common/common-auth';
import { authGuard } from '../middlewares/auth.guard';
import { defineRoutePipeline } from '../middlewares/define-router-pipeline.mw';
import { transactionInterceptor } from '../middlewares/transaction.interceptor';
import { setSessionToken } from '../utils/session-utils';

@Controller({
    path: 'developer/auth',
    version: 1,
})
export class DeveloperAuthController extends CommonAuth implements AppRouter {
    constructor(
        protected readonly authService: AuthService,
        protected readonly administratorService: AdministratorService,
        private readonly developerService: DeveloperService,
        private readonly userService: UserService,
        private readonly configService: ConfigService,
    ) {
        super(authService, administratorService);
    }

    initRoutes(router: Router): Router {
        router.post(
            '/accounts',
            ...defineRoutePipeline({
                before: [authGuard({ permissions: [Permission.Public] })],
                body: registerDeveloperAccountDto.input,
                response: registerDeveloperAccountDto.output,
                interceptors: [transactionInterceptor()],
                handler: async (req, res) => {
                    const result = await this.developerService.registerAccount(
                        req.getRequestContext(),
                        req.body,
                    );
                    if (isApiError(result)) return res.status(result.httpStatusCode).json(result);
                    res.status(200).json(result);
                },
            }),
        );
        router.patch(
            '/accounts/current',
            ...defineRoutePipeline({
                before: [authGuard({ permissions: [Permission.Owner] })],
                body: updatePasswordDto.input,
                response: updatePasswordDto.output,
                interceptors: [transactionInterceptor()],
                handler: async (req, res) => {
                    if (!req.getRequestContext().activeUserId) {
                        throw new ForbiddenError();
                    }
                    const result = await this.userService.updatePassword(req.getRequestContext(), {
                        ...req.body,
                        userId: req.getRequestContext().activeUserId!,
                    });
                    if (isApiError(result)) return res.status(result.httpStatusCode).json(result);
                    res.status(200).json({ success: result });
                },
            }),
        );

        router.post(
            '/sessions',
            ...defineRoutePipeline({
                before: [authGuard({ permissions: [Permission.Public] })],
                body: authenticateDeveloperDto.input,
                response: authenticateDeveloperDto.output,
                interceptors: [transactionInterceptor()],
                handler: async (req, res) => {
                    const result = (await this.sharedAuthenticate(
                        req.getRequestContext(),
                        req.body,
                        req,
                        res,
                    )) satisfies AuthenticateDeveloperDtoType['output'];
                    if (isApiError(result)) return res.status(result.httpStatusCode).json(result);
                    res.status(200).json(result);
                },
            }),
        );
        router.delete(
            '/sessions/current',
            ...defineRoutePipeline({
                before: [authGuard({ permissions: [Permission.Public] })],
                response: logoutDeveloperDto.output,
                interceptors: [transactionInterceptor()],
                handler: async (req, res, next) => {
                    const result = (await this.sharedLogout(
                        req.getRequestContext(),
                        req,
                        res,
                    )) satisfies LogoutDeveloperDtoType['output'];
                    if (isApiError(result)) return next(result);
                    res.status(200).json(result);
                },
            }),
        );

        router.post(
            '/verification-tokens',
            ...defineRoutePipeline({
                before: [authGuard({ permissions: [Permission.Public] })],
                body: refreshVerificationTokenDto.input,
                response: refreshVerificationTokenDto.output,
                interceptors: [transactionInterceptor()],
                handler: async (req, res) => {
                    const nativeAuthStrategyError = this.requireNativeAuthStrategy();
                    if (nativeAuthStrategyError) {
                        return nativeAuthStrategyError;
                    }
                    await this.developerService.refreshVerificationToken(req.getRequestContext(), req.body);
                    res.status(200).json({ success: true });
                },
            }),
        );

        router.post(
            '/account-verifications',
            ...defineRoutePipeline({
                before: [authGuard({ permissions: [Permission.Public] })],
                body: verifyAccountDto.input,
                response: verifyAccountDto.output,
                interceptors: [transactionInterceptor()],
                handler: async (req, res) => {
                    const nativeAuthStrategyError = this.requireNativeAuthStrategy();
                    if (nativeAuthStrategyError) {
                        return nativeAuthStrategyError;
                    }
                    const result = await this.developerService.verifyAccount(
                        req.getRequestContext(),
                        req.body,
                    );
                    if (isApiError(result)) {
                        return res.status(result.httpStatusCode).json(result);
                    }
                    const session = await this.authService.openAuthenticatedSession(
                        req.getRequestContext(),
                        result,
                        NATIVE_AUTH_STRATEGY_NAME,
                    );
                    if (isApiError(session)) {
                        // eslint-disable-next-line @typescript-eslint/only-throw-error
                        throw session;
                    }
                    setSessionToken({
                        req,
                        res,
                        rememberMe: true,
                        sessionToken: session.token,
                    });
                    res.status(200).json(this.clientSafeUser(session.user));
                },
            }),
        );

        router.post(
            '/account-email-address-change',
            ...defineRoutePipeline({
                before: [authGuard({ permissions: [Permission.Owner] })],
                body: requestEmailAddressChangeDto.input,
                response: requestEmailAddressChangeDto.output,
                interceptors: [transactionInterceptor()],
                handler: async (req, res) => {
                    const nativeAuthStrategyError = this.requireNativeAuthStrategy();
                    if (nativeAuthStrategyError) {
                        return nativeAuthStrategyError;
                    }
                    if (!req.getRequestContext().activeUserId) {
                        throw new ForbiddenError();
                    }
                    const passwordVerificationResult = await this.authService.verifyUserPassword(
                        req.getRequestContext(),
                        req.getRequestContext().activeUserId!,
                        req.body.password,
                    );

                    if (isApiError(passwordVerificationResult)) {
                        return res
                            .status(passwordVerificationResult.httpStatusCode)
                            .json(passwordVerificationResult);
                    }

                    const result = await this.developerService.requestEmailAddressChange(
                        req.getRequestContext(),
                        req.getRequestContext().activeUserId!,
                        req.body,
                    );
                    if (isApiError(result)) {
                        return res.status(result.httpStatusCode).json(result);
                    }

                    res.status(200).json({ success: result });
                },
            }),
        );

        router.patch(
            '/account-email-address-change',
            ...defineRoutePipeline({
                before: [authGuard({ permissions: [Permission.Owner] })],
                body: changeEmailAddressDto.input,
                response: changeEmailAddressDto.output,
                interceptors: [transactionInterceptor()],
                handler: async (req, res) => {
                    const nativeAuthStrategyError = this.requireNativeAuthStrategy();
                    if (nativeAuthStrategyError) {
                        return nativeAuthStrategyError;
                    }

                    const result = await this.developerService.changeEmailAddress(
                        req.getRequestContext(),
                        req.body,
                    );
                    if (isApiError(result)) {
                        return res.status(result.httpStatusCode).json(result);
                    }

                    res.status(200).json({ success: result });
                },
            }),
        );

        router.post(
            '/account-password-change',
            ...defineRoutePipeline({
                before: [authGuard({ permissions: [Permission.Public] })],
                body: requestPasswordResetDto.input,
                response: requestPasswordResetDto.output,
                interceptors: [transactionInterceptor()],
                handler: async (req, res) => {
                    const nativeAuthStrategyError = this.requireNativeAuthStrategy();
                    if (nativeAuthStrategyError) {
                        return nativeAuthStrategyError;
                    }

                    await this.developerService.requestPasswordReset(req.getRequestContext(), req.body);

                    res.status(200).json({ success: true });
                },
            }),
        );

        router.patch(
            '/account-password-change',
            ...defineRoutePipeline({
                before: [authGuard({ permissions: [Permission.Public] })],
                body: resetPasswordDto.input,
                response: resetPasswordDto.output,
                interceptors: [transactionInterceptor()],
                handler: async (req, res) => {
                    const nativeAuthStrategyError = this.requireNativeAuthStrategy();
                    if (nativeAuthStrategyError) {
                        return nativeAuthStrategyError;
                    }

                    const result = await this.developerService.resetPassword(
                        req.getRequestContext(),
                        req.body,
                    );
                    if (isApiError(result)) {
                        return res.status(result.httpStatusCode).json(result);
                    }

                    const authResult = await super.sharedAuthenticate(
                        req.getRequestContext(),
                        {
                            [NATIVE_AUTH_STRATEGY_NAME]: {
                                identifier: result.identifier,
                                password: req.body.newPassword,
                            },
                        },
                        req,
                        res,
                    );
                    if (isApiError(authResult) && authResult.code === 'NOT_VERIFIED_ACCOUNT_ERROR') {
                        return res.status(authResult.httpStatusCode).json(result);
                    }

                    if (isApiError(authResult)) {
                        // this should never happen
                        // eslint-disable-next-line @typescript-eslint/only-throw-error
                        throw authResult;
                    }

                    res.status(200).json(authResult);
                },
            }),
        );

        return router;
    }

    protected requireNativeAuthStrategy() {
        const { developerAuthenticationStrategies } = this.configService.authOptions;
        const nativeAuthStrategyIsConfigured = !!developerAuthenticationStrategies.find(
            strategy => strategy.name === NATIVE_AUTH_STRATEGY_NAME,
        );
        if (!nativeAuthStrategyIsConfigured) {
            const authStrategyNames = developerAuthenticationStrategies.map(s => s.name).join(', ');
            const errorMessage =
                'This API endpoint requires that the NativeAuthenticationStrategy be configured for the Developer API.\n' +
                `Currently the following AuthenticationStrategies are enabled: ${authStrategyNames}`;
            Logger.error(errorMessage);
            return new NativeAuthStrategyError();
        }
    }
}
