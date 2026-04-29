//Card 1: Portada de sucursal
import React from "react";

function isValidColor(color) {
  return /^#[0-9A-Fa-f]{6}$/.test(String(color || ""));
}

export default function PublicMenuBrandCard({
  publicMenu,
}) {
  const themeColor = isValidColor(publicMenu?.theme_color)
    ? publicMenu.theme_color
    : "#FF7A00";

  const coverUrl = publicMenu?.cover_image_url || "";

  return (
    <section
      style={{
        width: "100%",
        borderRadius: 0,
        overflow: "hidden",
        background: coverUrl ? "#111827" : themeColor,
        boxShadow: "0 18px 42px rgba(17,24,39,0.12)",
      }}
    >
      <div
        style={{
          width: "100%",
          height: "clamp(180px, 30vw, 360px)",
          position: "relative",
          overflow: "hidden",
        }}
      >
        {coverUrl ? (
          <img
            src={coverUrl}
            alt="Portada"
            loading="eager"
            style={{
              width: "100%",
              height: "100%",
              objectFit: "cover",
              objectPosition: "center",
              display: "block",
            }}
          />
        ) : (
          <div
            style={{
              width: "100%",
              height: "100%",
              background: themeColor,
            }}
          />
        )}
      </div>
    </section>
  );
}