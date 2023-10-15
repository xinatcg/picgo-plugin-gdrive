import { IGuiMenuItem, IPluginConfig, PicGo } from 'picgo'
import { IGoogleDriveConfig } from './config'
import { IGDriveLocalesKey, localeEn, localesZhCn } from './i18n'
import { IPicGo, IPlugin } from 'picgo/dist/types'
import { authorize } from './gdrive_utils'
import { OAuth2Client } from 'google-auth-library'

function uploadProcess (ctx: IPicGo): void {
  ctx.log.info('>> GDrive >> uploadProcess')
}

/*  the key name MUST same with the uploader name */
/*  https://picgo.github.io/PicGo-Core-Doc/zh/dev-guide/cli.html#%E9%85%8D%E7%BD%AE%E9%A1%B9%E7%9A%84%E5%A4%84%E7%90%86
* 这里有个约定俗成的规定，你的Uploader的配置项会存放在picgo配置项的picBed下。
* 比如你的Uploader的name为gitlab，那么保存的时候会保存到picBed.gitlab下。
* 你的plugin本身如果有配置项，那么你的plugin配置项会直接存放在picgo配置项下，并且以你的plugin命名。
* Transformer的配置项会放在picgo配置项的transformer下。 关于配置相关的部分你应该查看配置文件一章。
*  */
const configKeyName = 'picBed.Google Drive'

export = (ctx: IPicGo) => {
  const register = (): void => {
    // add the locale data to the picgo context
    ctx.i18n.addLocale('zh-CN', localesZhCn)
    ctx.i18n.addLocale('en', localeEn)
    const plugin: IPlugin = {
      handle,
      config
    }
    ctx.helper.uploader.register('Google Drive', plugin)
    ctx.helper.afterUploadPlugins.register('Google Drive', {
      handle (ctx) {
        ctx.log.info('afterUploadPlugins')
      }
    })
  }

  async function listFiles (authClient: OAuth2Client) {
    ctx.log.info('>> after authorize finish!')
  }

  // Configuration
  const config = (ctx: IPicGo): IPluginConfig[] => {
    const defaultConfig: IGoogleDriveConfig = {
      oauthClientId: '',
      oauthClientSecret: '',
      googleDriveDestFolderId: '',
      imageNamePrefix: '',
      appendGoogleUserInfo: true
    }
    let userConfig = ctx.getConfig<IGoogleDriveConfig>(configKeyName)
    userConfig = { ...defaultConfig, ...(userConfig || {}) }
    return [
      {
        name: 'oauthClientId',
        type: 'input',
        get alias () {
          return ctx.i18n.translate<IGDriveLocalesKey>(
            'PIC_GDRIVE_CONFIG_OAUTH_CLIENT_ID'
          )
        },
        get message () {
          return ctx.i18n.translate<IGDriveLocalesKey>(
            'PIC_GDRIVE_CONFIG_OAUTH_CLIENT_ID_MESSAGE'
          )
        },
        default: userConfig.oauthClientId || '',
        required: true
      },
      {
        name: 'oauthClientSecret',
        type: 'input',
        get alias () {
          return ctx.i18n.translate<IGDriveLocalesKey>(
            'PIC_GDRIVE_CONFIG_OAUTH_CLIENT_SECRET'
          )
        },
        get message () {
          return ctx.i18n.translate<IGDriveLocalesKey>(
            'PIC_GDRIVE_CONFIG_OAUTH_CLIENT_SECRET_MESSAGE'
          )
        },
        default: userConfig.oauthClientSecret || '',
        required: true
      },
      {
        name: 'googleDriveDestFolderId',
        type: 'input',
        get alias () {
          return ctx.i18n.translate<IGDriveLocalesKey>(
            'PIC_GDRIVE_CONFIG_GOOGLE_DRIVE_DEST_FOLDER_ID'
          )
        },
        get message () {
          return ctx.i18n.translate<IGDriveLocalesKey>(
            'PIC_GDRIVE_CONFIG_GOOGLE_DRIVE_DEST_FOLDER_ID_MESSAGE'
          )
        },
        default: userConfig.googleDriveDestFolderId || '',
        required: true
      },
      {
        name: 'imageNamePrefix',
        type: 'input',
        get alias () {
          return ctx.i18n.translate<IGDriveLocalesKey>(
            'PIC_GDRIVE_CONFIG_IMAGE_NAME_PREFIX'
          )
        },
        get message () {
          return ctx.i18n.translate<IGDriveLocalesKey>(
            'PIC_GDRIVE_CONFIG_IMAGE_NAME_PREFIX_MESSAGE'
          )
        },
        default: userConfig.imageNamePrefix,
        required: false
      },
      {
        name: 'appendGoogleUserInfo',
        type: 'confirm',
        get alias () {
          return ctx.i18n.translate<IGDriveLocalesKey>(
            'PIC_GDRIVE_CONFIG_APPEND_GOOGLE_USER_INFO'
          )
        },
        get message () {
          return ctx.i18n.translate<IGDriveLocalesKey>(
            'PIC_GDRIVE_CONFIG_APPEND_GOOGLE_USER_INFO_MESSAGE'
          )
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
        async handle (ctx: IPicGo, guiApi) {
          // TODO: use the Oauth2 configuration to authenticate with external web page
          // https://developers.google.com/drive/api/quickstart/nodejs#set_up_the_sample
          ctx.log.info('>> GDrive >> guiMenu > PIC_GDRIVE_MENU_AUTH > handle')
          const x = process.cwd()
          ctx.log.info('>> GDrive >> guiMenu > ' + x)
          const userConfig: IGoogleDriveConfig = ctx.getConfig(configKeyName)
          ctx.log.info('>> GDrive >> guiMenu > config')
          ctx.log.info(userConfig.oauthClientId)
          ctx.log.info(userConfig.oauthClientSecret)
          authorize(userConfig, ctx).then(listFiles).catch(ctx.log.error)
          ctx.log.info('>> GDrive >> guiMenu > end')
        }
      }
    ]
  }

  const handle = async (ctx: IPicGo): Promise<IPicGo> => {
    ctx.log.info('>> GDrive >> handle trigger')
    uploadProcess(ctx)
    return ctx
  }

  /*
    Command to trigger upload process
    快捷键触发上传处理
  */
  const commands = (ctx: IPicGo): any => [
    {
      label: ctx.i18n.translate<IGDriveLocalesKey>('PIC_GDRIVE_COMMAND_UPLOAD'),
      key: 'Ctrl+Alt+0',
      name: 'uploadToGDrive',
      async handle (ctx: IPicGo, guiApi: any) {
        ctx.log.info('>> GDrive >> command trigger')
        uploadProcess(ctx)
      }
    }
  ]
  return {
    uploader: 'Google Drive',
    commands,
    register,
    guiMenu
  }
}
