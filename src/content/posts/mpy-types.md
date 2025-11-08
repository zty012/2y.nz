---
title: 给 MicroPython 的模块添加类型提示，提升开发体验
published: 2025-11-08
description: 本文介绍如何为 MicroPython 的模块添加类型提示，以提升代码的可读性和开发体验，涵盖类型提示的基本概念、具体实现方法以及示例代码。
image: ''
tags:
  - Python
  - MicroPython
category: 教程
draft: false
lang: ''
---

[MicroPython-Stubs](https://micropython-stubs.readthedocs.io/en/main/index.html) 是一个比较新的、活跃的项目，旨在为 MicroPython 的模块添加 pyi 存根文件，从而为 MicroPython 提供类型提示支持。

## 安装

这里我使用 uv 来管理依赖，当然 venv 也是可以的：

```bash
uv init
uv add micropython-esp32-stubs
```

## 配置编辑器

### Zed

```json title=".zed/settings.json"
{
  "lsp": {
    "pyright": {
      "settings": {
        "python.analysis": {
          "extraPaths": [
            "./.venv/Lib/site-packages",
            "./.venv/lib/python3.12/site-packages",
            "./.venv/lib/python3.13/site-packages",
            "./.venv/lib/python3.14/site-packages"
          ],
          "typeCheckingMode": "basic",
          "diagnosticSeverityOverrides": {
            "reportMissingModuleSource": false
          }
        }
      }
    }
  }
}
```

### VSCode

```json title=".vscode/settings.json"
{
  "python.analysis.extraPaths": [
    "./.venv/Lib/site-packages",
    "./.venv/lib/python3.12/site-packages",
    "./.venv/lib/python3.13/site-packages",
    "./.venv/lib/python3.14/site-packages"
  ],
  "python.analysis.typeCheckingMode": "basic",
  "python.analysis.diagnosticSeverityOverrides": {
    "reportMissingModuleSource": "none"
  }
}
```

## 跋

经过如上配置后，编辑器就能识别 MicroPython 模块的类型提示了，从而提升代码的可读性和开发体验。希望本文对你有所帮助，祝你在 MicroPython 的开发旅程中一切顺利！
