export interface Project {
  title: string;
  description: string;
  tags: string[];
  githubUrl?: string;
  href?: string;
}

export const projects: Project[] = [
  {
    title: "Project Graph",
    description:
      "无限画布的节点图绘制工具。用图论拓扑的力量，将碎片化的灵感编织成有序的智慧。",
    tags: ["TypeScript", "React", "Tauri"],
    githubUrl: "https://github.com/graphif/project-graph",
  },
  {
    title: "zx",
    description:
      "基于 ESP32-S3 的客制化桌面仪表盘。用 KDE Connect 将时间、媒体与设备状态带到桌面。",
    tags: ["ESP32-S3", "LVGL", "KDE Connect"],
    githubUrl: "https://github.com/zty012/zx",
    href: "/zx",
  },
];
