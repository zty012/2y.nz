export interface Project {
  title: string;
  description: string;
  tags: string[];
  githubUrl?: string;
}

export const projects: Project[] = [
  {
    title: "Project Graph",
    description:
      "无限画布的节点图绘制工具。用图论拓扑的力量，将碎片化的灵感编织成有序的智慧。",
    tags: ["TypeScript", "React", "Tauri"],
    githubUrl: "https://github.com/graphif/project-graph",
  },
];
