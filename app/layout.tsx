import type { Metadata } from "next";
import { headers } from "next/headers";
import "./globals.css";

const title = "Variant Atlas｜遗传解读训练";
const description = "无需登录即可使用的 WES/WGS 单基因病遗传解读学习平台：课程、病例、ACMG证据、SOP工作流与报告训练。";

export async function generateMetadata(): Promise<Metadata> {
  const requestHeaders = await headers();
  const host = requestHeaders.get("x-forwarded-host") ?? requestHeaders.get("host") ?? "localhost:3000";
  const protocol = requestHeaders.get("x-forwarded-proto") ?? (host.startsWith("localhost") ? "http" : "https");
  const imageUrl = `${protocol}://${host}/og-wgs.png`;

  return {
    title,
    description,
    openGraph: {
      title,
      description,
      type: "website",
      locale: "zh_CN",
      images: [{ url: imageUrl, width: 1731, height: 909, alt: "Variant Atlas WES/WGS遗传解读训练：多通道病例分析" }],
    },
    twitter: { card: "summary_large_image", title, description, images: [imageUrl] },
  };
}

export default function RootLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  return (
    <html lang="zh-CN">
      <body>{children}</body>
    </html>
  );
}
