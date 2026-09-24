import React, { useMemo } from "react";
import { useTheme } from "@mui/material/styles";

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

  /*
   * Incluso durante una carga inicial no mostramos un placeholder grande.
   * Si todavía no existe ninguna unidad física visible, la sección no existe.
   */
  if (preparedItems.length === 0) return null;

  return (
    <section
      style={{
        marginTop: 22,
        paddingTop: 18,
        borderTop: `1px solid ${theme.palette.divider}`,
      }}
    >
      <div
        style={{
          display: "flex",
          justifyContent: "space-between",
          alignItems: "flex-end",
          gap: 12,
          flexWrap: "wrap",
          marginBottom: 12,
        }}
      >
        <div>
          <div
            style={{
              color: theme.palette.text.primary,
              fontSize: 16,
              fontWeight: 950,
              lineHeight: 1.2,
            }}
          >
            Preparación rápida
          </div>

          <div
            style={{
              marginTop: 4,
              color: theme.palette.text.secondary,
              fontSize: 12,
              fontWeight: 700,
              lineHeight: 1.35,
            }}
          >
            Productos que ya están listos.
          </div>
        </div>

        <div
          style={{
            color: theme.palette.text.secondary,
            fontSize: 11,
            fontWeight: 800,
            whiteSpace: "nowrap",
          }}
        >
          {preparedItems.length === 1
            ? "1 unidad disponible"
            : `${preparedItems.length} unidades disponibles`}
        </div>
      </div>

      <style>
        {`
          .preparedItemsGrid {
            display: grid;
            gap: 12px;
            grid-template-columns: repeat(1, minmax(0, 1fr));
          }

          @media (min-width: 640px) {
            .preparedItemsGrid {
              grid-template-columns: repeat(2, minmax(0, 1fr));
            }
          }

          @media (min-width: 900px) {
            .preparedItemsGrid {
              grid-template-columns: repeat(3, minmax(0, 1fr));
            }
          }

          @media (min-width: 1200px) {
            .preparedItemsGrid {
              grid-template-columns: repeat(4, minmax(0, 1fr));
            }
          }
        `}
      </style>

      <div className="preparedItemsGrid">
        {preparedItems.map((preparedItem) => {
          const preparedItemId = getPreparedItemId(preparedItem);
          const selected = selectedIds.has(preparedItemId);

          return (
            <PreparedItemCard
              key={getPreparedItemCartKey(preparedItem)}
              preparedItem={preparedItem}
              selected={selected}
              disabled={loading}
              themeColor={themeColor}
              onSelect={onSelect}
            />
          );
        })}
      </div>
    </section>
  );
}