---
title: 使用 Docker Compose 部署 Discourse
published: 2025-10-26
description: 本文介绍如何使用 Docker Compose 来部署 Discourse 论坛软件，涵盖环境准备、配置文件编写以及启动服务的步骤。
image: ''
tags:
  - Docker
  - Discourse
category: 教程
draft: false
lang: ''
---

Discourse 是很好用的论坛框架，但是它不能用 Docker Compose 来管理，本文介绍一种使用 Docker Compose 来部署它的方法。

## `docker-compose.yml` 文件

```yml
version: "3.8"
services:
  redis:
    image: redis:7-alpine
    restart: always
  postgres:
    # 原版 postgres 镜像不支持 pgvector 扩展，所以需要用这个镜像
    image: pgvector/pgvector:0.8.1-pg18-trixie
    restart: always
    environment:
      POSTGRES_DB: discourse
      POSTGRES_USER: discourse
      POSTGRES_PASSWORD: ${DB_PASS}
    volumes:
      - postgres-data:/var/lib/postgresql/data
  discourse:
    # VMWare 的 Bitnami 镜像已经转收费了，这里用 public.ecr.aws 上的免费版
    image: public.ecr.aws/bitnami/discourse:latest
    restart: always
    depends_on:
      - postgres
      - redis
    environment:
      DISCOURSE_HOSTNAME: ${DOMAIN}
      DISCOURSE_DATABASE_NAME: discourse
      DISCOURSE_DATABASE_USER: discourse
      DISCOURSE_DATABASE_PASSWORD: ${DB_PASS}
      DISCOURSE_DATABASE_HOST: postgres
      DISCOURSE_REDIS_HOST: redis
      DISCOURSE_SMTP_HOST: ${SMTP_HOST}
      DISCOURSE_SMTP_PORT: ${SMTP_PORT}
      DISCOURSE_SMTP_USER: ${SMTP_USER}
      DISCOURSE_SMTP_PASSWORD: ${SMTP_PASS}
      DISCOURSE_SMTP_PROTOCOL: tls
      DISCOURSE_EMAIL: ${ADMIN_EMAIL}
      DISCOURSE_POSTGRESQL_EXTENSIONS: unaccent,pg_trgm,btree_gist
      DISCOURSE_SKIP_BOOTSTRAP: "yes" # 稍后再进行初始化
      BITNAMI_DEBUG: true
    volumes:
      - discourse-data:/bitnami/discourse
    # 暴露端口
    # ports:
    #  - "3000:3000"
    # 或者用 Traefik
    # labels:
    #  - "traefik.enable=true"
    #  - ...
```

## 配置环境变量

```sh
DOMAIN=forum.example.com
DB_PASS=your_db_password
SMTP_HOST=smtp.example.com
SMTP_PORT=587
SMTP_USER=your_smtp_user
SMTP_PASS=your_smtp_password
ADMIN_EMAIL=admin@example.com
```

## 启动服务

```sh
docker-compose up -d
```

## 创建管理员账号

进入容器，运行以下命令

```sh
cd /opt/bitnami/discourse
RAILS_ENV=production bundle exec rake admin:create
```

## 完成

至此，Discourse 已经成功部署完成，可以通过浏览器访问 `http://forum.example.com` 来使用论坛了。

## 配置 Github OAuth

跟着[文档](https://meta.discourse.org/t/configure-github-login-for-discourse/13745)操作就行，但是注意 `Redirect URI` 不能用 `https://`，得写成类似 `http://forum.example.com/auth/github/callback`
