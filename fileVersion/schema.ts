import { createModule, gql } from "graphql-modules"
import { prismaClient } from "../prisma"
import { requestFileDownload } from "./service"

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

      extend type Query {
        getAllFileVersions: [FileVersion]!
        requestFileDownload(key: String!): String!
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
  },
})
