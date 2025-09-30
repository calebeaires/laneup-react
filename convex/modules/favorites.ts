import { v } from 'convex/values';
import { mutation } from '#/functions';
import { isAuthenticated } from '#/helpers';
import { userFavoriteArgs } from '#/schema.args';

export const remove = mutation({
	args: {
		favoriteId: v.id('favorites')
	},
	handler: async (ctx, args) => {
		await isAuthenticated(ctx);
		await ctx.db.delete(args.favoriteId);
	}
});

export const toggleFavorite = mutation({
	args: userFavoriteArgs,
	handler: async (ctx, args) => {
		const user = await isAuthenticated(ctx);

		if (args._id) {
			await ctx.db.delete(args._id);
		} else {
			await ctx.db.insert('favorites', {
				...args,
				userId: user._id
			});
		}
	}
});
