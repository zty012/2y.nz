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
      </head>
      <body className="flex min-h-screen flex-col">
        <Provider>{children}</Provider>
      </body>
    </html>
  );
}
