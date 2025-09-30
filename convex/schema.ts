import { defineSchema, defineTable } from 'convex/server';
import {
	activityArgs,
	commentArgs,
	inboxArgs,
	inviteArgs,
	memberArgs,
	projectArgs,
	relationArgs,
	taskArgs,
	userArgs,
	userFavoriteArgs,
	viewArgs,
	workspaceArgs
} from './schema.args';

export default defineSchema({
	users: defineTable(userArgs)
		.index('by_email', ['email'])
		.index('by_provider_id', ['clerkId']),
	favorites: defineTable(userFavoriteArgs)
		.index('by_project', ['projectId'])
		.index('by_user_project', ['userId', 'projectId']),
	workspaces: defineTable(workspaceArgs)
		.index('by_user', ['userId'])
		.index('by_creation', ['createdAt']),
	projects: defineTable(projectArgs)
		.index('by_workspace', ['workspaceId'])
		.index('by_creation', ['createdAt']),
	tasks: defineTable(taskArgs)
		.index('by_project', ['projectId'])
		.index('by_parent', ['parentId'])
		.index('by_status', ['status'])
		.index('by_priority', ['priority'])
		.index('by_userIds', ['userIds'])
		.index('by_creation', ['createdAt']),
	members: defineTable(memberArgs)
		.index('by_workspace_user', ['workspaceId', 'userId'])
		.index('by_workspace', ['workspaceId'])
		.index('by_user', ['userId']),
	invites: defineTable(inviteArgs)
		.index('by_workspace', ['workspaceId'])
		.index('by_project', ['projectId'])
		.index('by_user', ['userId'])
		.index('by_email', ['email']),
	comments: defineTable(commentArgs)
		.index('by_task', ['taskId'])
		.index('by_user', ['userId'])
		.index('by_parent', ['parentId'])
		.index('by_creation', ['createdAt']),
	activities: defineTable(activityArgs)
		.index('by_task', ['taskId'])
		.index('by_project', ['projectId'])
		.index('by_user', ['userId'])
		.index('by_creation', ['createdAt']),
	inbox: defineTable(inboxArgs)
		.index('by_user_project', ['userId', 'projectId'])
		.index('by_reference', ['referenceId'])
		.index('by_read_status', ['isRead'])
		.index('by_creation', ['createdAt']),
	relations: defineTable(relationArgs)
		.index('by_outgoing', ['outgoingId'])
		.index('by_incoming', ['incomingId'])
		.index('by_type', ['type'])
		.index('by_creation', ['createdAt']),
	views: defineTable(viewArgs)
		.index('by_project_type', ['projectId', 'type'])
		.index('by_project_user_type', ['projectId', 'userId', 'type'])
});
