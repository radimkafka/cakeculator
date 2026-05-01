import type { Recipe } from "#/types/recipe"

const FILE_NAME = "cakeculator-recipes.json"
const DRIVE_FILES_URL = "https://www.googleapis.com/drive/v3/files"
const DRIVE_UPLOAD_URL = "https://www.googleapis.com/upload/drive/v3/files"
const LAST_SYNCED_KEY = "cakeculator-last-synced"

function headers(accessToken: string): HeadersInit {
  return { Authorization: `Bearer ${accessToken}` }
}

async function findRecipesFile(
  accessToken: string,
): Promise<{ id: string; modifiedTime: string } | null> {
  const params = new URLSearchParams({
    spaces: "appDataFolder",
    q: `name='${FILE_NAME}'`,
    fields: "files(id,modifiedTime)",
  })

  const res = await fetch(`${DRIVE_FILES_URL}?${params}`, {
    headers: headers(accessToken),
  })

  if (!res.ok) throw new Error(`Drive list failed: ${res.status}`)

  const data = (await res.json()) as {
    files: { id: string; modifiedTime: string }[]
  }
  const file = data.files[0]
  return file ? { id: file.id, modifiedTime: file.modifiedTime } : null
}

export async function fetchRecipesFromDrive(
  accessToken: string,
): Promise<{ recipes: Recipe[]; modifiedTime: number } | null> {
  const file = await findRecipesFile(accessToken)
  if (!file) return null

  const res = await fetch(`${DRIVE_FILES_URL}/${file.id}?alt=media`, {
    headers: headers(accessToken),
  })

  if (!res.ok) throw new Error(`Drive download failed: ${res.status}`)

  const data: unknown = await res.json()

  // Handle legacy envelope format from previous version
  if (data && typeof data === "object" && "recipes" in data) {
    const envelope = data as { recipes: unknown }
    if (Array.isArray(envelope.recipes) && envelope.recipes.length > 0) {
      return {
        recipes: envelope.recipes as Recipe[],
        modifiedTime: new Date(file.modifiedTime).getTime(),
      }
    }
    return null
  }

  if (Array.isArray(data) && data.length > 0) {
    return {
      recipes: data as Recipe[],
      modifiedTime: new Date(file.modifiedTime).getTime(),
    }
  }

  return null
}

export function loadLastSyncedAt(): number {
  try {
    return Number(window.localStorage.getItem(LAST_SYNCED_KEY)) || 0
  } catch {
    return 0
  }
}

export function saveLastSyncedAt(timestamp: number): void {
  try {
    window.localStorage.setItem(LAST_SYNCED_KEY, String(timestamp))
  } catch {
    // ignore
  }
}

export async function saveRecipesToDrive(
  accessToken: string,
  recipes: Recipe[],
): Promise<void> {
  const file = await findRecipesFile(accessToken)
  const fileId = file?.id ?? null
  const body = JSON.stringify(recipes)

  if (fileId) {
    // Update existing file
    const res = await fetch(
      `${DRIVE_UPLOAD_URL}/${fileId}?uploadType=media`,
      {
        method: "PATCH",
        headers: {
          ...headers(accessToken),
          "Content-Type": "application/json",
        },
        body,
      },
    )
    if (!res.ok) throw new Error(`Drive update failed: ${res.status}`)
  } else {
    // Create new file with multipart upload
    const metadata = {
      name: FILE_NAME,
      parents: ["appDataFolder"],
    }

    const boundary = "cakeculator_boundary"
    const multipartBody =
      `--${boundary}\r\n` +
      `Content-Type: application/json; charset=UTF-8\r\n\r\n` +
      `${JSON.stringify(metadata)}\r\n` +
      `--${boundary}\r\n` +
      `Content-Type: application/json\r\n\r\n` +
      `${body}\r\n` +
      `--${boundary}--`

    const res = await fetch(
      `${DRIVE_UPLOAD_URL}?uploadType=multipart`,
      {
        method: "POST",
        headers: {
          ...headers(accessToken),
          "Content-Type": `multipart/related; boundary=${boundary}`,
        },
        body: multipartBody,
      },
    )
    if (!res.ok) throw new Error(`Drive create failed: ${res.status}`)
  }
}
