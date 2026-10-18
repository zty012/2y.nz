export interface Project {
  title: string;
  description: string;
  tags: string[];
  preview: "graph" | "device" | "serial";
  category: string;
  githubUrl?: string;
  href?: string;
}

export const projects: Project[] = [
  {
    title: "Project Graph",
    description:
      "无限画布的节点图绘制工具。用图论拓扑的力量，将碎片化的灵感编织成有序的智慧。",
    tags: ["TypeScript", "React", "Tauri"],
    preview: "graph",
    category: "SOFTWARE / 开源工具",
    githubUrl: "https://github.com/graphif/project-graph",
  },
  {
    title: "zx",
    description:
      "基于 ESP32-S3 的客制化桌面仪表盘。用 KDE Connect 将时间、媒体与设备状态带到桌面。",
    tags: ["ESP32-S3", "LVGL", "KDE Connect"],
    preview: "device",
    category: "HARDWARE / 桌面设备",
    githubUrl: "https://github.com/zty012/zx",
    href: "/zx",
  },
  {
    title: "GUART",
    description:
      "用 Go 构建的原生串口工作台。支持 UTF-8 / HEX 收发、ANSI 日志与被动 MCU 推断，让每一个字节都有迹可循。",
    tags: ["Go", "MyGo", "MujicaUI"],
    preview: "serial",
    category: "SOFTWARE / 串口工具",
    githubUrl: "https://github.com/zty012/guart",
    href: "https://guart.2y.nz",
  },
];
