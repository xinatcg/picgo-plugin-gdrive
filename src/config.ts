/**
 * The config interface for the Google Drive
 */
export interface IGoogleDriveConfig {
  /* Oauth Authentication: https://developers.google.com/drive/api/quickstart/nodejs */
  oauthClientId: string // Oauth client id
  oauthClientSecret: string // Oauth client secret
  googleDriveDestFolderId: string // the destination of google drive folder
  imageNamePrefix?: string // append prefix for the image name before upload to google drive
  appendGoogleUserInfo?: boolean // if enabled, the image name will append google user info
}
