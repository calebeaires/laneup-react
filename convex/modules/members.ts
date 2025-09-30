import { v } from 'convex/values';
import { isAuthenticated } from '#/helpers';
import { api } from '../_generated/api';
import { mutation } from '../_generated/server';

/**
 * Add a member to a project
 * This updates the member's projects array to include the new project
 */
export const addToProject = mutation({
	args: {
		memberId: v.id('members'),
		projectId: v.id('projects')
	},
	handler: async (ctx, args) => {
		await isAuthenticated(ctx);

		const member = await ctx.db.get(args.memberId);
		if (!member) throw new Error('Member not found');

		// Check if member already has this project
		const projects = member.projects || [];
		if (projects.includes(args.projectId)) {
			return member; // Already in project
		}

		// Add project to member's projects array
		await ctx.db.patch(args.memberId, {
			projects: [...projects, args.projectId],
			removed: false,
			updatedAt: Date.now()
		});

		return await ctx.db.get(args.memberId);
	}
});

/**
 * Remove a member from a project
 * This updates the member's projects array to exclude the project
 */
export const removeFromProject = mutation({
	args: {
		memberId: v.id('members'),
		projectId: v.id('projects')
	},
	handler: async (ctx, args) => {
		await isAuthenticated(ctx);

		const member = await ctx.db.get(args.memberId);
		if (!member) throw new Error('Member not found');

		// Remove project from member's projects array
		const projects = (member.projects || []).filter(
			(p) => p !== args.projectId
		);

		// If member has no more projects, consider deleting the member entirely
		if (projects.length === 0) {
			// For now, we'll keep the member but with empty projects
			// You may want to delete the member instead
		}

		await ctx.db.patch(args.memberId, {
			projects,
			updatedAt: Date.now()
		});

		return await ctx.db.get(args.memberId);
	}
});

/**
 * Remove a member from the workspace entirely
 */
export const removeFromWorkspace = mutation({
	args: {
		memberId: v.id('members')
	},
	handler: async (ctx, args) => {
		await isAuthenticated(ctx);

		// Remove the member record
		await ctx.db.patch(args.memberId, {
			removed: true,
			updatedAt: Date.now()
		});

		return { success: true };
	}
});

/**
 * Reactivate a removed member and optionally add to a project
 */
export const reactivateMember = mutation({
	args: {
		memberId: v.id('members'),
		projectId: v.optional(v.id('projects'))
	},
	handler: async (ctx, args) => {
		await isAuthenticated(ctx);

		const member = await ctx.db.get(args.memberId);
		if (!member) throw new Error('Member not found');

		const projects = member.projects || [];
		const updatedProjects =
			args.projectId && !projects.includes(args.projectId)
				? [...projects, args.projectId]
				: projects;

		// Reactivate member
		await ctx.db.patch(args.memberId, {
			removed: false,
			projects: updatedProjects,
			updatedAt: Date.now()
		});

		return await ctx.db.get(args.memberId);
	}
});

/**
 * Invite members to workspace and project
 * This is a wrapper around the invites.create function
 */
export const inviteToWorkspace = mutation({
	args: {
		emails: v.array(v.string()),
		workspaceId: v.id('workspaces'),
		projectId: v.id('projects'),
		role: v.union(v.literal('admin'), v.literal('member'), v.literal('guest')),
		message: v.optional(v.string())
	},
	handler: async (ctx, args) => {
		const user = await isAuthenticated(ctx);

		// Process each email
		const processedEmails = [];
		for (const email of args.emails) {
			// Check if user exists
			const existingUser = await ctx.db
				.query('users')
				.withIndex('by_email', (q) => q.eq('email', email))
				.first();

			if (existingUser) {
				// Check if user is already a member
				const existingMember = await ctx.db
					.query('members')
					.withIndex('by_workspace_user', (q) =>
						q.eq('workspaceId', args.workspaceId).eq('userId', existingUser._id)
					)
					.first();

				if (existingMember) {
					// User is already a member, just add to project if not already there
					const projects = existingMember.projects || [];
					if (!projects.includes(args.projectId)) {
						await ctx.runMutation(api.modules.members.addToProject, {
							memberId: existingMember._id,
							projectId: args.projectId
						});
					}
					processedEmails.push({
						email,
						status: 'added_to_project',
						memberId: existingMember._id
					});
				} else {
					// User exists but not a member, need to invite
					processedEmails.push({
						email,
						status: 'needs_invite'
					});
				}
			} else {
				// User doesn't exist, need to invite
				processedEmails.push({
					email,
					status: 'needs_invite'
				});
			}
		}

		// Create invites for emails that need inviting
		const emailsToInvite = processedEmails
			.filter((e) => e.status === 'needs_invite')
			.map((e) => e.email);

		if (emailsToInvite.length > 0) {
			const invites = emailsToInvite.map((email) => ({
				email,
				workspaceId: args.workspaceId,
				projectId: args.projectId,
				role: args.role,
				invitedBy: user._id,
				message: args.message
			}));

			await ctx.runMutation(api.modules.invites.create, { invites });
		}

		return processedEmails;
	}
});
