import { serverEndpoints } from '@/lib/routes'
import type {
  GetCurrentUserResponseDtoType,
  LoginResponseDtoType,
  SignupResponseDtoType,
} from '@snippetly/common/dto'
import { http, HttpResponse } from 'msw'
import { setupServer } from 'msw/node'

export const handlers = [
  http.get('/api/v1/users/current', () =>
    HttpResponse.json(
      {
        status: 200,
        type: 'success',
        message: 'fetched',
        data: {
          profile: {
            name: 'mo_dev7',
            image: '/avatar.jpg',
            imageKey: '',
            createdAt: new Date(),
            updatedAt: new Date(),
            email: '',
            isPrivate: false,
            firstName: 'mohamed',
            lastName: 'shaban',
            bio: 'bio',
            emailVerifiedAt: null,
          },
          stats: {
            snippetsCount: 10,
            collectionsCount: 5,
            forkedSnippetsCount: 20,
            forkedCollectionsCount: 20,
            friendsCount: 20,
            friendsInboxCount: 20,
            friendsOutboxCount: 20,
          },
        },
      } satisfies GetCurrentUserResponseDtoType['success'],
      { status: 200 },
    ),
  ),

  http.put(serverEndpoints.login, () =>
    HttpResponse.json(
      {
        status: 200,
        type: 'success',
        message: 'authenticated successfully',
        data: {
          accessToken: 'mock-token',
          user: {
            createdAt: new Date(),
            updatedAt: new Date(),
            name: 'test_user',
            email: 'test@example.com',
            isPrivate: false,
            firstName: 'first',
            lastName: 'last',
            image: null,
            imageKey: null,
          },
        },
      } satisfies LoginResponseDtoType['success'],
      { status: 200 },
    ),
  ),

  http.put(serverEndpoints.signup, () =>
    HttpResponse.json(
      {
        status: 201,
        type: 'success',
        message: 'authenticated successfully',
        data: {
          accessToken: 'mock-token',
          user: {
            createdAt: new Date(),
            name: 'test_user',
            email: 'test@example.com',
            isPrivate: false,
            firstName: 'first',
            lastName: 'last',
            image: null,
            imageKey: null,
          },
        },
      } satisfies SignupResponseDtoType['success'],
      { status: 201 },
    ),
  ),
]

export const server = setupServer(...handlers)
