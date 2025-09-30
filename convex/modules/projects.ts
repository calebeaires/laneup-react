import { v } from 'convex/values';
import { api } from '#/_generated/api';
import { mutation, triggers } from '#/functions';
import { isAuthenticated } from '#/helpers';
import { projectArgs } from '#/schema.args';
import { projectDefaultStatus } from '@/lib';

export const create = mutation({
	args: projectArgs,
	handler: async (ctx, args) => {
		const user = await isAuthenticated(ctx);
		const defaultStatus = args.status || projectDefaultStatus;
		const projectId = await ctx.db.insert('projects', {
			...args,
			alias: args.alias || 'KEY',
			label: args.label || [],
			module: args.module || [],
			cycle: args.cycle || [],
			status: defaultStatus,
			aliasCount: 0,
			createdAt: Date.now(),
			updatedAt: Date.now()
		});

		if (!projectId) {
			throw new Error('Failed to create project');
		}

		const member = await ctx.db
			.query('members')
			.withIndex('by_workspace_user', (q) =>
				q.eq('workspaceId', args.workspaceId).eq('userId', user._id)
			)
			.first();

		if (member) {
			await ctx.db.patch(member._id, {
				projects: [...(member.projects || []), projectId]
			});
		}

		const defaultTasks = [
			{
				name: 'Welcome',
				description:
					'This is your first task. You can edit, delete, or create new tasks to get started.',
				projectId,
				status: defaultStatus[1]._id,
				priority: 'medium' as const,
				position: 1
			},
			{
				name: 'Organize your project',
				description:
					'Create modules, features, and tasks to organize your project.',
				projectId,
				status: defaultStatus[0]._id,
				priority: 'high' as const,
				position: 2
			},
			{
				name: 'Invite team members',
				description:
					'Collaborate with your team by inviting them to your workspace.',
				projectId,
				status: defaultStatus[1]._id,
				priority: 'low' as const,
				position: 3
			}
		];

		for (const taskData of defaultTasks) {
			await ctx.runMutation(api.modules.tasks.create, {
				taskData
			});
		}

		return projectId;
	}
});

export const update = mutation({
	args: projectArgs,
	handler: async (ctx, args) => {
		delete args.workspaceId;
		return await ctx.db.patch(args._id, args);
	}
});

export const remove = mutation({
	args: {
		projectId: v.id('projects')
	},
	handler: async (ctx, args) => {
		return await ctx.db.delete(args.projectId);
	}
});

triggers.register('projects', async (ctx, change) => {
	if (change.operation === 'delete') {
		// Delete views
		for await (const view of ctx.db
			.query('views')
			.withIndex('by_project_type', (q) => q.eq('projectId', change.id))) {
			await ctx.db.delete(view._id);
		}

		// Delete tasks
		for await (const task of ctx.db
			.query('tasks')
			.withIndex('by_project', (q) => q.eq('projectId', change.id))) {
			await ctx.db.delete(task._id);
		}

		// Delete invites
		for await (const invite of ctx.db
			.query('invites')
			.withIndex('by_project', (q) => q.eq('projectId', change.id))) {
			await ctx.db.delete(invite._id);
		}

		// Update members to remove this project from their projects
		for await (const member of await ctx.db
			.query('members')
			.withIndex('by_workspace', (q) =>
				q.eq('workspaceId', change.oldDoc.workspaceId)
			)
			.collect()) {
			if (member.projects?.includes(change.id)) {
				const updatedProjects = member.projects.filter(
					(id) => id !== change.id
				);
				await ctx.db.patch(member._id, {
					projects: updatedProjects,
					updatedAt: Date.now()
				});
			}
		}

		// Delete favorites
		for await (const favorite of await ctx.db
			.query('favorites')
			.withIndex('by_project', (q) => q.eq('projectId', change.id))
			.collect()) {
			await ctx.db.delete(favorite._id);
		}
	}
});
