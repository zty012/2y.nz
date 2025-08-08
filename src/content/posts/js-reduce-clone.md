---
title: Array.reduce() 会修改原数组！
published: 2025-08-05
description: 神秘 Bug 居然是 Array.reduce() 导致的
image: ""
tags:
  - JS
  - Project Graph
category: 随笔
draft: false
lang: ""
---

```ts
get(index: number) {
  // 先获取从0到index（包含index）的所有patch
  const patches = this.patches.slice(0, index + 1);
  // 从initialStage开始应用patch，得到在index时刻的舞台序列化数据
  const data = patches.reduce((acc, patch) => {
    return applyPatch(acc, patch).newDocument;
  }, this.initialStage);
  // 反序列化得到舞台对象
  const stage = deserialize(data, this.project);
  console.log("get %d = %o (patches %o)", index, stage, patches);
  return stage;
}
```

这段代码用来获取在 `index` 时刻的舞台数据

看似没问题对吧，运行一下

```plain title="Console"
[INFO] get 0 = [ {} ] (patches: [
  { op: 'add', path: '/0', value: [ {} ] },
])
[INFO] get 0 = [ {}, {} ] (patches: [
  { op: 'add', path: '/0', value: [ {} ] },
])
```

诶，结果应该是一样的，为什么第二次运行结果多了一个 `{}`？

参考 [MDN「`Array.prototype.reduce()` # 有初始值时 reduce() 如何运行」](https://developer.mozilla.org/zh-CN/docs/Web/JavaScript/Reference/Global_Objects/Array/reduce#%E6%9C%89%E5%88%9D%E5%A7%8B%E5%80%BC%E6%97%B6_reduce_%E5%A6%82%E4%BD%95%E8%BF%90%E8%A1%8C)

如果给 `reduce()` 提供了初始值引用，那么第一个参数提供的函数的返回值将会修改初始值

所以得拷贝一份 `initialStage` 作为初始值，以 lodash 为例

```ts
get(index: number) {
  // 先获取从0到index（包含index）的所有patch
  const patches = this.patches.slice(0, index + 1);
  // 从initialStage开始应用patch，得到在index时刻的舞台序列化数据
  const data = patches.reduce((acc, patch) => {
    return applyPatch(acc, patch).newDocument;
  }, _.cloneDeep(this.initialStage));
  // 反序列化得到舞台对象
  const stage = deserialize(data, this.project);
  console.log("get %d = %o (patches %o)", index, stage, patches);
  return stage;
}
```

这样就不会修改原数组了，问题解决
