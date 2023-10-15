import * as fs from 'fs/promises'
import * as path from 'path'
import * as process from 'process'
import { google } from 'googleapis'
import { authenticateEnhance, LocalAuthOptionsEnhance } from './local_auth_enhance'
import { IGoogleDriveConfig } from './config'
import { OAuth2Client } from 'google-auth-library'
import { IPicGo } from 'picgo/dist/types'
// If modifying these scopes, delete token.json.
const SCOPES: string[] = ['https://www.googleapis.com/auth/drive.metadata.readonly']
// The file token.json stores the user's access and refresh tokens, and is
// created automatically when the authorization flow completes for the first
// time.
const TOKEN_PATH: string = path.join(process.cwd(), 'token.json')

/**
 * Reads previously authorized credentials from the save file.
 *
 * @return {Promise<OAuth2Client|null>}
 */
async function loadSavedCredentialsIfExist (): Promise<OAuth2Client | null> {
  try {
    const content = await fs.readFile(TOKEN_PATH, 'utf-8')
    const credentials = JSON.parse(content)
    return google.auth.fromJSON(credentials) as OAuth2Client
  } catch (err) {
    return null
  }
}

/**
 * Serializes credentials to a file compatible with GoogleAuth.fromJSON.
 *
 * @param {OAuth2Client} client
 * @param {string} clientId client id
 * @param {string} clientSecret
 * @return {Promise<void>}
 */
async function saveCredentials (client: OAuth2Client, clientId: string, clientSecret: string): Promise<void> {
  const payload = JSON.stringify({
    type: 'authorized_user',
    client_id: clientId,
    client_secret: clientSecret,
    refresh_token: client.credentials.refresh_token
  })
  await fs.writeFile(TOKEN_PATH, payload)
}

/**
 * Load or request authorization to call APIs.
 *
 */
export async function authorize (iGoogleDriveConfig: IGoogleDriveConfig, ctx: IPicGo): Promise<OAuth2Client> {
  ctx.log.info('>> authorize')
  let client = await loadSavedCredentialsIfExist()
  if (client) {
    return client
  }
  const option: LocalAuthOptionsEnhance = {
    scopes: SCOPES,
    clientId: iGoogleDriveConfig.oauthClientId,
    clientSecret: iGoogleDriveConfig.oauthClientSecret
  }
  ctx.log.info('>> start authenticateEnhance and config')
  ctx.log.info(iGoogleDriveConfig.oauthClientId)
  ctx.log.info(iGoogleDriveConfig.oauthClientSecret)
  client = await authenticateEnhance(option, ctx)
  if (client.credentials) {
    await saveCredentials(client, iGoogleDriveConfig.oauthClientId, iGoogleDriveConfig.oauthClientSecret)
  }
  return client
}

/**
 * Lists the names and IDs of up to 10 files.
 * @param {OAuth2Client} authClient An authorized OAuth2 client.
 */
// async function listFiles (authClient: OAuth2Client): Promise<void> {
//   const drive = google.drive({
//     version: 'v3',
//     auth: authClient
//   })
//   const res = await drive.files.list({
//     pageSize: 10,
//     fields: 'nextPageToken, files(id, name)'
//   })
//   const files = res.data.files
//   if (files.length === 0) {
//     console.log('No files found.')
//     return
//   }
//
//   console.log('Files:')
//   files.map((file) => {
//     console.log(`${file.name} (${file.id})`)
//   })
// }
