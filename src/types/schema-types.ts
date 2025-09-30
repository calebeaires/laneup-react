import type { Doc, Id } from "convex/_generated/dataModel";
import type { Infer } from "convex/values";
import type {
  memberRoleArgs,
  projectCycleArgs,
  projectLabelArgs,
  projectModuleArgs,
  projectStatusArgs,
  projectStatusGroupArgs,
  reactionArgs,
  taskAttachmentArgs,
  taskDateRangeArgs,
  taskLinkArgs,
  taskPriorityArgs,
  taskPriorityValueArgs,
  viewGroupOption,
  viewSortOption,
} from "../../convex/schema.args";

export type _ProjectType = Partial<Doc<"projects">>;
export type _WorkspaceType = Partial<Doc<"workspaces">>;
export type _MemberType = Partial<Doc<"members">> & {
  user: _UserType;
};

export type _RelationType = Partial<Doc<"relations">>;
export type _ActivityType = Partial<Doc<"activities">>;
export type _CommentType = Partial<Doc<"comments">>;
export type _ReactionType = Infer<typeof reactionArgs>;

export type _TaskType = Partial<Doc<"tasks">>;
export type _TaskDateRangeType = Infer<typeof taskDateRangeArgs>;
export type _TaskPriorityValueType = Infer<typeof taskPriorityValueArgs>;
export type _TaskPriorityType = Infer<typeof taskPriorityArgs>;
export type _TaskAttachmentType = Infer<typeof taskAttachmentArgs>;
export type _TaskLinkType = Infer<typeof taskLinkArgs>;

export type _TaskDataType = {
  task: _TaskType;
  activities: _ActivityType[];
  comments: _CommentType[];
};

export type _ViewType = Partial<Doc<"views">>;
export type _ViewGroupOptionType = Infer<typeof viewGroupOption>;
export type _ViewSortOptionType = Infer<typeof viewSortOption>;
export type _UserType = Partial<Doc<"users">>;

export type _UserFavoriteType = Partial<Doc<"favorites">>;
export type _FavoriteType = Partial<Doc<"favorites">>;

export type _MemberRoleType = Infer<typeof memberRoleArgs>;
export type _InviteType = Partial<Doc<"invites">>;

export type _InviteWithMetadata = _InviteType & {
  workspace: _WorkspaceType;
  project: _ProjectType;
};

export type _InboxType = Partial<Doc<"inbox">>;

export type _ProjectLabelType = Infer<typeof projectLabelArgs>;
export type _ProjectStatusType = Infer<typeof projectStatusArgs>;
export type _ProjectStatusGroupType = Infer<typeof projectStatusGroupArgs>;
export type _ProjectModuleType = Infer<typeof projectModuleArgs>;
export type _ProjectCycleType = Infer<typeof projectCycleArgs>;
export type _ProjectFeatureType =
  | _ProjectStatusType
  | _ProjectLabelType
  | _ProjectModuleType
  | _ProjectCycleType;

export type ProjectId = Id<"projects">;
export type WorkspaceId = Id<"workspaces">;
export type MemberId = Id<"members">;
export type TaskId = Id<"tasks">;
export type ViewId = Id<"views">;
export type UserId = Id<"users">;
export type InviteId = Id<"invites">;
export type InboxId = Id<"inbox">;
export type ActivityId = Id<"activities">;
export type CommentId = Id<"comments">;
export type RelationId = Id<"relations">;
