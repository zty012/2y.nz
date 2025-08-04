---
title: 脑子一热，写了个睡眠记录应用
published: 2025-07-20
description: 市面上所有睡眠记录应用都不支持 NFC 记录，于是自己动手写了一个
image: /img/sleep.jpg
tags:
  - Android
category: 随笔
draft: false
lang: ""
---

使用 Jetpack Compose 编写 UI

## 原理

NFC 的原理和支付宝碰一下相同，都是通过 [Android 应用记录 (AAR)](https://developer.android.com/develop/connectivity/nfc/nfc#aar) 实现的

每一条记录有 `id`, `bedTime`, `wakeUpTime` 三个字段，其中 `bedTime` 是 nullable 的

记录开始的时候，添加一条 `bedTime == null` 记录，记录结束的时候，更新 `bedTime` 字段为当前时间

## 甘特图

甘特图是这个软件的特色功能，可以直观地看到睡眠记录的趋势

:::tip
图中的短线表示 0:00 时间点
:::

## 为什么不用系统自带的？

因为算法算出来的肯定不准确

## 为什么不用手环？

为了这一个功能而买不值得
