import type { Id } from 'convex/_generated/dataModel';
import { v } from 'convex/values';
import type { MutationCtx, QueryCtx } from '#/_generated/server';
import { mutation, query, triggers } from '#/functions';
import { getMentionedUsers, isAuthenticated } from '#/helpers';
import type { _TaskDataType } from '@/types';
import { taskArgs } from '../schema.args';

// Export the inferred type
export const remove = mutation({
	args: {
		taskId: v.id('tasks')
	},
	handler: async (ctx, args) => {
		await isAuthenticated(ctx);
		return await ctx.db.delete(args.taskId);
	}
});

// create task
export const create = mutation({
	args: {
		taskData: taskArgs
	},
	handler: async (ctx, args) => {
		const user = await isAuthenticated(ctx);

		let aliasId = args.taskData.aliasId;

		// Generate aliasId if not provided and projectId exists
		if (!aliasId && args.taskData.projectId) {
			// Get the project
			const project = await ctx.db.get(args.taskData.projectId);
			if (!project) {
				throw new Error('Project not found');
			}

			// Atomically increment the aliasCount
			const currentCount = (project.aliasCount || 0) + 1;
			await ctx.db.patch(args.taskData.projectId, {
				aliasCount: currentCount,
				updatedAt: Date.now()
			});

			// Generate aliasId: {alias}-{count}
			aliasId = `${project.alias || 'TASK'}-${currentCount}`;
		}

		const taskId: Id<'tasks'> = await ctx.db.insert('tasks', {
			...args.taskData,
			aliasId,
			priority: args.taskData.priority || 'none',
			userIds: args.taskData.userIds || [],
			related: args.taskData.related || [],
			reactions: args.taskData.reactions || [],
			attachments: args.taskData.attachments || [],
			links: args.taskData.links || [],
			dateRange: args.taskData.dateRange || {},
			position: args.taskData.position || 0,
			createdAt: Date.now(),
			updatedAt: Date.now(),
			mentions: getMentionedUsers(args.taskData.description || ''),
			updatedBy: user._id
		});

		return taskId;
	}
});

export const update = mutation({
	args: taskArgs,
	handler: async (ctx, args) => {
		const user = await isAuthenticated(ctx);

		if (args.description) {
			args.mentions = getMentionedUsers(args.description);
		}

		console.log('updated by', user._id);

		await ctx.db.patch(args._id, {
			...args,
			updatedBy: user._id
		});
	}
});

export const get = query({
	args: { _id: v.id('tasks') },
	handler: async (ctx, args) => {
		if (!args._id) return null;

		const task = await ctx.db.get(args._id);

		if (!task) return null;

		const activities = await ctx.db
			.query('activities')
			.withIndex('by_task', (q) => q.eq('taskId', args._id))
			.collect();

		const comments = await ctx.db
			.query('comments')
			.withIndex('by_task', (q) => q.eq('taskId', args._id))
			.collect();

		return {
			task,
			activities: activities || [],
			comments: comments || []
		} as _TaskDataType;
	}
});

export const unsetProjectFeature = mutation({
	args: {
		type: v.union(
			v.literal('status'),
			v.literal('module'),
			v.literal('label'),
			v.literal('cycle')
		),
		featureId: v.string(),
		projectId: v.id('projects')
	},
	handler: async (ctx, args) => {
		for await (const task of ctx.db
			.query('tasks')
			.withIndex('by_project', (q) => q.eq('projectId', args.projectId))) {
			await ctx.db.patch(task._id, {
				[args.type]: null
			});
		}
	}
});

async function createInbox(
	ctx: QueryCtx | MutationCtx | any,
	userIds: Id<'users'>[],
	updatedBy: Id<'users'>,
	taskId: Id<'tasks'>,
	action: 'created' | 'updated',
	feature: string,
	projectId: Id<'projects'>
) {
	for (const assignee of userIds) {
		const createdAt = Date.now();
		if (assignee !== updatedBy) {
			await ctx.db.insert('inbox', {
				userId: assignee,
				referenceId: taskId,
				referenceType: 'task',
				projectId: projectId,
				isRead: false,
				archive: false,
				unsubscribe: false,
				createdAt,
				updatedAt: createdAt,
				action,
				feature
			});
		}
	}
}

triggers.register('tasks', async (ctx, change) => {
	if (change.operation === 'delete') {
		// Delete Activities
		for await (const activity of ctx.db
			.query('activities')
			.withIndex('by_task', (q) => q.eq('taskId', change.id))) {
			await ctx.db.delete(activity._id);
		}

		// Delete Comments
		for await (const message of ctx.db
			.query('comments')
			.withIndex('by_task', (q) => q.eq('taskId', change.id))) {
			await ctx.db.delete(message._id);
		}

		// Remove task from parent task
		for await (const task of ctx.db
			.query('tasks')
			.withIndex('by_parent', (q) => q.eq('parentId', change.id))) {
			await ctx.db.patch(task._id, {
				parentId: null
			});
		}

		// Delete Inbox
		for await (const inbox of ctx.db
			.query('inbox')
			.withIndex('by_reference', (q) => q.eq('referenceId', change.id))) {
			await ctx.db.delete(inbox._id);
		}

		// Patch Relations, incoming and outgoing
		for await (const relation of ctx.db
			.query('relations')
			.withIndex('by_incoming', (q) => q.eq('incomingId', change.id))) {
			await ctx.db.delete(relation._id);
		}

		// Delete Relations, outgoing
		for await (const relation of ctx.db
			.query('relations')
			.withIndex('by_outgoing', (q) => q.eq('outgoingId', change.id))) {
			await ctx.db.delete(relation._id);
		}
	} else if (['insert', 'update'].includes(change.operation)) {
		// Register activity

		const action = change.operation === 'insert' ? 'created' : 'updated';
		const createdAt = change.newDoc.createdAt || Date.now();

		if (action === 'created') {
			await ctx.db.insert('activities', {
				userId: change.newDoc.updatedBy,
				taskId: change.newDoc._id,
				projectId: change.newDoc.projectId,
				payload: {},
				createdAt,
				action
			});

			// Inbox == Created
			await createInbox(
				ctx,
				change.newDoc.userIds,
				change.newDoc.updatedBy,
				change.newDoc._id,
				action,
				'created',
				change.newDoc.projectId
			);
		} else if (action === 'updated') {
			const newDoc = change.newDoc;
			const oldDoc = change.oldDoc;

			// Track specific props with different strategies
			const simpleProps = [
				'name',
				'status',
				'module',
				'label',
				'priority',
				'cycle'
			];

			// 1. Track simple props with type "updated" and their new value
			for (const prop of simpleProps) {
				if (
					newDoc[prop as keyof typeof newDoc] !==
					oldDoc[prop as keyof typeof oldDoc]
				) {
					await ctx.db.insert('activities', {
						userId: newDoc.updatedBy,
						taskId: newDoc._id,
						projectId: newDoc.projectId,
						payload: {
							prop,
							type: 'updated',
							value: newDoc[prop as keyof typeof newDoc]
						},
						createdAt,
						action
					});

					// Inbox == Updated
					await createInbox(
						ctx,
						change.newDoc.userIds,
						newDoc.updatedBy,
						newDoc._id,
						'updated',
						prop,
						newDoc.projectId
					);
				}
			}

			// 1.1. Track dateRange with proper object comparison
			if (
				JSON.stringify(newDoc.dateRange || {}) !==
				JSON.stringify(oldDoc.dateRange || {})
			) {
				await ctx.db.insert('activities', {
					userId: newDoc.updatedBy,
					taskId: newDoc._id,
					projectId: newDoc.projectId,
					payload: {
						prop: 'dateRange',
						type: 'updated',
						value: newDoc.dateRange
					},
					createdAt,
					action
				});

				// Inbox == DateRange
				await createInbox(
					ctx,
					change.newDoc.userIds,
					newDoc.updatedBy,
					newDoc._id,
					'updated',
					'dateRange',
					newDoc.projectId
				);
			}

			// 2. Track userIds - compare arrays for added/removed users
			if (
				JSON.stringify(newDoc.userIds || []) !==
				JSON.stringify(oldDoc.userIds || [])
			) {
				const oldUserIds = oldDoc.userIds || [];
				const newUserIds = newDoc.userIds || [];

				// Find added users
				const addedUsers = newUserIds.filter((id) => !oldUserIds.includes(id));
				for (const userId of addedUsers) {
					await ctx.db.insert('activities', {
						userId: newDoc.updatedBy,
						taskId: newDoc._id,
						projectId: newDoc.projectId,
						payload: {
							prop: 'userIds',
							type: 'added',
							value: userId
						},
						createdAt,
						action
					});
				}

				if (addedUsers.length) {
					// Inbox == UserIds
					await createInbox(
						ctx,
						change.newDoc.userIds,
						newDoc.updatedBy,
						newDoc._id,
						'updated',
						'userIds',
						newDoc.projectId
					);
				}

				// Find removed users
				const removedUsers = oldUserIds.filter(
					(id) => !newUserIds.includes(id)
				);
				for (const userId of removedUsers) {
					await ctx.db.insert('activities', {
						userId: newDoc.updatedBy,
						taskId: newDoc._id,
						projectId: newDoc.projectId,
						payload: {
							prop: 'userIds',
							type: 'removed',
							value: userId
						},
						createdAt,
						action
					});
				}
			}

			// 3. Track attachments - compare arrays for added/removed items
			if (
				JSON.stringify(newDoc.attachments || []) !==
				JSON.stringify(oldDoc.attachments || [])
			) {
				const oldAttachments = oldDoc.attachments || [];
				const newAttachments = newDoc.attachments || [];

				// Find added attachments
				const addedAttachments = newAttachments.filter(
					(newItem) =>
						!oldAttachments.some((oldItem) => oldItem._id === newItem._id)
				);
				for (const attachment of addedAttachments) {
					await ctx.db.insert('activities', {
						userId: newDoc.updatedBy,
						taskId: newDoc._id,
						projectId: newDoc.projectId,
						payload: {
							prop: 'attachments',
							type: 'added',
							value: attachment.name || attachment.url
						},
						createdAt,
						action
					});
				}

				// Find removed attachments
				const removedAttachments = oldAttachments.filter(
					(oldItem) =>
						!newAttachments.some((newItem) => newItem._id === oldItem._id)
				);
				for (const attachment of removedAttachments) {
					await ctx.db.insert('activities', {
						userId: newDoc.updatedBy,
						taskId: newDoc._id,
						projectId: newDoc.projectId,
						payload: {
							prop: 'attachments',
							type: 'removed',
							value: attachment.name || attachment.url
						},
						createdAt,
						action
					});
				}

				// Inbox == Attachments
				await createInbox(
					ctx,
					change.newDoc.userIds,
					newDoc.updatedBy,
					newDoc._id,
					'updated',
					'attachments',
					newDoc.projectId
				);
			}

			// 4. Track links - compare arrays for added/removed items
			if (
				JSON.stringify(newDoc.links || []) !==
				JSON.stringify(oldDoc.links || [])
			) {
				const oldLinks = oldDoc.links || [];
				const newLinks = newDoc.links || [];

				// Find added links
				const addedLinks = newLinks.filter(
					(newItem) => !oldLinks.some((oldItem) => oldItem._id === newItem._id)
				);
				for (const link of addedLinks) {
					await ctx.db.insert('activities', {
						userId: newDoc.updatedBy,
						taskId: newDoc._id,
						projectId: newDoc.projectId,
						payload: {
							prop: 'links',
							type: 'added',
							value: link.name || link.url
						},
						createdAt,
						action
					});
				}

				// Find removed links
				const removedLinks = oldLinks.filter(
					(oldItem) => !newLinks.some((newItem) => newItem._id === oldItem._id)
				);
				for (const link of removedLinks) {
					await ctx.db.insert('activities', {
						userId: newDoc.updatedBy,
						taskId: newDoc._id,
						projectId: newDoc.projectId,
						payload: {
							prop: 'links',
							type: 'removed',
							value: link.name || link.url
						},
						action
					});
				}

				// Inbox == Links
				await createInbox(
					ctx,
					change.newDoc.userIds,
					newDoc.updatedBy,
					newDoc._id,
					'updated',
					'links',
					newDoc.projectId
				);
			}

			// 5. Track description - special handling without storing the actual value
			if (newDoc.description !== oldDoc.description) {
				const wasEmpty =
					!oldDoc.description || oldDoc.description.trim() === '';
				const isNowEmpty =
					!newDoc.description || newDoc.description.trim() === '';

				let type: 'added' | 'updated' | 'removed';
				if (wasEmpty && !isNowEmpty) {
					type = 'added';
				} else if (!wasEmpty && isNowEmpty) {
					type = 'removed';
				} else {
					type = 'updated';
				}

				await ctx.db.insert('activities', {
					userId: newDoc.updatedBy,
					taskId: newDoc._id,
					projectId: newDoc.projectId,
					payload: {
						prop: 'description',
						type
						// No value stored for description as per requirement
					},
					createdAt,
					action
				});

				// Inbox == Description
				await createInbox(
					ctx,
					change.newDoc.userIds,
					newDoc.updatedBy,
					newDoc._id,
					'updated',
					'description',
					newDoc.projectId
				);
			}
		}
	}
});
