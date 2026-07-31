// oxlint-disable next/no-sync-scripts
import { Provider } from "@/components/provider";
import "./global.css";

export default function Layout({ children }: LayoutProps<"/">) {
  return (
    <html lang="zh" suppressHydrationWarning>
      <head>
        <link
          rel="stylesheet"
          href="https://cdn.jsdelivr.net/npm/misans@4.1.0/lib/Latin/MiSansLatin-Medium.min.css"
          integrity="sha256-U1HWEJBTYb3Vk2SGsRqnj1O1qrT1d/Aj8wGQyaUXtGc="
          crossOrigin="anonymous"
        ></link>
        <script src="https://pl28784628.effectivecpmnetwork.com/08/b5/8d/08b58dc48db10eef658159b8cc1bece1.js"></script>
      </head>
      <body className="flex min-h-screen flex-col">
        <Provider>{children}</Provider>
      </body>
    </html>
  );
}
