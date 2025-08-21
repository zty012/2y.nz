---
title: 使用 pyftsubset 压缩字体
published: 2025-08-21
description: 使用 pyftsubset 工具来压缩字体文件，减少文件大小并提高加载速度。
image: ""
tags: []
category: 教程
draft: false
lang: ""
---

首先需要安装 `fonttools`

只保留数字和大写字母：`pyftsubset ./DINPro-Bold_13934.ttf --unicodes="U+0030-0039,U+0041-005A,U+002E" --flavor=woff2 --with-zopfli`
