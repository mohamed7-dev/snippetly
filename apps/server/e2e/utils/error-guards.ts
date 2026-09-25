import { ApiErrorGuard, createApiErrorGuard } from '@snippetly/testing';

export const authenticatedUserErrorGuard: ApiErrorGuard<{ id: string; identifier: string }> =
    createApiErrorGuard(input => input.id != null && input.identifier !== null);
