import { v } from "convex/values";
import { _ViewType } from "@/types";
import { mutation } from "../_generated/server";
import { viewArgs } from "../schema.args";

export const upsertView = mutation({
  args: viewArgs,
  handler: async (ctx, args) => {
    delete args._creationTime;

    let _id = args._id;

    if (_id) {
      await ctx.db.patch(_id, {
        ...args,
        updatedAt: Date.now(),
      });
    } else {
      if (!args.userId || !args.projectId || !args.type) {
        return null;
      }
      if (args.type === "user") {
        const userView = await ctx.db
          .query("views")
          .withIndex("by_project_user_type", (q) =>
            q
              .eq("projectId", args.projectId)
              .eq("userId", args.userId)
              .eq("type", "user"),
          )
          .first();

        if (userView) {
          await ctx.db.patch(userView._id, {
            ...args,
            updatedAt: Date.now(),
          });

          return userView._id;
        }
      }

      _id = await ctx.db.insert("views", {
        ...args,
        createdAt: Date.now(),
        updatedAt: Date.now(),
      });
    }

    return _id;
  },
});

export const remove = mutation({
  args: {
    viewId: v.id("views"),
  },
  handler: async (ctx, args) => {
    await ctx.db.delete(args.viewId);
  },
});
