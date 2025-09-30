import type { UserIdentity } from 'convex/server';
import { isArray } from 'lodash-es';
import { _UserType, type UserId } from '@/types';
import type { MutationCtx, QueryCtx } from './_generated/server';

export const isAuthenticated = async (
	ctx: QueryCtx | MutationCtx
): Promise<{
	_id: UserId;
	identity: UserIdentity;
}> => {
	const userIdentity = await ctx.auth.getUserIdentity();

	if (!userIdentity) throw new Error('Unauthorized');

	return {
		_id: userIdentity._id as UserId,
		identity: userIdentity
	};
};

export function getMentionedUsers(description: string): UserId[] {
	const preMentions = description.match(/data-user="([^"]+)"/g);
	const mentions = preMentions
		?.map((mention) => mention.match(/data-user="([^"]+)"/)?.[1])
		.filter(Boolean);
	const result = [];

	if (isArray(mentions)) {
		for (const mention of mentions) {
			result.push(mention as UserId);
		}
		return result;
	}
	return [];
}
