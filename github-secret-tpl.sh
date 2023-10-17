#!/usr/bin/env sh
# How to use?
# 1. copy the github-secret-tpl.json to github-secret.json
# 2. update the github-secret.json with some secret value
# 3. run this script to set the secret to the GitHub repository

gh secret list
# SLACK Notification, create the income webhook
gh secret set SLACK_WEBHOOK -b""
# Publish to NPM: create the access token on the npmjs.com
gh secret set NPM_TOKEN -b""

gh secret list
