import { v } from 'convex/values';
import type { _MemberType, _ProjectType, _UserType, _ViewType } from '@/types';
import { query } from './_generated/server';
import { isAuthenticated } from './helpers';

// === CASCADING QUERIES APPROACH ===
// The space store now uses a cascading approach:
// 1. getUserMemberships (root query)
// 2. getWorkspacesByMemberships (from membership IDs)
// 3. getProjectsByWorkspaces (from workspace IDs)
// 4. getTasksByProjects (from project IDs)

// 1. Get user's workspace memberships (ROOT QUERY)
export const getUserMemberships = query({
	handler: async (ctx) => {
		const user = await isAuthenticated(ctx);

		if (!user) {
			return null;
		}

		const memberList: _MemberType[] = [];

		// Then get memberships by the user's _id
		const memberships = await ctx.db
			.query('members')
			.withIndex('by_user', (q) => q.eq('userId', user._id))
			.collect();

		for (const membership of memberships) {
			const user = (await ctx.db.get(membership.userId)) as _UserType;
			memberList.push({ ...membership, user });
		}

		return memberList as _MemberType[];
	}
});

// 2. Get workspaces where user is a member (LEGACY - use getWorkspacesByMemberships for cascading)
export const getUserWorkspaces = query({
	args: { userId: v.id('users') },
	handler: async (ctx, args) => {
		await isAuthenticated(ctx);

		const user = await ctx.db
			.query('users')
			.withIndex('by_id', (q) => q.eq('_id', args.userId))
			.first();

		if (!user) return [];

		// Then get memberships
		const memberships = await ctx.db
			.query('members')
			.withIndex('by_user', (q) => q.eq('userId', user._id))
			.collect();

		// Then get workspace details for each membership
		const workspaces = await Promise.all(
			memberships.map((membership) => ctx.db.get(membership.workspaceId))
		);

		// Filter out null results and return with membership info
		return workspaces.filter(Boolean).map((workspace, index) => ({
			...workspace,
			membershipRole: memberships[index].role,
			membershipId: memberships[index]._id
		}));
	}
});

// 3. Get all projects for user's workspaces (LEGACY - use cascade queries for better performance)
export const getUserProjects = query({
	args: { userId: v.id('users') },
	handler: async (ctx, args) => {
		await isAuthenticated(ctx);
		const user = await ctx.db
			.query('users')
			.withIndex('by_id', (q) => q.eq('_id', args.userId))
			.first();

		if (!user) return [];

		// Get user's memberships
		const memberships = await ctx.db
			.query('members')
			.withIndex('by_user', (q) => q.eq('userId', user._id))
			.collect();

		// Get all projects for these workspaces
		const allProjects = [];
		for (const membership of memberships) {
			const projects = await ctx.db
				.query('projects')
				.withIndex('by_workspace', (q) =>
					q.eq('workspaceId', membership.workspaceId)
				)
				.collect();
			allProjects.push(...projects);
		}

		return allProjects;
	}
});

// 4. Get all tasks for a specific workspace
export const getWorkspaceTasks = query({
	args: { workspaceId: v.union(v.id('workspaces'), v.null()) },
	handler: async (ctx, args) => {
		await isAuthenticated(ctx);
		// Get all projects in workspace

		if (!args.workspaceId) return [];

		const projects = await ctx.db
			.query('projects')
			.withIndex('by_workspace', (q) => q.eq('workspaceId', args.workspaceId))
			.collect();

		// Get all tasks for these projects
		const allTasks = [];
		for (const project of projects) {
			const tasks = await ctx.db
				.query('tasks')
				.withIndex('by_project', (q) => q.eq('projectId', project._id))
				.collect();
			allTasks.push(...tasks);
		}

		return allTasks;
	}
});

// === SINGLE CONTEXT QUERIES ===
export const getWorkspaceProjects = query({
	args: { workspaceId: v.union(v.id('workspaces'), v.null()) },
	handler: async (ctx, args) => {
		await isAuthenticated(ctx);
		if (!args.workspaceId) return [];

		return await ctx.db
			.query('projects')
			.withIndex('by_workspace', (q) => q.eq('workspaceId', args.workspaceId))
			.collect();
	}
});

export const getUserAccessibleProjects = query({
	args: { workspaceId: v.union(v.id('workspaces'), v.null()) },
	handler: async (ctx, args) => {
		console.log('projects', args.workspaceId);

		const user = await isAuthenticated(ctx);
		if (!args.workspaceId || !user) return [];

		// Get user's membership in this workspace
		const membership = await ctx.db
			.query('members')
			.withIndex('by_workspace_user', (q) =>
				q.eq('workspaceId', args.workspaceId).eq('userId', user._id)
			)
			.first();

		if (!membership) return []; // User not member of workspace

		// If member has specific projects, filter by those
		if (membership.projects && membership.projects.length > 0) {
			const projects = await Promise.all(
				membership.projects.map((projectId) => ctx.db.get(projectId))
			);

			return projects.filter(Boolean); // Remove null results
		}

		// If admin role, return all workspace projects
		if (membership.role === 'admin') {
			return (await ctx.db
				.query('projects')
				.withIndex('by_workspace', (q) => q.eq('workspaceId', args.workspaceId))
				.collect()) as _ProjectType[];
		}

		// Default: empty array for members without project access
		return [] as _ProjectType[];
	}
});

export const getProjectTasks = query({
	args: { projectId: v.union(v.id('projects'), v.null()) },
	handler: async (ctx, args) => {
		await isAuthenticated(ctx);
		if (!args.projectId) return [];

		return await ctx.db
			.query('tasks')
			.withIndex('by_project', (q) => q.eq('projectId', args.projectId))
			.collect();
	}
});

export const getProjectViews = query({
	args: {
		projectId: v.union(v.id('projects'), v.null()),
		userId: v.union(v.id('users'), v.null())
	},
	handler: async (ctx, args) => {
		const user = await isAuthenticated(ctx);
		if (!args.projectId || !user) return undefined;

		const result = [];

		const views = await ctx.db
			.query('views')
			.withIndex('by_project_type', (q) =>
				q.eq('projectId', args.projectId).eq('type', 'view')
			)
			.collect();

		if (views.length > 0) {
			result.push(...views);
		}

		const userView = await ctx.db
			.query('views')
			.withIndex('by_project_user_type', (q) =>
				q
					.eq('projectId', args.projectId)
					.eq('userId', user._id)
					.eq('type', 'user')
			)
			.first();

		if (userView) {
			result.unshift(userView);
		}

		return result as _ViewType;
	}
});

export const getWorkspaceMembers = query({
	args: {
		workspaceId: v.union(v.id('workspaces'), v.null()),
		includeRemoved: v.optional(v.boolean())
	},
	handler: async (ctx, args) => {
		await isAuthenticated(ctx);
		if (!args.workspaceId) return [];

		const members = await ctx.db
			.query('members')
			.withIndex('by_workspace', (q) => q.eq('workspaceId', args.workspaceId))
			.collect();

		// Filter by removed status if specified
		const filteredMembers = args.includeRemoved
			? members
			: members.filter((member) => !member.removed);

		// Fetch user info for each member
		const users = await Promise.all(
			filteredMembers.map((m) => ctx.db.get(m.userId))
		);

		// Combine member and user info
		return filteredMembers.map((member, i) => ({
			...member,
			user: users[i] // will be null if user not found
		}));
	}
});

// === OPTIMIZED CASCADE QUERIES (PREFERRED) ===

// Get workspaces by membership IDs (for cascading from memberships)
export const getWorkspacesByMemberships = query({
	args: { membershipIds: v.union(v.array(v.id('members')), v.null()) },
	handler: async (ctx, args) => {
		await isAuthenticated(ctx);

		if (!args?.membershipIds || args.membershipIds.length === 0) {
			return [];
		}

		const memberships = await Promise.all(
			args.membershipIds.map((id) => ctx.db.get(id))
		);

		const workspaces = await Promise.all(
			memberships
				.filter(Boolean)
				.map((membership) => ctx.db.get(membership.workspaceId))
		);

		const result = workspaces.filter(Boolean).map((workspace, index) => ({
			...workspace,
			membershipRole: memberships[index]?.role,
			membershipId: memberships[index]?._id
		}));

		return result;
	}
});

// Get projects by workspace IDs (for cascading from workspaces)
export const getProjectsByWorkspaces = query({
	args: { workspaceIds: v.union(v.array(v.id('workspaces')), v.null()) },
	handler: async (ctx, args) => {
		await isAuthenticated(ctx);
		if (!args.workspaceIds || args.workspaceIds.length === 0) return [];

		const allProjects = [];

		for (const workspaceId of args.workspaceIds) {
			const projects = await ctx.db
				.query('projects')
				.withIndex('by_workspace', (q) => q.eq('workspaceId', workspaceId))
				.collect();
			allProjects.push(...projects);
		}

		return allProjects;
	}
});

// Get tasks by project IDs (for cascading from projects)
export const getTasksByProjects = query({
	args: { projectIds: v.array(v.id('projects')) },
	handler: async (ctx, args) => {
		await isAuthenticated(ctx);
		if (args.projectIds.length === 0) return [];

		const allTasks = [];

		for (const projectId of args.projectIds) {
			const tasks = await ctx.db
				.query('tasks')
				.withIndex('by_project', (q) => q.eq('projectId', projectId))
				.collect();
			allTasks.push(...tasks);
		}

		return allTasks;
	}
});

// === OPTIMIZED BULK QUERY (Alternative approach) ===

// Get complete hierarchical data in one query (efficient but monolithic)
export const getUserHierarchicalData = query({
	args: { userId: v.id('users') },
	handler: async (ctx, args) => {
		await isAuthenticated(ctx);
		const user = await ctx.db
			.query('users')
			.withIndex('by_id', (q) => q.eq('_id', args.userId))
			.first();

		if (!user)
			return { memberships: [], workspaces: [], projects: [], tasks: [] };

		// Get memberships
		const memberships = await ctx.db
			.query('members')
			.withIndex('by_user', (q) => q.eq('userId', user._id))
			.collect();

		if (memberships.length === 0) {
			return { memberships: [], workspaces: [], projects: [], tasks: [] };
		}

		// Get all workspaces
		const workspaces = await Promise.all(
			memberships.map(async (membership) => {
				const workspace = await ctx.db.get(membership.workspaceId);
				return workspace
					? {
							...workspace,
							membershipRole: membership.role,
							membershipId: membership._id
						}
					: null;
			})
		);

		const validWorkspaces = workspaces.filter(Boolean);
		const workspaceIds = validWorkspaces.map((w) => w._id);

		// Get all projects for these workspaces
		const allProjects = [];
		for (const workspaceId of workspaceIds) {
			const projects = await ctx.db
				.query('projects')
				.withIndex('by_workspace', (q) => q.eq('workspaceId', workspaceId))
				.collect();
			allProjects.push(...projects);
		}

		// Get all tasks for these projects
		const allTasks = [];
		for (const project of allProjects) {
			const tasks = await ctx.db
				.query('tasks')
				.withIndex('by_project', (q) => q.eq('projectId', project._id))
				.collect();
			allTasks.push(...tasks);
		}

		return {
			memberships,
			workspaces: validWorkspaces,
			projects: allProjects,
			tasks: allTasks
		};
	}
});

// Get user favorites for a specific project (for cascading from user/project context)
export const getUserFavorites = query({
	args: { projectId: v.union(v.id('projects'), v.null()) },
	handler: async (ctx, args) => {
		const user = await isAuthenticated(ctx);
		if (!args.projectId) return [];

		return await ctx.db
			.query('favorites')
			.withIndex('by_user_project', (q) =>
				q.eq('userId', user._id).eq('projectId', args.projectId)
			)
			.collect();
	}
});

export const getUserInbox = query({
	args: {
		projectId: v.union(v.id('projects'), v.null())
	},
	handler: async (ctx, _args) => {
		const user = await isAuthenticated(ctx);
		if (!user) return [];

		if (!_args.projectId) {
			return [];
		}

		const inboxItems = await ctx.db
			.query('inbox')
			.withIndex('by_user_project', (q) =>
				q.eq('userId', user._id).eq('projectId', _args.projectId)
			)
			.collect();

		// Enrich inbox items with task data for better performance
		const enrichedItems = await Promise.all(
			inboxItems.map(async (item) => {
				if (item.referenceType === 'task' && item.referenceId) {
					const task = await ctx.db.get(item.referenceId);
					return {
						...item,
						task
					};
				}
				return item;
			})
		);

		return enrichedItems;
	}
});

export const getTaskWithData = query({
	args: {
		taskId: v.union(v.id('tasks'), v.null())
	},
	handler: async (ctx, args) => {
		if (!args.taskId) return null;

		await isAuthenticated(ctx);

		const task = await ctx.db.get(args.taskId);
		if (!task) return null;

		// Get activities for this task
		const activities = await ctx.db
			.query('activities')
			.withIndex('by_task', (q) => q.eq('taskId', args.taskId))
			.order('desc')
			.collect();

		// Get comments for this task
		const comments = await ctx.db
			.query('comments')
			.withIndex('by_task', (q) => q.eq('taskId', args.taskId))
			.order('desc')
			.collect();

		return {
			task,
			activities,
			comments
		};
	}
});

// === BULK QUERIES ===

// Get multiple users by IDs
export const getUsersByIds = query({
	args: { userIds: v.array(v.id('users')) },
	handler: async (ctx, args) => {
		if (args.userIds.length === 0) return [];
		const users = await Promise.all(args.userIds.map((id) => ctx.db.get(id)));
		return users.filter(Boolean);
	}
});

// Get multiple projects by IDs
export const getProjectsByIds = query({
	args: { projectIds: v.array(v.id('projects')) },
	handler: async (ctx, args) => {
		if (args.projectIds.length === 0) return [];
		const projects = await Promise.all(
			args.projectIds.map((id) => ctx.db.get(id))
		);
		return projects.filter(Boolean);
	}
});
