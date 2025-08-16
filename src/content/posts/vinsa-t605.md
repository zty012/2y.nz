---
title: Vinsa T605 Linux 驱动
published: 2025-06-01
description: 通过 udev 规则自动配置数位板为电脑模式
image: ""
tags:
  - Linux
  - 逆向
category: 教程
draft: false
lang: ""
---

:::warning
只适用于 16:9 比例的屏幕
:::

```udev title="/etc/udev/rules.d/99-vinsa-t605.rules"
SUBSYSTEM=="usb", ATTR{idVendor}=="08f2", ATTR{idProduct}=="6811", MODE="0666", RUN+="/usr/local/bin/tablet_setup.py"
```

```python title="/usr/local/bin/tablet_setup.py"
#!/usr/bin/env python3
import usb1
import time
import sys
import subprocess

VENDOR_ID = 0x08F2
PRODUCT_ID = 0x6811

# 通过逆向 Android 设置工具得到
NORMAL_MODE_REPORTS = [
    [0x08, 0x06, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00],
    [0x08, 0x01, 0x00, 0xFF, 0xF0, 0x00, 0xFF, 0xF0]
]

def reset_usb():
    try:
        subprocess.run(
            ["usbreset", f"{VENDOR_ID:04x}:{PRODUCT_ID:04x}"],
            capture_output=True, text=True
        )
        time.sleep(2)
    except:
        pass

def main():
    reset_usb()
    with usb1.USBContext() as ctx:
        d = ctx.openByVendorIDAndProductID(VENDOR_ID, PRODUCT_ID, skip_on_error=True)
        if not d:
            return 1
        i = 2
        try:
            if d.kernelDriverActive(i):
                try: d.detachKernelDriver(i)
                except: pass
            d.claimInterface(i)
            for r in NORMAL_MODE_REPORTS:
                try:
                    d.controlWrite(0x21, 0x09, 0x0300 | r[0], i, bytes(r), 1000)
                except: pass
                time.sleep(0.3)
            d.controlWrite(0x21, 0x09, 0x0308, i, bytes([0x08, 0x01, 0, 0, 0, 0, 0, 0]), 1000)
        except:
            return 1
        finally:
            try: d.releaseInterface(i)
            except: pass
            try: d.attachKernelDriver(i)
            except: pass
            reset_usb()
    return 0

if __name__ == "__main__":
    sys.exit(main())
```
