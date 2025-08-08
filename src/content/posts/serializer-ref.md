---
title: "@graphif/serializer 引用机制的原理"
published: 2025-08-06
description: 利用对象引用机制，压缩对象序列化后的数据，用时间换空间
image: /img/serializer-ref.jpg
tags:
  - Project Graph
  - JS
category: 原理
draft: false
lang: ""
---

:::warning
算法有待优化，不建议学习
:::

## 概念

在一个对象中，经常会有「两个键指向相同的对象」的情况，这种情况下，可以将第二个键的值设为一个特殊的对象以节省空间，即「引用」。

## 前言

在 `@graphif/serializer` 以前的版本中，没有考虑到相同的对象可以被优化。

现在，既然我想到了，就把它做出来。

## 哪些对象可以被优化？

并不能粗暴地将所有相同的对象都优化，只有那些「比较复杂」的对象才有可能被优化。

比如，我这里通过「字符串值总长度」和「键值对数量」两个指标来判断一个对象是否比较复杂。

```ts
function isComplex(obj: Record<string, any>): boolean {
  const stringLengthTotal = Object.values(obj)
    .filter((v) => typeof v === "string")
    .reduce((acc, v) => acc + v.length, 0);
  return Object.keys(obj).length > 5 || stringLengthTotal >= 50;
}
```

## 「引用」如何表示？

在 `@graphif/serializer` 中，用 `$` 作为引用的标志。

```json
[{ "hello": "world" }, { "$": "/0" }]
```

在上面的例子中，第二个对象引用了第一个对象。

`$` 的值是一个路径，类似 XPath，但是全部使用 `/` 分隔，数组也是。

## 怎么知道对象对应的路径？

首先生成一个「对象 ID」，可以用任意算法生成，只要保证唯一性即可。

例如，我使用 `md5` 哈希算法和 `MsgPack` 编码生成。

```ts
const okey = md5(encode(result));
```

:::note
`okey` == `Object Key`
:::

然后，将「对象 ID」和「路径」对应起来即可。

```ts
const obj2path = new Map<string, string>();
```

## 跋

第一次做这种东西，尝试了几个小时才成功，效果还行。

不管了，以后有时间再重新搞一遍吧。
