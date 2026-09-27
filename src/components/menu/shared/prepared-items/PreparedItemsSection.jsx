import React, {
  useCallback, useEffect, useMemo, useRef, useState,
} from "react";
import { alpha, useTheme } from "@mui/material/styles";

import {
  getPreparedItemCartKey,
  getPreparedItemId,
} from "../../../../hooks/menu/preparedItem.utils";

import PreparedItemCard from "./PreparedItemCard";

/*
 * Sección visual compartida de Preparación rápida.
 *
 * Usa:
 * - preparedItem.utils.js, para reutilizar la identidad física prepared:{id}.
 * - PreparedItemCard.jsx, para renderizar cada unidad.
 *
 * La usan:
 * - StaffMenuEntryPage.jsx.
 * - PublicMenuEntryPage.jsx.
 * - CashierDirectOrderPage.jsx.
 *
 * No conoce endpoints, canales, carrito ni reglas de disponibilidad normal.
 */

export default function PreparedItemsSection({
  items = [],
  loading = false,
  selectedPreparedItemIds = [],
  onSelect,
  themeColor,
}) {
  const theme = useTheme();
  const railRef = useRef(null);

  const [canScrollLeft, setCanScrollLeft] = useState(false);
  const [canScrollRight, setCanScrollRight] = useState(false);

  const preparedItems = useMemo(() => {
    return (Array.isArray(items) ? items : []).filter(
      (item) => getPreparedItemId(item) > 0,
    );
  }, [items]);

  const selectedIds = useMemo(() => {
    const source =
      selectedPreparedItemIds instanceof Set
        ? Array.from(selectedPreparedItemIds)
        : Array.isArray(selectedPreparedItemIds)
          ? selectedPreparedItemIds
          : [];

    return new Set(
      source
        .map((id) => Number(id))
        .filter((id) => Number.isInteger(id) && id > 0),
    );
  }, [selectedPreparedItemIds]);

  const configuredColor = String(themeColor || "").trim();
  const themePrimary = String(theme.palette.primary.main || "").trim();

  const carouselColor =
    /^#[0-9A-Fa-f]{6}$/.test(configuredColor)
      ? configuredColor
      : /^#[0-9A-Fa-f]{6}$/.test(themePrimary)
        ? themePrimary
        : "#FF7A00";

  const sectionBorder = alpha(carouselColor, 0.18);
  const carouselBorder = alpha(carouselColor, 0.13);
  const countSurface = alpha(carouselColor, 0.09);
  const countBorder = alpha(carouselColor, 0.2);
  const imageSurface = alpha(carouselColor, 0.035);

  const syncScrollState = useCallback(() => {
    const rail = railRef.current;

    if (!rail) {
      setCanScrollLeft(false);
      setCanScrollRight(false);
      return;
    }

    const maxScrollLeft = Math.max(0, rail.scrollWidth - rail.clientWidth);

    setCanScrollLeft(rail.scrollLeft > 4);
    setCanScrollRight(rail.scrollLeft < maxScrollLeft - 4);
  }, []);

  useEffect(() => {
    const rail = railRef.current;
    if (!rail) return undefined;

    const frame = window.requestAnimationFrame(syncScrollState);

    rail.addEventListener("scroll", syncScrollState, { passive: true });
    window.addEventListener("resize", syncScrollState);

    let resizeObserver = null;

    if (typeof ResizeObserver !== "undefined") {
      resizeObserver = new ResizeObserver(syncScrollState);
      resizeObserver.observe(rail);
    }

    return () => {
      window.cancelAnimationFrame(frame);
      rail.removeEventListener("scroll", syncScrollState);
      window.removeEventListener("resize", syncScrollState);
      resizeObserver?.disconnect();
    };
  }, [preparedItems.length, syncScrollState]);

  const scrollOneCard = useCallback((direction) => {
    const rail = railRef.current;
    if (!rail) return;

    const firstSlide = rail.querySelector(".preparedItemSlide");
    if (!firstSlide) return;

    const railStyles = window.getComputedStyle(rail);
    const gap =
      Number.parseFloat(
        railStyles.columnGap ||
          railStyles.gap ||
          "12",
      ) || 12;

    const cardWidth = firstSlide.getBoundingClientRect().width;

    rail.scrollBy({
      left: direction * (cardWidth + gap),
      behavior: "smooth",
    });
  }, []);

  /*
   * Incluso durante una carga inicial no mostramos un placeholder grande.
   * Si todavía no existe ninguna unidad física visible, la sección no existe.
   */
  if (preparedItems.length === 0) return null;

  return (
    <section
      className="preparedItemsSection"
      style={{
        "--prepared-image-surface": imageSurface,
        "--prepared-image-border": carouselBorder,
        position: "relative",
        marginTop: 22,
        padding: "21px 14px 18px",
        border: `1px solid ${sectionBorder}`,
        borderRadius: 14,
        background: "#FFFFFF",
        boxShadow: "0 14px 36px rgba(47,42,61,0.07)",
        overflow: "hidden",
      }}
    >
      <div
        aria-hidden="true"
        style={{
          position: "absolute",
          top: 0,
          left: 0,
          right: 0,
          height: 5,
          background: carouselColor,
        }}
      />

      <style>
        {`
          .preparedItemsCarousel {
            position: relative;
            width: 100%;
            box-sizing: border-box;
          }

          .preparedItemsRail {
            display: flex;
            align-items: stretch;
            gap: 12px;
            width: 100%;
            box-sizing: border-box;
            overflow-x: auto;
            overflow-y: hidden;
            scroll-snap-type: x mandatory;
            scroll-behavior: smooth;
            scrollbar-width: none;
            overscroll-behavior-x: contain;
            -webkit-overflow-scrolling: touch;
            padding: 3px 4px 7px;
          }

          .preparedItemsRail::-webkit-scrollbar {
            display: none;
          }

          .preparedItemSlide {
            flex: 0 0 min(82%, 250px);
            min-width: 0;
            display: flex;
            scroll-snap-align: start;
            scroll-snap-stop: normal;
          }

          .preparedItemSlide > article {
            width: 100%;
          }

          /*
           * ProductThumb conserva su lógica compartida.
           * Aquí únicamente adaptamos la superficie y altura visual
           * para las tarjetas de Entrega inmediata.
           */
          .preparedItemsSection .preparedItemCardThumb > div {
            height: 160px !important;
            background: var(--prepared-image-surface) !important;
            border-color: var(--prepared-image-border) !important;
          }

          .preparedItemsArrow {
            position: absolute;
            top: 50%;
            z-index: 4;
            width: 40px;
            height: 40px;
            border: 2px solid #FFFFFF;
            border-radius: 999px;
            color: #FFFFFF;
            display: grid;
            place-items: center;
            padding: 0;
            cursor: pointer;
            font-size: 31px;
            font-weight: 500;
            line-height: 1;
            box-shadow: 0 8px 22px rgba(17,24,39,0.20);
            transform: translateY(-50%);
            transition:
              transform 160ms ease,
              box-shadow 160ms ease,
              opacity 160ms ease;
          }

          .preparedItemsArrow:hover {
            transform: translateY(-50%) scale(1.05);
            box-shadow: 0 10px 26px rgba(17,24,39,0.26);
          }

          .preparedItemsArrowLeft {
            left: 4px;
          }

          .preparedItemsArrowRight {
            right: 4px;
          }

          @media (min-width: 640px) {
            .preparedItemSlide {
              flex-basis: calc((100% - 12px) / 2);
            }

            .preparedItemsSection .preparedItemCardThumb > div {
              height: 165px !important;
            }
          }

          @media (min-width: 900px) {
            .preparedItemSlide {
              flex-basis: calc((100% - 24px) / 3);
            }

            .preparedItemsSection .preparedItemCardThumb > div {
              height: 170px !important;
            }
          }

          @media (min-width: 1200px) {
            .preparedItemSlide {
              flex-basis: calc((100% - 36px) / 4);
            }
          }

          @media (max-width: 639px) {
            .preparedItemsSection .preparedItemCardThumb > div {
              height: 150px !important;
            }

            .preparedItemsArrow {
              width: 34px;
              height: 34px;
              font-size: 27px;
            }

            .preparedItemsArrowLeft {
              left: 3px;
            }

            .preparedItemsArrowRight {
              right: 3px;
            }
          }
        `}
      </style>

      <div
        style={{
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
          gap: 12,
          flexWrap: "wrap",
          marginBottom: 15,
        }}
      >
        <div style={{ minWidth: 0 }}>
          <div
            style={{
              color: carouselColor,
              fontSize: 21,
              fontWeight: 950,
              lineHeight: 1.15,
              letterSpacing: "-0.25px",
            }}
          >
            Entrega inmediata
          </div>

          <div
            style={{
              marginTop: 5,
              color: theme.palette.text.secondary,
              fontSize: 12.5,
              fontWeight: 700,
              lineHeight: 1.4,
            }}
          >
            Productos listos para servir al momento.
          </div>
        </div>

        <div
          style={{
            display: "inline-flex",
            alignItems: "center",
            minHeight: 30,
            padding: "5px 11px",
            borderRadius: 999,
            border: `1px solid ${countBorder}`,
            background: countSurface,
            color: carouselColor,
            fontSize: 11,
            fontWeight: 900,
            lineHeight: 1.15,
            whiteSpace: "nowrap",
          }}
        >
          {preparedItems.length === 1
            ? "1 unidad disponible"
            : `${preparedItems.length} unidades disponibles`}
        </div>
      </div>

      <div className="preparedItemsCarousel">
        {canScrollLeft ? (
          <button
            type="button"
            className="preparedItemsArrow preparedItemsArrowLeft"
            onClick={() => scrollOneCard(-1)}
            aria-label="Ver producto anterior"
            title="Anterior"
            style={{ background: carouselColor }}
          >
            ‹
          </button>
        ) : null}

        <div
          ref={railRef}
          className="preparedItemsRail"
          onScroll={syncScrollState}
        >
          {preparedItems.map((preparedItem) => {
            const preparedItemId = getPreparedItemId(preparedItem);
            const selected = selectedIds.has(preparedItemId);

            return (
              <div
                key={getPreparedItemCartKey(preparedItem)}
                className="preparedItemSlide"
              >
                <PreparedItemCard
                  preparedItem={preparedItem}
                  selected={selected}
                  disabled={loading}
                  themeColor={carouselColor}
                  onSelect={onSelect}
                />
              </div>
            );
          })}
        </div>

        {canScrollRight ? (
          <button
            type="button"
            className="preparedItemsArrow preparedItemsArrowRight"
            onClick={() => scrollOneCard(1)}
            aria-label="Ver siguiente producto"
            title="Siguiente"
            style={{ background: carouselColor }}
          >
            ›
          </button>
        ) : null}
      </div>
    </section>
  );
}