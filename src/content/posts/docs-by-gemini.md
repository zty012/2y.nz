---
title: 使用 Gemini CLI 全自动生成文档
published: 2025-08-07
description: 借助 Gemini 方便的 CLI 工具，编写 Shell 脚本，自动为项目内所有文件生成文档
image: ""
tags:
  - Linux
  - Project Graph
  - AI
category: 教程
draft: false
lang: ""
---

首先需要安装 Gemini CLI，不多赘述

然后编写一个 Bash 脚本:

```sh
#!/bin/bash
set -e

model="gemini-2.5-flash"
out="./docs/services"
mkdir -p "$out"

for file in $(grep -rl "^@service" app/src/core); do
  relative=${file#app/src/core/}
  relative="app/src/core/$relative"
  service=$(grep -oP '@service\("\K[^"]+(?="\))' "$file")
  service=$(echo "$service" | sed -E 's/([a-z0-9])([A-Z])/\1-\L\2/g' | tr '[:upper:]' '[:lower:]')

  doc="$out/$service.zh-CN.mdx"
  [[ -e $doc ]] && { echo "$(tput setaf 3)文件 $doc 已存在，跳过"; continue; }

  prompt=$(cat <<EOF
下面是一段 TypeScript 源码。请完成三件事，用三行“---”作为分隔符输出：

1. 用中文概述这个服务的用途，要求同以前（不要称“类”，分段，善用标题，不要一级标题，API 方法也要标题）。
2. 给这个服务起一个 lucide 的大驼峰图标名。
3. 把服务原始大驼峰名翻译成中文，格式：“[原文的大驼峰形式][空格][译文]”。

不要输出多余的解释或空白。

example:
用于管理用户会话，跟踪登录状态与权限……

## API

### \`login(userId: string): Promise<void>\`

……

### \`logout(): Promise<void>\`

……
---
UserCog
---
UserService 用户服务
end example.

---
$(cat "$file")
EOF
  )

  tput setaf 4
  echo "正在生成 $service.zh-CN.mdx, $relative"
  tput setaf 8

  # 一次请求拿到三段
  raw=$(gemini -p "$prompt" -m "$model")

  # 用 awk 按 "---" 拆分
  doc_body=$(echo "$raw" | awk -v RS='---' 'NR==1{print; exit}')
  icon=$(echo      "$raw" | awk -v RS='---' 'NR==2{gsub(/[[:space:]]/, ""); print}')
  title=$(echo     "$raw" | awk -v RS='---' 'NR==3{gsub(/^[[:space:]]+|[[:space:]]+$/, ""); print}')

  tput setaf 2
  echo "标题: $title"
  echo "图标: $icon"

  cat > "$doc" <<EOF
---
title: $title
icon: $icon
relatedFile: $relative
---

$doc_body
EOF
done
```

## 原理

1. 脚本会找到项目内所有使用 `@service` 装饰器的 TypeScript 文件，并获取服务名和文件路径
2. 调用 Gemini CLI，生成文档内容、标题、图标
3. 保存到 `.md` 文件，并添加 `relatedFile` frontmatter，指向源文件的相对路径

## See Also

- [源文件](https://github.com/graphif/project-graph/blob/31f067a9cc67e6c0ada05dad257bbda5f591eacf/utils/generate-service-docs.sh)
- [tput 颜色速查表](/p/tput)
