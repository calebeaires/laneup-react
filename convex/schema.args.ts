import { v } from "convex/values";

// === VIEW HELPERS ARGS ===
export const viewGroupOption = v.union(
  v.literal("status"),
  v.literal("priority"),
  v.literal("userIds"),
  v.literal("label"),
  v.literal("project"),
  v.literal("module"),
  v.literal("cycle"),
  v.literal("none"),
  v.literal("dateRange"),
  v.null(),
);

export const viewSortOption = v.union(
  v.literal("priority"),
  v.literal("name"),
  v.literal("createdAt"),
  v.literal("updatedAt"),
  v.literal("dateRange"),
  v.null(),
);

const viewTagVisibilityOption = v.object({
  list: v.optional(v.array(viewGroupOption)),
  board: v.optional(v.array(viewGroupOption)),
  table: v.optional(v.array(viewGroupOption)),
  timeline: v.optional(v.array(viewGroupOption)),
});

const viewDisplay = v.object({
  groupBy: v.optional(viewGroupOption),
  subgroupBy: v.optional(viewGroupOption),
  sortBy: v.optional(viewSortOption),
  expandedGroups: v.optional(v.array(v.string())),
  tagsStacked: v.optional(v.boolean()),
  tagVisibility: v.optional(viewTagVisibilityOption),
});

const viewFilterBase = v.object({
  searchTerm: v.optional(v.string()),
  status: v.optional(v.array(v.string())),
  label: v.optional(v.array(v.string())),
  module: v.optional(v.array(v.string())),
  cycle: v.optional(v.array(v.string())),
  priority: v.optional(v.array(v.string())),
  userIds: v.optional(v.array(v.id("users"))),
});

const viewTabOption = v.union(
  v.literal("list"),
  v.literal("board"),
  v.literal("table"),
  v.literal("timeline"),
);

export const viewFilter = v.object({
  columnId: v.optional(v.string()),
  type: v.optional(v.string()),
  operator: v.optional(v.string()),
  values: v.optional(v.array(v.string())),
});

// === VIEW ARGS ===
export const viewArgs = v.object({
  _id: v.optional(v.id("views")),
  _creationTime: v.optional(v.number()),
  content: v.optional(
    v.object({
      display: v.optional(viewDisplay),
      filter: v.optional(viewFilterBase),
      filters: v.optional(v.array(viewFilter)),
      settings: v.optional(
        v.object({
          currentViewTab: v.optional(viewTabOption),
        }),
      ),
    }),
  ),
  type: v.optional(v.string()),
  projectId: v.optional(v.id("projects")),
  userId: v.optional(v.id("users")), // References users._id
  shared: v.optional(v.boolean()),
  name: v.optional(v.string()),
  description: v.optional(v.string()),
  createdAt: v.optional(v.number()),
  updatedAt: v.optional(v.number()),
});

// === TASK ARGS ===

export const taskDateRangeArgs = v.object({
  start: v.optional(v.string()), // ISO date string
  end: v.optional(v.string()), // ISO date string
});

export const taskPriorityValueArgs = v.union(
  v.literal("low"),
  v.literal("medium"),
  v.literal("high"),
  v.literal("urgent"),
  v.literal("none"),
  v.null(),
);

export const taskPriorityArgs = v.object({
  _id: v.optional(taskPriorityValueArgs),
  name: v.optional(v.string()),
  order: v.optional(v.number()),
  color: v.optional(v.string()),
  icon: v.optional(v.string()),
});
export const reactionArgs = v.object({
  userId: v.string(),
  emoji: v.string(),
});

export const taskAttachmentArgs = v.object({
  _id: v.optional(v.string()),
  url: v.string(),
  name: v.string(),
  size: v.optional(v.number()),
  type: v.optional(v.string()),
});

export const taskLinkArgs = v.object({
  _id: v.optional(v.string()),
  url: v.optional(v.string()),
  name: v.optional(v.string()),
});

export const taskArgs = v.object({
  _id: v.optional(v.id("tasks")),
  _creationTime: v.optional(v.number()),
  name: v.optional(v.string()),
  projectId: v.optional(v.id("projects")),
  related: v.optional(v.array(v.string())),
  status: v.optional(v.union(v.string(), v.null())),
  module: v.optional(v.union(v.string(), v.null())),
  parentId: v.optional(v.union(v.id("tasks"), v.null())),
  priority: v.optional(taskPriorityValueArgs),
  position: v.optional(v.number()),
  aliasId: v.optional(v.string()),
  label: v.optional(v.union(v.string(), v.null())),
  description: v.optional(v.string()),
  cycle: v.optional(v.union(v.string(), v.null())),
  userIds: v.optional(v.array(v.id("users"))),
  mentions: v.optional(v.array(v.id("users"))),
  updatedBy: v.optional(v.union(v.id("users"), v.null())), // References users.clerkId
  reactions: v.optional(v.array(reactionArgs)),
  links: v.optional(v.array(taskLinkArgs)),
  attachments: v.optional(v.array(taskAttachmentArgs)),
  dateRange: v.optional(taskDateRangeArgs),
  createdAt: v.optional(v.number()),
  updatedAt: v.optional(v.number()),
});

// === FAVORITE ARGS ===
export const userFavoriteArgs = v.object({
  _id: v.optional(v.id("favorites")),
  referenceId: v.optional(v.union(v.id("views"), v.string())),
  type: v.optional(
    v.union(v.literal("view"), v.literal("module"), v.literal("cycle")),
  ),
  userId: v.optional(v.id("users")),
  projectId: v.optional(v.id("projects")),
});

// === USER ARGS ===
export const userArgs = v.object({
  _id: v.optional(v.id("users")),
  _creationTime: v.optional(v.number()),
  clerkId: v.string(),
  email: v.optional(v.string()),
  name: v.optional(v.string()),
  firstName: v.optional(v.string()),
  lastName: v.optional(v.string()),
  imageUrl: v.optional(v.string()),
  language: v.optional(v.string()),
  lastProjectId: v.optional(v.id("projects")),
  lastWorkspaceId: v.optional(v.id("workspaces")),
  stripeCustomerId: v.optional(v.string()),
  createdAt: v.optional(v.number()),
  updatedAt: v.optional(v.number()),
});

// === WORKSPACE ARGS ===
export const workspaceArgs = v.object({
  _id: v.optional(v.id("workspaces")),
  _creationTime: v.optional(v.number()),
  name: v.string(),
  description: v.optional(v.string()),
  userId: v.id("users"),
  stripeSubscriptionId: v.optional(v.string()),
  plan: v.optional(v.string()),
  planMembers: v.optional(v.number()),
  planSeats: v.optional(v.number()),
  planBillingCycle: v.union(v.literal("monthly"), v.literal("yearly")),
  teams: v.optional(
    v.array(
      v.object({
        _id: v.optional(v.string()),
        name: v.string(),
        description: v.optional(v.string()),
        createdAt: v.optional(v.number()),
        updatedAt: v.optional(v.number()),
      }),
    ),
  ),
  createdAt: v.optional(v.number()),
  updatedAt: v.optional(v.number()),
});

// === PROJECT ARGS ===
export const projectLabelArgs = v.object({
  _id: v.optional(v.string()),
  name: v.string(),
  color: v.string(),
  description: v.string(),
  deleted: v.boolean(),
});

export const projectStatusGroupArgs = v.union(
  v.literal("backlog"),
  v.literal("todo"),
  v.literal("inProgress"),
  v.literal("done"),
  v.literal("cancelled"),
);

export const projectStatusArgs = v.object({
  _id: v.optional(v.string()),
  name: v.optional(v.string()),
  color: v.optional(v.string()),
  group: v.optional(projectStatusGroupArgs),
  deleted: v.boolean(),
});

export const projectModuleArgs = v.object({
  _id: v.string(),
  name: v.string(),
  description: v.string(),
  color: v.string(),
  deleted: v.boolean(),
});

export const projectCycleArgs = v.object({
  _id: v.optional(v.string()),
  name: v.optional(v.string()),
  description: v.optional(v.string()),
  startDate: v.optional(v.string()),
  endDate: v.optional(v.string()),
  leader: v.optional(v.string()),
  color: v.optional(v.string()),
  createdAt: v.optional(v.number()),
  updatedAt: v.optional(v.number()),
  deleted: v.optional(v.boolean()),
});

export const projectArgs = v.object({
  _id: v.optional(v.id("projects")),
  _creationTime: v.optional(v.number()),
  name: v.optional(v.string()),
  alias: v.optional(v.string()),
  aliasCount: v.optional(v.number()),
  icon: v.optional(v.string()),
  color: v.optional(v.string()),
  description: v.optional(v.string()),
  workspaceId: v.optional(v.id("workspaces")),
  label: v.optional(v.array(projectLabelArgs)),
  status: v.optional(v.array(projectStatusArgs)),
  module: v.optional(v.array(projectModuleArgs)),
  cycle: v.optional(v.array(projectCycleArgs)),
  storyPoints: v.optional(v.array(v.number())),
  createdAt: v.optional(v.number()),
  updatedAt: v.optional(v.number()),
});

// === MEMBER ARGS ===
export const memberRoleArgs = v.union(
  v.literal("admin"),
  v.literal("member"),
  v.literal("guest"),
);
export const memberArgs = v.object({
  _id: v.optional(v.id("members")),
  _creationTime: v.optional(v.number()),
  role: memberRoleArgs,
  projects: v.optional(v.array(v.id("projects"))),
  workspaceId: v.id("workspaces"),
  teams: v.optional(v.array(v.string())),
  userId: v.id("users"),
  createdAt: v.optional(v.number()),
  updatedAt: v.optional(v.number()),
  removed: v.optional(v.boolean()),
});

// === INVITE ARGS ===
export const inviteArgs = v.object({
  _id: v.optional(v.id("invites")),
  _creationTime: v.optional(v.number()),
  workspaceId: v.optional(v.id("workspaces")),
  projectId: v.optional(v.id("projects")),
  email: v.optional(v.string()),
  role: v.optional(memberRoleArgs),
  invitedBy: v.optional(v.id("users")),
  token: v.optional(v.string()),
  status: v.optional(
    v.union(
      v.literal("pending"),
      v.literal("accepted"),
      v.literal("declined"),
      v.literal("expired"),
    ),
  ),
  createdAt: v.optional(v.number()),
  expiresAt: v.optional(v.number()),
  acceptedAt: v.optional(v.number()),
  userId: v.optional(v.id("users")),
  message: v.optional(v.string()),
});

// === COMMENT ARGS ===
export const commentArgs = v.object({
  _id: v.optional(v.id("comments")),
  _creationTime: v.optional(v.number()),
  taskId: v.id("tasks"),
  userId: v.id("users"),
  content: v.optional(v.string()),
  parentId: v.optional(v.id("comments")),
  isEdited: v.optional(v.boolean()),
  editedBy: v.optional(v.union(v.id("users"), v.null())),
  attachments: v.optional(v.array(taskAttachmentArgs)),
  mentions: v.optional(v.array(v.string())),
  reactions: v.optional(v.array(reactionArgs)),
  createdAt: v.optional(v.number()),
  updatedAt: v.optional(v.number()),
});

// === ACTIVITY ARGS ===
export const activityArgs = v.object({
  _id: v.optional(v.id("activities")),
  _creationTime: v.optional(v.number()),
  userId: v.id("users"),
  action: v.string(),
  taskId: v.id("tasks"),
  projectId: v.id("projects"),
  payload: v.optional(
    v.object({
      prop: v.optional(v.string()),
      type: v.optional(
        v.union(
          v.literal("updated"),
          v.literal("added"),
          v.literal("removed"),
          v.null(),
        ),
      ),
      value: v.optional(v.any()),
    }),
  ),
  createdAt: v.optional(v.number()),
});

// === INBOX ARGS ===
export const inboxArgs = v.object({
  _id: v.optional(v.id("inbox")),
  _creationTime: v.optional(v.number()),
  userId: v.id("users"),
  action: v.optional(v.string()),
  feature: v.optional(v.string()),
  referenceId: v.optional(v.id("tasks")),
  referenceType: v.optional(v.string()),
  projectId: v.optional(v.id("projects")),
  message: v.optional(v.string()),
  isRead: v.optional(v.boolean()),
  snooze: v.optional(v.number()),
  archive: v.optional(v.boolean()),
  unsubscribe: v.optional(v.boolean()),
  createdAt: v.optional(v.number()),
  updatedAt: v.optional(v.number()),
});

// === RELATION ARGS ===
export const relationArgs = v.object({
  _id: v.optional(v.id("relations")),
  _creationTime: v.optional(v.number()),
  outgoingId: v.id("tasks"),
  incomingId: v.id("tasks"),
  type: v.union(
    v.literal("doc"),
    v.literal("subtask"),
    v.literal("waitingOn"),
    v.literal("blocking"),
  ),
  createdAt: v.optional(v.number()),
  updatedAt: v.optional(v.number()),
});
