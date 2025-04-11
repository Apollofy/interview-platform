import { v } from "convex/values";
import { mutation, query } from "./_generated/server";

export const syncUser = mutation({
    args: {
        clerkId: v.string(),
        email:v.string(),
        name: v.string(),
        image: v.optional(v.string()),
    },
    handler: async (ctx, args) => {
        console.log("Syncing user:", args.clerkId, "with email:", args.email);
        
        const existingUser = await ctx.db
            .query("users")
            .withIndex("by_clerk_id", (q) => q.eq("clerkId", args.clerkId))
            .first();

        if(existingUser) {
            console.log("User already exists:", existingUser);
            return;
        }

        console.log("Creating new user without role");
        return await ctx.db.insert("users", {
            ...args,
        });
    },
});

export const updateUserRole = mutation({
    args: {
        clerkId: v.string(),
        role: v.union(v.literal("candidate"), v.literal("interviewer")),
    },
    handler: async (ctx, args) => {
        console.log("Updating role for user:", args.clerkId, "to:", args.role);
        
        const user = await ctx.db
            .query("users")
            .withIndex("by_clerk_id", (q) => q.eq("clerkId", args.clerkId))
            .first();
        
        if (!user) {
            console.error("User not found for role update:", args.clerkId);
            throw new Error("User not found");
        }
        
        await ctx.db.patch(user._id, { role: args.role });
        console.log("Role updated successfully");
        return user._id;
    },
});

export const createUserWithRole = mutation({
    args: {
        clerkId: v.string(),
        email: v.string(),
        name: v.string(),
        image: v.optional(v.string()),
        role: v.union(v.literal("candidate"), v.literal("interviewer")),
    },
    handler: async (ctx, args) => {
        console.log("Creating or updating user with role:", args);
        
        // Check if user already exists
        const existingUser = await ctx.db
            .query("users")
            .withIndex("by_clerk_id", (q) => q.eq("clerkId", args.clerkId))
            .first();
        
        if (existingUser) {
            console.log("User exists, updating role");
            await ctx.db.patch(existingUser._id, { role: args.role });
            return existingUser._id;
        }
        
        // Create new user with role
        console.log("Creating new user with role");
        return await ctx.db.insert("users", args);
    },
});

export const getUsers = query({
    handler: async (ctx) => {
      const identity = await ctx.auth.getUserIdentity();
      if (!identity) throw new Error("User is not authenticated");
  
      const users = await ctx.db.query("users").collect();
  
      return users;
    },
});

export const getUserByClerkId = query({
    args: { clerkId: v.string() },
    handler: async (ctx, args) => {
      const user = await ctx.db
        .query("users")
        .withIndex("by_clerk_id", (q) => q.eq("clerkId", args.clerkId))
        .first();
  
      return user;
    },
});