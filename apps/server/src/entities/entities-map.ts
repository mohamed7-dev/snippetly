import { Administrator } from './administrator/administrator.entity';
import {
    AuthenticationMethod,
    CredentialsAuthenticationMethod,
    ExternalAuthenticationMethod,
} from './authentication-method/authentication-method.entity';
import { Collection } from './collections/collection.entity';
import { Developer } from './developer/developer.entity';
import { Friendship } from './friendships/friendship.entity';
import { Role } from './role/role.entity';
import { Session } from './session/session.entity';
import { Snippet } from './snippets/snippet.entity';
import { Tag } from './tags/tag.entity';
import { User } from './users/user.entity';

export const entitiesMap = {
    User,
    Developer,
    Session,
    Role,
    AuthenticationMethod,
    CredentialsAuthenticationMethod,
    ExternalAuthenticationMethod,
    Friendship,
    Collection,
    Snippet,
    Tag,
    Administrator,
};
