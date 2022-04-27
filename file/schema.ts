import { createModule, gql } from "graphql-modules"
import { File } from "@prisma/client"
import { prismaClient } from "../prisma"
import {
  createFileRecord,
  CreateFileInput,
  getFile,
  moveFile,
  renameFile,
  deleteFile,
} from "./service"

const prisma = prismaClient()
export const fileModule = createModule({
  id: "file-module",
  dirname: __dirname,
  typeDefs: [
    gql`
      type File implements FileNode {
        id: ID!
        name: String!
        directoryId: ID!
        ancestors: [String]
        createdAt: String!
        updatedAt: String!
        versions: [FileVersion]!
      }
      input CreateFileInput {
        name: String!
        directoryId: ID!
        mimeType: String!
        size: Int!
      }
      type CreateFileResult {
        file: File!
        url: String
      }

      extend type Query {
        getAllFiles: [File]!
        getFile(id: ID!): File
      }
      extend type Mutation {
        createFile(input: CreateFileInput!): CreateFileResult!
        moveFile(id: ID!, directoryId: ID!): File!
        renameFile(id: ID!, newName: String!): File!
        deleteFile(id: ID!): Boolean
      }
    `,
  ],
  resolvers: {
    Query: {
      getAllFiles: async () => {
        return prisma.file.findMany()
      },
      getFile: async (_: unknown, { id }: { id: string }) => {
        return await getFile(prisma, id)
      },
    },
    Mutation: {
      createFile: async (
        _: unknown,
        { input }: { input: CreateFileInput }
      ): Promise<{ file: File; url: string }> => {
        return createFileRecord(prisma, input)
      },
      moveFile: async (
        _: unknown,
        { id, directoryId }: { id: string; directoryId: string }
      ) => {
        return await moveFile(prisma, id, directoryId)
      },
      renameFile: async (
        _: unknown,
        { id, newName }: { id: string; newName: string }
      ) => {
        return await renameFile(prisma, id, newName)
      },
      deleteFile: async (_: unknown, { id }: { id: string }) => {
        return await deleteFile(prisma, id)
      },
    },
  },
})
