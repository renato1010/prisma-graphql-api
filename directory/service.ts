import { Directory, PrismaClient } from "@prisma/client"

export async function createDirectory(
  client: PrismaClient,
  name: Directory["name"],
  parentId: Directory["parentId"]
): Promise<Directory> {
  if (name.toLowerCase() === "root") {
    throw new Error("Can not create directory root")
  }
  const directory = await client.directory.create({ data: { name, parentId } })
  return directory
}
