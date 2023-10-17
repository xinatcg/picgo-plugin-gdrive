## PicGo Google Drive Plugin

[中文文档](README_cn.md)|En

This plugin implements the upload of clipboard images to a specified folder on Google Drive via OAuth2 authorization and retrieves the shareable link.

## Usage

### Configuration and Authorization

#### OAuth Configuration and Authorization

Currently, this plugin uses OAuth authorization with the following process:

1. Create a Project in Google Cloud.
2. Enable the Google Drive API.
3. Create an OAuth consent screen.
4. Create Credentials: Client ID and Client Secret.

In simple terms, the authorization process follows a standard OAuth flow. We configure the OAuth ClientId and Client Secret associated with Google Cloud project. Under this configuration, users need to log into their Google account and grant authorization to the project to access their Google resources.

You can directly refer to the Google documentation: [Node.js quickstart](https://developers.google.com/drive/api/quickstart/nodejs). The document details how to obtain OAuth Client Id and Client Secret on the Google Cloud platform.

![OAuth Configuration](https://cdn.jsdelivr.net/gh/storageimgbed/storage@img/images/202310170934457.png)
After configuring the OAuth ClientId and Client Secret, we can start the authorization process.

![Initiate Authentication](https://cdn.jsdelivr.net/gh/storageimgbed/storage@img/images/202310170934012.png)

After clicking the "Login and Authenticate" button, a webpage will open. Ensure that your webpage is logged into the Google account you want to authorize (the target user for image uploads).

![OAuth Login](https://cdn.jsdelivr.net/gh/storageimgbed/storage@img/images/202310170915884.png)
![OAuth Permission](https://cdn.jsdelivr.net/gh/storageimgbed/storage@img/images/202310170916827.png)
![Authentication Successful](https://cdn.jsdelivr.net/gh/storageimgbed/storage@img/images/202310170917226.png)

When you see this last page, it means the authorization was successful: Authentication successful!

After successful authorization, a `gdrive_token.json` file will be created in PicGo's configuration folder. This way, you only need to authorize once, and in the future, you can directly access Google Drive permissions through this file. Here's a feature to check the path of this token file and whether it exists:

![Token File Check](https://cdn.jsdelivr.net/gh/storageimgbed/storage@img/images/202310170935280.png)
This is the token file's path on Mac.

![Token File Path](https://cdn.jsdelivr.net/gh/storageimgbed/storage@img/images/202310170936447.png)

With this, the OAuth configuration and authorization are completed.

#### Folder ID

We need to specify a folder as the target destination for uploading images. This folder supports both shared and team-shared folders.

Open your target folder in the browser and view the URL. The last ID in the URL is the folder's ID.

![Folder ID](https://cdn.jsdelivr.net/gh/storageimgbed/storage@img/images/202310170923094.png)

Copy this ID and fill it in the configuration.

![Configuration with Folder ID](https://cdn.jsdelivr.net/gh/storageimgbed/storage@img/images/202310170936111.png)

#### Other Configurations

![Other Configurations](https://cdn.jsdelivr.net/gh/storageimgbed/storage@img/images/202310170937729.png)

1. Image File Prefix: Here you can add an additional prefix to all uploaded images.
2. Append Google User Information to File Name: TODO
3. Copy Link to Clipboard Directly: This option is to not affect the global configuration. Only copy the shareable link. For example, if our global configuration is GitHub + Markdown link, but for Google Drive, I only want to copy the link, I can enable this option.

### Trigger with Keyboard Shortcut

![Keyboard Shortcut](https://cdn.jsdelivr.net/gh/storageimgbed/storage@img/images/202310170943283.png)

This plugin registers a keyboard shortcut for directly uploading to Google Drive. This shortcut temporarily switches the current configuration to Google Drive, uploads the image, and then switches back to the default configuration.

The purpose is to support quick uploads to two image beds. The default configuration is GitHub, and only special images are uploaded to Google Drive, such as images intended for internal sharing.

## Use Cases

Why develop this plugin? It's mainly based on a need - internal image sharing and support for Google Drive Embed third-party applications. For example, we currently use ClickUp as our task management system. Since the free version of ClickUp has limited storage space, but we have a sufficiently large paid version of Google Drive, we need to upload screenshots to Google Drive and then get their shareable links to paste into ClickUp. The pasted link can directly embed the content into the page. The main advantages are:

1. Image sharing is private, accessible only to Google accounts with the appropriate permissions.
2. Image location changes do not affect shared links.

## Future Plans

1. Support generating external links: [Reference](https://www.googledrives.cn/552.html).
2. Support Service Account authorization method.
3. Automation control over image names increases.
