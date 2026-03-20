import React from "react";
import {
  Modal,
  PillButton,
} from "../../../pages/public/publicMenu.ui";
import {
  buildModifierContextSections,
  formatModifierGroupMeta,
  money,
} from "../../../hooks/public/publicMenu.utils";

function OptionRow({ option, onSelectPlaceholder }) {
  const affectsPrice = !!option?.affects_total;
  const price = Number(option?.price || 0);

  return (
    <div
      style={{
        display: "grid",
        gap: 8,
        padding: "10px 12px",
        borderRadius: 12,
        border: "1px solid rgba(0,0,0,0.08)",
        background: "#fff",
      }}
    >
      <div
        style={{
          display: "flex",
          justifyContent: "space-between",
          gap: 10,
          alignItems: "start",
          flexWrap: "wrap",
        }}
      >
        <div style={{ minWidth: 0 }}>
          <div style={{ fontWeight: 900, fontSize: 13 }}>
            {option?.name || "Opción"}
          </div>

          {option?.description ? (
            <div style={{ fontSize: 12, opacity: 0.76, marginTop: 2 }}>
              {option.description}
            </div>
          ) : null}

          <div style={{ fontSize: 12, opacity: 0.72, marginTop: 4 }}>
            {affectsPrice
              ? `Ajuste: ${money(price)}`
              : "Sin ajuste al total"}
            {Number(option?.max_quantity_per_selection || 0) > 1
              ? ` · Máx. por selección: ${Number(option.max_quantity_per_selection)}`
              : ""}
            {option?.is_default ? " · Sugerido por defecto" : ""}
          </div>
        </div>

        <PillButton
          tone="soft"
          onClick={() => onSelectPlaceholder?.(option)}
          title="Botón listo para conectar la selección después"
        >
          Seleccionar
        </PillButton>
      </div>
    </div>
  );
}

function GroupCard({ group, onSelectPlaceholder }) {
  const options = Array.isArray(group?.options) ? group.options : [];

  return (
    <div
      style={{
        display: "grid",
        gap: 10,
        padding: "12px",
        borderRadius: 14,
        border: "1px solid rgba(0,0,0,0.10)",
        background: "#fff",
      }}
    >
      <div>
        <div style={{ fontWeight: 950, fontSize: 14 }}>
          {group?.name || "Grupo de extras"}
        </div>

        {group?.description ? (
          <div style={{ fontSize: 12, opacity: 0.78, marginTop: 3 }}>
            {group.description}
          </div>
        ) : null}

        <div style={{ fontSize: 12, opacity: 0.74, marginTop: 5 }}>
          {formatModifierGroupMeta(group)}
        </div>
      </div>

      {options.length > 0 ? (
        <div style={{ display: "grid", gap: 8 }}>
          {options.map((option) => (
            <OptionRow
              key={option?.id}
              option={option}
              onSelectPlaceholder={onSelectPlaceholder}
            />
          ))}
        </div>
      ) : (
        <div
          style={{
            fontSize: 12,
            opacity: 0.7,
            padding: "10px 12px",
            borderRadius: 12,
            background: "#fafafa",
            border: "1px dashed rgba(0,0,0,0.12)",
          }}
        >
          Este grupo no tiene opciones visibles en este contexto.
        </div>
      )}
    </div>
  );
}

export default function ProductExtrasModal({
  open,
  product,
  onClose,
  onSelectPlaceholder,
}) {
  if (!product) return null;

  const title = product?.display_name || product?.name || "Producto";
  const sections = buildModifierContextSections(product);

  return (
    <Modal
      open={open}
      title={`Extras: ${title}`}
      onClose={onClose}
      actions={
        <PillButton tone="default" onClick={onClose} title="Cerrar">
          Cerrar
        </PillButton>
      }
    >
      <div style={{ display: "grid", gap: 12 }}>
        <div style={{ fontSize: 13, opacity: 0.82 }}>
          Aquí se muestran los extras disponibles según su contexto real:
          producto, variante, componente o variante del componente. Una rareza
          agradable: por fin algo ordenado.
        </div>

        {sections.length > 0 ? (
          sections.map((section) => (
            <div
              key={section.key}
              style={{
                display: "grid",
                gap: 10,
                padding: "12px",
                borderRadius: 16,
                border: "1px solid rgba(0,0,0,0.10)",
                background: "#fafafa",
              }}
            >
              <div>
                <div style={{ fontWeight: 950, fontSize: 14 }}>
                  {section.title}
                </div>
                <div style={{ fontSize: 12, opacity: 0.76, marginTop: 2 }}>
                  {section.subtitle}
                </div>
              </div>

              <div style={{ display: "grid", gap: 10 }}>
                {(section.groups || []).map((group) => (
                  <GroupCard
                    key={group?.id}
                    group={group}
                    onSelectPlaceholder={onSelectPlaceholder}
                  />
                ))}
              </div>
            </div>
          ))
        ) : (
          <div
            style={{
              fontSize: 13,
              opacity: 0.78,
              padding: "12px",
              borderRadius: 14,
              border: "1px dashed rgba(0,0,0,0.12)",
              background: "#fafafa",
            }}
          >
            Este producto no tiene extras visibles para este contexto.
          </div>
        )}
      </div>
    </Modal>
  );
}