import { v } from 'convex/values';
import { mutation, query, triggers } from '#/functions';
import { isAuthenticated } from '#/helpers';
import { commentArgs, reactionArgs } from '#/schema.args';

export const create = mutation({
	args: commentArgs,
	handler: async (ctx, args) => {
		await isAuthenticated(ctx);
		return await ctx.db.insert('comments', {
			...args,
			mentions: args.mentions || [],
			reactions: args.reactions || [],
			attachments: args.attachments || [],
			isEdited: false,
			editedBy: null,
			createdAt: Date.now()
			// updatedAt: Date.now(),
		});
	}
});

export const get = query({
	args: {
		taskId: v.id('tasks')
	},
	handler: async (ctx, args) => {
		await isAuthenticated(ctx);
		return await ctx.db
			.query('comments')
			.withIndex('by_task', (q) => q.eq('taskId', args.taskId))
			.collect();
	}
});

export const update = mutation({
	args: {
		commentId: v.id('comments'),
		content: v.string(),
		reactions: v.optional(v.array(reactionArgs))
	},
	handler: async (ctx, args) => {
		await isAuthenticated(ctx);
		return await ctx.db.patch(args.commentId, {
			content: args.content,
			reactions: args.reactions,
			updatedAt: Date.now()
		});
	}
});

export const remove = mutation({
	args: {
		commentId: v.id('comments')
	},
	handler: async (ctx, args) => {
		await isAuthenticated(ctx);
		return await ctx.db.delete(args.commentId);
	}
});

triggers.register('comments', async (ctx, change) => {
	if (change.operation === 'delete') {
		// Patch all child comments (recursive)
		for await (const child of ctx.db
			.query('comments')
			.withIndex('by_parent', (q) => q.eq('parentId', change.id))) {
			await ctx.db.patch(child._id, {
				parentId: null
			});
		}
	}

	if (['insert', 'deleted'].includes(change.operation)) {
		const task = await ctx.db.get(change.newDoc.taskId);
		if (!task) return;

		const action = change.operation === 'insert' ? 'created' : change.operation;

		// Register activity for the task
		await ctx.db.insert('activities', {
			taskId: task._id,
			userId: task.updatedBy,
			projectId: task.projectId,
			action,
			payload: {
				type: action === 'created' ? 'added' : 'removed',
				prop: 'comment',
				value: null
			},
			createdAt: Date.now()
		});
	}
});
