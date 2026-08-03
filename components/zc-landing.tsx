import { ArrowLeft, ArrowUpRight, Camera, HardDrive, Usb } from "lucide-react";
import Link from "next/link";

const features = [
  {
    icon: Camera,
    title: "实时取景与拍摄",
    description:
      "OV5640 输出 RGB565 实时画面，显示在 240 × 280 的 ST7789 LCD 上。按下快门后，以 QSXGA 分辨率拍摄 JPEG。",
  },
  {
    icon: HardDrive,
    title: "自动保存到 SD 卡",
    description:
      "照片保存到 SD 卡根目录，自动寻找下一个可用编号，文件名格式为 ZC_0001.JPG。",
  },
  {
    icon: Usb,
    title: "USB Mass Storage",
    description: "启动时按住快门，电脑即可直接访问 SD 卡，无需取卡或额外软件。",
  },
];

export function ZcLanding() {
  return (
    <main className="zc-page">
      <header className="zc-header">
        <Link href="/" className="zc-back-link">
          <ArrowLeft /> 2y.nz
        </Link>
        <span className="zc-brand">zc</span>
        <span className="zc-header-label">OPEN HARDWARE / 2026</span>
      </header>

      <div className="zc-content">
        <section className="zc-intro">
          <p className="zc-kicker">ESP32-S3 · OV5640 · ST7789</p>
          <h1>zc</h1>
          <p className="zc-summary">
            基于 ESP32-S3 和 OV5640
            的小型数码相机。设备启动后显示实时取景画面，按下快门拍摄 JPEG
            并保存到 SD 卡。
          </p>
          <div className="zc-links">
            <a
              href="https://github.com/zty012/zc"
              target="_blank"
              rel="noreferrer"
            >
              GitHub <ArrowUpRight />
            </a>
            <a
              href="https://oshwhub.com/zty012/project_ejrdjhbd"
              target="_blank"
              rel="noreferrer"
            >
              复刻 zc01 <ArrowUpRight />
            </a>
          </div>
        </section>

        <section className="zc-features" aria-labelledby="zc-features-title">
          <div className="zc-section-heading">
            <p className="zc-kicker">FEATURES</p>
            <h2 id="zc-features-title">功能</h2>
          </div>
          <div className="zc-feature-list">
            {features.map(({ icon: Icon, title, description }, index) => (
              <article className="zc-feature" key={title}>
                <span className="zc-feature-index">0{index + 1}</span>
                <Icon className="zc-feature-icon" />
                <div>
                  <h3>{title}</h3>
                  <p>{description}</p>
                </div>
              </article>
            ))}
          </div>
        </section>

        <section className="zc-specs" aria-labelledby="zc-specs-title">
          <div className="zc-section-heading">
            <p className="zc-kicker">DETAILS</p>
            <h2 id="zc-specs-title">硬件与实现</h2>
          </div>
          <dl>
            <div>
              <dt>主控</dt>
              <dd>ESP32-S3</dd>
            </div>
            <div>
              <dt>摄像头</dt>
              <dd>OV5640</dd>
            </div>
            <div>
              <dt>显示屏</dt>
              <dd>ST7789 / 240 × 280</dd>
            </div>
            <div>
              <dt>存储</dt>
              <dd>SD 卡 / PSRAM 帧缓冲</dd>
            </div>
            <div>
              <dt>照片格式</dt>
              <dd>QSXGA JPEG / EXIF</dd>
            </div>
            <div>
              <dt>依赖管理</dt>
              <dd>ESP-IDF Component Manager</dd>
            </div>
          </dl>
        </section>
      </div>

      <footer className="zc-footer">
        <span>zc / SMALL DIGITAL CAMERA</span>
        <span>zty012</span>
      </footer>
    </main>
  );
}
