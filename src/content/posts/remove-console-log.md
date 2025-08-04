---
title: 利用正则删除所有 console.log
published: 2024-11-23
description: 利用正则表达式删除所有 console.log，以提高应用性能
image: ""
tags:
  - 前端
category: 教程
draft: false
lang: ""
---

```regex
(// )?console\.log\((.|\n)*?\);?
```
