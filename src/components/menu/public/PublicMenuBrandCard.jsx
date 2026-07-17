// Card 1: Portada de sucursal
import React, {
  useEffect,
  useState,
} from "react";

function isValidColor(color) {
  return /^#[0-9A-Fa-f]{6}$/.test(
    String(color || "")
  );
}

export default function PublicMenuBrandCard({
  publicMenu,
}) {
  const themeColor = isValidColor(
    publicMenu?.theme_color
  )
    ? publicMenu.theme_color
    : "#FF7A00";

  /*
   * El backend conserva el mismo contrato:
   *
   * cover_image_url contiene:
   * WebP optimizado → imagen original.
   */
  const coverUrl =
    publicMenu?.cover_image_url || "";

  const [coverLoading, setCoverLoading] =
    useState(Boolean(coverUrl));

  const [coverFailed, setCoverFailed] =
    useState(false);

  /*
   * Cuando cambia la portada, se reinicia
   * el estado visual de carga y error.
   */
  useEffect(() => {
    setCoverFailed(false);
    setCoverLoading(Boolean(coverUrl));
  }, [coverUrl]);

  const hasUsableCover =
    Boolean(coverUrl) &&
    !coverFailed;

  return (
    <section
      style={{
        width: "100%",
        borderRadius: 0,
        overflow: "hidden",

        background: hasUsableCover
          ? "#111827"
          : themeColor,

        boxShadow:
          "0 18px 42px rgba(17,24,39,0.12)",
      }}
    >
      <div
        aria-busy={
          hasUsableCover &&
          coverLoading
        }
        style={{
          width: "100%",
          height:
            "clamp(180px, 30vw, 360px)",
          position: "relative",
          overflow: "hidden",

          background: hasUsableCover
            ? "#111827"
            : themeColor,
        }}
      >
        {hasUsableCover ? (
          <>
            {coverLoading && (
              <div
                aria-hidden="true"
                style={{
                  position: "absolute",
                  inset: 0,
                  zIndex: 1,

                  background:
                    "linear-gradient(110deg, #E5E7EB 8%, #F3F4F6 18%, #E5E7EB 33%)",

                  backgroundSize:
                    "200% 100%",
                }}
              />
            )}

            <img
              key={coverUrl}
              src={coverUrl}
              alt="Portada"
              loading="eager"
              decoding="async"
              onLoad={() => {
                setCoverLoading(false);
                setCoverFailed(false);
              }}
              onError={() => {
                setCoverLoading(false);
                setCoverFailed(true);
              }}
              style={{
                position: "relative",
                zIndex: 2,
                width: "100%",
                height: "100%",
                objectFit: "cover",
                objectPosition: "center",
                display: "block",

                opacity: coverLoading
                  ? 0
                  : 1,

                transform: coverLoading
                  ? "scale(1.015)"
                  : "scale(1)",

                transition:
                  "opacity 320ms ease, transform 420ms ease",
              }}
            />
          </>
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
