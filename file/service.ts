import { File, Prisma, PrismaClient, FileVersion } from "@prisma/client"
import { CreateFileVersionInput } from "../fileVersion"
import { getBucket } from "../bucket/bucket"
import { generateId } from "../utils/generators"

const fileInputFields = Prisma.validator<Prisma.FileArgs>()({
  select: { name: true, directoryId: true },
})

export type CreateFileInput = Prisma.FileGetPayload<typeof fileInputFields> &
  Omit<CreateFileVersionInput, "fileId" | "key"> & { key?: FileVersion["key"] }

export async function createFileRecord(
  client: PrismaClient,
  file: CreateFileInput
): Promise<{ file: File; url: string }> {
  const { name, directoryId, mimeType, size, key: keyInput } = file
  const key = keyInput ?? generateId()
  const directory = await client.directory.findUnique({
    where: { id: directoryId },
  })
  const ancestors = directory?.ancestors ?? []
  const data = {
    name,
    directoryId,
    ancestors: [...ancestors, directoryId],
    versions: {
      create: {
        name,
        key,
        mimeType,
        size,
      },
    },
  }
  const fileData = await client.file.create({
    data,
    include: { versions: true },
  })
  const bucket = getBucket()
  const url = await bucket.getSignedUrl("put", key)
  return { file: fileData, url }
}

export async function getFile(
  client: PrismaClient,
  id: File["id"]
): Promise<File | null> {
  console.log({ id })
  return await client.file.findUnique({
    where: { id },
    include: { versions: true },
  })
}

export async function moveFile(
  client: PrismaClient,
  id: File["id"],
  moveToDirectoryId: File["directoryId"]
): Promise<
  File & {
    versions: FileVersion[]
  }
> {
  const directory = await client.directory.findUnique({
    where: { id: moveToDirectoryId },
  })
  if (!directory) {
    throw new Error(`Can't move to directory with ID=${moveToDirectoryId}`)
  }
  const ancestors = directory.ancestors
  const fileAndVersions = await client.file.update({
    where: { id },
    data: {
      directoryId: moveToDirectoryId,
      ancestors: [...ancestors, moveToDirectoryId],
    },
    include: { versions: true },
  })
  return fileAndVersions
}

export async function renameFile(
  client: PrismaClient,
  fileId: File["id"],
  newName: File["name"]
): Promise<File> {
  return await client.file.update({
    where: { id: fileId },
    data: { name: newName },
    include: { versions: true },
  })
}

export async function deleteFile(
  client: PrismaClient,
  id: string
): Promise<boolean> {
  try {
    const fileVersions = await client.file
      .findUnique({ where: { id } })
      .versions()
    await client.$transaction([
      client.fileVersion.deleteMany({ where: { fileId: id } }),
      client.file.delete({ where: { id } }),
    ])
    for (const version of fileVersions) {
      await getBucket().deleteObject(version.key)
    }
    return true
  } catch (error) {
    console.error(error)
    return false
  }
}

export async function findFiles(
  client: PrismaClient,
  lookupName: string
): Promise<File[]> {
  return await client.file.findMany({
    where: { name: { contains: lookupName, mode: "insensitive" } },
    orderBy: [{ name: "asc" }],
  })
}
