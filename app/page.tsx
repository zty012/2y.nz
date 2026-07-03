import { BackgroundMedia } from "@/components/home/background-media";
import { ScreenIntro } from "@/components/home/screen-intro";
import { ScreenProject } from "@/components/home/screen-project";
import { TimeThemeProvider } from "@/components/home/theme-time";
import { backgroundConfig, sectionBackgrounds } from "@/lib/background";
import { projects } from "@/lib/projects";

export default function HomePage() {
  return (
    <TimeThemeProvider>
      {/* 全局固定背景 — 覆盖整个视口，各 section 滚动在其上方 */}
      {backgroundConfig.enabled && (
        <BackgroundMedia {...backgroundConfig.props} position="fixed" />
      )}

      <div className="snap-container">
        <ScreenIntro sectionBg={sectionBackgrounds[0] ?? null} />
        {projects.map((project, index) => (
          <ScreenProject
            key={project.title}
            project={project}
            index={index}
            sectionBg={sectionBackgrounds[index + 1] ?? null}
          />
        ))}
      </div>
    </TimeThemeProvider>
  );
}
