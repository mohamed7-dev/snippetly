export type AppJob =
    | {
          type: 'delete-developer-account';
          userId: string;
          deleteAfter: number;
      }
    | {
          type: 'copy-collection-snippets';
          sourceCollectionId: string;
          targetCollectionId: string;
          developerId: string;
      }
    | {
          type: 'notify-friends-of-published-snippet';
          authorId: string;
          snippetId: string;
      }
    | {
          type: 'notify-friendship-change';
          eventType: 'sent' | 'accepted' | 'cancelled' | 'rejected';
          requesterId: string;
          addresseeId: string;
          actorId: string;
      }
    | {
          type: 'send-account-welcome-email';
          userId: string;
      }
    | {
          type: 'send-account-goodbye-email';
          userId: string;
      };
