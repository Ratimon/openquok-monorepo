import type { PublicCreatePostDto } from "./dtos";

/** CLI/agent creates always flag posts for human review on the kanban board. */
export function withAgentCreatePayload<T extends PublicCreatePostDto>(payload: T): T & { isAgent: true } {
    return { ...payload, isAgent: true };
}
