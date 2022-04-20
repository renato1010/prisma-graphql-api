import { createModule, gql } from "graphql-modules"
import { prismaClient } from "../prisma"

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

      extend type Query {
        getAllFiles: [File]!
      }
    `,
  ],
  resolvers: {
    Query: {
      getAllFiles: async () => {
        return prisma.file.findMany()
      },
    },
  },
})
