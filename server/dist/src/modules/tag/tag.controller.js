import { TagService } from "./tag.service.js";
import { StatusCodes } from "http-status-codes";
import { GetPopularTagsResDto } from "./dto/response.dto.js";
import { InternalServerError } from "../../common/lib/exception.js";
export class TagController {
    TagService;
    constructor(){
        this.TagService = new TagService();
    }
    getPopularTags = async (_req, res)=>{
        const tags = await this.TagService.getPopularTags();
        const { success, data: parsedData } = GetPopularTagsResDto.safeParse(tags);
        if (!success) {
            throw new InternalServerError();
        }
        res.status(StatusCodes.OK).json({
            message: "Fetched successfully.",
            data: parsedData
        });
    };
}
