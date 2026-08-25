import type { MetadataRoute } from "next";

export default function manifest(): MetadataRoute.Manifest {
  return {
    name: "TimeCapsule",
    short_name: "TimeCapsule",
    description: "A personal time capsule for your memories",

    start_url: "/",

    display: "standalone",

    icons: [
      {
        src: "/time-capsule-icon.png",
        sizes: "512x512",
        type: "image/png",
      },
    ],
  };
}