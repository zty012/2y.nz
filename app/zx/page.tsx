import { ZxLanding } from "@/components/zx-landing";
import type { Metadata } from "next";
import "./zx.css";

export const metadata: Metadata = {
  title: "zx · 客制化桌面仪表盘",
  description:
    "基于 ESP32-S3 的客制化桌面仪表盘，以 KDE Connect 联动手机与电脑。",
  openGraph: {
    title: "zx · 客制化桌面仪表盘",
    description: "时间、设备与正在播放的世界，放在触手可及的桌面上。",
    type: "website",
  },
};

export default function ZxPage() {
  return <ZxLanding />;
}
