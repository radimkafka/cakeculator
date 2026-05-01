import type { Recipe } from "#/types/recipe"

const FILE_NAME = "cakeculator-recipes.json"
const DRIVE_FILES_URL = "https://www.googleapis.com/drive/v3/files"
const DRIVE_UPLOAD_URL = "https://www.googleapis.com/upload/drive/v3/files"

function headers(accessToken: string): HeadersInit {
  return { Authorization: `Bearer ${accessToken}` }
}

async function findRecipesFile(accessToken: string): Promise<string | null> {
  const params = new URLSearchParams({
    spaces: "appDataFolder",
    q: `name='${FILE_NAME}'`,
    fields: "files(id)",
  })

  const res = await fetch(`${DRIVE_FILES_URL}?${params}`, {
    headers: headers(accessToken),
  })

  if (!res.ok) throw new Error(`Drive list failed: ${res.status}`)

  const data = (await res.json()) as { files: { id: string }[] }
  return data.files[0]?.id ?? null
}

export async function fetchRecipesFromDrive(
  accessToken: string,
): Promise<Recipe[] | null> {
  const fileId = await findRecipesFile(accessToken)
  if (!fileId) return null

  const res = await fetch(`${DRIVE_FILES_URL}/${fileId}?alt=media`, {
    headers: headers(accessToken),
  })

  if (!res.ok) throw new Error(`Drive download failed: ${res.status}`)

  const data: unknown = await res.json()
  if (!Array.isArray(data) || data.length === 0) return null
  return data as Recipe[]
}

export async function saveRecipesToDrive(
  accessToken: string,
  recipes: Recipe[],
): Promise<void> {
  const fileId = await findRecipesFile(accessToken)
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
