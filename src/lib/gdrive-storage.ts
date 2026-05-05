import type { Recipe as CakeCostRecipe } from "#/types/recipe"
import type { Recipe } from "#/types/recipe-book"

const FILE_NAME = "cakeculator-recipes.json"
const DRIVE_FILES_URL = "https://www.googleapis.com/drive/v3/files"
const DRIVE_UPLOAD_URL = "https://www.googleapis.com/upload/drive/v3/files"
const LAST_SYNCED_KEY = "cakeculator-last-synced"

export type CloudData = {
  schemaVersion: 2
  cakeCost: { recipes: CakeCostRecipe[] }
  recipeBook: { recipes: Recipe[] }
}

function emptyCloudData(): CloudData {
  return {
    schemaVersion: 2,
    cakeCost: { recipes: [] },
    recipeBook: { recipes: [] },
  }
}

function parseCloudData(raw: unknown): CloudData | null {
  // New format
  if (
    raw &&
    typeof raw === "object" &&
    "schemaVersion" in raw &&
    (raw as { schemaVersion: unknown }).schemaVersion === 2
  ) {
    const obj = raw as Partial<CloudData>
    return {
      schemaVersion: 2,
      cakeCost: { recipes: obj.cakeCost?.recipes ?? [] },
      recipeBook: { recipes: obj.recipeBook?.recipes ?? [] },
    }
  }

  // Legacy: direct array of cost recipes
  if (Array.isArray(raw)) {
    if (raw.length === 0) return null
    const data = emptyCloudData()
    data.cakeCost.recipes = raw as CakeCostRecipe[]
    return data
  }

  // Legacy envelope: { recipes: [...] } where recipes were cost recipes
  if (raw && typeof raw === "object" && "recipes" in raw) {
    const env = raw as { recipes: unknown }
    if (Array.isArray(env.recipes) && env.recipes.length > 0) {
      const data = emptyCloudData()
      data.cakeCost.recipes = env.recipes as CakeCostRecipe[]
      return data
    }
  }

  return null
}

function headers(accessToken: string): HeadersInit {
  return { Authorization: `Bearer ${accessToken}` }
}

async function findDataFile(
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

export async function fetchCloudDataFromDrive(
  accessToken: string,
): Promise<{ data: CloudData; modifiedTime: number } | null> {
  const file = await findDataFile(accessToken)
  if (!file) return null

  const res = await fetch(`${DRIVE_FILES_URL}/${file.id}?alt=media`, {
    headers: headers(accessToken),
  })

  if (!res.ok) throw new Error(`Drive download failed: ${res.status}`)

  const raw: unknown = await res.json()
  const parsed = parseCloudData(raw)
  if (!parsed) return null

  return {
    data: parsed,
    modifiedTime: new Date(file.modifiedTime).getTime(),
  }
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

export async function saveCloudDataToDrive(
  accessToken: string,
  data: CloudData,
): Promise<void> {
  const file = await findDataFile(accessToken)
  const fileId = file?.id ?? null
  const body = JSON.stringify(data)

  if (fileId) {
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
