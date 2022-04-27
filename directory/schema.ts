import { Directory } from "@prisma/client"
import { PaginationOptions } from "../app"
import { createModule, gql } from "graphql-modules"
import { prismaClient } from "../prisma"
import {
  countDirectoryChildren,
  createDirectory,
  deleteDirectory,
  DirectoryContentsResult,
  getDirectory,
  getDirectoryContents,
  getDirectoryContentsRaw,
  getDirectorySize,
  moveDirectory,
  renameDirectory,
  Sort,
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
        children: Int!
        size: Int
      }
      type DirectoryContentsResult {
        id: String!
        name: String!
        mimeType: String!
        size: Int!
        key: String!
        createdAt: String!
        updatedAt: String!
        type: String!
      }

      extend type Query {
        getAllDirectories: [Directory]!
        getDirectory(id: ID!): Directory
        getDirectoryContents(
          id: ID!
          pagination: PaginationInput
          sort: SortInput
        ): [DirectoryContentsResult]
        getDirectoryContentsRaw(
          id: ID!
          pagination: PaginationInput
          sort: SortInput
        ): [DirectoryContentsResult]
        countDirectoryChildren(id: ID!): Int!
        getDirectorySize(id: ID!): Int!
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
    Directory: {
      children: async ({ id }: { id: string }): Promise<number> => {
        return await countDirectoryChildren(prismaClient(), id)
      },
      size: async ({ id }: { id: string }): Promise<number | null> => {
        return await getDirectorySize(prismaClient(), id)
      },
    },
    Query: {
      getAllDirectories: () => {
        return prisma.directory.findMany()
      },
      getDirectory: (_: unknown, { id }: { id: string }) => {
        return getDirectory(prisma, id)
      },
      getDirectoryContents: async (
        _: unknown,
        {
          id,
          pagination,
          sort,
        }: {
          id: Directory["id"]
          pagination?: PaginationOptions
          sort?: Sort
        }
      ): Promise<DirectoryContentsResult[]> => {
        return await getDirectoryContents(prisma, id, pagination, sort)
      },
      getDirectoryContentsRaw: async (
        _: unknown,
        {
          id,
          pagination,
          sort,
        }: {
          id: Directory["id"]
          pagination?: PaginationOptions
          sort?: Sort
        }
      ): Promise<DirectoryContentsResult[]> => {
        return await getDirectoryContentsRaw(prisma, id, pagination, sort)
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
