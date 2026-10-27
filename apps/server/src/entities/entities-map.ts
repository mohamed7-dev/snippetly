import { Administrator } from './administrator/administrator.entity';
import {
    AuthenticationMethod,
    ExternalAuthenticationMethod,
    NativeAuthenticationMethod,
} from './authentication-method/authentication-method.entity';
import { Collection } from './collections/collection.entity';
import { DeveloperPreferences } from './developer-preferences/developer-preferences.entity';
import { Developer } from './developer/developer.entity';
import { Favourite } from './favourites/favourite.entity';
import { Friendship } from './friendships/friendship.entity';
import { AppNotification } from './notifications/app-notification.entity';
import { PushSubscription } from './push-notifications/push-subscription.entity';
import { Role } from './role/role.entity';
import { Session } from './session/session.entity';
import { Snippet } from './snippets/snippet.entity';
import { Tag } from './tags/tag.entity';
import { User } from './users/user.entity';

export const entitiesMap = {
    User,
    Developer,
    DeveloperPreferences,
    Session,
    Role,
    AuthenticationMethod,
    NativeAuthenticationMethod,
    ExternalAuthenticationMethod,
    Friendship,
    Favourite,
    Collection,
    Snippet,
    PushSubscription,
    AppNotification,
    Tag,
    Administrator,
};

export type EntityNames = keyof typeof entitiesMap;
