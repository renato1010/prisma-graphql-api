import { FileVersion } from "@prisma/client"
import { createModule, gql } from "graphql-modules"
import { prismaClient } from "../prisma"
import {
  requestFileDownload,
  createFileVersionRecord,
  CreateFileVersionInput,
} from "./service"

const prisma = prismaClient()
export const fileVersionModule = createModule({
  id: "fileVersion-module",
  dirname: __dirname,
  typeDefs: [
    gql`
      type FileVersion implements FileNode {
        id: ID!
        name: String!
        mimeType: String!
        key: String!
        size: Int!
        fileId: ID!
        createdAt: String!
        updatedAt: String!
      }

      input CreateFileVersionInput {
        fileId: ID!
        name: String!
        mimeType: String!
        size: Int!
      }

      type CreateFileVersionResult {
        id: ID!
        name: String!
        fileId: ID!
        mimeType: String!
        size: Int!
        key: String!
        createdAt: String!
        updatedAt: String!
        url: String!
      }

      extend type Query {
        getAllFileVersions: [FileVersion]!
        requestFileDownload(key: String!): String!
      }

      extend type Mutation {
        createFileVersion(
          input: CreateFileVersionInput!
        ): CreateFileVersionResult!
      }
    `,
  ],
  resolvers: {
    Query: {
      getAllFileVersions: () => {
        return prisma.fileVersion.findMany()
      },
      requestFileDownload: async (_: unknown, { key }: { key: string }) => {
        const signedUrl = await requestFileDownload(key)
        return signedUrl
      },
    },
    Mutation: {
      createFileVersion: async (
        _: unknown,
        { input }: { input: CreateFileVersionInput }
      ): Promise<FileVersion & { url: string }> => {
        return await createFileVersionRecord(prisma, input)
      },
    },
  },
})
