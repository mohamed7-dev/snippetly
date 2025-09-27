import z from "zod";
import { SelectSnippetDto } from "./select-snippet.dto.ts";
import { SelectTagDto } from "../../tag/dto/select-tag.dto.ts";
import { SelectUserDto } from "../../user/dto/select-user.dto.ts";
import { SelectCollectionDto } from "../../collections/dto/select-collection.dto.ts";

//####################### Mutate #######################
const CommonMutateSchema = SelectSnippetDto.omit({
  id: true,
  oldSlugs: true,
}).extend({
  collectionPublicId: z.string(),
  creatorName: z.string(),
});

export const CreateSnippetResDto = CommonMutateSchema.omit({
  updatedAt: true,
  forkedFrom: true,
}).transform((val) => {
  const {
    slug,
    createdAt,
    collectionId,
    creatorId,
    collectionPublicId,
    creatorName,
    ...rest
  } = val;
  return {
    ...rest,
    publicId: slug,
    addedAt: createdAt,
    collectionPublicId: collectionPublicId,
    creatorName: creatorName,
  };
});
export const UpdateSnippetResDto = CommonMutateSchema.transform((val) => {
  const {
    slug,
    createdAt,
    updatedAt,
    collectionId,
    creatorId,
    collectionPublicId,
    creatorName,
    forkedFrom,
    ...rest
  } = val;
  return {
    ...rest,
    publicId: slug,
    addedAt: createdAt,
    lastUpdatedAt: updatedAt,
    collectionPublicId: collectionPublicId,
    creatorName: creatorName,
    isForked: !!forkedFrom,
  };
});
export const ForkSnippetResDto = CommonMutateSchema;

//###################### Query ##########################
const BaseSnippetsCollectionSchema = z.object({
  snippet: SelectSnippetDto.omit({
    note: true,
    id: true,
    creatorId: true,
    oldSlugs: true,
  }).extend({
    tags: z.array(SelectTagDto.pick({ name: true })).catch([]),
    creator: SelectUserDto.pick({
      name: true,
      firstName: true,
      lastName: true,
      image: true,
    }),
  }),
  collection: SelectCollectionDto.pick({
    title: true,
    slug: true,
    color: true,
  }).transform((val) => {
    const { slug, ...rest } = val;
    return { publicId: slug, ...rest };
  }),
});

export const GetSnippetsByCollectionResDto = z.object({
  snippets: z.array(
    BaseSnippetsCollectionSchema.shape.snippet.transform((val) => {
      const {
        creator: { name, ...creatorRest },
        collectionId,
        createdAt,
        updatedAt,
        forkedFrom,
        slug,
        ...rest
      } = val;
      return {
        ...rest,
        publicId: slug,
        addedAt: createdAt,
        lastUpdatedAt: updatedAt,
        isForked: !!forkedFrom,
        creator: {
          ...creatorRest,
          username: name,
          fullName: creatorRest.firstName.concat(" ", creatorRest.lastName),
        },
      };
    })
  ),
  collection: BaseSnippetsCollectionSchema.shape.collection,
});

export const GetPublicSnippetsByCollectionResDto = z.object({
  snippets: z.array(
    BaseSnippetsCollectionSchema.shape.snippet
      .omit({ forkedFrom: true, isPrivate: true, updatedAt: true })
      .transform((val) => {
        const {
          creator: { name, ...creatorRest },
          collectionId,
          createdAt,
          slug,
          ...rest
        } = val;
        return {
          ...rest,
          publicId: slug,
          addedAt: createdAt,
          creator: {
            ...creatorRest,
            username: name,
            fullName: creatorRest.firstName.concat(" ", creatorRest.lastName),
          },
        };
      })
  ),
});

// Discover Snippets
export const DiscoverSnippetsResDto = z.array(
  SelectSnippetDto.pick({
    title: true,
    slug: true,
    code: true,
    language: true,
    allowForking: true,
    description: true,
    createdAt: true,
  })
    .extend({
      forkedCount: z.number(),
      creator: SelectUserDto.pick({
        name: true,
        firstName: true,
        lastName: true,
        image: true,
      }),
      collection: SelectCollectionDto.pick({
        title: true,
        slug: true,
        color: true,
      }),
      tags: z.array(SelectTagDto.pick({ name: true })),
    })
    .transform((val) => {
      const {
        creator: { name, ...restCreator },
        collection: { slug: collectionSlug, ...restCollection },
        createdAt,
        slug,
        ...rest
      } = val;
      return {
        ...rest,
        publicId: slug,
        addedAt: createdAt,
        creator: {
          ...restCreator,
          username: name,
          fullName: restCreator.firstName.concat(" ", restCreator.lastName),
        },
        collection: {
          ...restCollection,
          publicId: collectionSlug,
        },
      };
    })
);

// Shared Snippet Item
const CommonUserSnippetsSchema = SelectSnippetDto.omit({
  note: true,
  collectionId: true,
  creatorId: true,
  id: true,
  oldSlugs: true,
}).extend({
  forkedCount: z.number(),
  creator: SelectUserDto.pick({
    name: true,
    firstName: true,
    lastName: true,
    image: true,
  }),
  collection: SelectCollectionDto.pick({
    title: true,
    slug: true,
    color: true,
  }),
  tags: z.array(SelectTagDto.pick({ name: true })),
});

// Get Current User Snippets
export const GetCurrentUserSnippetsResDto = z.array(
  CommonUserSnippetsSchema.transform((val) => {
    const {
      creator: { name, ...restCreator },
      collection: { slug: collectionSlug, ...restCollection },
      createdAt,
      updatedAt,
      forkedFrom,
      slug,
      ...rest
    } = val;
    return {
      ...rest,
      publicId: slug,
      addedAt: createdAt,
      lastUpdatedAt: updatedAt,
      isForked: !!forkedFrom,
      creator: {
        ...restCreator,
        username: name,
        fullName: restCreator.firstName.concat(" ", restCreator.lastName),
      },
      collection: {
        ...restCollection,
        publicId: collectionSlug,
      },
    };
  })
);

// Get User Snippets
export const GetUserSnippetsResDto = z.array(
  CommonUserSnippetsSchema.omit({
    forkedFrom: true,
    updatedAt: true,
  }).transform((val) => {
    const {
      creator: { name, ...restCreator },
      collection: { slug: collectionSlug, ...restCollection },
      createdAt,
      slug,
      ...rest
    } = val;
    return {
      ...rest,
      publicId: slug,
      addedAt: createdAt,
      creator: {
        ...restCreator,
        username: name,
        fullName: restCreator.firstName.concat(" ", restCreator.lastName),
      },
      collection: {
        ...restCollection,
        publicId: collectionSlug,
      },
    };
  })
);

// Get Current User Friends Snippets
export const GetCurrentUserFriendsSnippetsResDto = z.array(
  CommonUserSnippetsSchema.omit({
    updatedAt: true,
    forkedFrom: true,
    isPrivate: true,
  }).transform((val) => {
    const {
      creator: { name, ...restCreator },
      collection: { slug: collectionSlug, ...restCollection },
      createdAt,
      slug,
      ...rest
    } = val;
    return {
      ...rest,
      publicId: slug,
      addedAt: createdAt,
      creator: {
        ...restCreator,
        username: name,
        fullName: restCreator.firstName.concat(" ", restCreator.lastName),
      },
      collection: {
        ...restCollection,
        publicId: collectionSlug,
      },
    };
  })
);

// Get Snippet
export const GetSnippetResDto = CommonUserSnippetsSchema.extend(
  SelectSnippetDto.pick({ note: true }).shape
).transform((val) => {
  const {
    creator: { name, ...restCreator },
    collection: { slug: collectionSlug, ...restCollection },
    createdAt,
    updatedAt,
    forkedFrom,
    slug,
    ...rest
  } = val;
  return {
    ...rest,
    publicId: slug,
    addedAt: createdAt,
    lastUpdatedAt: updatedAt,
    isForked: !!forkedFrom,
    creator: {
      ...restCreator,
      username: name,
      fullName: restCreator.firstName.concat(" ", restCreator.lastName),
    },
    collection: {
      ...restCollection,
      publicId: collectionSlug,
    },
  };
});

export const GetPublicSnippetResDto = CommonUserSnippetsSchema.omit({
  isPrivate: true,
  updatedAt: true,
  forkedFrom: true,
}).transform((val) => {
  const {
    creator: { name, ...restCreator },
    collection: { slug: collectionSlug, ...restCollection },
    createdAt,
    slug,
    ...rest
  } = val;
  return {
    ...rest,
    publicId: slug,
    addedAt: createdAt,
    creator: {
      ...restCreator,
      username: name,
      fullName: restCreator.firstName.concat(" ", restCreator.lastName),
    },
    collection: {
      ...restCollection,
      publicId: collectionSlug,
    },
  };
});
