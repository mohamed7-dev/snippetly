import { SelectSnippetDto } from "../snippets/select-snippet.dto";
import { SelectTagDto } from "../tags/select-tag.dto";
import { SelectUserDto } from "../user";
import { z } from "../zod";
import { SelectCollectionDto } from "./select-collection.dto";

export const CommonMutationSchema = SelectCollectionDto.omit({
  id: true,
  creatorId: true,
  oldSlugs: true,
  forkedFrom: true,
}).extend({
  creatorName: z.string(),
  forkedFrom: z.string().optional(),
});

export const collectionExample = {
  title: "React custom hooks",
  slug: "react-custom-hooks",
  description: "Collection of reactjs custom hooks",
  createdAt: new Date().toISOString() as unknown as Date,
  color: "#eee",
  isPrivate: false,
  allowForking: true,
  creatorName: "john_doe20",
};

export const CommonUserCollectionsSchema = z.object({
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
