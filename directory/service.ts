import { Directory, PrismaClient } from "@prisma/client"
import { deleteFile } from "../file"
import { prismaClient } from "../prisma"

const prisma = prismaClient()

export async function createDirectory(
  client: PrismaClient,
  name: Directory["name"],
  parentId: Directory["parentId"]
): Promise<Directory> {
  if (name.toLowerCase() === "root") {
    throw new Error("Can not create directory root")
  }
  const parent = parentId
    ? await client.directory.findUnique({ where: { id: parentId } })
    : null
  const ancestors = parent?.ancestors ?? []
  const directory = await client.directory.create({
    data: {
      name,
      parentId,
      ancestors: [...ancestors, ...(parentId ? [parentId] : [])],
    },
  })
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
  id: Directory["id"]
): Promise<boolean> {
  try {
    // delete all files that has as an ancestor the directory
    // that is subject to deletion
    const relatedFiles = await client.file.findMany({
      where: { ancestors: { has: id } },
    })
    for (const file of relatedFiles) {
      await deleteFile(prisma, file.id)
    }
    // find all directories that has as an ancestor the
    // directory to be deleted
    await client.$transaction([
      client.directory.deleteMany({ where: { ancestors: { has: id } } }),
      client.directory.delete({ where: { id } }),
    ])
    return true
  } catch (error) {
    return false
  }
}

export async function findDirectories(
  client: PrismaClient,
  lookupName: string
): Promise<Directory[]> {
  return await client.directory.findMany({
    where: { name: { contains: lookupName, mode: "insensitive" } },
    orderBy: [{ name: "asc" }],
  })
}
