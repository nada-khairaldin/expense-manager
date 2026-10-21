import type { MetadataRoute } from "next";

export default function manifest(): MetadataRoute.Manifest {
  return {
    name: "مصروفي — إدارة المصروفات والميزانية الشخصية",
    short_name: "مصروفي",
    description: "نظام مالي ذكي وشامل لإدارة المصروفات والميزانية الشخصية والعائلية بأسلوب احترافي وموثوق",
    start_url: "/dashboard",
    display: "standalone",
    orientation: "portrait",
    background_color: "#14263D",
    theme_color: "#16856B",
    dir: "rtl",
    lang: "ar",
    scope: "/",
    icons: [
      {
        src: "/icon.png",
        sizes: "192x192",
        type: "image/png",
        purpose: "any",
      },
      {
        src: "/icon.png",
        sizes: "512x512",
        type: "image/png",
        purpose: "maskable",
      },
    ],
    categories: ["finance", "productivity", "utilities"],
  };
}
