import {IGuiMenuItem, IPluginConfig, PicGo} from 'picgo';
import {IGoogleDriveConfig} from './config';
import {IGDriveLocalesKey, localeEn, localesZhCn} from './i18n';
import {IPicGo, IPlugin} from 'picgo/dist/types';
import {authorize} from './gdrive_utils';
import { OAuth2Client } from 'google-auth-library'

function uploadProcess(ctx: IPicGo): void {
  ctx.log.info('>> GDrive >> uploadProcess');
}

const configKeyName = 'picBed.gdrive';



export = (ctx: IPicGo) => {
  const register = (): void => {
    // add the locale data to the picgo context
    ctx.i18n.addLocale('zh-CN', localesZhCn);
    ctx.i18n.addLocale('en', localeEn);
    const plugin: IPlugin = {
      handle,
      config,
    };
    ctx.helper.uploader.register('Google Drive', plugin);
    ctx.helper.afterUploadPlugins.register('Google Drive', {
      handle(ctx) {
        ctx.log.info('afterUploadPlugins');
      },
    });
  };

  async function listFiles(authClient: OAuth2Client) {
    ctx.log.info(">> after authorize finish!")
  }
  // Configuration
  const config = (ctx: IPicGo): IPluginConfig[] => {
    const defaultConfig: IGoogleDriveConfig = {
      oauthClientId: '',
      oauthClientSecret: '',
      googleDriveDestFolderId: '',
      imageNamePrefix: '',
      appendGoogleUserInfo: true,
    };
    let userConfig = ctx.getConfig<IGoogleDriveConfig>(configKeyName);
    userConfig = {...defaultConfig, ...(userConfig || {})};
    return [
      {
        name: 'oauthClientId',
        type: 'input',
        get alias() {
          return ctx.i18n.translate<IGDriveLocalesKey>(
            'PIC_GDRIVE_CONFIG_OAUTH_CLIENT_ID'
          );
        },
        get message() {
          return ctx.i18n.translate<IGDriveLocalesKey>(
            'PIC_GDRIVE_CONFIG_OAUTH_CLIENT_ID_MESSAGE'
          );
        },
        default: userConfig.oauthClientId || '',
        required: true,
      },
      {
        name: 'oauthClientSecret',
        type: 'input',
        get alias() {
          return ctx.i18n.translate<IGDriveLocalesKey>(
            'PIC_GDRIVE_CONFIG_OAUTH_CLIENT_SECRET'
          );
        },
        get message() {
          return ctx.i18n.translate<IGDriveLocalesKey>(
            'PIC_GDRIVE_CONFIG_OAUTH_CLIENT_SECRET_MESSAGE'
          );
        },
        default: userConfig.oauthClientSecret || '',
        required: true,
      },
      {
        name: 'googleDriveDestFolderId',
        type: 'input',
        get alias() {
          return ctx.i18n.translate<IGDriveLocalesKey>(
            'PIC_GDRIVE_CONFIG_GOOGLE_DRIVE_DEST_FOLDER_ID'
          );
        },
        get message() {
          return ctx.i18n.translate<IGDriveLocalesKey>(
            'PIC_GDRIVE_CONFIG_GOOGLE_DRIVE_DEST_FOLDER_ID_MESSAGE'
          );
        },
        default: userConfig.googleDriveDestFolderId || '',
        required: true,
      },
      {
        name: 'imageNamePrefix',
        type: 'input',
        get alias() {
          return ctx.i18n.translate<IGDriveLocalesKey>(
            'PIC_GDRIVE_CONFIG_IMAGE_NAME_PREFIX'
          );
        },
        get message() {
          return ctx.i18n.translate<IGDriveLocalesKey>(
            'PIC_GDRIVE_CONFIG_IMAGE_NAME_PREFIX_MESSAGE'
          );
        },
        default: userConfig.imageNamePrefix,
        required: false,
      },
      {
        name: 'appendGoogleUserInfo',
        type: 'confirm',
        get alias() {
          return ctx.i18n.translate<IGDriveLocalesKey>(
            'PIC_GDRIVE_CONFIG_APPEND_GOOGLE_USER_INFO'
          );
        },
        get message() {
          return ctx.i18n.translate<IGDriveLocalesKey>(
            'PIC_GDRIVE_CONFIG_APPEND_GOOGLE_USER_INFO_MESSAGE'
          );
        },
        default: userConfig.appendGoogleUserInfo,
        required: true,
      },
    ];
  };

  // GUI
  const guiMenu = (ctx: PicGo): IGuiMenuItem[] => {
    return [
      {
        label: ctx.i18n.translate<IGDriveLocalesKey>('PIC_GDRIVE_MENU_AUTH'),
        async handle(ctx: IPicGo, guiApi) {
          // TODO: use the Oauth2 configuration to authenticate with external web page
          // https://developers.google.com/drive/api/quickstart/nodejs#set_up_the_sample
          ctx.log.info('>> GDrive >> guiMenu > PIC_GDRIVE_MENU_AUTH > handle');
          const x = process.cwd();
          ctx.log.info('>> GDrive >> guiMenu > ' + x);
          const userConfig: IGoogleDriveConfig = ctx.getConfig(configKeyName);
          authorize(userConfig).then(listFiles).catch(ctx.log.error);
        },
      },
    ];
  };

  const handle = async (ctx: IPicGo): Promise<IPicGo> => {
    ctx.log.info('>> GDrive >> handle trigger');
    uploadProcess(ctx);
    return ctx;
  };

  /*
    Command to trigger upload process
    快捷键触发上传处理
  */
  const commands = (ctx: IPicGo): any => [
    {
      label: ctx.i18n.translate<IGDriveLocalesKey>('PIC_GDRIVE_COMMAND_UPLOAD'),
      key: 'Ctrl+Alt+0',
      name: 'uploadToGDrive',
      async handle(ctx: IPicGo, guiApi: any) {
        ctx.log.info('>> GDrive >> command trigger');
        uploadProcess(ctx);
      },
    },
  ];
  return {
    uploader: 'Google Drive',
    commands,
    register,
    guiMenu,
  };
};
