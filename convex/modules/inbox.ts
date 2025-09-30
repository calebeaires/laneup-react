import { v } from 'convex/values';
import { mutation } from '#/functions';
import { isAuthenticated } from '#/helpers';
import { inboxArgs } from '#/schema.args';

export const remove = mutation({
	args: {
		inboxId: v.id('inbox')
	},
	handler: async (ctx, args) => {
		await isAuthenticated(ctx);

		return await ctx.db.delete(args.inboxId);
	}
});

export const toggleRead = mutation({
	args: {
		inboxId: v.id('inbox'),
		isRead: v.boolean()
	},
	handler: async (ctx, args) => {
		await isAuthenticated(ctx);

		return await ctx.db.patch(args.inboxId, {
			isRead: args.isRead,
			updatedAt: Date.now()
		});
	}
});

export const markAllAsRead = mutation({
	args: {
		projectId: v.id('projects')
	},
	handler: async (ctx, args) => {
		const user = await isAuthenticated(ctx);

		if (!user) return false;

		const inboxItems = await ctx.db
			.query('inbox')
			.withIndex('by_user_project', (q) =>
				q.eq('userId', user._id).eq('projectId', args.projectId)
			)
			.filter((q) => q.eq(q.field('isRead'), false))
			.collect();

		for (const inbox of inboxItems) {
			await ctx.db.patch(inbox._id, {
				isRead: true,
				updatedAt: Date.now()
			});
		}

		return true;
	}
});

export const archive = mutation({
	args: {
		inboxId: v.id('inbox')
	},
	handler: async (ctx, args) => {
		await isAuthenticated(ctx);

		return await ctx.db.patch(args.inboxId, {
			archive: true,
			updatedAt: Date.now()
		});
	}
});

export const unarchive = mutation({
	args: {
		inboxId: v.id('inbox')
	},
	handler: async (ctx, args) => {
		await isAuthenticated(ctx);

		return await ctx.db.patch(args.inboxId, {
			archive: false,
			updatedAt: Date.now()
		});
	}
});

export const snooze = mutation({
	args: {
		inboxId: v.id('inbox'),
		snoozeUntil: v.number() // timestamp
	},
	handler: async (ctx, args) => {
		await isAuthenticated(ctx);

		return await ctx.db.patch(args.inboxId, {
			snooze: args.snoozeUntil,
			updatedAt: Date.now()
		});
	}
});

export const update = mutation({
	args: inboxArgs,
	handler: async (ctx, args) => {
		await isAuthenticated(ctx);

		if (!args._id) return false;

		const { _id, ...updates } = args;
		return await ctx.db.patch(_id, {
			...updates,
			updatedAt: Date.now()
		});
	}
});
