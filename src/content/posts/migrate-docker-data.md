---
title: 将 Docker 数据迁移到 /data 数据盘
published: 2025-08-28
description: 本文介绍如何将 Docker 的数据目录从默认位置迁移到新的数据盘（如 /data），以便更好地管理存储空间。
image: ""
tags:
  - Docker
  - Linux
category: 教程
draft: false
lang: ""
---

在使用 Docker 的过程中，默认情况下，Docker 会将其数据存储在 `/var/lib/docker` 目录下。如果你的系统盘空间有限，或者你希望将 Docker 数据存储在一个更大的数据盘上，可以通过以下步骤将 Docker 数据迁移到新的位置（例如 `/data/docker`）

本文以 `/data/docker` 作为新的数据目录为例

## 停止 Docker 服务

```sh
sudo systemctl stop docker.socket docker containerd
```

## 迁移数据

```sh
sudo rsync -aqxP /var/lib/docker/ /data/docker/
```

## 配置 Docker 使用新目录

```json title="/etc/docker/daemon.json"
{
  "data-root": "/data/docker"
}
```

## 删除或重命名旧数据目录（可选）

```sh
sudo mv /var/lib/docker /var/lib/docker.bak
```

## 启动 Docker 服务

```sh
sudo systemctl start containerd docker.socket docker
```
