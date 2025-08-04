---
title: 在 Git 历史记录中移除一个文件
published: 2024-07-28
description: 不小心把一个大文件提交到了 Git 仓库
image: ""
tags:
  - Git
category: 教程
draft: false
lang: ""
---

首先安装 [git-filter-repo](https://github.com/newren/git-filter-repo/blob/main/INSTALL.md) 插件

然后需要把仓库重新 clone 一份到本地

运行以下命令

```sh
git filter-repo --invert-paths --path <文件的路径>
```

最后强制推送远端

```sh
git push -f
```
