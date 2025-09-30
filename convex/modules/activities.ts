import { v } from 'convex/values';
import { mutation } from '#/functions';

export const remove = mutation({
	args: {
		activityId: v.id('activities')
	},
	handler: async (ctx, args) => {
		return await ctx.db.delete(args.activityId);
	}
});
