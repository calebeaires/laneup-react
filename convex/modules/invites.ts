import type { Doc } from 'convex/_generated/dataModel';
import { v } from 'convex/values';
import { isAuthenticated } from '#/helpers';
import { inviteArgs } from '#/schema.args';
import {
	_InviteType,
	type _InviteWithMetadata,
	_ProjectType,
	_WorkspaceType
} from '@/types';
import { mutation, query } from '../_generated/server';

export const create = mutation({
	args: {
		invites: v.array(inviteArgs)
	},
	handler: async (ctx, args) => {
		const invitedByUser = await isAuthenticated(ctx);

		if (!args.invites || args.invites.length === 0) {
			throw new Error('No invites provided');
		}

		const inviteList = [];
		for (const invite of args.invites) {
			// Always set invitedBy to current user
			invite.invitedBy = invitedByUser._id;

			// Check if user exists by email
			const user = await ctx.db
				.query('users')
				.withIndex('by_email', (q) => q.eq('email', invite.email))
				.first();

			if (user?._id) {
				// Check if user is already a member of the project
				const member = await ctx.db
					.query('members')
					.withIndex('by_workspace_user', (q) =>
						q.eq('workspaceId', invite.workspaceId).eq('userId', user._id)
					)
					.first();
				const isProjectMember = member?.projects?.includes(invite.projectId);

				if (!isProjectMember) {
					// Check if invite already exists for this project/email
					const existingInvite = await ctx.db
						.query('invites')
						.withIndex('by_email', (q) => q.eq('email', invite.email))
						.collect();
					const alreadyInvited = existingInvite.some(
						(i) => i.projectId === invite.projectId
					);
					if (!alreadyInvited) {
						inviteList.push(invite);
					}
				}
			} else {
				// User does not exist, just add invite
				inviteList.push(invite);
			}
		}

		const createdInvites = [];
		for (const invite of inviteList) {
			// Generate a token for the invite
			const now = Date.now();
			const inviteDoc = {
				...invite,
				status: 'pending' as const,
				createdAt: now,
				expiresAt: now + 1000 * 60 * 60 * 24 * 7 // 7 days
			};
			const inviteId = await ctx.db.insert('invites', inviteDoc);
			createdInvites.push(await ctx.db.get(inviteId));
		}

		return createdInvites;
	}
});

export const get = query({
	args: { workspaceId: v.id('workspaces') },
	handler: async (ctx, args) => {
		return await ctx.db
			.query('invites')
			.withIndex('by_workspace', (q) => q.eq('workspaceId', args.workspaceId))
			.collect()
			.then((invites) => invites.filter((i) => i.status === 'pending'));
	}
});

export const getByUserEmail = query({
	args: { email: v.string() },
	handler: async (ctx, args) => {
		await isAuthenticated(ctx);
		if (!args.email) return null;

		const invites = await ctx.db
			.query('invites')
			.withIndex('by_email', (q) => q.eq('email', args.email))
			.collect();

		const inviteReferences: _InviteWithMetadata[] = [];

		for (const invite of invites.filter((i) => i.status === 'pending')) {
			const workspace = await ctx.db.get(invite.workspaceId);
			const project = await ctx.db.get(invite.projectId);

			inviteReferences.push({
				...invite,
				workspace,
				project
			});
		}

		return inviteReferences;
	}
});

export const accept: ReturnType<typeof mutation> = mutation({
	args: { _id: v.id('invites') },
	handler: async (ctx, args): Promise<Doc<'members'> | null> => {
		const user = await isAuthenticated(ctx);

		// 1. Get invite
		const invite = await ctx.db.get(args._id);
		if (!invite) throw new Error('Invite not found');

		// 2. Check if already accepted/declined/expired
		if (invite.status === 'accepted')
			throw new Error('Invite already accepted');
		if (invite.status === 'declined') throw new Error('Invite was declined');
		if (invite.expiresAt && invite.expiresAt < Date.now())
			throw new Error('Invite has expired');

		// 4. Check if user is already a member of the workspace
		const existingMember = await ctx.db
			.query('members')
			.withIndex('by_workspace_user', (q) =>
				q.eq('workspaceId', invite.workspaceId).eq('userId', user._id)
			)
			.first();

		let memberId;
		if (existingMember) {
			// If already a member, add project to projects if not present
			const projects = existingMember.projects || [];
			if (!projects.includes(invite.projectId)) {
				await ctx.db.patch(existingMember._id, {
					userId: existingMember.userId,
					workspaceId: existingMember.workspaceId,
					role: existingMember.role,
					projects: [...projects, invite.projectId],
					updatedAt: Date.now()
				});
			}
			memberId = existingMember._id;
		} else {
			// Create new member
			memberId = await ctx.db.insert('members', {
				workspaceId: invite.workspaceId,
				userId: user._id,
				role: invite.role,
				projects: [invite.projectId],
				createdAt: Date.now(),
				updatedAt: Date.now()
			});
		}

		// 5. Update invite status
		await ctx.db.patch(invite._id, {
			status: 'accepted',
			acceptedAt: Date.now(),
			userId: user._id
		});

		// 6. Return the member
		return await ctx.db.get(memberId);
	}
});

export const remove = mutation({
	args: {
		inviteId: v.id('invites')
	},
	handler: async (ctx, args) => {
		return await ctx.db.delete(args.inviteId);
	}
});
