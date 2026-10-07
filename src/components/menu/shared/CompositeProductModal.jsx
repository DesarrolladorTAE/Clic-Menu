// src/components/menu/shared/CompositeProductModal.jsx

import React, { useEffect, useState } from "react";
import { MenuItem, TextField } from "@mui/material";

import {
  Modal,
  PillButton,
} from "../../../pages/public/publicMenu.ui";

import {
  getPublicAvailabilityPresentation,
  isAvailabilityBlocked,
} from "../../../hooks/public/publicMenu.utils";

const MOBILE_BREAKPOINT = 600;

function useIsMobileViewport() {
  const [isMobile, setIsMobile] = useState(() => {
    if (typeof window === "undefined") {
      return false;
    }

    return window.matchMedia(`(max-width: ${MOBILE_BREAKPOINT}px)`).matches;
  });

  useEffect(() => {
    if (typeof window === "undefined") {
      return undefined;
    }

    const mediaQuery = window.matchMedia(`(max-width: ${MOBILE_BREAKPOINT}px)`);

    const handleChange = (event) => {
      setIsMobile(event.matches);
    };

    setIsMobile(mediaQuery.matches);

    if (typeof mediaQuery.addEventListener === "function") {
      mediaQuery.addEventListener("change", handleChange);

      return () => {
        mediaQuery.removeEventListener("change", handleChange);
      };
    }

    mediaQuery.addListener(handleChange);

    return () => {
      mediaQuery.removeListener(handleChange);
    };
  }, []);

  return isMobile;
}

function getAvailabilityTone(status = "") {
  const s = String(status || "").toLowerCase();

  if (s === "available") {
    return "ok";
  }

  if (s === "insufficient_stock") {
    return "warn";
  }

  if (
    s === "out_of_stock" ||
    s === "recipe_missing" ||
    s === "inventory_blocked"
  ) {
    return "danger";
  }

  return "default";
}

function isSourceUnavailable(source) {
  if (!source || typeof source !== "object") {
    return true;
  }

  const availability =
    source?.availability &&
    typeof source.availability === "object"
      ? source.availability
      : null;

  if (availability) {
    return isAvailabilityBlocked(availability);
  }

  return source?.is_available === false;
}

function getEffectiveComponentSource(component) {
  const variants = Array.isArray(component?.variants)
    ? component.variants
    : [];

  const selectedVariantId = Number(component?.variant_id || 0);

  if (selectedVariantId > 0) {
    return (
      variants.find(
        (variant) => Number(variant?.id) === selectedVariantId,
      ) || null
    );
  }

  if (component?.default_option) {
    return component.default_option;
  }

  return component;
}

function AvailabilityChip({ source }) {
  const availability = source?.availability || null;

  if (!availability) {
    return null;
  }

  const presentation = getPublicAvailabilityPresentation(availability);

  if (!presentation.label) {
    return null;
  }

  const tone = getAvailabilityTone(availability?.status);

  const palette = {
    ok: {
      bg: "rgba(16, 185, 129, 0.12)",
      bd: "rgba(16, 185, 129, 0.25)",
      fg: "#047857",
    },
    warn: {
      bg: "rgba(245, 158, 11, 0.12)",
      bd: "rgba(245, 158, 11, 0.25)",
      fg: "#B45309",
    },
    danger: {
      bg: "rgba(239, 68, 68, 0.10)",
      bd: "rgba(239, 68, 68, 0.24)",
      fg: "#B91C1C",
    },
    default: {
      bg: "rgba(0,0,0,0.05)",
      bd: "rgba(0,0,0,0.10)",
      fg: "#374151",
    },
  };

  const ui = palette[tone] || palette.default;

  return (
    <div
      style={{
        display: "inline-flex",
        alignItems: "center",
        gap: 6,
        padding: "6px 10px",
        borderRadius: 999,
        border: `1px solid ${ui.bd}`,
        background: ui.bg,
        color: ui.fg,
        fontSize: 11,
        fontWeight: 900,
        lineHeight: 1.1,
        maxWidth: "100%",
      }}
      title={presentation.caption || presentation.label}
    >
      {presentation.label}
    </div>
  );
}

function AvailabilityNotice({ source }) {
  const availability = source?.availability || null;

  if (!availability) {
    return null;
  }

  const blocked = isSourceUnavailable(source);

  if (!blocked) {
    return null;
  }

  const presentation = getPublicAvailabilityPresentation(availability);

  if (!presentation.caption) {
    return null;
  }

  return (
    <div
      style={{
        fontSize: 12,
        padding: "8px 10px",
        borderRadius: 12,
        border: "1px solid rgba(239, 68, 68, 0.20)",
        background: "#FFF5F5",
        color: "#B91C1C",
        fontWeight: 800,
      }}
    >
      {presentation.caption}
    </div>
  );
}

export default function CompositeProductModal({
  open,
  product,
  draft = [],
  onClose,
  onToggleIncluded,
  onVariantChange,
  onConfirm,
  confirmLabel = "Agregar compuesto",
  busy = false,
}) {
  const isMobileViewport = useIsMobileViewport();

  if (!product) {
    return null;
  }

  const title =
    product?.display_name ||
    product?.name ||
    "Producto compuesto";

  const hasBlockingIncludedUnavailable = (
    Array.isArray(draft) ? draft : []
  ).some((component) => {
    /*
     * Un componente opcional no incluido no participa
     * en la validación de disponibilidad.
     */
    if (
      component?.is_optional &&
      component?.included === false
    ) {
      return false;
    }

    const effectiveSource =
      getEffectiveComponentSource(component);

    return isSourceUnavailable(effectiveSource);
  });

  return (
    <Modal
      open={open}
      title={`Configurar: ${title}`}
      onClose={onClose}
      width={isMobileViewport ? "100vw" : "920px"}
      maxHeight={isMobileViewport ? "100dvh" : "650px"}
      bodyPadding={0}
      backdropBlur={false}
      fullScreenMobile
      contentStyle={{
        borderRadius: isMobileViewport ? 0 : 18,
        width: isMobileViewport ? "100vw" : "920px",
        maxWidth: isMobileViewport ? "100vw" : "920px",
        height: isMobileViewport ? "100dvh" : "650px",
        minHeight: isMobileViewport ? "100dvh" : "650px",
        maxHeight: isMobileViewport ? "100dvh" : "650px",
        margin: 0,
        boxSizing: "border-box",
      }}
      bodyStyle={{
        background: "#F5F3F3",
        boxSizing: "border-box",
      }}
      actions={
        <>
          <PillButton
            tone="default"
            onClick={onClose}
            disabled={busy}
            title="Cancelar"
          >
            Cancelar
          </PillButton>

          <PillButton
            tone="orange"
            onClick={onConfirm}
            disabled={busy || hasBlockingIncludedUnavailable}
            title={
              hasBlockingIncludedUnavailable
                ? "Hay componentes seleccionados sin disponibilidad"
                : "Guardar selección"
            }
          >
            {busy ? "⏳ Guardando..." : confirmLabel}
          </PillButton>
        </>
      }
    >
      <div
        style={{
          width: "calc(100% - 32px)",
          minHeight: "calc(100% - 16px)",
          margin: "0 16px 16px",
          boxSizing: "border-box",
          padding: 16,
          border: "1px solid rgba(47,42,61,0.08)",
          borderTop: "none",
          borderRadius: "0 0 10px 10px",
          background: "#FFFFFF",
          boxShadow: "0 2px 10px rgba(0,0,0,0.035)",
        }}
      >
        <div style={{ display: "grid", gap: 10 }}>
          <div
            style={{
              fontSize: 13,
              color: "#6E6A6A",
              lineHeight: 1.5,
            }}
          >
            Configura los componentes del producto. Aquí sí va lo opcional,
            variantes, avisos de precio y demás civilización mínima.
          </div>

          {(draft || []).map((c) => {
            const cid = Number(c.component_product_id);
            const variants = Array.isArray(c.variants) ? c.variants : [];
            const canPickVariant = !!c.allow_variant && variants.length > 0;
            const included = c.included !== false;

            const selectedVariant = c.variant_id
              ? variants.find(
                  (v) => Number(v.id) === Number(c.variant_id),
                )
              : null;

            const effectiveSelectionSource =
              selectedVariant ||
              (
                !c.variant_id
                  ? c.default_option || c
                  : null
              );

            return (
              <div
                key={cid}
                style={{
                  display: "grid",
                  gap: 8,
                  padding: 12,
                  borderRadius: 12,
                  border: "1px solid rgba(47,42,61,0.12)",
                  background: "#FFFFFF",
                  boxShadow: "0 2px 8px rgba(47,42,61,0.035)",
                  opacity: !included ? 0.72 : 1,
                }}
              >
                <div
                  style={{
                    display: "flex",
                    justifyContent: "space-between",
                    gap: 10,
                    alignItems: "flex-start",
                  }}
                >
                  <div
                    style={{
                      minWidth: 0,
                      display: "grid",
                      gap: 6,
                    }}
                  >
                    <div
                      style={{
                        fontWeight: 900,
                        fontSize: 14,
                        color: "#3F3A52",
                      }}
                    >
                      {c.name}
                    </div>

                    <div
                      style={{
                        fontSize: 12,
                        color: "#6E6A6A",
                        marginTop: 2,
                      }}
                    >
                      Cantidad:{" "}
                      <strong>
                        {Number.isFinite(Number(c.quantity))
                          ? Number(c.quantity)
                          : 1}
                      </strong>

                      {c.is_optional ? (
                        <>
                          {" "}· <strong>Opcional</strong>
                        </>
                      ) : (
                        <>
                          {" "}· <strong>Requerido</strong>
                        </>
                      )}
                    </div>

                    {!canPickVariant ? (
                      <AvailabilityChip source={c} />
                    ) : null}

                    {c.notes ? (
                      <div
                        style={{
                          fontSize: 12,
                          color: "#6E6A6A",
                          marginTop: 2,
                          whiteSpace: "pre-line",
                          lineHeight: 1.45,
                        }}
                      >
                        {String(c.notes)}
                      </div>
                    ) : null}
                  </div>

                  {c.is_optional ? (
                    <label
                      style={{
                        display: "inline-flex",
                        gap: 8,
                        alignItems: "center",
                        fontSize: 12,
                        fontWeight: 900,
                        color: "#3F3A52",
                        whiteSpace: "nowrap",
                      }}
                    >
                      <input
                        type="checkbox"
                        checked={included}
                        onChange={(event) =>
                          onToggleIncluded?.(
                            cid,
                            event.target.checked,
                          )
                        }
                        style={{
                          width: 17,
                          height: 17,
                          margin: 0,
                          cursor: "pointer",
                        }}
                      />

                      Incluir
                    </label>
                  ) : null}
                </div>

                {!canPickVariant ? (
                  <AvailabilityNotice source={c} />
                ) : null}

                {canPickVariant ? (
                  <div
                    style={{
                      display: "grid",
                      gap: 8,
                    }}
                  >
                    <div
                      style={{
                        fontSize: 12,
                        fontWeight: 900,
                        color: "#3F3A52",
                      }}
                    >
                      Variante del componente
                    </div>

                    <TextField
                      select
                      fullWidth
                      size="small"
                      value={
                        c.variant_id
                          ? String(c.variant_id)
                          : ""
                      }
                      SelectProps={{
                        displayEmpty: true,
                      }}
                      onChange={(event) => {
                        onVariantChange?.(
                          cid,
                          event.target.value
                            ? Number(event.target.value)
                            : null,
                        );
                      }}
                      disabled={included === false}
                      sx={{
                        "& .MuiOutlinedInput-root": {
                          minHeight: 44,
                          borderRadius: 2,
                          backgroundColor: "#FFFFFF",
                          fontSize: 14,
                          fontWeight: 700,
                          "& fieldset": {
                            borderColor: "rgba(47,42,61,0.16)",
                          },
                          "&:hover fieldset": {
                            borderColor: "rgba(47,42,61,0.30)",
                          },
                          "&.Mui-focused fieldset": {
                            borderWidth: "1px",
                          },
                        },
                        "& .MuiSelect-select": {
                          display: "flex",
                          alignItems: "center",
                        },
                        opacity: included === false ? 0.65 : 1,
                      }}
                    >
                      {c.default_option ? (
                        <MenuItem
                          value=""
                          disabled={isSourceUnavailable(c.default_option)}
                        >
                          {c.name}
                          {isSourceUnavailable(c.default_option)
                            ? " · No disponible"
                            : ""}
                        </MenuItem>
                      ) : (
                        <MenuItem
                          value=""
                          disabled={isSourceUnavailable(c)}
                        >
                          (Sin variante)
                          {isSourceUnavailable(c)
                            ? " · No disponible"
                            : ""}
                        </MenuItem>
                      )}

                      {variants.map((v) => (
                        <MenuItem
                          key={v.id}
                          value={String(v.id)}
                          disabled={isSourceUnavailable(v)}
                        >
                          {v.name}
                          {Number(v.price_adjustment_preview || 0) > 0
                            ? ` (+$${Number(
                                v.price_adjustment_preview,
                              ).toFixed(2)})`
                            : ""}
                          {isSourceUnavailable(v)
                            ? " · No disponible"
                            : ""}
                        </MenuItem>
                      ))}
                    </TextField>

                    <div
                      style={{
                        display: "flex",
                        flexWrap: "wrap",
                        gap: 8,
                        alignItems: "center",
                      }}
                    >
                      {effectiveSelectionSource ? (
                        <AvailabilityChip
                          source={effectiveSelectionSource}
                        />
                      ) : null}
                    </div>

                    {effectiveSelectionSource ? (
                      <AvailabilityNotice
                        source={effectiveSelectionSource}
                      />
                    ) : included ? (
                      <div
                        style={{
                          fontSize: 12,
                          padding: "8px 10px",
                          borderRadius: 12,
                          border:
                            "1px solid rgba(239, 68, 68, 0.20)",
                          background: "#FFF5F5",
                          color: "#B91C1C",
                          fontWeight: 800,
                        }}
                      >
                        La variante seleccionada ya no está disponible.
                        Elige otra opción.
                      </div>
                    ) : null}

                    <div
                      style={{
                        fontSize: 12,
                        color: "#6E6A6A",
                        lineHeight: 1.45,
                      }}
                    >
                      {c.apply_variant_price
                        ? "La variante puede modificar el precio del compuesto."
                        : "La variante es solo elección visual, sin ajuste de precio."}
                    </div>
                  </div>
                ) : c.allow_variant ? (
                  <div
                    style={{
                      fontSize: 12,
                      color: "#6E6A6A",
                      lineHeight: 1.45,
                    }}
                  >
                    Este componente permite variante, pero no hay variantes
                    disponibles en este canal.
                  </div>
                ) : null}
              </div>
            );
          })}

          {hasBlockingIncludedUnavailable ? (
            <div
              style={{
                fontSize: 12,
                padding: "10px 12px",
                borderRadius: 12,
                border: "1px solid rgba(239, 68, 68, 0.24)",
                background: "#FFF5F5",
                color: "#B91C1C",
                fontWeight: 800,
                lineHeight: 1.45,
              }}
            >
              Hay componentes seleccionados sin disponibilidad.
              Elige una opción disponible o retira los componentes
              opcionales bloqueados antes de continuar.
            </div>
          ) : null}
        </div>
      </div>
    </Modal>
  );
}