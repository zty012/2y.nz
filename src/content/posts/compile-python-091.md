---
title: 编译 Python 0.9.1 版本
published: 2025-09-26
description: ""
image: ""
tags:
  - Python
  - C
category: 教程
draft: false
lang: ""
---

首先下载源码: [Python-0.9.1.tar.gz](https://www.python.org/ftp/python/src/Python-0.9.1.tar.gz)

## 修改 Makefile

将 56 行左右的 `For BSD` 注释掉，将 `For System V` 取消注释

## 编译

```sh
make clean
make CFLAGS="-ansi -Wno-implicit-int -Wno-implicit-function-declaration"
```
