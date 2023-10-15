# 开发笔记

## Google Drive API

参考官方文档: [Node.js quickstart](https://developers.google.com/drive/api/quickstart/nodejs)

官方文档的流程是通过加载 Token.json 文件来配置 Oauth. 我们需要将这个过程转化为使用配置来实现.

### 官方授权案例解析

```javascript
// The file token.json stores the user's access and refresh tokens, and is
// created automatically when the authorization flow completes for the first
// time.
const TOKEN_PATH = path.join(process.cwd(), 'token.json');
const CREDENTIALS_PATH = path.join(process.cwd(), 'credentials.json');
```

`token.json`: 保存授权成功后的 token
`credentials.json`: Oauth2 的配置文件

```javascript
authorize().then(listFiles).catch(console.error);

/**
 * Load or request or authorization to call APIs.
 *
 */
async function authorize () {
  // 如果已经有保存好的 token.json 直接加载
  let client = await loadSavedCredentialsIfExist();
  if (client) {
    return client;
  }

  // 如果没有的化, 需要进行授权操作. 这里使用的是 CREDENTIALS_PATH
  // 问题: 如何使用配置的信息来代替这个文件路径?
  client = await authenticateEnhance({
    scopes: SCOPES,
    keyfilePath: CREDENTIALS_PATH,
  });
  // 这里是异步授权后等待返回的 credential 然后保存下来.
  if (client.credentials) {
    await saveCredentials(client);
  }
  return client;
}
```

### 相关依赖库

#### local-auth

这是一个二次封装的授权库, 简化授权过程, 但是仅支持传入 token.json 文件路径.

```bash
npm install googleapis@105 @google-cloud/local-auth@2.1.0 --save
```

这里是具体[实现关键代码](https://github.com/googleapis/nodejs-local-auth/blob/67b792a1f795480d48f9ce0e5a74d2d7073b5fd4/src/index.ts#L73)

```javascript
export async function authenticate(
  options: LocalAuthOptions
): Promise<OAuth2Client> {
  if (
    !options ||
    !options.keyfilePath ||
    typeof options.keyfilePath !== 'string'
  ) {
    throw new Error(
      'keyfilePath must be set to the fully qualified path to a GCP credential keyfile.'
    );
  }

  // eslint-disable-next-line @typescript-eslint/no-var-requires
  const keyFile = require(options.keyfilePath);
  const keys = keyFile.installed || keyFile.web;
  if (!keys.redirect_uris || keys.redirect_uris.length === 0) {
    throw new Error(invalidRedirectUri);
  }
  const redirectUri = new URL(keys.redirect_uris[0] ?? 'http://localhost');
  if (redirectUri.hostname !== 'localhost') {
    throw new Error(invalidRedirectUri);
  }

  // create an oAuth client to authorize the API call
  const client = new OAuth2Client({
    clientId: keys.client_id,
    clientSecret: keys.client_secret,
  });
  //...
}
```


#### google-auth-library

```bash
npm install google-auth-library --save
```

### Google Drive API

https://developers.google.com/drive/api/guides/manage-uploads#node.js

#### Buffer to bufferStream

参考该[文章](https://www.labnol.org/google-drive-api-upload-220412)将 Buffer 转化为 Google Drive API 可以使用的数据

```javascript
const uploadFile = async (fileObject) => {
  const bufferStream = new stream.PassThrough();
  bufferStream.end(fileObject.buffer);
  const { data } = await google.drive({ version: 'v3' }).files.create({
    media: {
      mimeType: fileObject.mimeType,
      body: bufferStream,
    },
    requestBody: {
      name: fileObject.originalname,
      parents: ['DRIVE_FOLDER_ID'],
    },
    fields: 'id,name',
  });
  console.log(`Uploaded file ${data.name} ${data.id}`);
};
```

## PicGo Plugin 笔记

参考

https://github.com/yabostone/picgo-plugin-rclone
https://github.com/wayjam/picgo-plugin-s3
