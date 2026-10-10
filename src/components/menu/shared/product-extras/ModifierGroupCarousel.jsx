import React, { useCallback, useEffect, useRef, useState } from "react";

import ChevronLeftRoundedIcon from "@mui/icons-material/ChevronLeftRounded";
import ChevronRightRoundedIcon from "@mui/icons-material/ChevronRightRounded";

import {
  getSafeModifierThemeColor,
  modifierHexToRgba,
} from "./ModifierCardShells";

export function getModifierGroupCarouselKey(group, index = 0) {
  const groupId = Number(group?.id || group?.modifier_group_id || 0);

  if (groupId > 0) {
    return `group:${groupId}`;
  }

  const name = String(group?.name || "grupo").trim();

  return `group:${index}:${name}`;
}

function ModifierGroupCarouselCard({
  group,
  selected = false,
  themeColor,
  onClick,
}) {
  const safeThemeColor = getSafeModifierThemeColor(themeColor);
  const name =
    String(group?.name || "Grupo de extras").trim() || "Grupo de extras";

  return (
    <button
      type="button"
      className={`modifierGroupCarouselCard${selected ? " isSelected" : ""}`}
      aria-pressed={selected}
      title={name}
      onClick={onClick}
      style={{
        "--modifier-group-card-color": safeThemeColor,
        "--modifier-group-card-soft": modifierHexToRgba(safeThemeColor, 0.075),
        "--modifier-group-card-hover": modifierHexToRgba(safeThemeColor, 0.045),
        "--modifier-group-card-border": modifierHexToRgba(safeThemeColor, 0.32),
        "--modifier-group-card-shadow": modifierHexToRgba(safeThemeColor, 0.14),
      }}
    >
      <span className="modifierGroupCarouselCardName">{name}</span>
    </button>
  );
}

export default function ModifierGroupCarousel({
  groups = [],
  selectedGroupKey = null,
  themeColor,
  onSelectGroup,
}) {
  const safeThemeColor = getSafeModifierThemeColor(themeColor);
  const railRef = useRef(null);

  const [canScrollLeft, setCanScrollLeft] = useState(false);
  const [canScrollRight, setCanScrollRight] = useState(false);

  const visibleGroups = Array.isArray(groups) ? groups : [];

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

    if (!rail) {
      return undefined;
    }

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
  }, [visibleGroups.length, syncScrollState]);

  const scrollOneCard = useCallback((direction) => {
    const rail = railRef.current;

    if (!rail) {
      return;
    }

    const slides = Array.from(
      rail.querySelectorAll(".modifierGroupCarouselSlide"),
    );

    if (slides.length === 0) {
      return;
    }

    const railRect = rail.getBoundingClientRect();
    const currentScroll = rail.scrollLeft;
    const maxScrollLeft = Math.max(0, rail.scrollWidth - rail.clientWidth);

    const positions = slides.map((slide) => {
      const slideRect = slide.getBoundingClientRect();

      return {
        element: slide,
        left: currentScroll + slideRect.left - railRect.left,
      };
    });

    let targetLeft = direction > 0 ? maxScrollLeft : 0;

    if (direction > 0) {
      const next = positions.find(
        (position) => position.left > currentScroll + 8,
      );

      if (next) {
        targetLeft = Math.min(next.left, maxScrollLeft);
      }
    } else {
      const previous = [...positions]
        .reverse()
        .find((position) => position.left < currentScroll - 8);

      if (previous) {
        targetLeft = Math.max(0, previous.left);
      }
    }

    rail.scrollTo({
      left: targetLeft,
      behavior: "smooth",
    });
  }, []);

  if (visibleGroups.length === 0) {
    return null;
  }

  return (
    <div
        className="modifierGroupCarousel"
        style={{
            "--modifier-group-carousel-color": safeThemeColor,
        }}
    >
      <style>
        {`
          .modifierGroupCarousel {
            position: relative;
            width: 100%;
            min-width: 0;
            max-width: 100%;
            box-sizing: border-box;
            padding: 7px;
            border: none;
            border-radius: 12px;
            background: transparent;
            overflow: hidden;
          }

          .modifierGroupCarouselRail {
            display: flex;
            align-items: stretch;
            gap: 10px;
            width: 100%;
            min-width: 0;
            max-width: 100%;
            box-sizing: border-box;
            overflow-x: auto;
            overflow-y: hidden;
            scroll-snap-type: x mandatory;
            scroll-behavior: smooth;
            scroll-padding-inline: 4px;
            scrollbar-width: none;
            overscroll-behavior-x: contain;
            -webkit-overflow-scrolling: touch;
            padding: 3px 4px 6px;
          }

          .modifierGroupCarouselRail::-webkit-scrollbar {
            display: none;
          }

          .modifierGroupCarouselSlide {
            flex: 0 0 auto;
            width: max-content;
            min-width: 150px;
            max-width: none;
            min-height: 54px;
            display: flex;
            box-sizing: border-box;
            scroll-snap-align: start;
            scroll-snap-stop: normal;
          }

          .modifierGroupCarouselCard {
            width: max-content;
            min-width: 150px;
            max-width: none;
            height: 54px;
            min-height: 54px;
            max-height: 54px;
            box-sizing: border-box;
            display: flex;
            align-items: center;
            justify-content: center;
            padding: 0 18px;
            border: 1px solid rgba(47,42,61,0.13);
            border-radius: 10px;
            background: #FFFFFF;
            color: #3F3A52;
            font: inherit;
            cursor: pointer;
            overflow: hidden;
            box-shadow: 0 4px 13px rgba(47,42,61,0.055);
            transition:
              transform 160ms ease,
              box-shadow 160ms ease,
              border-color 160ms ease,
              background-color 160ms ease,
              color 160ms ease;
          }

          .modifierGroupCarouselCard:hover {
            transform: translateY(-2px);
            border-color: var(--modifier-group-card-color);
            background: var(--modifier-group-card-hover);
            box-shadow: 0 8px 18px var(--modifier-group-card-shadow);
          }

          .modifierGroupCarouselCard.isSelected {
            border-color: var(--modifier-group-card-color);
            background: var(--modifier-group-card-soft);
            color: var(--modifier-group-card-color);
            box-shadow: 0 7px 17px var(--modifier-group-card-shadow);
          }

          .modifierGroupCarouselCardName {
            display: block;
            width: max-content;
            max-width: none;
            white-space: nowrap;
            overflow: visible;
            text-overflow: clip;
            color: inherit;
            font-size: 12.5px;
            font-weight: 900;
            line-height: 1.15;
            letter-spacing: 0;
          }

          .modifierGroupCarouselArrow {
            position: absolute;
            top: 50%;
            z-index: 5;
            width: 38px;
            height: 38px;
            border: 2px solid #FFFFFF;
            border-radius: 999px;
            color: #FFFFFF;
            display: grid;
            place-items: center;
            padding: 0;
            cursor: pointer;
            box-shadow: 0 8px 22px rgba(17,24,39,0.20);
            transform: translateY(-50%);
            transition:
              transform 160ms ease,
              box-shadow 160ms ease,
              opacity 160ms ease;
          }

          .modifierGroupCarouselArrow:hover {
            transform: translateY(-50%) scale(1.05);
            box-shadow: 0 10px 26px rgba(17,24,39,0.26);
          }

          .modifierGroupCarouselArrowLeft {
            left: 4px;
          }

          .modifierGroupCarouselArrowRight {
            right: 4px;
          }

          @media (max-width: 600px) {
            .modifierGroupCarousel {
              width: 100%;
              min-width: 0;
              max-width: 100%;
              padding: 6px;
              overflow: hidden;
            }

            .modifierGroupCarouselRail {
              width: 100%;
              min-width: 0;
              max-width: 100%;
              gap: 8px;
              padding: 3px 3px 6px;
            }

            .modifierGroupCarouselSlide {
              min-width: 128px;
              min-height: 50px;
            }

            .modifierGroupCarouselCard {
              min-width: 128px;
              height: 50px;
              min-height: 50px;
              max-height: 50px;
              padding: 0 14px;
            }

            .modifierGroupCarouselCardName {
              font-size: 11.5px;
            }

            .modifierGroupCarouselArrow {
              width: 32px;
              height: 32px;
            }

            .modifierGroupCarouselArrowLeft {
              left: 3px;
            }

            .modifierGroupCarouselArrowRight {
              right: 3px;
            }
          }
        `}
      </style>

      {canScrollLeft ? (
        <button
          type="button"
          className="modifierGroupCarouselArrow modifierGroupCarouselArrowLeft"
          onClick={() => scrollOneCard(-1)}
          aria-label="Ver grupo anterior"
          title="Anterior"
          style={{ background: safeThemeColor }}
        >
          <ChevronLeftRoundedIcon sx={{ fontSize: 27, display: "block" }} />
        </button>
      ) : null}

      <div
        ref={railRef}
        className="modifierGroupCarouselRail"
        onScroll={syncScrollState}
      >
        {visibleGroups.map((group, index) => {
          const groupKey = getModifierGroupCarouselKey(group, index);
          const selected = String(groupKey) === String(selectedGroupKey || "");

          return (
            <div key={groupKey} className="modifierGroupCarouselSlide">
              <ModifierGroupCarouselCard
                group={group}
                selected={selected}
                themeColor={safeThemeColor}
                onClick={() => onSelectGroup?.(group, groupKey, index)}
              />
            </div>
          );
        })}
      </div>

      {canScrollRight ? (
        <button
          type="button"
          className="modifierGroupCarouselArrow modifierGroupCarouselArrowRight"
          onClick={() => scrollOneCard(1)}
          aria-label="Ver siguiente grupo"
          title="Siguiente"
          style={{ background: safeThemeColor }}
        >
          <ChevronRightRoundedIcon sx={{ fontSize: 27, display: "block" }} />
        </button>
      ) : null}
    </div>
  );
}