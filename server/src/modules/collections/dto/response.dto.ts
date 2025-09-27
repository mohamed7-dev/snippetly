import z from "zod";
import { SelectCollectionDto } from "./select-collection.dto";
import { SelectUserDto } from "../../user/dto/select-user.dto";
import { SelectTagDto } from "../../tag/dto/select-tag.dto";
import { SelectSnippetDto } from "../../snippet/dto/select-snippet.dto";

//######################## Mutation #####################
const CommonMutationSchema = SelectCollectionDto.omit({
  id: true,
  creatorId: true,
  oldSlugs: true,
}).extend({
  creatorName: z.string(),
});

export const CreateCollectionResDto = CommonMutationSchema.omit({
  forkedFrom: true,
  updatedAt: true,
}).transform((val) => {
  const { createdAt, slug, ...rest } = val;
  return {
    ...rest,
    addedAt: createdAt,
    publicId: slug,
  };
});

export const UpdateCollectionResDto = CommonMutationSchema.transform((val) => {
  const { createdAt, updatedAt, slug, forkedFrom, ...rest } = val;
  return {
    ...rest,
    addedAt: createdAt,
    lastUpdatedAt: updatedAt,
    publicId: slug,
    isForked: !!forkedFrom,
  };
});

export const ForkCollectionResDto = CommonMutationSchema.omit({
  updatedAt: true,
}).transform((val) => {
  const { createdAt, forkedFrom, slug, ...rest } = val;
  return {
    ...rest,
    addedAt: createdAt,
    publicId: slug,
    isForked: !!forkedFrom,
  };
});

// ############################ Query ########################

// discover collections
export const DiscoverCollectionsResDto = z.array(
  SelectCollectionDto.omit({
    isPrivate: true,
    id: true,
    creatorId: true,
    forkedFrom: true,
    updatedAt: true,
    oldSlugs: true,
  })
    .extend({
      creator: SelectUserDto.pick({
        name: true,
        firstName: true,
        lastName: true,
        image: true,
      }),
      tags: z.array(SelectTagDto.pick({ name: true })),
      forkedCount: z.number(),
      snippetsCount: z.number(),
      snippets: z.array(
        SelectSnippetDto.pick({
          title: true,
          slug: true,
          language: true,
          createdAt: true,
        })
      ),
    })
    .transform((val) => {
      const {
        slug,
        creator: { name, ...creatorRes },
        createdAt,
        snippets,
        ...rest
      } = val;
      return {
        ...rest,
        addedAt: createdAt,
        publicId: slug,
        creator: {
          ...creatorRes,
          username: name,
          fullName: creatorRes.firstName.concat(" ", creatorRes.lastName),
        },
        snippets: snippets.map((snippet) => {
          const { slug, createdAt, ...rest } = snippet;
          return {
            ...rest,
            publicId: slug,
            addedAt: createdAt,
          };
        }),
      };
    })
);

// Common Schema
const UserCollectionsSchema = z.object({
  stats: z.object({
    totalCollections: z.number(),
    publicCollections: z.number(),
    totalSnippets: z.number(),
    forkedCollections: z.number(),
  }),
  collections: z.array(
    SelectCollectionDto.omit({
      id: true,
      creatorId: true,
      oldSlugs: true,
    }).extend({
      snippetsCount: z.number(),
      creator: SelectUserDto.pick({
        name: true,
        firstName: true,
        lastName: true,
        image: true,
      }),
      tags: z.array(SelectTagDto.pick({ name: true })),
      snippets: z.array(
        SelectSnippetDto.pick({
          title: true,
          slug: true,
          language: true,
          createdAt: true,
        })
      ),
    })
  ),
});

// Get Current User Collections (Owner)
export const GetCurrentUserCollectionsResDto = z.object({
  stats: UserCollectionsSchema.shape.stats,
  collections: z.array(
    UserCollectionsSchema.shape.collections.unwrap().transform((val) => {
      const {
        creator: { name, ...creatorRest },
        snippets,
        createdAt,
        slug,
        updatedAt,
        forkedFrom,
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
        snippets: snippets.map((snippet) => {
          const { slug, createdAt, ...rest } = snippet;
          return {
            ...rest,
            publicId: slug,
            addedAt: createdAt,
          };
        }),
      };
    })
  ),
});
export type GetCurrentUserCollectionsResDtoType = z.infer<
  typeof GetCurrentUserCollectionsResDto
>;

// Get Current User Collections (Public)
export const GetPublicUserCollectionsResDto = z.object({
  stats: UserCollectionsSchema.shape.stats,
  collections: z.array(
    UserCollectionsSchema.shape.collections
      .unwrap()
      .omit({
        forkedFrom: true,
        updatedAt: true,
        isPrivate: true,
      })
      .transform((val) => {
        const {
          creator: { name, ...creatorRest },
          snippets,
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
          snippets: snippets.map((snippet) => {
            const { slug, createdAt, ...rest } = snippet;
            return {
              ...rest,
              publicId: slug,
              addedAt: createdAt,
            };
          }),
        };
      })
  ),
});
export type GetPublicUserCollectionsResDtoType = z.infer<
  typeof GetPublicUserCollectionsResDto
>;

// Get Collection (Owner)

export const GetCollectionResDto = UserCollectionsSchema.shape.collections
  .unwrap()
  .extend({
    snippetsCount: z.number(),
  })
  .transform((val) => {
    const {
      creator: { name, ...creatorRest },
      snippets,
      createdAt,
      slug,
      updatedAt,
      forkedFrom,
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
      snippets: snippets.map((snippet) => {
        const { slug, createdAt, ...rest } = snippet;
        return {
          ...rest,
          publicId: slug,
          addedAt: createdAt,
        };
      }),
    };
  });
export type GetCollectionResDtoType = z.infer<typeof GetCollectionResDto>;

// Get Collection (Public)

export const GetPublicCollectionResDto = UserCollectionsSchema.shape.collections
  .unwrap()
  .omit({
    forkedFrom: true,
    updatedAt: true,
    isPrivate: true,
  })
  .extend({
    snippetsCount: z.number(),
  })
  .transform((val) => {
    const {
      creator: { name, ...creatorRest },
      snippets,
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
      snippets: snippets.map((snippet) => {
        const { slug, createdAt, ...rest } = snippet;
        return {
          ...rest,
          publicId: slug,
          addedAt: createdAt,
        };
      }),
    };
  });
export type GetPublicCollectionResDtoType = z.infer<
  typeof GetPublicCollectionResDto
>;
