---
title: WebKitGTK 与 GPU 加速
published: 2025-08-04
description: 让 WebKitGTK 强制使用 GPU 加速，以提升渲染性能
image: ""
tags:
  - Linux
category: 教程
draft: false
lang: ""
---

添加环境变量即可

```sh title="/etc/environment"
WEBKIT_FORCE_COMPOSITING_MODE=1
```
