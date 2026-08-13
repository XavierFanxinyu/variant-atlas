import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "Variant Atlas｜遗传解读训练",
  description: "从证据规则到真实病例推理的 WES/WGS 单基因病解读学习工作台。",
};

export default function RootLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  return (
    <html lang="zh-CN">
      <body>{children}</body>
    </html>
  );
}
