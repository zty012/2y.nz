"use client";

import {
  ArrowDownToLine,
  ArrowLeft,
  ArrowUpRight,
  Code2,
  Coffee,
  Heart,
  ScanLine,
  Sparkles,
} from "lucide-react";
import { motion, useReducedMotion } from "motion/react";
import Image from "next/image";
import Link from "next/link";
import donateImage from "@/public/donate.png";

const reasons = [
  {
    icon: Code2,
    title: "让作品持续生长",
    detail: "多一点时间，打磨代码与细节。",
  },
  {
    icon: Sparkles,
    title: "让灵感落地成真",
    detail: "把脑海里的小想法，变成可用的作品。",
  },
  {
    icon: Coffee,
    title: "也补充一点能量",
    detail: "一杯咖啡，就是很棒的鼓励。",
  },
];

export function DonateContent() {
  const reducedMotion = useReducedMotion();
  const reveal = (delay: number) => ({
    initial: { opacity: 0 },
    animate: { opacity: 1 },
    transition: {
      duration: reducedMotion ? 0 : 0.7,
      delay: reducedMotion ? 0 : delay,
    },
  });

  return (
    <main className="donate-page">
      <div className="donate-atmosphere" aria-hidden="true" />

      <header className="donate-header">
        <Link href="/" className="donate-home" aria-label="2y.nz，返回首页">
          <ArrowLeft size={16} aria-hidden="true" />
          <span>
            2y<span className="donate-brand-dot">.</span>nz
          </span>
        </Link>
        <span className="donate-header-note">
          A LITTLE SUPPORT, A LONG WAY.
        </span>
        <span className="donate-header-label">
          <span />
          感谢有你
        </span>
      </header>

      <div className="donate-main">
        <section className="donate-story" aria-labelledby="donate-title">
          <motion.p {...reveal(0.05)} className="donate-eyebrow">
            <span /> SUPPORT THE THINGS YOU LOVE
          </motion.p>

          <motion.div {...reveal(0.15)}>
            <h1 id="donate-title">
              让热爱，
              <br />
              <span>继续发生。</span>
            </h1>
            <p className="donate-handwritten">Keep the spark alive.</p>
          </motion.div>

          <motion.div {...reveal(0.25)} className="donate-intro">
            <p>
              如果这里的作品，恰好帮到了你，
              <br className="donate-desktop-break" />
              或是让你觉得「这个还挺有意思」。
            </p>
            <p>欢迎请我喝杯咖啡，为下一次创造加一点燃料。</p>
          </motion.div>

          <motion.div {...reveal(0.35)} className="donate-reasons">
            {reasons.map(({ icon: Icon, title, detail }, index) => (
              <div className="donate-reason" key={title}>
                <span className="donate-reason-icon">
                  <Icon size={19} strokeWidth={1.5} aria-hidden="true" />
                </span>
                <div>
                  <h2>{title}</h2>
                  <p>{detail}</p>
                </div>
                <span className="donate-reason-number" aria-hidden="true">
                  0{index + 1}
                </span>
              </div>
            ))}
          </motion.div>
        </section>

        <motion.section
          {...reveal(0.25)}
          className="donate-card"
          aria-labelledby="donate-card-title"
        >
          <div className="donate-card-topline">
            <span className="donate-card-kicker">A SMALL GESTURE</span>
            <Heart size={17} strokeWidth={1.5} aria-hidden="true" />
          </div>
          <div className="donate-card-heading">
            <span className="donate-coffee">
              <Coffee size={27} strokeWidth={1.5} aria-hidden="true" />
            </span>
            <h2 id="donate-card-title">请我喝杯咖啡</h2>
            <p>不在多少，每一份心意都很珍贵。</p>
          </div>

          <a
            href="/donate.png"
            target="_blank"
            rel="noopener noreferrer"
            className="donate-qr-link"
            aria-label="在新标签页查看完整微信赞赏码"
          >
            <div className="donate-qr">
              {/* The source includes a decorative frame; show only the complete 506px QR square. */}
              <Image
                src={donateImage}
                alt="zty 的微信赞赏码，使用微信扫一扫进行赞赏"
                priority
                unoptimized
                sizes="600px"
                className="donate-qr-image"
              />
            </div>
            <span
              className="donate-qr-corner donate-qr-corner-tl"
              aria-hidden="true"
            />
            <span
              className="donate-qr-corner donate-qr-corner-br"
              aria-hidden="true"
            />
          </a>

          <p className="donate-scan">
            <ScanLine size={15} aria-hidden="true" />
            微信扫一扫，传递一点心意
          </p>
          <div className="donate-card-divider">
            <span />
            <Heart size={12} aria-hidden="true" />
            <span />
          </div>
          <a
            href="/donate.png"
            download="zty-donate.png"
            className="donate-download"
          >
            <ArrowDownToLine size={16} aria-hidden="true" />
            保存赞赏码
            <ArrowUpRight size={15} aria-hidden="true" />
          </a>
          <p className="donate-save-hint">手机上也可以保存图片，在微信中识别</p>
          <div className="donate-card-bottom">
            <span />
            自愿赞赏 · 金额随心
          </div>
        </motion.section>
      </div>

      <motion.footer {...reveal(0.45)} className="donate-footer">
        <p>
          <Heart size={14} aria-hidden="true" />
          支持不止于赞赏。使用、分享、反馈，同样让我满怀动力。
        </p>
        <span>MADE WITH CARE. SHARED WITH YOU.</span>
      </motion.footer>
    </main>
  );
}
