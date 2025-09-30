import { createClerkClient } from '@clerk/backend';
import { v } from 'convex/values';
import { action, mutation, query } from '#/_generated/server';
import { isAuthenticated } from '#/helpers';
import type { _UserType } from '@/types';

const clerkClient = createClerkClient({
	secretKey: process.env.CLERK_SECRET_KEY
});

// Upsert user data from Clerk
export const upsertUser = mutation({
	args: {
		clerkId: v.string(),
		email: v.optional(v.string()),
		name: v.optional(v.string()),
		firstName: v.optional(v.string()),
		lastName: v.optional(v.string()),
		imageUrl: v.optional(v.string())
	},
	handler: async (ctx, args) => {
		const userIdentity = await ctx.auth.getUserIdentity();

		if (!userIdentity) {
			throw new Error('Unauthorized - Please sign in');
		}

		if (!args.clerkId) {
			throw new Error('Unauthorized - Please sign in');
		}

		const now = Date.now();
		let user: _UserType;

		// Check if user already exists
		const existingUser = await ctx.db
			.query('users')
			.withIndex('by_provider_id', (q) => q.eq('clerkId', args.clerkId))
			.first();

		if (existingUser) {
			// only update if there is something different in args from existingUser
			if (
				existingUser.email !== args.email ||
				existingUser.name !== args.name ||
				existingUser.firstName !== args.firstName ||
				existingUser.lastName !== args.lastName ||
				existingUser.imageUrl !== args.imageUrl
			) {
				await ctx.db.patch(existingUser._id, {
					email: args.email,
					name: args.name,
					firstName: args.firstName,
					lastName: args.lastName,
					imageUrl: args.imageUrl,
					updatedAt: now
				});
			}

			user = existingUser;
		} else {
			// Create new user
			const userId = await ctx.db.insert('users', {
				clerkId: args.clerkId,
				name: args.name,
				email: args.email,
				firstName: args.firstName,
				lastName: args.lastName,
				imageUrl: args.imageUrl,
				createdAt: now,
				updatedAt: now
			});

			user = await ctx.db.get(userId);
		}

		const memberships = await ctx.db
			.query('members')
			.withIndex('by_user', (q) => q.eq('userId', user._id))
			.collect();

		return {
			user,
			hasMemberships: memberships.length > 0
		};
	}
});

export const updateUserMetadata = action({
	args: {
		clerkId: v.optional(v.string()),
		userId: v.optional(v.id('users'))
	},
	handler: async (ctx, args) => {
		const userIdentity = await ctx.auth.getUserIdentity();

		if (!userIdentity) {
			throw new Error('User not authenticated');
		}

		if (!userIdentity.publicMetadata || !userIdentity.publicMetadata._id) {
			try {
				await clerkClient.users.updateUserMetadata(args.clerkId, {
					publicMetadata: {
						_id: args.userId
					}
				});
			} catch (error) {
				console.error('Error updating user metadata:', error);
			}
		}
		return 'success';
	}
});

export const updateLastest = mutation({
	args: {
		_id: v.id('users'),
		lastProjectId: v.optional(v.id('projects')),
		lastWorkspaceId: v.optional(v.id('workspaces'))
	},
	handler: async (ctx, args) => {
		if (!args.lastProjectId && !args.lastWorkspaceId) {
			return;
		}

		await ctx.db.patch(args._id, {
			lastProjectId: args.lastProjectId,
			lastWorkspaceId: args.lastWorkspaceId
		});
	}
});

// Get current user data
export const getCurrentUser = query({
	handler: async (ctx) => {
		const user = await ctx.auth.getUserIdentity();

		if (!user) {
			return null;
		}

		const userData = await ctx.db
			.query('users')
			.withIndex('by_provider_id', (q) => q.eq('clerkId', user.subject))
			.first();

		return userData;
	}
});

export const getByProviderId = query({
	args: {
		providerId: v.optional(v.union(v.string(), v.null()))
	},
	handler: async (ctx, args) => {
		if (!args.providerId) {
			return null;
		}

		return await ctx.db
			.query('users')
			.withIndex('by_provider_id', (q) => q.eq('clerkId', args.providerId))
			.first();
	}
});

export const updateStripeCustomerId = mutation({
	args: {
		stripeCustomerId: v.optional(v.string())
	},
	handler: async (ctx, args) => {
		const user = await isAuthenticated(ctx);

		if (!user) {
			return;
		}

		if (!args.stripeCustomerId) {
			return;
		}

		await ctx.db.patch(user._id, {
			stripeCustomerId: args.stripeCustomerId
		});
	}
});
