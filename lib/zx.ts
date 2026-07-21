export type ZxCardId =
  | "overview"
  | "battery"
  | "connect"
  | "media"
  | "settings";

export interface ZxCard {
  id: ZxCardId;
  label: string;
  eyebrow: string;
  title: string;
  summary: string;
  description: string;
  color: string;
  accent: string;
  gridColumn: string;
  gridRow: string;
  facts: { label: string; value: string }[];
}

export const zxCards: ZxCard[] = [
  {
    id: "overview",
    label: "现在",
    eyebrow: "ESP32-S3 DESKTOP DASHBOARD",
    title: "zx",
    summary: "把时间、设备与正在播放的世界，放在触手可及的桌面上。",
    description:
      "zx 是一台基于 ESP32-S3 的客制化桌面仪表盘。它用 480×320 触摸界面承载时钟、电源状态和媒体控制，并通过 KDE Connect 与局域网中的手机和电脑协作。",
    color: "#202a4a",
    accent: "#a9b8f7",
    gridColumn: "1 / span 3",
    gridRow: "1 / span 2",
    facts: [
      { label: "主控", value: "ESP32-S3-WROOM-1-N16R8" },
      { label: "界面", value: "LVGL 9 · 480×320 Touch UI" },
      { label: "系统", value: "ESP-IDF 6 · 双核任务调度" },
    ],
  },
  {
    id: "battery",
    label: "电量",
    eyebrow: "POWER",
    title: "电源，心中有数",
    summary: "IP5306 电源管理、实时电压与多级休眠。",
    description:
      "设备持续读取电池电压并估算剩余电量，同时展示 IP5306 的充电、满电与负载状态。Light Sleep、Deep Sleep 和 Boost Off 对应不同的待机需求。",
    color: "#173c35",
    accent: "#9fe8ce",
    gridColumn: "4",
    gridRow: "1",
    facts: [
      { label: "电源管理", value: "IP5306-I2C" },
      { label: "电量采样", value: "ADC 分压实时读取" },
      { label: "休眠", value: "Light · Deep · Boost Off" },
    ],
  },
  {
    id: "connect",
    label: "KDE",
    eyebrow: "KDE CONNECT",
    title: "跨越屏幕的连接",
    summary: "发现、配对、媒体与查找设备，都在局域网内完成。",
    description:
      "zx 实现 KDE Connect 的局域网发现和安全会话，支持验证码配对、可信设备持久化与查找设备。通信由 mbedTLS 保护，不依赖云端服务。",
    color: "#3b294a",
    accent: "#e4c9ff",
    gridColumn: "4",
    gridRow: "2",
    facts: [
      { label: "发现", value: "UDP / TCP Identity" },
      { label: "安全", value: "mbedTLS 加密会话" },
      { label: "功能", value: "配对 · 查找 · MPRIS" },
    ],
  },
  {
    id: "media",
    label: "媒体",
    eyebrow: "NOW PLAYING",
    title: "播放，仍在指尖",
    summary: "看见曲目，也能上一曲、暂停或继续下一曲。",
    description:
      "通过 KDE Connect MPRIS 插件，仪表盘同步已连接设备的播放器、曲目和艺人信息。触摸卡片上的控制按钮即可远程操控播放。",
    color: "#40301c",
    accent: "#ffd691",
    gridColumn: "1 / span 2",
    gridRow: "3",
    facts: [
      { label: "信息", value: "播放器 · 曲目 · 艺人" },
      { label: "控制", value: "上一曲 · 播放暂停 · 下一曲" },
      { label: "协议", value: "KDE Connect MPRIS" },
    ],
  },
  {
    id: "settings",
    label: "设置",
    eyebrow: "MAKE IT YOURS",
    title: "由你定义的仪表盘",
    summary: "从 Wi-Fi 到背光，从设备名到休眠方式。",
    description:
      "设置页集中管理 Wi-Fi 扫描与连接、显示亮度、KDE Connect 设备和电池状态。常用配置写入 NVS，重新上电后自动恢复。",
    color: "#252936",
    accent: "#d8deef",
    gridColumn: "3 / span 2",
    gridRow: "3",
    facts: [
      { label: "联网", value: "Wi-Fi · SNTP 自动校时" },
      { label: "持久化", value: "凭证与偏好写入 NVS" },
      { label: "硬件开放", value: "原理图与 PCB 已开源" },
    ],
  },
];
