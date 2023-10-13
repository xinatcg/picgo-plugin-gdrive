import { PicGo } from 'picgo'

export = (ctx: PicGo) => {
  const register = (): void => {
    ctx.helper.uploader.register('gdrive', {
      handle (ctx) {
        console.log(ctx)
      }
    })
    ctx.helper.transformer.register('gdrive', {
      handle (ctx) {
        console.log(ctx)
      }
    })
    ctx.helper.beforeTransformPlugins.register('gdrive', {
      handle (ctx) {
        console.log(ctx)
      }
    })
    ctx.helper.beforeUploadPlugins.register('gdrive', {
      handle (ctx) {
        console.log(ctx)
      }
    })
    ctx.helper.afterUploadPlugins.register('gdrive', {
      handle (ctx) {
        console.log(ctx)
      }
    })
  }
  const commands = (ctx: PicGo) => [{
    label: '',
    key: '',
    name: '',
    async handle (ctx: PicGo, guiApi: any) {}
  }]
  return {
    uploader: 'gdrive',
    transformer: 'gdrive',
    commands,
    register
  }
}
