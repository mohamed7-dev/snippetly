import { TagRepository } from "./tag.repository.js";
import { TagReadService } from "./tag-read.service.js";
export class TagService {
    TagRepository;
    TagReadService;
    constructor(){
        this.TagRepository = new TagRepository();
        this.TagReadService = new TagReadService();
    }
    async getPopularTags() {
        const result = await this.TagReadService.findPopularTags();
        return result;
    }
    async ensureTagsExistence(tags, addedBy) {
        const normalizedTags = tags.map((t)=>t.toLowerCase());
        const results = await Promise.all(normalizedTags.map(async (tagName)=>{
            const [tag] = await this.TagRepository.insert([
                {
                    name: tagName,
                    usageCount: 1,
                    addedBy
                }
            ]);
            return tag;
        }));
        return results;
    }
}
