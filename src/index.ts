import { IGuiMenuItem, IPluginConfig, PicGo } from 'picgo'
import { IGoogleDriveConfig } from './config'
import { IGDriveLocalesKey, localeEn, localesZhCn } from './i18n'

function uploadProcess (ctx: PicGo): void {
  ctx.log.info('>> GDrive >> uploadProcess')
}

export = (ctx: PicGo) => {
  const register = (): void => {
    // add the locale data to the picgo context
    ctx.i18n.addLocale('zh-CN', localesZhCn)
    ctx.i18n.addLocale('en', localeEn)
    ctx.helper.uploader.register('Google Drive', {
      handle,
      config
    })
    ctx.helper.afterUploadPlugins.register('Google Drive', {
      handle (ctx) {
        ctx.log.info('afterUploadPlugins')
      }
    })
  }

  // Configuration
  const config = (ctx: PicGo): IPluginConfig[] => {
    const defaultConfig: IGoogleDriveConfig = {
      oauthClientId: '',
      oauthClientSecret: '',
      googleDriveDestFolderId: '',
      imageNamePrefix: '',
      appendGoogleUserInfo: true
    }
    let userConfig = ctx.getConfig<IGoogleDriveConfig>('picBed.gdrive')
    userConfig = { ...defaultConfig, ...(userConfig || {}) }
    return [
      {
        name: 'oauthClientId',
        type: 'input',
        get alias () {
          return ctx.i18n.translate<IGDriveLocalesKey>('PIC_GDRIVE_CONFIG_OAUTH_CLIENT_ID')
        },
        get message () {
          return ctx.i18n.translate<IGDriveLocalesKey>('PIC_GDRIVE_CONFIG_OAUTH_CLIENT_ID_MESSAGE')
        },
        default: userConfig.oauthClientId || '',
        required: true
      },
      {
        name: 'oauthClientSecret',
        type: 'input',
        get alias () {
          return ctx.i18n.translate<IGDriveLocalesKey>('PIC_GDRIVE_CONFIG_OAUTH_CLIENT_SECRET')
        },
        get message () {
          return ctx.i18n.translate<IGDriveLocalesKey>('PIC_GDRIVE_CONFIG_OAUTH_CLIENT_SECRET_MESSAGE')
        },
        default: userConfig.oauthClientSecret || '',
        required: true
      },
      {
        name: 'googleDriveDestFolderId',
        type: 'input',
        get alias () {
          return ctx.i18n.translate<IGDriveLocalesKey>('PIC_GDRIVE_CONFIG_GOOGLE_DRIVE_DEST_FOLDER_ID')
        },
        get message () {
          return ctx.i18n.translate<IGDriveLocalesKey>('PIC_GDRIVE_CONFIG_GOOGLE_DRIVE_DEST_FOLDER_ID_MESSAGE')
        },
        default: userConfig.googleDriveDestFolderId || '',
        required: true
      },
      {
        name: 'imageNamePrefix',
        type: 'input',
        get alias () {
          return ctx.i18n.translate<IGDriveLocalesKey>('PIC_GDRIVE_CONFIG_IMAGE_NAME_PREFIX')
        },
        get message () {
          return ctx.i18n.translate<IGDriveLocalesKey>('PIC_GDRIVE_CONFIG_IMAGE_NAME_PREFIX_MESSAGE')
        },
        default: userConfig.imageNamePrefix,
        required: false
      },
      {
        name: 'appendGoogleUserInfo',
        type: 'confirm',
        get alias () {
          return ctx.i18n.translate<IGDriveLocalesKey>('PIC_GDRIVE_CONFIG_APPEND_GOOGLE_USER_INFO')
        },
        get message () {
          return ctx.i18n.translate<IGDriveLocalesKey>('PIC_GDRIVE_CONFIG_APPEND_GOOGLE_USER_INFO_MESSAGE')
        },
        default: userConfig.appendGoogleUserInfo,
        required: true
      }
    ]
  }

  // GUI
  const guiMenu = (ctx: PicGo): IGuiMenuItem[] => {
    return [
      {
        label: ctx.i18n.translate<IGDriveLocalesKey>('PIC_GDRIVE_MENU_AUTH'),
        async handle (ctx: PicGo, guiApi) {
          // TODO: use the Oauth2 configuration to authenticate with external web page
          // https://developers.google.com/drive/api/quickstart/nodejs#set_up_the_sample
          ctx.log.info('>> GDrive >> guiMenu > PIC_GDRIVE_MENU_AUTH > handle')
        }
      }
    ]
  }

  const handle = async (ctx: PicGo): Promise<PicGo> => {
    ctx.log.info('>> GDrive >> handle trigger')
    uploadProcess(ctx)
    return ctx
  }

  /*
    Command to trigger upload process
    快捷键触发上传处理
  */
  const commands = (ctx: PicGo): any => [{
    label: ctx.i18n.translate<IGDriveLocalesKey>('PIC_GDRIVE_COMMAND_UPLOAD'),
    key: 'Ctrl+Alt+0',
    name: 'uploadToGDrive',
    async handle (ctx: PicGo, guiApi: any) {
      ctx.log.info('>> GDrive >> command trigger')
      uploadProcess(ctx)
    }
  }]
  return {
    uploader: 'Google Drive',
    commands,
    register,
    guiMenu
  }
}
