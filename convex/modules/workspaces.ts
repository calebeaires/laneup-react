import { v } from 'convex/values';
import Stripe from 'stripe';
import { api } from '#/_generated/api';
import { action } from '#/_generated/server';
import { mutation, query, triggers } from '#/functions';
import { useProjectDefault } from '@/lib';

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY);

export const getWorkspace = query({
	args: {
		workspaceId: v.id('workspaces')
	},
	handler: async (ctx, args) => await ctx.db.get(args.workspaceId)
});

export const create = mutation({
	args: {
		name: v.string(),
		description: v.string(),
		userId: v.id('users'),
		projectData: v.object({
			name: v.string(),
			description: v.optional(v.string()),
			alias: v.optional(v.string()),
			icon: v.optional(v.string()),
			color: v.optional(v.string())
		})
	},
	handler: async (ctx, args) => {
		const now = Date.now();

		// 1. Create workspace
		const workspaceId = await ctx.db.insert('workspaces', {
			name: args.name,
			description: args.description,
			userId: args.userId,
			createdAt: now,
			updatedAt: now,
			plan: 'free',
			planMembers: 1,
			planBillingCycle: 'monthly'
		});

		if (!workspaceId) {
			throw new Error('Failed to create workspace');
		}

		// 2. Create default project, and tasks
		const projectId = await ctx.runMutation(
			api.modules.projects.create,
			useProjectDefault({
				...args.projectData,
				workspaceId,
				createdAt: now,
				updatedAt: now
			})
		);

		// 2. Create member record (user as admin)
		await ctx.db.insert('members', {
			workspaceId,
			userId: args.userId,
			projects: [projectId],
			role: 'admin',
			createdAt: now,
			updatedAt: now
		});

		return workspaceId;
	}
});

export const update = mutation({
	args: {
		_id: v.id('workspaces'),
		name: v.optional(v.string()),
		description: v.optional(v.string())
	},
	handler: async (ctx, args) => {
		return await ctx.db.patch(args._id, args);
	}
});

export const remove = mutation({
	args: {
		workspaceId: v.id('workspaces')
	},
	handler: async (ctx, args) => {
		return await ctx.db.delete(args.workspaceId);
	}
});

export const updateWorkspacePlan = mutation({
	args: {
		workspaceId: v.id('workspaces'),
		stripeSubscriptionId: v.optional(v.string()),
		plan: v.string(),
		planMembers: v.number(),
		planSeats: v.number()
	},
	handler: async (ctx, args) => {
		return await ctx.db.patch(args.workspaceId, {
			stripeSubscriptionId: args.stripeSubscriptionId,
			plan: args.plan,
			planMembers: args.planMembers,
			planSeats: args.planSeats
		});
	}
});

export const createStripeSubscription = action({
	args: {
		workspaceId: v.id('workspaces')
	},
	handler: async (ctx, args) => {
		// user validation is done at the getCurrentUser
		const user = await ctx.runQuery(api.modules.user.getCurrentUser, {});

		let customerId = user.stripeCustomerId;

		if (!customerId) {
			const customer = await stripe.customers.create({
				// Add customer data here, e.g. email, name, metadata, etc.
				email: user.email,
				metadata: { _id: user._id }
			});

			customerId = customer.id;
		}

		await ctx.runMutation(api.modules.user.updateStripeCustomerId, {
			stripeCustomerId: customerId
		});

		// create a free subscription at stripe
		const subscription = await stripe.subscriptions.create({
			customer: customerId,
			items: [{ price: 'price_1S2aVSPWU4d0S3fABFMSijF2', quantity: 1 }],
			metadata: { workspaceId: args.workspaceId, _id: user._id },
			proration_behavior: 'create_prorations'
		});

		await ctx.runMutation(api.modules.workspaces.updateWorkspacePlan, {
			workspaceId: args.workspaceId,
			stripeSubscriptionId: subscription.id,
			plan: 'free',
			planMembers: 1,
			planSeats: 2
		});

		return subscription;
	}
});

export const updateStripeSubscription = action({
	args: {
		workspaceId: v.id('workspaces'),
		quantity: v.number(),
		billingCycle: v.union(v.literal('monthly'), v.literal('yearly'))
	},
	handler: async (ctx, args) => {
		const user = await ctx.runQuery(api.modules.user.getCurrentUser, {});
		const workspace = await ctx.runQuery(api.modules.workspaces.getWorkspace, {
			workspaceId: args.workspaceId
		});

		if (!workspace) throw new Error('Workspace not found');
		if (!workspace.stripeSubscriptionId)
			throw new Error('Workspace has no subscription');

		// Determine the price ID based on billing cycle
		const priceId =
			args.billingCycle === 'yearly'
				? 'price_1S1V5WPWU4d0S3fA3Fbwjqof'
				: 'price_1S1V5WPWU4d0S3fAxky6vxXC';

		// Get the current subscription
		const subscription = await stripe.subscriptions.retrieve(
			workspace.stripeSubscriptionId
		);

		try {
			// Try to update the existing subscription directly
			const updatedSubscription = await stripe.subscriptions.update(
				workspace.stripeSubscriptionId,
				{
					items: [
						{
							id: subscription.items.data[0].id, // Keep the same subscription item ID
							price: priceId,
							quantity: args.quantity
						}
					],
					proration_behavior: 'create_prorations' // Handle prorations automatically
				}
			);

			// Update workspace with new details
			await ctx.runMutation(api.modules.workspaces.updateWorkspacePlan, {
				workspaceId: args.workspaceId,
				stripeSubscriptionId: updatedSubscription.id, // Same ID, but updated
				plan: 'pro',
				planMembers: args.quantity,
				planSeats: args.quantity + 1
			});

			return { success: true, subscription: updatedSubscription };
		} catch (error: any) {
			// If update fails due to missing payment method, create checkout session
			if (
				error.code === 'invoice_payment_intent_requires_action' ||
				error.message?.includes('no attached payment source') ||
				error.message?.includes('default payment method')
			) {
				if (!user.stripeCustomerId)
					throw new Error('User has no Stripe customer ID');

				const checkoutSession = await stripe.checkout.sessions.create({
					customer: user.stripeCustomerId,
					mode: 'subscription',
					line_items: [
						{
							price: priceId,
							quantity: args.quantity
						}
					],
					success_url:
						'http://localhost:5231/workspace/billing?success=true&session_id={CHECKOUT_SESSION_ID}',
					cancel_url: 'http://localhost:5231/workspace/billing?canceled=true',
					metadata: {
						workspaceId: args.workspaceId,
						userId: user._id,
						oldSubscriptionId: workspace.stripeSubscriptionId
					}
				});

				return {
					success: false,
					requiresPayment: true,
					url: checkoutSession.url
				};
			}

			// Re-throw other errors
			throw error;
		}
	}
});

export const completeSubscriptionUpdate = action({
	args: {
		checkoutSessionId: v.string()
	},
	handler: async (ctx, args) => {
		const session = await stripe.checkout.sessions.retrieve(
			args.checkoutSessionId,
			{
				expand: ['subscription']
			}
		);

		if (!session.subscription || typeof session.subscription === 'string') {
			throw new Error('No subscription found in checkout session');
		}

		const workspaceId = session.metadata?.workspaceId;
		const oldSubscriptionId = session.metadata?.oldSubscriptionId;

		if (!workspaceId || !oldSubscriptionId) {
			throw new Error('Missing metadata in checkout session');
		}

		// Cancel the old subscription
		await stripe.subscriptions.cancel(oldSubscriptionId);

		// Update workspace with new subscription details
		await ctx.runMutation(api.modules.workspaces.updateWorkspacePlan, {
			workspaceId: workspaceId as any,
			stripeSubscriptionId: session.subscription.id,
			plan: 'pro', // Adjust based on your pricing logic
			planMembers: session.subscription.items.data[0]?.quantity || 1,
			planSeats: (session.subscription.items.data[0]?.quantity || 1) + 1
		});

		return { success: true };
	}
});

triggers.register('workspaces', async (ctx, change) => {
	if (change.operation === 'delete') {
		// Delete all projects
		for await (const project of ctx.db
			.query('projects')
			.withIndex('by_workspace', (q) => q.eq('workspaceId', change.id))) {
			await ctx.db.delete(project._id);
		}

		// Delete all members
		for await (const member of ctx.db
			.query('members')
			.withIndex('by_workspace', (q) => q.eq('workspaceId', change.id))) {
			await ctx.db.delete(member._id);
		}

		// Delete all invites
		for await (const invite of ctx.db
			.query('invites')
			.withIndex('by_workspace', (q) => q.eq('workspaceId', change.id))) {
			await ctx.db.delete(invite._id);
		}
	}
});
