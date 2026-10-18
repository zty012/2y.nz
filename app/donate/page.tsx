import type { Metadata } from "next";
import { DonateContent } from "@/components/donate-content";
import "./donate.css";

export const metadata: Metadata = {
  title: "赞助 · 2y.nz",
  description:
    "如果这里的作品对你有一点帮助，欢迎请我喝杯咖啡。感谢每一份支持，让热爱继续发生。",
};

export default function DonatePage() {
  return <DonateContent />;
}
