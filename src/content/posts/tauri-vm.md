---
title: 在虚拟机中开发 Tauri 应用
published: 2025-08-12
description: 在本地运行前端服务，将构建产物在虚拟机中运行，并且可以使用完整的 DevTools
image: ""
tags:
  - Tauri
  - 前端
  - Linux
category: 教程
draft: false
lang: ""
---

## 添加后门

在前端的任意位置添加一个后门，触发时弹窗提示输入一个 URL，然后通过 `window.location.href` 跳转到该 URL

此步骤用于在构建后的 Tauri 应用中使用本地前端，比如 `http://192.168.122.1:1240`

## 设置在产物中保留 DevTools

有两种方法

### 启用 `devtools` feature

编辑 `Cargo.toml`，给 `tauri` 依赖添加一个 feature

```toml
[dependencies]
tauri = { version = "...", features = [..., "devtools"] }
# ...
```

### 直接构建 debug 版本

```sh
pnpm tauri build --debug
```

## 编译应用

可以使用 Github Actions 或者交叉编译来编译应用，然后把产物放到虚拟机中

## 运行前端

需要将服务暴露在虚拟机的网络，此处以 NAT 网络为例

### 获取在虚拟机 NAT 网络中的本机 IP 地址

以 KVM 为例：

```sh
$ arp -n
Address                  HWtype  HWaddress           Flags Mask            Iface
192.168.122.175          ether   52:54:00:0e:e6:bf   C                     virbr0
192.168.10.3             ether   22:d6:58:98:c5:25   C                     wlp0s20f3
192.168.10.11            ether   ea:f0:6c:fb:40:cb   C                     wlp0s20f3
192.168.10.1             ether   78:91:e9:e7:45:d8   C                     wlp0s20f3
```

因为虚拟机网络设备是 `virbr0`，对应的 `Address` 列为 `192.168.122.175`，所以 IP 地址为 `192.168.122.1`

### 启动前端服务

```sh
pnpm dev --host <刚才获取的 IP 地址>
```

## 在虚拟机中运行

运行刚才编译好的 Tauri 应用，触发后门，输入前端服务的地址，比如 `http://192.168.122.1:1420`，跳转到开发环境

## 使用 DevTools

因为刚才的步骤中配置了 DevTools，所以可以直接 `Ctrl+Shift+I` 打开 DevTools，和正常的开发环境一样
