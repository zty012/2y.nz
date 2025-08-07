---
title: tput 颜色速查表
published: 2025-08-07
description: 这下忘不了 tput setaf 的数字对应颜色了
image: /img/tput.png
tags:
  - Linux
category: 记录
draft: false
lang: ""
---

重置: `tput sgr0`

:::warning
颜色会随终端配色方案变化，可能不准确，以上图片为 tty 中的颜色
:::

---

在终端中快速查看颜色表

```sh title="~/.zshrc"
colors() {
  color(){
    for c; do
        printf '\e[48;5;%dm%03d' $c $c
    done
    printf '\e[0m \n'
  }

  IFS=$' \t\n'
  color {0..15}
  for ((i=0;i<6;i++)); do
      color $(seq $((i*36+16)) $((i*36+51)))
  done
  color {232..255}
}
```
