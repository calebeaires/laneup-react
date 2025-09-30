import { R2 } from '@convex-dev/r2';
import { v } from 'convex/values';
import { components } from './_generated/api';
import { mutation } from './_generated/server';

export const r2 = new R2(components.r2);

export const upload = mutation({
	args: {
		projectId: v.id('projects')
	},
	handler: async (_, args) => {
		return r2.generateUploadUrl(
			`project/${args.projectId}/${crypto.randomUUID()}`
		);
	}
});

export const deleteByKey = mutation({
	args: {
		key: v.string()
	},
	handler: async (ctx, args) => {
		return await r2.deleteObject(ctx, args.key);
	}
});
