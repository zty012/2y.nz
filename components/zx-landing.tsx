"use client";

import { zxCards, type ZxCard, type ZxCardId } from "@/lib/zx";
import {
  ArrowLeft,
  BatteryMedium,
  ChevronLeft,
  ChevronRight,
  CirclePause,
  ExternalLink,
  Radio,
  Settings,
  X,
} from "lucide-react";
import { AnimatePresence, motion } from "motion/react";
import Link from "next/link";
import { useEffect, useState } from "react";

const transition = { type: "spring", stiffness: 320, damping: 34 } as const;

function DeviceContent({ card, time }: { card: ZxCard; time: Date | null }) {
  if (card.id === "overview") {
    return (
      <>
        <span className="zx-card-label">现在</span>
        <strong className="zx-clock">
          {time?.toLocaleTimeString("zh-CN", { hour12: false }) ?? "--:--:--"}
        </strong>
        <span className="zx-date">
          {time?.toLocaleDateString("zh-CN", {
            year: "numeric",
            month: "2-digit",
            day: "2-digit",
          }) ?? "----/--/--"}
        </span>
      </>
    );
  }

  if (card.id === "battery") {
    return (
      <>
        <span className="zx-card-label zx-inline-label">
          <BatteryMedium /> 电量
        </span>
        <strong className="zx-device-status">86%</strong>
        <span className="zx-device-meta">4072 mV</span>
      </>
    );
  }

  if (card.id === "connect") {
    return (
      <>
        <span className="zx-card-label">KDE</span>
        <Radio className="zx-status-icon" />
        <strong className="zx-device-status">1 在线</strong>
        <span className="zx-device-meta">1 已发现</span>
      </>
    );
  }

  if (card.id === "media") {
    return (
      <>
        <div className="zx-media-head">
          <span className="zx-card-label">媒体</span>
          <span className="zx-media-controls">
            <ChevronLeft /> <CirclePause /> <ChevronRight />
          </span>
        </div>
        <strong className="zx-media-title">我不是复制品</strong>
        <span className="zx-device-meta">
          星葵77/洛天依Official/乐正绫
        </span>
      </>
    );
  }

  return (
    <span className="zx-settings-device">
      <Settings /> 设置
    </span>
  );
}

function LandingContent({ card }: { card: ZxCard }) {
  return (
    <>
      <span className="zx-card-label">{card.eyebrow}</span>
      {card.id === "overview" ? (
        <>
          <strong className="zx-hero-title">zx</strong>
          <span className="zx-hero-kicker">客制化桌面仪表盘</span>
          <p className="zx-hero-summary">{card.summary}</p>
        </>
      ) : (
        <>
          <strong className="zx-landing-title">{card.title}</strong>
          <span className="zx-open-hint">点击展开</span>
        </>
      )}
    </>
  );
}

function BentoCard({
  card,
  time,
  onOpen,
}: {
  card: ZxCard;
  time: Date | null;
  onOpen: (id: ZxCardId) => void;
}) {
  const [showIntroduction, setShowIntroduction] = useState(false);

  return (
    <motion.button
      layoutId={`zx-card-${card.id}`}
      type="button"
      className={`zx-card zx-card-${card.id}`}
      style={{
        background: card.color,
        color: card.accent,
        gridColumn: card.gridColumn,
        gridRow: card.gridRow,
      }}
      transition={transition}
      whileHover={{ scale: 1.015 }}
      whileTap={{ scale: 0.985 }}
      onHoverStart={() => setShowIntroduction(true)}
      onHoverEnd={() => setShowIntroduction(false)}
      onFocus={() => setShowIntroduction(true)}
      onBlur={() => setShowIntroduction(false)}
      onClick={() => onOpen(card.id)}
      aria-label={`查看${card.title}`}
    >
      <motion.div
        className="zx-card-layer zx-device-layer"
        animate={{
          opacity: showIntroduction ? 0 : 1,
          filter: showIntroduction ? "blur(12px)" : "blur(0px)",
          scale: showIntroduction ? 0.98 : 1,
        }}
        transition={{ duration: 0.3, ease: [0.22, 1, 0.36, 1] }}
      >
        <DeviceContent card={card} time={time} />
      </motion.div>
      <motion.div
        className="zx-card-layer"
        initial={false}
        animate={{
          opacity: showIntroduction ? 1 : 0,
          filter: showIntroduction ? "blur(0px)" : "blur(12px)",
          scale: showIntroduction ? 1 : 1.02,
        }}
        transition={{ duration: 0.3, ease: [0.22, 1, 0.36, 1] }}
      >
        <LandingContent card={card} />
      </motion.div>
    </motion.button>
  );
}

function ExpandedCard({
  card,
  onClose,
}: {
  card: ZxCard;
  onClose: () => void;
}) {
  return (
    <motion.div
      className="zx-dialog-backdrop"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      onClick={onClose}
    >
      <motion.article
        layoutId={`zx-card-${card.id}`}
        role="dialog"
        aria-modal="true"
        aria-labelledby="zx-dialog-title"
        className="zx-dialog"
        style={{ background: card.color, color: card.accent }}
        transition={transition}
        onClick={(event) => event.stopPropagation()}
      >
        <motion.div
          className="zx-dialog-inner"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.2, delay: 0.12 }}
        >
          <div className="zx-dialog-topline">
            <span>{card.eyebrow}</span>
            <button type="button" onClick={onClose} aria-label="关闭详情">
              <X />
            </button>
          </div>
          <div className="zx-dialog-copy">
            <span className="zx-dialog-number">
              {String(zxCards.indexOf(card) + 1).padStart(2, "0")}
            </span>
            <h2 id="zx-dialog-title">{card.title}</h2>
            <p>{card.description}</p>
          </div>
          <dl className="zx-facts">
            {card.facts.map((fact) => (
              <div key={fact.label}>
                <dt>{fact.label}</dt>
                <dd>{fact.value}</dd>
              </div>
            ))}
          </dl>
          <div className="zx-dialog-actions">
            <a
              href="https://github.com/zty012/zx"
              target="_blank"
              rel="noreferrer"
            >
              <ExternalLink /> GitHub 源码
            </a>
            <a
              href="https://oshwhub.com/zty012/project_eabqovce"
              target="_blank"
              rel="noreferrer"
            >
              <ExternalLink /> 立创开源硬件
            </a>
          </div>
        </motion.div>
      </motion.article>
    </motion.div>
  );
}

export function ZxLanding() {
  const [expandedId, setExpandedId] = useState<ZxCardId | null>(null);
  const [time, setTime] = useState<Date | null>(null);
  const expandedCard = zxCards.find((card) => card.id === expandedId);

  useEffect(() => {
    setTime(new Date());
    const clockTimer = window.setInterval(() => setTime(new Date()), 1000);
    return () => {
      window.clearInterval(clockTimer);
    };
  }, []);

  useEffect(() => {
    if (!expandedId) return;
    const onKeyDown = (event: KeyboardEvent) => {
      if (event.key === "Escape") setExpandedId(null);
    };
    const previousOverflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    window.addEventListener("keydown", onKeyDown);
    return () => {
      document.body.style.overflow = previousOverflow;
      window.removeEventListener("keydown", onKeyDown);
    };
  }, [expandedId]);

  return (
    <main className="zx-page">
      <div className="zx-ambient zx-ambient-one" />
      <div className="zx-ambient zx-ambient-two" />
      <nav className="zx-nav" aria-label="zx 页面导航">
        <Link href="/">
          <ArrowLeft /> 2y.nz
        </Link>
        <span className="zx-nav-name">zx / 2026</span>
        <div>
          <a
            href="https://github.com/zty012/zx"
            target="_blank"
            rel="noreferrer"
          >
            GitHub
          </a>
          <a
            href="https://oshwhub.com/zty012/project_eabqovce"
            target="_blank"
            rel="noreferrer"
          >
            OSHWHub
          </a>
        </div>
      </nav>

      <section className="zx-stage" aria-label="zx 功能一览">
        <div className="zx-stage-heading">
          <span>01 / INTERFACE AS PRODUCT</span>
          <span>悬停预览 · 点击展开</span>
        </div>
        <div className="zx-device-shell">
          <div className="zx-device-grid">
            {zxCards.map((card) => (
              <BentoCard
                key={card.id}
                card={card}
                time={time}
                onOpen={setExpandedId}
              />
            ))}
          </div>
        </div>
        <div className="zx-stage-footer">
          <span>ESP32-S3 · LVGL 9 · KDE Connect</span>
          <span>480 × 320 TOUCH UI</span>
        </div>
      </section>

      <AnimatePresence>
        {expandedCard && (
          <ExpandedCard
            card={expandedCard}
            onClose={() => setExpandedId(null)}
          />
        )}
      </AnimatePresence>
    </main>
  );
}
