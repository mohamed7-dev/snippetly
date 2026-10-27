import z from 'zod';
import { InferDtoType, successResponse } from '../shared/common-schemas.js';

const pushSubscription = z.object({
    endpoint: z.string().url().max(2048),
    keys: z.object({
        p256dh: z.string().min(1).max(256),
        auth: z.string().min(1).max(256),
    }),
});

export const getPushNotificationPublicKeyDto = {
    output: z.object({
        publicKey: z.string().nullable(),
    }),
};

export const savePushNotificationSubscriptionDto = {
    input: pushSubscription,
    output: successResponse,
};

export const deletePushNotificationSubscriptionDto = {
    input: z.object({
        endpoint: z.string().url(),
    }),
    output: successResponse,
};

export type GetPushNotificationPublicKeyDtoType = InferDtoType<
    typeof getPushNotificationPublicKeyDto
>;
export type SavePushNotificationSubscriptionDtoType = InferDtoType<
    typeof savePushNotificationSubscriptionDto
>;
export type DeletePushNotificationSubscriptionDtoType = InferDtoType<
    typeof deletePushNotificationSubscriptionDto
>;
