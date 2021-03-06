// eslint-disable-next-line
require("dotenv").config()
import { Directory, File, FileVersion } from "@prisma/client"
import express, { Request } from "express"
import { graphqlHTTP } from "express-graphql"
import { createApplication, createModule, gql } from "graphql-modules"
import { directoryModule, findDirectories } from "./directory"
import { fileModule, findFiles } from "./file"
import { fileVersionModule } from "./fileVersion"
import { downloadLocalFile, uploadLocalFile } from "./bucket"
import { prismaClient } from "./prisma"

const client = prismaClient()

export interface PaginationOptions {
  pageLength: number
  page: number
}

const mainModule = createModule({
  id: "main-module",
  dirname: __dirname,
  typeDefs: [
    gql`
      interface FileNode {
        id: ID!
        name: String!
        createdAt: String!
        updatedAt: String!
        deletedAt: String
      }
      input PaginationInput {
        page: Int!
        pageLength: Int!
      }
      input SortInput {
        field: String!
        direction: SortDirection
      }
      enum SortDirection {
        ASC
        DESC
      }
      type Query {
        searchFiles(query: String!): [FileNode]
      }
    `,
  ],
  resolvers: {
    FileNode: {
      __resolveType(obj: File | FileVersion | Directory) {
        if (Object.prototype.hasOwnProperty.call(obj, "parentId")) {
          return "Directory"
        }
        if (Object.prototype.hasOwnProperty.call(obj, "fileId")) {
          return "FileVersion"
        }
        if (Object.prototype.hasOwnProperty.call(obj, "directoryId")) {
          return "File"
        }
      },
    },
    Query: {
      searchFiles: async (_: unknown, { query }: { query: string }) => {
        return [
          ...(await findDirectories(client, query)),
          ...(await findFiles(client, query)),
        ]
      },
    },
  },
})
const api = createApplication({
  modules: [mainModule, directoryModule, fileModule, fileVersionModule],
})
const app = express()
const port = process.env.LOCAL_PORT ?? 4000
app.get("/file", (req, res) => {
  void downloadLocalFile(
    `${req.protocol}://${req.get("host") ?? ""}${req.originalUrl}`
  )
    .then((file) => {
      res.setHeader("Content-Type", file.ContentType)
      res.status(200).send(file.Body)
    })
    .catch((error) => {
      res.status(400).send(error)
    })
})
app.use(/\/((?!graphql).)*/, express.raw({ limit: "100000kb", type: "*/*" }))

app.put("/file", function (req: Request<unknown, unknown, Buffer>, res) {
  const { headers } = req
  const data = {
    ContentType: headers["content-type"] ?? "application/octet-stream",
    Body: req.body,
  }
  void uploadLocalFile(
    `${req.protocol}://${req.get("host") ?? ""}${req.originalUrl}`,
    data
  )
    .then(() => res.status(200).send(true))
    .catch((error) => res.status(400).send(error))
})
app.use(
  "/graphql",
  // eslint-disable-next-line @typescript-eslint/no-misused-promises
  graphqlHTTP({
    schema: api.schema,
    customExecuteFn: api.createExecution(),
    graphiql: process.env.NODE_ENV === "development",
  })
)

app.listen(port, () => {
  console.log(`app running on port ${port}`)
})
