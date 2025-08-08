---
title: 在 Next.js 中使用 Primer UI
published: 2025-08-08
description: 以 Brand UI 为例，介绍如何在 Next.js 项目中集成 Primer UI 组件库，并且无缝兼容 next-themes 主题系统
image: ""
tags:
  - Next.js
  - React
category: 教程
draft: false
lang: ""
---

## 安装 Primer

首先需要安装 Product UI 或者 Brand UI，详见 Primer 文档，本文以 Brand UI 为例

## 创建 `ThemeProvider` 组件

由于 Primer UI 的 `ThemeProvider` 是客户端组件，所以不能直接加入到 `layout.tsx` 中，得自己写一个

:::note
也可以直接使用 Primer 提供的 `ThemeProvider` 组件，只要能提供 `data-color-mode` 属性即可
:::

```tsx title="theme-provider.tsx"
"use client";

import { useTheme } from "next-themes";
import { ReactNode, useEffect } from "react";

export default function ThemeProvider({ children }: { children: ReactNode }) {
  const { theme } = useTheme();

  useEffect(() => {
    document.body.dataset.colorMode = theme;
  }, [theme]);

  return children;
}
```

## 使用 `ThemeProvider`

然后在 `layout.tsx` 中使用这个 Provider 就可以了
