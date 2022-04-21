import { File, PrismaClient, Prisma } from "@prisma/client"
import { getBucket } from "../bucket/bucket"
import { generateId } from "../utils/generators"

const fileInputFields = Prisma.validator<Prisma.FileArgs>()({
  select: { name: true, directoryId: true },
})

export type CreateFileInput = Prisma.FileGetPayload<typeof fileInputFields> & {
  key?: string
  mimeType: string
  size: number
}

export async function createFileRecord(
  client: PrismaClient,
  file: CreateFileInput
): Promise<{ file: File; url: string }> {
  const { name, directoryId, mimeType, size, key: keyInput } = file
  const key = keyInput ?? generateId()
  const data = { name, directoryId, versions: { name, key, mimeType, size } }
  const fileData = await client.file.create({
    data,
    include: { versions: true },
  })
  const bucket = getBucket()
  const url = (await bucket?.getSignedUrl("put", key)) ?? ""
  return { file: fileData, url }
}