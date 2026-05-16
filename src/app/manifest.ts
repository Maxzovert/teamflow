import type { MetadataRoute } from "next";

/** Served at `/manifest.webmanifest` with correct Content-Type (fixes “downloads as file”). */
export default function manifest(): MetadataRoute.Manifest {
  return {
    id: "/",
    name: "Tobedone",
    short_name: "Tobedone",
    description: "Team collaboration and task management",
    start_url: "/",
    scope: "/",
    display: "standalone",
    background_color: "#FAFBFC",
    theme_color: "#0C66E4",
    orientation: "any",
    icons: [
      {
        src: "/icons/icon-192.png",
        sizes: "192x192",
        type: "image/png",
        purpose: "any",
      },
      {
        src: "/icons/icon-512.png",
        sizes: "512x512",
        type: "image/png",
        purpose: "any",
      },
      {
        src: "/icons/icon-512.png",
        sizes: "512x512",
        type: "image/png",
        purpose: "maskable",
      },
    ],
  };
}
