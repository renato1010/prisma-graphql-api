import { Directory } from "@prisma/client"
import { createModule, gql } from "graphql-modules"
import { prismaClient } from "../prisma"
import {
  createDirectory,
  deleteDirectory,
  getDirectory,
  moveDirectory,
  renameDirectory,
} from "./service"

const prisma = prismaClient()
export const directoryModule = createModule({
  id: "directory-module",
  dirname: __dirname,
  typeDefs: [
    gql`
      type Directory implements FileNode {
        id: ID!
        name: String!
        parentId: ID
        ancestors: [String]
        files: [File]!
        directories: [Directory]!
        createdAt: String!
        updatedAt: String!
      }

      extend type Query {
        getAllDirectories: [Directory]!
        getDirectory(id: ID!): Directory
      }
      type Mutation {
        createDirectory(name: String!, parentId: String!): Directory!
        renameDirectory(id: ID!, newName: String): Directory
        moveDirectory(id: ID!, parentId: ID): Directory
        deleteDirectory(id: ID!): Boolean!
      }
    `,
  ],
  resolvers: {
    Query: {
      getAllDirectories: () => {
        return prisma.directory.findMany()
      },
      getDirectory: (_: unknown, { id }: { id: string }) => {
        return getDirectory(prisma, id)
      },
    },
    Mutation: {
      createDirectory: async (
        _: unknown,
        { name, parentId }: { name: string; parentId: string }
      ) => {
        return await createDirectory(prisma, name, parentId)
      },
      renameDirectory: async (
        _: unknown,
        { id, newName }: { id: string; newName: string }
      ) => {
        return await renameDirectory(prisma, id, newName)
      },
      moveDirectory: async (
        _: unknown,
        { id, parentId }: { id: Directory["id"]; parentId: Directory["id"] }
      ) => {
        return await moveDirectory(prisma, id, parentId)
      },

      deleteDirectory: async (_: unknown, { id }: { id: string }) => {
        return await deleteDirectory(prisma, id)
      },
    },
  },
})
