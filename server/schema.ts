import { permissions } from "./permissions";
import { APP_SECRET, getUserId } from "./utils";
import { compare, hash } from "bcryptjs";
import { sign } from "jsonwebtoken";
import { applyMiddleware } from "graphql-middleware";
import {
  intArg,
  makeSchema,
  objectType,
  inputObjectType,
  asNexusMethod,
  enumType,
  nonNull,
  list,
  arg,
  stringArg,
} from "nexus";
import { DateTimeResolver } from "graphql-scalars";
import { Context } from "./context";
import { Gender, ListStatus } from "@prisma/client";

export const DateTime = asNexusMethod(DateTimeResolver, "date");

const Query = objectType({
  name: "Query",
  definition(t) {
    t.nonNull.list.nonNull.field("allUsers", {
      type: "User",
      resolve: (_parent, _args, context: Context) => {
        return context.prisma.user.findMany();
      },
    });

    t.nullable.field("me", {
      type: "User",
      resolve: (parent, args, context: Context) => {
        const userId = getUserId(context);
        return context.prisma.user.findUnique({
          where: {
            id: String(userId),
          },
        });
      },
    });

    t.nullable.field("listById", {
      type: "List",
      args: {
        id: intArg(),
      },
      resolve: (_parent, args, context: Context) => {
        return context.prisma.list.findUnique({
          where: { id: String(args.id) || undefined },
        });
      },
    });

    // t.nonNull.list.nonNull.field("feed", {
    //   type: "Post",
    //   args: {
    //     searchString: stringArg(),
    //     skip: intArg(),
    //     take: intArg(),
    //     orderBy: arg({
    //       type: "PostOrderByUpdatedAtInput",
    //     }),
    //   },
    //   resolve: (_parent, args, context: Context) => {
    //     const or = args.searchString
    //       ? {
    //           OR: [
    //             { title: { contains: args.searchString } },
    //             { content: { contains: args.searchString } },
    //           ],
    //         }
    //       : {};

    //     return context.prisma.post.findMany({
    //       where: {
    //         published: true,
    //         ...or,
    //       },
    //       take: args.take || undefined,
    //       skip: args.skip || undefined,
    //       orderBy: args.orderBy || undefined,
    //     });
    //   },
    // });

    // t.list.field("draftsByUser", {
    //   type: "Post",
    //   args: {
    //     userUniqueInput: nonNull(
    //       arg({
    //         type: "UserUniqueInput",
    //       })
    //     ),
    //   },
    //   resolve: (_parent, args, context: Context) => {
    //     return context.prisma.user
    //       .findUnique({
    //         where: {
    //           id: args.userUniqueInput.id || undefined,
    //           email: args.userUniqueInput.email || undefined,
    //         },
    //       })
    //       .posts({
    //         where: {
    //           published: false,
    //         },
    //       });
    //   },
    // });
  },
});

const Mutation = objectType({
  name: "Mutation",
  definition(t) {
    t.field("signup", {
      type: "AuthPayload",
      args: {
        email: nonNull(stringArg()),
        password: nonNull(stringArg()),
      },
      resolve: async (_parent, args, context: Context) => {
        const hashedPassword = await hash(args.password, 10);
        const user = await context.prisma.user.create({
          data: {
            email: args.email,
            password: hashedPassword,
          },
        });
        return {
          token: sign({ userId: user.id }, APP_SECRET),
          user,
        };
      },
    });

    t.field("login", {
      type: "AuthPayload",
      args: {
        email: nonNull(stringArg()),
        password: nonNull(stringArg()),
      },
      resolve: async (_parent, { email, password }, context: Context) => {
        const user = await context.prisma.user.findUnique({
          where: {
            email,
          },
        });
        if (!user) {
          throw new Error(`No user found for email: ${email}`);
        }
        const passwordValid = await compare(password, user.password);
        if (!passwordValid) {
          throw new Error("Invalid password");
        }
        return {
          token: sign({ userId: user.id }, APP_SECRET),
          user,
        };
      },
    });

    t.field("createList", {
      type: "List",
      args: {
        data: nonNull(
          arg({
            type: "ListCreateInput",
          })
        ),
      },
      resolve: (_, args, context: Context) => {
        const userId = getUserId(context);
        return context.prisma.list.create({
          data: {
            ...args.data,
            ownerId: String(userId),
          },
        });
      },
    });

    //     t.field("togglePublishPost", {
    //       type: "Post",
    //       args: {
    //         id: nonNull(intArg()),
    //       },
    //       resolve: async (_, args, context: Context) => {
    //         try {
    //           const post = await context.prisma.post.findUnique({
    //             where: { id: args.id || undefined },
    //             select: {
    //               published: true,
    //             },
    //           });
    //           return context.prisma.post.update({
    //             where: { id: args.id || undefined },
    //             data: { published: !post?.published },
    //           });
    //         } catch (e) {
    //           throw new Error(
    //             `Post with ID ${args.id} does not exist in the database.`
    //           );
    //         }
    //       },
    //     });

    //     t.field("incrementPostViewCount", {
    //       type: "Post",
    //       args: {
    //         id: nonNull(intArg()),
    //       },
    //       resolve: (_, args, context: Context) => {
    //         return context.prisma.post.update({
    //           where: { id: args.id || undefined },
    //           data: {
    //             viewCount: {
    //               increment: 1,
    //             },
    //           },
    //         });
    //       },
    //     });

    //     t.field("deletePost", {
    //       type: "Post",
    //       args: {
    //         id: nonNull(intArg()),
    //       },
    //       resolve: (_, args, context: Context) => {
    //         return context.prisma.post.delete({
    //           where: { id: args.id },
    //         });
    //       },
    //     });
    //   },
  },
});

const User = objectType({
  name: "User",
  definition(t) {
    t.nonNull.string("id");
    t.nonNull.string("email");
    t.nonNull.list.nonNull.field("lists", {
      type: "List",
      resolve: (parent, _, context: Context) => {
        return context.prisma.list.findMany({
          where: { ownerId: parent.id || undefined },
          orderBy: { createdAt: "desc" },
          take: 10,
        });
      },
    });
  },
});

const ListStatusEnum = enumType({
  name: "ListStatus",
  members: ListStatus,
});

const List = objectType({
  name: "List",
  definition(t) {
    t.nonNull.string("id");
    t.nonNull.field("createdAt", { type: "DateTime" });
    t.nonNull.field("updatedAt", { type: "DateTime" });
    t.nonNull.string("name");
    t.nonNull.field("status", { type: "ListStatus" });
    t.nonNull.string("ownerId");
    t.field("current", {
      type: "ListRevision",
      resolve: (parent, _, context: Context) => {
        return context.prisma.listRevision.findFirst({
          where: { listId: parent.id },
          orderBy: { updatedAt: "desc" },
          include: {
            owner: true,
            members: { orderBy: { position: "asc" } },
          },
        });
      },
    });
    t.nonNull.list.nonNull.field("revisions", {
      type: "ListRevision",
      resolve: (parent, _, context: Context) => {
        return context.prisma.listRevision.findMany({
          where: { listId: parent.id },
          orderBy: { updatedAt: "desc" },
          include: {
            owner: true,
            members: { orderBy: { position: "asc" } },
          },
        });
      },
    });
    t.field("owner", {
      type: "User",
      resolve: (parent, _, context: Context) => {
        return context.prisma.user.findUnique({
          where: { id: parent.ownerId || undefined },
        });
      },
    });
  },
});

const ListRevision = objectType({
  name: "ListRevision",
  definition(t) {
    t.nonNull.string("id");
    t.nonNull.string("ownerId");
    t.nonNull.field("createdAt", { type: "DateTime" });
    t.nonNull.field("updatedAt", { type: "DateTime" });
    t.nonNull.list.nonNull.field("members", {
      type: "ListMember",
    });
  },
});

const GenderEnum = enumType({
  name: "Gender",
  members: Gender,
});

const ListMember = objectType({
  name: "ListMember",
  definition(t) {
    t.nonNull.string("id");
    t.nonNull.field("position", { type: "Int" });
    t.nonNull.field("gender", { type: "Gender" });
    t.nonNull.string("listRevId");
  },
});

const ListMemberInput = inputObjectType({
  name: "ListMemberInput",
  definition(t) {
    t.nonNull.field("position", { type: "Int" });
    t.nonNull.field("gender", { type: "Gender" });
  },
});

const ListCreateInput = inputObjectType({
  name: "ListCreateInput",
  definition(t) {
    t.nonNull.field("name", { type: "String" });
    t.field("date", { type: "DateTime" });
    t.nonNull.list.nonNull.field("members", { type: "ListMemberInput" });
  },
});

const SortOrder = enumType({
  name: "SortOrder",
  members: ["asc", "desc"],
});

// const PostOrderByUpdatedAtInput = inputObjectType({
//   name: "PostOrderByUpdatedAtInput",
//   definition(t) {
//     t.nonNull.field("updatedAt", { type: "SortOrder" });
//   },
// });

const UserUniqueInput = inputObjectType({
  name: "UserUniqueInput",
  definition(t) {
    t.field("id", { type: "Int" });
    t.field("email", { type: "String" });
  },
});

// const PostCreateInput = inputObjectType({
//   name: "PostCreateInput",
//   definition(t) {
//     t.nonNull.string("title");
//     t.string("content");
//   },
// });

const UserCreateInput = inputObjectType({
  name: "UserCreateInput",
  definition(t) {
    t.nonNull.string("email");
    t.list.nonNull.field("lists", { type: "ListCreateInput" });
  },
});

const AuthPayload = objectType({
  name: "AuthPayload",
  definition(t) {
    t.string("token");
    t.field("user", { type: "User" });
  },
});

const schemaWithoutPermissions = makeSchema({
  types: [
    Query,
    Mutation,
    List,
    ListMember,
    ListCreateInput,
    ListMemberInput,
    GenderEnum,
    ListStatusEnum,
    ListRevision,
    User,
    AuthPayload,
    UserUniqueInput,
    UserCreateInput,
    SortOrder,
    DateTime,
  ],
  outputs: {
    schema: __dirname + "/../schema.graphql",
    typegen: __dirname + "/generated/nexus.ts",
  },
  contextType: {
    module: require.resolve("./context"),
    export: "Context",
  },
  sourceTypes: {
    modules: [
      {
        module: "@prisma/client",
        alias: "prisma",
      },
    ],
  },
});

export const schema = applyMiddleware(schemaWithoutPermissions, permissions);
