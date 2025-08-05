---
title: Linux 将程序放在后台运行的几种方法
published: 2025-08-05
description: "&, %, &!, nohup, disown"
image: ""
tags:
  - Linux
category: 记录
draft: false
lang: ""
---

## 放在后台运行，和 shell 同生共死

在命令末尾加上 `&` 就能放在后台运行，会提示一个 job 编号

使用命令 `%` 或 `fg` 加上 job 编号可以把程序拉回前台

如果要重新放到后台，可以按 `Ctrl-Z` 挂起，再用 `bg` 命令放回后台

## 放在后台运行，不管 shell 进程了

### 方法 1

在命令末尾加上 `&!` 即可

### 方法 2

在命令前加上 `nohup`

### 方法 3

先用 `&` 放到后台，然后用 `disown` 命令把它从当前 shell 进程中分离
