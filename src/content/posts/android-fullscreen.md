---
title: 在 Android 应用中隐藏状态栏和导航栏
published: 2024-09-29
description: 使用 Kotlin 实现全屏显示 Activity
image: ""
tags:
  - Android
category: 教程
draft: false
lang: ""
---

## 修改 theme 文件

```xml
<resources>
  <style name="AppTheme.FullScreen" parent="Theme.AppCompat.DayNight.NoActionBar">
    <item name="android:windowFullscreen">true</item>
    <item name="android:windowLayoutInDisplayCutoutMode">shortEdges</item>
    <item name="android:windowActionBar">false</item>
    <item name="android:windowNoTitle">true</item>
    <item name="android:windowTranslucentNavigation">true</item>
    <item name="android:navigationBarColor">@android:color/transparent</item>
  </style>
</resources>
```

## 修改 MainActivity.kt

```kt
import android.os.Bundle
import android.view.WindowInsets
import android.view.WindowInsetsController
import android.view.WindowManager
import androidx.core.view.WindowCompat

class MainActivity {
  override fun onCreate(savedInstanceState: Bundle?) {
    // ...

    WindowCompat.setDecorFitsSystemWindows(window, false)
    window.decorView.windowInsetsController?.let { controller ->
      controller.hide(WindowInsets.Type.statusBars() or WindowInsets.Type.navigationBars())
      controller.systemBarsBehavior = WindowInsetsController.BEHAVIOR_SHOW_TRANSIENT_BARS_BY_SWIPE
    }
    window.addFlags(WindowManager.LayoutParams.FLAG_KEEP_SCREEN_ON)
  }
}
```
