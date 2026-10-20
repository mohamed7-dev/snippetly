import type { ComponentType } from 'react';

export type NotificationSeverity = 'error' | 'info' | 'warning';

export type NotificationActionContext<TResponse> = {
    data: TResponse;
    dismiss: () => void;
};

export type NotificationAction<TResponse> =
    | {
          label: string;
          onClick: (context: NotificationActionContext<TResponse>) => void | Promise<void>;
          component?: never;
      }
    | {
          label: string;
          onClick?: never;
          component: ComponentType<NotificationActionContext<TResponse>>;
      };

export type AppNotificationDefinition<TResponse = unknown> = {
    id: string;
    title: string | ((data: TResponse) => string);
    description?: string | ((data: TResponse) => string);
    severity: NotificationSeverity;
    recheckInterval: number | false;
    actions?: Array<NotificationAction<TResponse>>;
    check: () => TResponse | Promise<TResponse>;
    shouldShow: (data: TResponse) => boolean;
};
