import { IGuiMenuItem, IPluginConfig, PicGo } from 'picgo'
import { IGoogleDriveConfig } from './config'
import { IGDriveLocalesKey, localeEn, localesZhCn } from './i18n'
import { IPicGo, IPlugin } from 'picgo/dist/types'
import { authorize, getTokenPath } from './gdrive_utils'
import { OAuth2Client } from 'google-auth-library'
import fs from 'fs/promises'
import { google } from 'googleapis'
import * as stream from 'stream'
import { getCurrentFormattedTime } from './utils'
import ncp from 'node-clipboardy'

async function uploadProcess (ctx: IPicGo): Promise<void> {
  ctx.log.info('>> GDrive >> uploadProcess')
  ctx.log.info(ctx.output.toString())

  const userConfig: IGoogleDriveConfig = ctx.getConfig(configKeyName)
  // ctx.log.info('>> userConfig')
  // ctx.log.info(JSON.stringify(userConfig))
  const oauthClient = await authorize(userConfig, ctx)
  const drive = google.drive({
    version: 'v3',
    auth: oauthClient
  })

  for (const imgInfo of ctx.output) {
    ctx.log.info('>> GDrive >> uploadProcess >> imgInfo')
    ctx.log.info(imgInfo.fileName ?? '')
    /* Start to upload the image
    *  https://developers.google.com/drive/api/guides/manage-uploads#node.js
    *  https://developers.google.com/drive/api/guides/folder
    * */
    const defaultFileName = getCurrentFormattedTime() + '.png'
    let fileName = imgInfo.fileName ?? defaultFileName
    if (userConfig.imageNamePrefix) {
      fileName = userConfig.imageNamePrefix + '_' + fileName
    }
    ctx.log.info('final fileName to upload: ' + fileName)
    const requestBody = {
      name: fileName,
      parents: [userConfig.googleDriveDestFolderId]
    }
    const bufferStream = new stream.PassThrough()
    bufferStream.end(imgInfo.buffer)
    const media = {
      mimeType: 'image/png',
      body: bufferStream
    }
    try {
      const file = await drive.files.create({
        requestBody,
        media,
        // necessary to access shared folder: https://developers.google.com/drive/api/reference/rest/v3/files/list
        supportsAllDrives: true,
        // we can check the return data structure of `create` function to find the corresponding return filed. (drive_v3.Schema$File)
        // webViewLink -> shared link to the image file
        fields: 'id,name,webViewLink'
      })
      ctx.log.info(JSON.stringify(file.data) ?? '')
      const sharedLink = file.data.webViewLink ?? ''
      ncp.writeSync(sharedLink)
      // imgInfo.imgUrl = sharedLink
    } catch (err) {
      ctx.log.error(err)
    }
  }
}

/*  the key name MUST same with the uploader name */
/*  https://picgo.github.io/PicGo-Core-Doc/zh/dev-guide/cli.html#%E9%85%8D%E7%BD%AE%E9%A1%B9%E7%9A%84%E5%A4%84%E7%90%86
* 这里有个约定俗成的规定，你的Uploader的配置项会存放在picgo配置项的picBed下。
* 比如你的Uploader的name为gitlab，那么保存的时候会保存到picBed.gitlab下。
* 你的plugin本身如果有配置项，那么你的plugin配置项会直接存放在picgo配置项下，并且以你的plugin命名。
* Transformer的配置项会放在picgo配置项的transformer下。 关于配置相关的部分你应该查看配置文件一章。
*  */
const uploaderId = 'Google Drive'
const configKeyName = 'picBed.' + uploaderId

export = (ctx: IPicGo) => {
  const register = (): void => {
    // add the locale data to the picgo context
    ctx.i18n.addLocale('zh-CN', localesZhCn)
    ctx.i18n.addLocale('en', localeEn)
    const plugin: IPlugin = {
      handle,
      config
    }
    ctx.helper.uploader.register(uploaderId, plugin)
    ctx.helper.afterUploadPlugins.register(uploaderId, {
      handle (ctx) {
        ctx.log.info('afterUploadPlugins')
      }
    })
  }

  async function testAfterAuthorizeFinish (authClient: OAuth2Client): Promise<void> {
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
          // ctx.log.info(userConfig.oauthClientId)
          // ctx.log.info(userConfig.oauthClientSecret)
          authorize(userConfig, ctx).then(testAfterAuthorizeFinish).catch(ctx.log.error)
          ctx.log.info('>> GDrive >> guiMenu > end')
        }
      },
      {
        label: ctx.i18n.translate<IGDriveLocalesKey>('PIC_GDRIVE_MENU_TEST_UPLOAD'),
        async handle (ctx: IPicGo, guiApi) {
          ctx.log.info('>> GDrive >> guiMenu > test upload')
          ctx.output.forEach(imgInfo => {
            ctx.log.info('>> GDrive >> guiMenu > test upload > imgInfo')
            ctx.log.info(imgInfo.imgUrl ?? '')
            ctx.log.info(imgInfo.imgUrl ?? '')
          })
        }
      },
      {
        label: ctx.i18n.translate<IGDriveLocalesKey>('PIC_GDRIVE_MENU_CHECK_TOKEN_PATH'),
        async handle (ctx: IPicGo, guiApi) {
          const tokenPath = getTokenPath(ctx)
          ctx.log.info(tokenPath)
          const title = ctx.i18n.translate<IGDriveLocalesKey>('PIC_GDRIVE_MENU_CHECK_TOKEN_PATH')
          const messageSuffix = ctx.i18n.translate<IGDriveLocalesKey>('PIC_GDRIVE_MENU_CHECK_TOKEN_PATH_MESSAGE')
          const content = await fs.readFile(getTokenPath(ctx), 'utf-8')
          const exist = content !== undefined && content.length > 0
          const result = await guiApi.showMessageBox({
            title,
            message: tokenPath + messageSuffix + exist.toString(),
            type: 'info',
            buttons: ['Yes', 'No']
          })
          ctx.log.info(result)
        }
      },
      {
        label: ctx.i18n.translate<IGDriveLocalesKey>('PIC_GDRIVE_MENU_TEST'),
        async handle (ctx: IPicGo, guiApi) {
          ctx.log.info(ctx.configPath)
          ctx.log.info(ctx.baseDir)
        }
      }
    ]
  }

  const handle = async (ctx: IPicGo): Promise<IPicGo> => {
    ctx.log.info('>> GDrive >> handle trigger')
    await uploadProcess(ctx)
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

        const config: any = ctx.getConfig()
        ctx.log.info('>> userConfigBefore')
        ctx.log.info(JSON.stringify(config))

        /* save app origin config */
        const originCurrent = config.picBed.current
        const originUploader = config.picBed.uploader
        /* switch to this plugin temp */
        config.picBed.current = uploaderId
        config.picBed.uploader = uploaderId
        // ctx.log.info('>> userConfigBefore')
        // ctx.log.info(JSON.stringify(config))
        // ctx.log.info('>> updateUserConfigBefore')
        // ctx.log.info(JSON.stringify(config))

        ctx.setConfig(config)
        try {
          await guiApi.upload()
        } finally {
          /* switch back to origin config */
          config.picBed.current = originCurrent
          config.picBed.uploader = originUploader
          // ctx.log.info('>> finally')
          // ctx.log.info(JSON.stringify(config))
          ctx.setConfig(config)
        }
      }
    }
  ]
  return {
    uploader: uploaderId,
    commands,
    register,
    guiMenu
  }
}
