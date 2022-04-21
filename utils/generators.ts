import { customAlphabet } from "nanoid"

const generateId = (): string => {
  const alphabet =
    "0123456789ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz"
  const nanoid = customAlphabet(alphabet, 11)
  return nanoid()
}

export { generateId }
