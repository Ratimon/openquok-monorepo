import type { Request, Response, NextFunction } from "express";
import type {
    ListingTagCreateSchemaType,
    ListingTagUpdateSchemaType,
    ListingTagGroupCreateSchemaType,
} from "../data/schemas/listingTagSchemas";
import { ListingTagService } from "../services/ListingTagService";
import { ListingTagDTOMapper } from "../utils/dtos/ListingTagDTO";
import { ListingTagGroupDTOMapper } from "../utils/dtos/ListingTagGroupDTO";

export class ListingTagController {
    constructor(private readonly listingTagService: ListingTagService) {}

    getActivePartialTags = async (_req: Request, res: Response, next: NextFunction): Promise<void> => {
        try {
            const data = await this.listingTagService.getActivePartialTags();
            res.status(200).json({ success: true, data: ListingTagDTOMapper.toDTOCollection(data) });
        } catch (err) {
            next(err);
        }
    };

    getActiveFullTags = async (_req: Request, res: Response, next: NextFunction): Promise<void> => {
        try {
            const data = await this.listingTagService.getActiveFullTags();
            res.status(200).json({ success: true, data: ListingTagDTOMapper.toDTOCollection(data) });
        } catch (err) {
            next(err);
        }
    };

    getAllFullTags = async (_req: Request, res: Response, next: NextFunction): Promise<void> => {
        try {
            const data = await this.listingTagService.getAllFullTags();
            res.status(200).json({ success: true, data: ListingTagDTOMapper.toDTOCollection(data) });
        } catch (err) {
            next(err);
        }
    };

    createTag = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
        try {
            const { tagData, tagGroupIds } = req.body as {
                tagData: ListingTagCreateSchemaType;
                tagGroupIds?: string[];
            };
            const result = await this.listingTagService.createTag(tagData, tagGroupIds ?? []);
            res.status(201).json({
                success: true,
                data: result,
                message: "Tag created successfully",
            });
        } catch (err) {
            next(err);
        }
    };

    updateTag = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
        try {
            const { tagId } = req.params as { tagId: string };
            const { tagData, tagGroupIds } = req.body as {
                tagData: ListingTagUpdateSchemaType;
                tagGroupIds?: string[];
            };
            tagData.id = tagId;
            const result = await this.listingTagService.updateTag(tagData, tagGroupIds ?? []);
            res.status(200).json({
                success: true,
                data: result,
                message: "Tag updated successfully",
            });
        } catch (err) {
            next(err);
        }
    };

    deleteTag = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
        try {
            const { tagId } = req.params as { tagId: string };
            await this.listingTagService.deleteTag(tagId);
            res.status(200).json({ success: true, message: "Tag deleted successfully" });
        } catch (err) {
            next(err);
        }
    };

    getAllTagGroups = async (_req: Request, res: Response, next: NextFunction): Promise<void> => {
        try {
            const tagGroups = await this.listingTagService.getAllTagGroups();
            res.status(200).json({
                success: true,
                data: ListingTagGroupDTOMapper.toDTOCollection(tagGroups),
            });
        } catch (err) {
            next(err);
        }
    };

    createTagGroup = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
        try {
            const { name } = req.body as ListingTagGroupCreateSchemaType;
            const tagGroup = await this.listingTagService.createTagGroup(name);
            const tagGroupDto = ListingTagGroupDTOMapper.toDTO(tagGroup);
            res.status(201).json({
                success: true,
                data: tagGroupDto,
                message: "Tag group created successfully",
            });
        } catch (err) {
            next(err);
        }
    };

    updateTagGroup = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
        try {
            const { tagGroupId } = req.params as { tagGroupId: string };
            const { name } = req.body as ListingTagGroupCreateSchemaType;
            const tagGroup = await this.listingTagService.updateTagGroup(tagGroupId, name);
            const tagGroupDto = ListingTagGroupDTOMapper.toDTO(tagGroup);
            res.status(200).json({
                success: true,
                data: tagGroupDto,
                message: "Tag group updated successfully",
            });
        } catch (err) {
            next(err);
        }
    };

    deleteTagGroup = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
        try {
            const { tagGroupId } = req.params as { tagGroupId: string };
            await this.listingTagService.deleteTagGroup(tagGroupId);
            res.status(200).json({ success: true, message: "Tag group deleted successfully" });
        } catch (err) {
            next(err);
        }
    };
}
