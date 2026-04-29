// src/components/menu/public/PublicMenuGalleryCarousel.jsx
// Card 3: Carrusel de imágenes
import React, { useEffect, useMemo, useState } from "react";
import ChevronLeftRoundedIcon from "@mui/icons-material/ChevronLeftRounded";
import ChevronRightRoundedIcon from "@mui/icons-material/ChevronRightRounded";

function isValidColor(color) {
  return /^#[0-9A-Fa-f]{6}$/.test(String(color || ""));
}

export default function PublicMenuGalleryCarousel({ publicMenu }) {
  const themeColor = isValidColor(publicMenu?.theme_color)
    ? publicMenu.theme_color
    : "#FF7A00";

  const images = useMemo(() => {
    return (Array.isArray(publicMenu?.gallery) ? publicMenu.gallery : [])
      .filter((img) => img?.is_active !== false)
      .map((img) => ({
        id: img?.id,
        url: img?.image_url || img?.public_url || img?.url || "",
        name: img?.original_name || "Imagen",
      }))
      .filter((img) => !!img.url);
  }, [publicMenu]);

  const [active, setActive] = useState(0);
  const [notice, setNotice] = useState("");

  useEffect(() => {
    setActive(0);
  }, [images.length]);

  useEffect(() => {
    if (images.length <= 1) return;

    const timer = setInterval(() => {
      setActive((prev) => (prev >= images.length - 1 ? 0 : prev + 1));
    }, 6000);

    return () => clearInterval(timer);
  }, [images.length]);

  useEffect(() => {
    if (!notice) return;

    const timer = setTimeout(() => setNotice(""), 2200);
    return () => clearTimeout(timer);
  }, [notice]);

  if (!images.length) return null;

  const currentIndex = Math.min(active, images.length - 1);
  const current = images[currentIndex] || images[0];

  const handlePrev = () => {
    if (images.length <= 1) {
      setNotice("No hay más imágenes por mostrar.");
      return;
    }

    setActive((prev) => (prev <= 0 ? images.length - 1 : prev - 1));
  };

  const handleNext = () => {
    if (images.length <= 1) {
      setNotice("No hay más imágenes por mostrar.");
      return;
    }

    setActive((prev) => (prev >= images.length - 1 ? 0 : prev + 1));
  };

  return (
    <section
      className="cm-gallery-carousel"
      style={{
        width: "100%",
        background: "#FFFFFF",
        overflow: "hidden",
        position: "relative",
        boxShadow: "0 14px 34px rgba(47,42,61,0.07)",
      }}
    >
      <div
        className="cm-gallery-frame"
        style={{
          width: "100%",
          aspectRatio: "16 / 7",
          minHeight: 210,
          maxHeight: 420,
          overflow: "hidden",
          background: "#F6F3EF",
          position: "relative",
        }}
      >
        <img
          key={current.url}
          src={current.url}
          alt={current.name}
          loading="lazy"
          style={{
            width: "100%",
            height: "100%",
            objectFit: "cover",
            objectPosition: "center",
            display: "block",
            animation: "cmGalleryFade 420ms ease both",
          }}
        />

        <div
          style={{
            position: "absolute",
            inset: 0,
            background:
              "linear-gradient(90deg, rgba(17,24,39,0.12), rgba(17,24,39,0.02), rgba(17,24,39,0.12))",
            pointerEvents: "none",
          }}
        />

        <button
          type="button"
          onClick={handlePrev}
          className="cm-gallery-arrow cm-gallery-arrow-left"
          style={{ background: themeColor }}
          title="Anterior"
          aria-label="Imagen anterior"
        >
          <ChevronLeftRoundedIcon className="cm-gallery-arrow-icon" />
        </button>

        <button
          type="button"
          onClick={handleNext}
          className="cm-gallery-arrow cm-gallery-arrow-right"
          style={{ background: themeColor }}
          title="Siguiente"
          aria-label="Imagen siguiente"
        >
          <ChevronRightRoundedIcon className="cm-gallery-arrow-icon" />
        </button>

        <div
          style={{
            position: "absolute",
            left: "50%",
            bottom: 16,
            transform: "translateX(-50%)",
            display: "flex",
            gap: 8,
            alignItems: "center",
            justifyContent: "center",
            zIndex: 3,
          }}
        >
          {images.map((img, index) => {
            const selected = index === currentIndex;

            return (
              <button
                key={`${img.id || img.url}-${index}`}
                type="button"
                onClick={() => setActive(index)}
                title={`Ver imagen ${index + 1}`}
                style={{
                  width: selected ? 24 : 9,
                  height: 9,
                  borderRadius: 999,
                  border: "none",
                  padding: 0,
                  cursor: "pointer",
                  background: selected ? themeColor : "rgba(255,255,255,0.82)",
                  boxShadow: "0 4px 12px rgba(17,24,39,0.22)",
                  transition: "all 220ms ease",
                }}
              />
            );
          })}
        </div>

        {notice ? (
          <div
            style={{
              position: "absolute",
              left: "50%",
              bottom: 42,
              transform: "translateX(-50%)",
              background: "rgba(17,24,39,0.78)",
              color: "#FFFFFF",
              padding: "8px 12px",
              borderRadius: 999,
              fontSize: 12,
              fontWeight: 850,
              whiteSpace: "nowrap",
              backdropFilter: "blur(8px)",
              zIndex: 4,
            }}
          >
            {notice}
          </div>
        ) : null}
      </div>

      <style>
        {`
          @keyframes cmGalleryFade {
            from {
              opacity: 0.45;
              transform: scale(1.015);
            }
            to {
              opacity: 1;
              transform: scale(1);
            }
          }

          .cm-gallery-arrow {
            position: absolute;
            top: 50%;
            width: 58px;
            height: 58px;
            border-radius: 999px;
            border: none;
            color: #FFFFFF;
            cursor: pointer;
            display: flex;
            align-items: center;
            justify-content: center;
            padding: 0;
            box-shadow: 0 14px 28px rgba(17,24,39,0.24);
            transition: transform 180ms ease, filter 180ms ease, opacity 180ms ease;
            z-index: 3;
          }

          .cm-gallery-arrow-icon {
            font-size: 42px;
            line-height: 1;
          }

          .cm-gallery-arrow-left {
            left: 24px;
            transform: translateY(-50%);
          }

          .cm-gallery-arrow-right {
            right: 24px;
            transform: translateY(-50%);
          }

          .cm-gallery-arrow:hover {
            filter: brightness(1.04);
          }

          .cm-gallery-arrow-left:hover {
            transform: translateY(-50%) scale(1.04);
          }

          .cm-gallery-arrow-right:hover {
            transform: translateY(-50%) scale(1.04);
          }

          .cm-gallery-arrow:active {
            opacity: 0.86;
          }

          @media (max-width: 640px) {
            .cm-gallery-frame {
              aspect-ratio: 16 / 9 !important;
              min-height: 190px !important;
            }

            .cm-gallery-arrow {
              width: 44px;
              height: 44px;
            }

            .cm-gallery-arrow-icon {
              font-size: 34px;
            }

            .cm-gallery-arrow-left {
              left: 12px;
            }

            .cm-gallery-arrow-right {
              right: 12px;
            }
          }
        `}
      </style>
    </section>
  );
}