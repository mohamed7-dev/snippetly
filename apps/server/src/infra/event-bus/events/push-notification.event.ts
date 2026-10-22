import { PushNotificationPayload } from '../../push-notification/push-notification.service';
import { AppEvent } from '../app-event';

export class PushNotificationEvent extends AppEvent {
    constructor(
        public readonly developerIds: string[],
        public readonly notificationPayload: PushNotificationPayload,
    ) {
        super();
    }
}
