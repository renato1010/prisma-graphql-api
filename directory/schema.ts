import { createModule, gql } from "graphql-modules"
import { prismaClient } from "../prisma"

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
        files: [File]!
        directories: [Directory]!
        createdAt: String!
        updatedAt: String!
      }

      extend type Query {
        getAllDirectories: [Directory]!
      }
    `,
  ],
  resolvers: {
    Query: {
      getAllDirectories: () => {
        return prisma.directory.findMany()
      },
    },
  },
})
