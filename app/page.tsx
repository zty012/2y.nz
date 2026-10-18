import type { Metadata } from "next";
import Image from "next/image";
import Link from "next/link";
import {
  ArrowDown,
  ArrowUpRight,
  Code2,
  Coffee,
  Cpu,
  GitBranch,
  Heart,
} from "lucide-react";
import { projects } from "@/lib/projects";
import guartImage from "@/public/guart.png";
import "./home.css";

export const metadata: Metadata = {
  title: "zty012 · 让想法，发生。",
  description:
    "zty012 的个人空间。全栈开发者与嵌入式爱好者，在 Web 与物理世界之间探索，把好奇心变成真实可用的作品。",
};

function OrbitArtwork() {
  return (
    <div className="home-orbit" aria-hidden="true">
      <div className="home-orbit-halo" />
      <svg viewBox="0 0 480 460" fill="none">
        <defs>
          <linearGradient
            id="orbit-gold"
            x1="100"
            y1="70"
            x2="370"
            y2="390"
            gradientUnits="userSpaceOnUse"
          >
            <stop stopColor="#f4dfac" />
            <stop offset="0.48" stopColor="#c5a366" />
            <stop offset="1" stopColor="#685335" />
          </linearGradient>
          <radialGradient id="orbit-core">
            <stop stopColor="#f9e9bf" />
            <stop offset="1" stopColor="#b68e50" />
          </radialGradient>
        </defs>
        <circle
          cx="240"
          cy="225"
          r="174"
          stroke="#d9bf8a"
          strokeOpacity="0.09"
          strokeDasharray="2 8"
        />
        <circle
          cx="240"
          cy="225"
          r="124"
          stroke="#d9bf8a"
          strokeOpacity="0.06"
        />
        <path
          d="M20 225H460M240 12V438"
          stroke="#d9bf8a"
          strokeOpacity="0.08"
        />
        <g stroke="url(#orbit-gold)">
          <ellipse
            cx="240"
            cy="225"
            rx="185"
            ry="70"
            transform="rotate(-35 240 225)"
            strokeOpacity="0.6"
          />
          <ellipse
            cx="240"
            cy="225"
            rx="185"
            ry="70"
            transform="rotate(35 240 225)"
            strokeOpacity="0.35"
          />
          <ellipse
            cx="240"
            cy="225"
            rx="185"
            ry="70"
            transform="rotate(90 240 225)"
            strokeOpacity="0.25"
          />
        </g>
        <g className="home-orbit-spark" fill="url(#orbit-gold)">
          {Array.from({ length: 16 }, (_, index) => (
            <path
              key={index}
              d="M237 225L240 128L243 225L240 322Z"
              transform={`rotate(${index * 11.25} 240 225)`}
              opacity={index % 2 === 0 ? 0.9 : 0.45}
            />
          ))}
        </g>
        <circle cx="240" cy="225" r="17" fill="url(#orbit-core)" />
        <circle cx="89" cy="321" r="5" fill="#dcc18a" />
        <circle cx="391" cy="321" r="4" fill="#a6b994" />
        <circle cx="240" cy="40" r="3" fill="#dcc18a" />
        <path
          d="M57 66V54H69M411 54H423V66M57 384V396H69M411 396H423V384"
          stroke="#dcc18a"
          strokeOpacity="0.4"
        />
      </svg>
      <span className="home-orbit-label home-orbit-label-web">
        01 / DIGITAL
      </span>
      <span className="home-orbit-label home-orbit-label-hardware">
        02 / PHYSICAL
      </span>
      <span className="home-orbit-caption">
        DIFFERENT WORLDS. SAME CURIOSITY.
      </span>
    </div>
  );
}

function GraphPreview() {
  return (
    <div className="home-project-art home-graph-art" aria-hidden="true">
      <span className="home-art-label">A LITTLE SPACE FOR BIG IDEAS</span>
      <svg viewBox="0 0 520 250" fill="none">
        <g stroke="#bba77e" strokeOpacity="0.4">
          <path d="M155 125H210Q230 125 230 85V64H310M155 125H310M155 125H210Q230 125 230 165V186H310" />
          <path
            d="M410 64H445M410 125H466M410 186H445"
            strokeDasharray="3 5"
            strokeOpacity="0.3"
          />
        </g>
        <g fill="#24271f" stroke="#9b8d6c">
          <rect x="43" y="101" width="112" height="48" rx="8" />
          <rect
            x="310"
            y="43"
            width="100"
            height="42"
            rx="7"
            strokeOpacity="0.5"
          />
          <rect
            x="310"
            y="104"
            width="100"
            height="42"
            rx="7"
            strokeOpacity="0.5"
          />
          <rect
            x="310"
            y="165"
            width="100"
            height="42"
            rx="7"
            strokeOpacity="0.5"
          />
        </g>
        <g fill="#ded0ae" fontSize="12" textAnchor="middle">
          <text x="99" y="130">
            一个想法
          </text>
          <text x="360" y="69">
            连接灵感
          </text>
          <text x="360" y="130">
            梳理思路
          </text>
          <text x="360" y="191">
            无限可能
          </text>
        </g>
        <g fill="#dcc18a">
          <circle cx="155" cy="125" r="3" />
          <circle cx="310" cy="64" r="3" />
          <circle cx="310" cy="125" r="3" />
          <circle cx="310" cy="186" r="3" />
        </g>
        <path d="M266 211L269 225L273 220L278 219Z" fill="#cbb98f" />
        <text x="286" y="232" fill="#8e937e" fontSize="9">
          you, connecting the dots
        </text>
      </svg>
      <span className="home-art-corner">
        <GitBranch size={14} /> INFINITE CANVAS
      </span>
    </div>
  );
}

function DevicePreview() {
  return (
    <div className="home-project-art home-device-art" aria-hidden="true">
      <span className="home-art-label">A SMALL WINDOW INTO YOUR WORLD</span>
      <div className="home-device">
        <div className="home-device-screen">
          <div className="home-device-top">
            <span>zx / 桌面</span>
            <span>
              CONNECTED <i />
            </span>
          </div>
          <div className="home-device-clock">
            09<span>:</span>41
          </div>
          <div className="home-device-date">新的一天，保持好奇。</div>
          <div className="home-device-bottom">
            <span>
              <span className="home-device-bars">▂ ▅ ▃ ▇ ▄</span>{" "}
              正在播放你的日常
            </span>
            <span>86%</span>
          </div>
        </div>
      </div>
      <span className="home-art-corner">
        <Cpu size={14} /> ESP32-S3 · MADE TANGIBLE
      </span>
    </div>
  );
}

function SerialPreview() {
  return (
    <div className="home-project-art home-serial-art" aria-hidden="true">
      <span className="home-art-label">EVERY BYTE HAS A STORY</span>
      <Image
        src={guartImage}
        alt=""
        className="home-serial-image"
        sizes="(max-width: 760px) 80vw, 440px"
        unoptimized
      />
      <span className="home-art-corner">
        <Code2 size={14} /> GUART · NATIVE SERIAL STUDIO
      </span>
    </div>
  );
}

const projectPreviews = {
  graph: GraphPreview,
  device: DevicePreview,
  serial: SerialPreview,
};

export default function HomePage() {
  return (
    <div className="studio-home" id="top">
      <a className="home-skip" href="#main">
        跳至主要内容
      </a>
      <div className="home-atmosphere" aria-hidden="true" />
      <header className="home-header home-shell">
        <Link className="home-brand" href="/" aria-label="2y.nz 首页">
          2y<span>.</span>nz<span className="home-brand-mark">/</span>
        </Link>
        <nav className="home-nav" aria-label="主导航">
          <a href="#projects">作品</a>
          <a href="#about">关于</a>
          <a
            href="https://github.com/zty012"
            target="_blank"
            rel="noopener noreferrer"
          >
            GitHub <ArrowUpRight size={13} aria-hidden="true" />
          </a>
        </nav>
        <Link className="home-support-link" href="/donate">
          <Coffee size={15} aria-hidden="true" />
          <span>请我喝杯咖啡</span>
          <ArrowUpRight size={13} aria-hidden="true" />
        </Link>
      </header>
      <main id="main" className="home-shell">
        <section className="home-hero" aria-labelledby="home-title">
          <div className="home-hero-copy">
            <p className="home-eyebrow home-reveal">
              <span /> A PERSONAL SPACE BY ZTY012
            </p>
            <h1 id="home-title" className="home-reveal home-delay-1">
              保持好奇，
              <br />
              让想法<span>发生。</span>
            </h1>
            <p className="home-hero-script home-reveal home-delay-2">
              From a little spark to something real.
            </p>
            <p className="home-hero-intro home-reveal home-delay-2">
              你好，我是 <strong>zty012</strong>。一名全栈开发者与嵌入式爱好者。
              <br className="home-desktop-break" />
              在屏幕与电路之间，把脑海里的「如果」，变成手中的「看」。
            </p>
            <div className="home-hero-actions home-reveal home-delay-3">
              <a href="#projects" className="home-primary-link">
                探索我的作品 <ArrowDown size={16} aria-hidden="true" />
              </a>
              <a
                href="https://github.com/zty012"
                target="_blank"
                rel="noopener noreferrer"
                className="home-text-link"
              >
                在 GitHub 找到我 <ArrowUpRight size={15} aria-hidden="true" />
              </a>
            </div>
          </div>
          <div className="home-hero-art home-reveal home-delay-2">
            <OrbitArtwork />
          </div>
          <div className="home-hero-foot home-reveal home-delay-3">
            <span className="home-status">
              <i /> 始终在探索，持续在创造
            </span>
            <span className="home-hero-disciplines">
              WEB DEVELOPMENT <b>×</b> EMBEDDED SYSTEMS
            </span>
            <a href="#projects" aria-label="向下浏览作品">
              <ArrowDown size={16} aria-hidden="true" />
            </a>
          </div>
        </section>
        <section
          className="home-projects"
          id="projects"
          aria-labelledby="projects-title"
        >
          <div className="home-section-heading">
            <div>
              <p className="home-eyebrow">01 / SELECTED WORK</p>
              <h2 id="projects-title">
                一些想法，一些实现<span>。</span>
              </h2>
            </div>
            <p>
              从软件到硬件，
              <br />
              好奇心有不同的形状。
            </p>
          </div>
          <div className="home-project-grid">
            {projects.map((project, index) => {
              const href = project.href ?? project.githubUrl!;
              const external = /^https?:\/\//.test(href);
              const Preview = projectPreviews[project.preview];

              return (
                <article className="home-project" key={project.title}>
                  <Link
                    href={href}
                    className="home-project-preview"
                    target={external ? "_blank" : undefined}
                    rel={external ? "noopener noreferrer" : undefined}
                    aria-label={`了解 ${project.title}${external ? "（在新标签页打开）" : ""}`}
                  >
                    <Preview />
                    <span className="home-preview-arrow">
                      <ArrowUpRight size={21} aria-hidden="true" />
                    </span>
                  </Link>
                  <div className="home-project-heading">
                    <span className="home-project-number">0{index + 1}</span>
                    <h3>
                      <Link
                        href={href}
                        target={external ? "_blank" : undefined}
                        rel={external ? "noopener noreferrer" : undefined}
                      >
                        {project.title}
                      </Link>
                    </h3>
                    <span className="home-project-category">
                      {project.category}
                    </span>
                  </div>
                  <p className="home-project-description">
                    {project.description}
                  </p>
                  <div className="home-project-bottom">
                    <ul aria-label="技术栈">
                      {project.tags.map((tag) => (
                        <li key={tag}>{tag}</li>
                      ))}
                    </ul>
                    {project.githubUrl && (
                      <a
                        href={project.githubUrl}
                        target="_blank"
                        rel="noopener noreferrer"
                        aria-label={`查看 ${project.title} 的源代码（在新标签页打开）`}
                      >
                        <Code2 size={15} aria-hidden="true" /> 源代码{" "}
                        <ArrowUpRight size={12} aria-hidden="true" />
                      </a>
                    )}
                  </div>
                </article>
              );
            })}
          </div>
        </section>
        <section
          className="home-about"
          id="about"
          aria-labelledby="about-title"
        >
          <div>
            <p className="home-eyebrow">02 / A LITTLE ABOUT ME</p>
            <h2 id="about-title">
              不止于代码，
              <br />
              更在于<span>创造。</span>
            </h2>
            <p className="home-about-motto">Protect What You Choose.</p>
          </div>
          <div className="home-about-body">
            <p>
              我喜欢搭建东西。可能是一个让思路更清晰的工具，也可能是一台让桌面更有趣的小设备。
            </p>
            <p>
              对我来说，Web
              和嵌入式并非两个世界。好的代码是一座桥，让数字里的想法，在真实世界里找到回响。
            </p>
            <div className="home-toolbox">
              <span>在我的工具箱里</span>
              <ul>
                {["TypeScript", "React / Next.js", "ESP-IDF", "Arch Linux"].map(
                  (tool) => (
                    <li key={tool}>{tool}</li>
                  ),
                )}
              </ul>
            </div>
          </div>
        </section>
        <aside className="home-coffee" aria-labelledby="coffee-title">
          <div className="home-coffee-icon">
            <Coffee size={25} strokeWidth={1.4} aria-hidden="true" />
          </div>
          <div>
            <h2 id="coffee-title">如果这些小小的创造，恰好对你有用。</h2>
            <p>一杯咖啡，一次分享，或一条反馈，都是继续创造的动力。</p>
          </div>
          <Link href="/donate">
            为热爱加点燃料 <ArrowUpRight size={17} aria-hidden="true" />
          </Link>
        </aside>
      </main>
      <footer className="home-footer home-shell">
        <Link className="home-brand" href="/">
          2y<span>.</span>nz
        </Link>
        <p>
          用 <Heart size={11} aria-label="热爱" /> 创造，带着好奇继续。
        </p>
        <a href="#top">
          BACK TO TOP <ArrowUpRight size={13} aria-hidden="true" />
        </a>
      </footer>
    </div>
  );
}
