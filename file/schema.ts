import { createModule, gql } from "graphql-modules"
import { File } from "@prisma/client"
import { prismaClient } from "../prisma"
import { createFileRecord, CreateFileInput } from "./service"

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
      }
      extend type Mutation {
        createFile(input: CreateFileInput!): CreateFileResult!
      }
    `,
  ],
  resolvers: {
    Query: {
      getAllFiles: async () => {
        return prisma.file.findMany()
      },
    },
    Mutation: {
      createFile: async (
        _: unknown,
        { input }: { input: CreateFileInput }
      ): Promise<{ file: File; url: string }> => {
        return createFileRecord(prisma, input)
      },
    },
  },
})
