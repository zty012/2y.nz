import type { Metadata } from "next";
import { ZcLanding } from "@/components/zc-landing";
import "./zc.css";

export const metadata: Metadata = {
  title: "zc · 一台只做一件事的数码相机",
  description:
    "基于 ESP32-S3 和 OV5640 的小型数码相机，拍摄 QSXGA JPEG 并保存到 SD 卡。",
  openGraph: {
    title: "zc · 一台只做一件事的数码相机",
    description: "所见即所得。按下快门，留下完整的一帧。",
    type: "website",
  },
};

export default function ZcPage() {
  return <ZcLanding />;
}
