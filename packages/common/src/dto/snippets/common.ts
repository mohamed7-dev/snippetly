import { SelectCollectionDto } from "../collections/select-collection.dto";
import { SelectTagDto } from "../tags/select-tag.dto";
import { SelectUserDto } from "../user";
import { z } from "../zod";
import { SelectSnippetDto } from "./select-snippet.dto";

export const snippetExample = {
  title: "useDebounce hook",
  slug: "use-debounce-hook",
  description: "custom react hook that debounces rendering",
  createdAt: new Date().toISOString() as unknown as Date,
  updatedAt: new Date().toISOString() as unknown as Date,
  isPrivate: false,
  allowForking: true,
  creatorName: "john_doe20",
  collectionSlug: "reactjs-hooks",
  oldSlugs: [],
  code: `{{code}}`,
  language: "typescript",
  note: "{{note}}",
  forkedFromSlug: null,
} satisfies Omit<
  z.infer<typeof SelectSnippetDto>,
  "creatorId" | "collectionId" | "id" | "forkedFrom"
> & {
  creatorName: string;
  collectionSlug: string;
  forkedFromSlug: string | null;
};

export const CommonSnippetMutationSchema = SelectSnippetDto.omit({
  id: true,
  oldSlugs: true,
  creatorId: true,
  collectionId: true,
  forkedFrom: true,
}).extend({
  collectionSlug: z.string(),
  creatorName: z.string(),
  forkedFromSlug: z.string().nullable(),
});

export const CommonUserSnippetsResSchema = SelectSnippetDto.omit({
  collectionId: true,
  creatorId: true,
  id: true,
  oldSlugs: true,
  forkedFrom: true,
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
  forkedFromSlug: z.string().nullish(),
});
