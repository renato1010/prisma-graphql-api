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

export async function getDirectory(
  client: PrismaClient,
  directoryId: Directory["id"]
): Promise<Directory | null> {
  return client.directory.findUnique({
    where: { id: directoryId },
    include: { files: true, directories: true },
  })
}

export async function renameDirectory(
  client: PrismaClient,
  directoryId: Directory["id"],
  newDirectoryName: Directory["name"]
): Promise<Directory> {
  if (newDirectoryName.toLowerCase() === "root") {
    throw new Error("Directory name 'root' is reserved")
  }
  const rootDirectory = await client.directory.findUnique({
    where: { id: directoryId },
  })
  if (rootDirectory?.name === "root") {
    throw new Error("Root directory can not be renamed")
  }
  return client.directory.update({
    where: { id: directoryId },
    data: { name: newDirectoryName },
    include: { files: true, directories: true },
  })
}

export async function deleteDirectory(
  client: PrismaClient,
  id: string
): Promise<boolean> {
  try {
    await client.directory.delete({ where: { id } })
    return true
  } catch (error) {
    return false
  }
}
