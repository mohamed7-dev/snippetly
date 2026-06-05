import { TagRepository } from "./tag.repository";
import { TagReadService } from "./tag-read.service";

export class TagService {
  private readonly TagRepository: TagRepository;
  private readonly TagReadService: TagReadService;

  constructor() {
    this.TagRepository = new TagRepository();
    this.TagReadService = new TagReadService();
  }

  async getPopularTags() {
    const result = await this.TagReadService.findPopularTags();
    return result;
  }

  async ensureTagsExistence(tags: string[], addedBy: number) {
    const normalizedTags = tags.map((t) => t.toLowerCase());

    const results = await Promise.all(
      normalizedTags.map(async (tagName) => {
        const [tag] = await this.TagRepository.insert([
          {
            name: tagName,
            usageCount: 1, // initial count
            addedBy,
          },
        ]);

        return tag;
      })
    );

    return results;
  }
}
