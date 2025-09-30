import {
	customCtx,
	customMutation
} from 'convex-helpers/server/customFunctions';
import { Triggers } from 'convex-helpers/server/triggers';
import type { DataModel } from '#/_generated/dataModel';
import {
	action as Action,
	query as Query,
	internalMutation as rawInternalMutation,
	mutation as rawMutation
} from '#/_generated/server';

// start using Triggers, with table types from schema.ts
export const triggers = new Triggers<DataModel>();

// create wrappers that replace the built-in `mutation` and `internalMutation`
// the wrappers override `ctx` so that `ctx.db.insert`, `ctx.db.patch`, etc. run registered trigger functions
export const mutation = customMutation(rawMutation, customCtx(triggers.wrapDB));
export const internalMutation = customMutation(
	rawInternalMutation,
	customCtx(triggers.wrapDB)
);
export const query = Query;
export const action = Action;
