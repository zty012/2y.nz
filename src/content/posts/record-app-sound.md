---
title: 使用 FFmpeg 录制应用的声音
published: 2024-09-26
description: 使用 FFmpeg 和 PulseAudio 录制应用的声音，无需第三方软件
image: ""
tags:
  - Linux
  - FFmpeg
category: 教程
draft: false
lang: ""
---

```sh
$ ffmpeg -f pulse -i default output.wav

ffmpeg version n7.0.2 Copyright (c) 2000-2024 the FFmpeg developers
Press [q] to stop, [?] for help
```

然后就可以在应用里播放声音了，按 q 结束录制
