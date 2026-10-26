//src/components/menu/shared/menu-sets/MenuSetsSection.jsx
//Contenedor con carruzel horizontal
import React, { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { alpha, useTheme } from "@mui/material/styles";

import ChevronLeftRoundedIcon from "@mui/icons-material/ChevronLeftRounded";
import ChevronRightRoundedIcon from "@mui/icons-material/ChevronRightRounded";

import { normalizeMenuSet } from "../../../../hooks/menu/menu-sets/menuSet.utils";
import MenuSetCard from "./MenuSetCard";

function getSafeColor(theme, color) {
  if (/^#[0-9A-Fa-f]{6}$/.test(String(color || ""))) return color;

  const primary = theme.palette.primary.main;
  return /^#[0-9A-Fa-f]{6}$/.test(primary) ? primary : "#FF7A00";
}

export default function MenuSetsSection({
  items = [],
  menuSets,
  loading = false,
  themeColor,
  onOpenMenuSet,
}) {
  const theme = useTheme();
  const color = getSafeColor(theme, themeColor);
  const railRef = useRef(null);

  const [canScrollLeft, setCanScrollLeft] = useState(false);
  const [canScrollRight, setCanScrollRight] = useState(false);

  const sets = useMemo(() => {
    const source = Array.isArray(menuSets) ? menuSets : items;

    return (Array.isArray(source) ? source : [])
      .map((item, index) => {
        if (item?.kind === "menu_set" && "isSellable" in item) return item;
        return normalizeMenuSet(item, index);
      })
      .filter((item) => item.id !== null);
  }, [items, menuSets]);

  const updateScrollState = useCallback(() => {
    const rail = railRef.current;

    if (!rail) {
      setCanScrollLeft(false);
      setCanScrollRight(false);
      return;
    }

    const maxScroll = Math.max(0, rail.scrollWidth - rail.clientWidth);
    setCanScrollLeft(rail.scrollLeft > 4);
    setCanScrollRight(rail.scrollLeft < maxScroll - 4);
  }, []);

  useEffect(() => {
    const rail = railRef.current;
    if (!rail) return undefined;

    const frame = window.requestAnimationFrame(updateScrollState);
    rail.addEventListener("scroll", updateScrollState, { passive: true });
    window.addEventListener("resize", updateScrollState);

    let observer = null;

    if (typeof ResizeObserver !== "undefined") {
      observer = new ResizeObserver(updateScrollState);
      observer.observe(rail);
    }

    return () => {
      window.cancelAnimationFrame(frame);
      rail.removeEventListener("scroll", updateScrollState);
      window.removeEventListener("resize", updateScrollState);
      observer?.disconnect();
    };
  }, [sets.length, updateScrollState]);

  const scrollOneCard = useCallback((direction) => {
    const rail = railRef.current;
    if (!rail) return;

    const firstCard = rail.querySelector(".cm-menu-set-slide");
    if (!firstCard) return;

    const styles = window.getComputedStyle(rail);
    const gap = Number.parseFloat(styles.columnGap || styles.gap || "12") || 12;
    const width = firstCard.getBoundingClientRect().width;

    rail.scrollBy({
      left: direction * (width + gap),
      behavior: "smooth",
    });
  }, []);

  if (sets.length === 0) return null;

  return (
    <section
      className="cm-menu-sets-section"
      aria-label="Arma tu menú"
      style={{
        "--cm-menu-sets-color": color,
        "--cm-menu-sets-border": alpha(color, 0.18),
        "--cm-menu-sets-muted": theme.palette.text.secondary,
        "--cm-menu-sets-text": theme.palette.text.primary,
        "--cm-menu-sets-surface": theme.palette.background.paper,
      }}
    >
      <style>
        {`
          .cm-menu-sets-section {
            position: relative;
            width: 100%;
            min-width: 0;
            padding: 15px 13px 12px;
            border: 1px solid var(--cm-menu-sets-border);
            border-radius: 14px;
            background: var(--cm-menu-sets-surface);
            box-shadow: 0 10px 28px rgba(47,42,61,0.055);
            overflow: hidden;
            box-sizing: border-box;
          }

          .cm-menu-sets-section * { box-sizing: border-box; }

          .cm-menu-sets-header {
            display: flex;
            justify-content: space-between;
            align-items: flex-start;
            flex-wrap: wrap;
            gap: 10px;
            margin-bottom: 11px;
          }

          .cm-menu-sets-title {
            margin: 0;
            color: var(--cm-menu-sets-text);
            font-size: 18px;
            font-weight: 950;
            line-height: 1.2;
            letter-spacing: -0.3px;
          }

          .cm-menu-sets-description {
            margin: 4px 0 0;
            color: var(--cm-menu-sets-muted);
            font-size: 12px;
            line-height: 1.4;
          }

          .cm-menu-sets-label {
            display: inline-flex;
            align-items: center;
            flex-shrink: 0;
            border: 1px solid var(--cm-menu-sets-border);
            border-radius: 999px;
            padding: 5px 10px;
            color: var(--cm-menu-sets-color);
            background: var(--cm-menu-sets-surface);
            font-size: 10.5px;
            font-weight: 900;
            white-space: nowrap;
          }

          .cm-menu-sets-carousel {
            position: relative;
            width: 100%;
            min-width: 0;
          }

          .cm-menu-sets-rail {
            display: flex;
            align-items: stretch;
            width: 100%;
            min-width: 0;
            gap: 12px;
            padding: 3px 3px 6px;
            overflow-x: auto;
            overflow-y: hidden;
            scroll-snap-type: x mandatory;
            scroll-behavior: smooth;
            overscroll-behavior-x: contain;
            -webkit-overflow-scrolling: touch;
            scrollbar-width: none;
          }

          .cm-menu-sets-rail::-webkit-scrollbar { display: none; }

          /*
           * Tarjetas compactas con ancho controlado.
           * No se estiran cuando hay pocos conjuntos.
           */
          .cm-menu-set-slide {
            flex: 0 0 min(80%, 252px);
            display: flex;
            min-width: 0;
            scroll-snap-align: start;
          }

          .cm-menu-set-slide > article {
            width: 100%;
            height: 100%;
          }

          .cm-menu-sets-arrow {
            position: absolute;
            z-index: 5;
            top: 50%;
            width: 37px;
            height: 37px;
            padding: 0;
            display: grid;
            place-items: center;
            border: 2px solid #FFFFFF;
            border-radius: 50%;
            background: var(--cm-menu-sets-color);
            color: #FFFFFF;
            cursor: pointer;
            box-shadow: 0 7px 20px rgba(17,24,39,0.22);
            transform: translateY(-50%);
            transition: transform 160ms ease, box-shadow 160ms ease;
          }

          .cm-menu-sets-arrow:hover {
            transform: translateY(-50%) scale(1.06);
            box-shadow: 0 9px 24px rgba(17,24,39,0.28);
          }

          .cm-menu-sets-arrow:focus-visible {
            outline: 3px solid var(--cm-menu-sets-color);
            outline-offset: 3px;
          }

          .cm-menu-sets-arrow-left { left: 1px; }
          .cm-menu-sets-arrow-right { right: 1px; }

          @media (max-width: 639px) {
            .cm-menu-sets-section { padding: 13px 10px 10px; }
            .cm-menu-sets-header { gap: 8px; margin-bottom: 9px; }
            .cm-menu-sets-title { font-size: 17px; }
            .cm-menu-sets-description { font-size: 11.5px; }
            .cm-menu-sets-arrow { width: 33px; height: 33px; }
            .cm-menu-sets-rail { gap: 10px; }
            .cm-menu-set-slide { flex-basis: min(83%, 238px); }
          }
        `}
      </style>

      <header className="cm-menu-sets-header">
        <div style={{ minWidth: 0, flex: 1 }}>
          <h2 className="cm-menu-sets-title">ARMA TU MENÚ</h2>
          <p className="cm-menu-sets-description">
            Elige un menú y personalízalo a tu gusto.
          </p>
        </div>

        <span className="cm-menu-sets-label">Conjuntos</span>
      </header>

      <div className="cm-menu-sets-carousel">
        {canScrollLeft ? (
          <button
            type="button"
            className="cm-menu-sets-arrow cm-menu-sets-arrow-left"
            onClick={() => scrollOneCard(-1)}
            aria-label="Ver Conjunto anterior"
            title="Anterior"
          >
            <ChevronLeftRoundedIcon sx={{ fontSize: 27 }} />
          </button>
        ) : null}

        <div
          ref={railRef}
          className="cm-menu-sets-rail"
          onScroll={updateScrollState}
        >
          {sets.map((menuSet) => (
            <div key={menuSet.id} className="cm-menu-set-slide">
              <MenuSetCard
                menuSet={menuSet}
                themeColor={color}
                onOpenMenuSet={onOpenMenuSet}
              />
            </div>
          ))}
        </div>

        {canScrollRight ? (
          <button
            type="button"
            className="cm-menu-sets-arrow cm-menu-sets-arrow-right"
            onClick={() => scrollOneCard(1)}
            aria-label="Ver siguiente Conjunto"
            title="Siguiente"
          >
            <ChevronRightRoundedIcon sx={{ fontSize: 27 }} />
          </button>
        ) : null}
      </div>
    </section>
  );
}