---
title: Linux 蓝牙音频突然断流的解决方案
published: 2026-01-17
description: 彻底解决 Linux 使用蓝牙音频设备时出现的断流问题
image: ''
tags:
  - Linux
category: ''
draft: false 
lang: ''
---

ERTM (Enhanced Re-Transmission Mode) 本意是为了在丢包时通过重传保证可靠性。但在 Linux 环境下，由于驱动实现不佳或环境干扰（如 USB 3.0 噪声），协议栈会陷入重传循环，导致实时性要求极高的音频流（A2DP）被阻塞。表现出来就是：连接没断，但没声音了。

## 解决方法

只需要设置一个内核模块参数，禁用 ERTM 即可。

```plain title="/etc/modprobe.d/bluetooth.conf"
options bluetooth disable_ertm=1
```
