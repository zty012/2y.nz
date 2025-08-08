---
title: 使用 Coolify 部署前端应用
published: 2025-07-17
description: 放弃有诸多限制 Cloudflare Pages，转移到自部署的 Coolify 平台
image: ""
tags:
  - Coolify
  - Next.js
  - React
  - Linux
category: 教程
draft: false
lang: ""
---

无论是使用 Vercel 还是 Cloudflare Pages 部署，都存在一些限制

- 请求数量限制
- 应用大小限制
- 无法部署 Github 组织中的仓库

于是我找到了 Coolify，这是一个 Docker 容器管理器（类似 1Panel），并且得益于 Nixpacks 强大的自动检测框架能力，可以轻松地部署任意类型的应用

## 安装 Coolify

只需运行一条命令即可

```sh
curl -fsSL https://cdn.coollabs.io/coolify/install.sh | bash
```

安装完成后打开网页，创建一个账号后，就可以开始部署应用了

## 配置 Github App

虽然不配置也可以部署，但是配置后可以获得更多的功能，比如：

- 在 Push 代码时自动部署
- 支持部署 Private 仓库

参考官方文档: [Github Integration # With GitHub App](https://coolify.io/docs/knowledge-base/git/github/integration#with-github-app-recommended)

## 创建项目

选择左侧导航栏中的 Projects，然后点击 Add 按钮，输入项目名称，然后创建

## 创建资源

在 Resources 页面，点击 New 按钮

如果创建了 Github App，选择 `Private Repository (with GitHub App)`，否则选择 `Public Repository`

输入项目的仓库地址，模板选择 `Nixpacks`，然后点击创建

创建完成把资源页面中的 `Ports Exposes` 改为应用监听的端口，如 `3000`

## 配置域名

给域名添加一条 A 记录，指向服务器，Cloudflare SSL 需要改为灵活模式

将资源页面中的 `Domains` 选项改为 FQDN (Fully Qualified Domain Name)，格式如下

```plain
<scheme>://<host>:<port>
```

- `scheme`: 如果使用 Cloudflare 等自带 SSL 的 CDN，则为 `http`；否则为 `https`，Coolify 会自动生成 SSL 证书；如果不需要 SSL，则为 `http`
- `host`: 域名，如 `example.com`
- `port`: **应用监听**的端口，如 `3000`

## 部署应用

直接点击资源页面右上角的 Deploy，等待部署完成即可
