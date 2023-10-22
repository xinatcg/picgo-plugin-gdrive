# PicGo Google Drive 插件 

[English](README.md)|中文文档

该插件实现通过 Oauth2 授权, 上传剪切板图片到 Google Drive 指定文件夹, 并获取共享链接.

## 使用方法

### 配置与授权

#### Oauth 配置及授权

本插件目前使用 OAuth 授权, 流程如下:

1. Google Cloud 创建一个 Project
2. Enable Google Drive 的 API
3. 创建 OAuth 的 consent screen
4. 创建 Credential: Client ID 和 Client Secret

简单的说, 授权的过程是一个标准的 OAuth 流程, 我们配置的内容为 Google Cloud 的项目的对应 Oauth 授权的 Credential. 在这个配置下, 用户需要登陆自己的 Google 账号, 然后通过 Oauth 授权给该项目访问你的 Google 的资源. 

可以直接参考 Google 文档: [Node.js quickstart](https://developers.google.com/drive/api/quickstart/nodejs). 该文档详细的介绍如何在 Google Cloud 平台获取 Oauth 的 Client Id 和 Client Secret.

![](https://cdn.jsdelivr.net/gh/storageimgbed/storage@img/images/202310170912351.png)

配置 OAuth 的 ClientId 和 Client Secret 后, 我们就可以启动授权流程

![](https://cdn.jsdelivr.net/gh/storageimgbed/storage@img/images/202310170912392.png)

点击登陆认证按钮后, 会跳转打开一个网页, 确保你的网页登陆了你需要授权的 Google 账号 (就是图片需要上传的目标用户)

![](https://cdn.jsdelivr.net/gh/storageimgbed/storage@img/images/202310170915884.png)
![](https://cdn.jsdelivr.net/gh/storageimgbed/storage@img/images/202310170916827.png)
![](https://cdn.jsdelivr.net/gh/storageimgbed/storage@img/images/202310170917226.png)

当我们看到最后这个页面时, 表示授权成功了: Authentication successful!

授权成功后, 会在 PicGo 的配置文件夹中创建一个 `gdrive_token.json` 的文件, 这样只需要授权一次, 以后就可以直接通过该文件获取权限访问 Google Drive. 这里提供了一个功能来检查该文件的路径以及是否存在:

![](https://cdn.jsdelivr.net/gh/storageimgbed/storage@img/images/202310170919547.png)

这是在 Mac 上该 Token 文件的路径

![](https://cdn.jsdelivr.net/gh/storageimgbed/storage@img/images/202310170920590.png)

至此 Oauth 的配置和授权就完成了.

#### 文件夹 ID

我们需要指定一个文件夹作为上传图片的目标地址. 这个文件夹支持共享文件夹和 Team 共享文件夹.

在浏览器打开你的目标文件夹, 然后查看 URL, URL 的最后的 ID 就是该文件夹的 ID.

![](https://cdn.jsdelivr.net/gh/storageimgbed/storage@img/images/202310170923094.png)

拷贝这个 ID 然后填入配置中:

![](https://cdn.jsdelivr.net/gh/storageimgbed/storage@img/images/202310170924452.png)

#### 其他配置

![](https://cdn.jsdelivr.net/gh/storageimgbed/storage@img/images/202310170925324.png)

1. 图片文件前缀: 这里可以为所有上传的图片额外增加一个前缀
2. 文件名是否追加 Google 用户信息: TODO
3. 是否直接复制链接到剪切板: 这个选项是为了不影响全局配置的情况的, 只拷贝共享链接. 比如我们全局配置是 Github + Markdown link, 而 Google Drive 我只想拷贝链接, 我就可以打开这个选项.

### 快捷键触发

![](https://cdn.jsdelivr.net/gh/storageimgbed/storage@img/images/202310170928511.png)

该 Plugin 注册了一个快捷键, 用于直接上传到 Google Drive, 这个快捷键会临时将当前的配置切换为 Google Drive, 然后上传完成再切换回默认的配置. 

其目的是我想同时支持两种图床的快捷上传, 默认的配置是 GitHub, 只有特殊的图片才使用 Google Drive 比如只希望内部分享的图片.

## 使用场景

为什么还要开发这个插件呢? 这里主要基于一个需求点, 内部图片分享和支持Google Drive Embed 第三方应用. 举个例子, 我们目前使用 ClickUp 作为我们的任务管理系统, 由于 ClickUp 免费版本存储空间很少, 但是我们有足够大的 Google Drive 的付费版, 所以我们需要将截图上传到 Google Drive 然后再获取其贡献链接粘贴到 ClickUp, 粘贴后的 Link 可以直接将内容嵌入到页面. 其主要优点: 

1. 图片分享是隐私的, 只有登陆了具有访问权限的 Google 账号才能访问图片
2. 图片位置变更不影响分享链接

## 后续计划

1. 支持外链的生成: [参考](https://www.googledrives.cn/552.html)
2. 支持 Service Account 授权方式
3. 图片名自动化控制能力增强

