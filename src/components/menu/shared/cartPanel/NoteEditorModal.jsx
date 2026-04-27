import React from "react";
import { Modal, PillButton } from "../../../../pages/public/publicMenu.ui";

export default function NoteEditorModal({
  open,
  item,
  value,
  setValue,
  onClose,
  onSave,
}) {
  const label = item?.variant_name
    ? `${item.name} · ${item.variant_name}`
    : item?.name;

  return (
    <Modal
      open={open}
      title="Nota del producto"
      onClose={onClose}
      width="min(480px, 94vw)"
      maxHeight="min(78vh, 620px)"
      bodyPadding={14}
      actions={
        <>
          <PillButton tone="default" onClick={onClose} title="Cancelar">
            Cancelar
          </PillButton>

          <PillButton
            tone="danger"
            onClick={() => {
              setValue("");
              onSave("");
            }}
            title="Limpiar nota"
            disabled={!String(value || "").trim()}
          >
            Limpiar
          </PillButton>

          <PillButton
            tone="orange"
            onClick={() => onSave(value)}
            title="Guardar nota"
          >
            Guardar nota
          </PillButton>
        </>
      }
    >
      <div style={{ display: "grid", gap: 12 }}>
        <div
          style={{
            border: "1px solid rgba(47,42,61,0.10)",
            background: "#FFFFFF",
            borderRadius: 18,
            padding: 12,
          }}
        >
          <div style={{ fontSize: 12, color: "#6E6A6A", fontWeight: 850 }}>
            Producto
          </div>

          <div
            style={{
              marginTop: 3,
              fontSize: 14,
              color: "#2F2A3D",
              fontWeight: 950,
              lineHeight: 1.25,
            }}
          >
            {label || "Producto"}
          </div>
        </div>

        <textarea
          value={value}
          onChange={(e) => setValue(e.target.value)}
          placeholder="Ej: sin cebolla, poco chile, separado, bien cocido..."
          maxLength={500}
          autoFocus
          style={{
            width: "100%",
            minHeight: 150,
            resize: "vertical",
            boxSizing: "border-box",
            borderRadius: 18,
            border: "1px solid rgba(47,42,61,0.14)",
            outline: "none",
            padding: 12,
            fontSize: 14,
            lineHeight: 1.45,
            fontWeight: 750,
            color: "#2F2A3D",
            background: "#FFFFFF",
          }}
        />

        <div
          style={{
            display: "flex",
            justifyContent: "space-between",
            gap: 10,
            fontSize: 12,
            color: "#6E6A6A",
            fontWeight: 800,
          }}
        >
          <span>La nota se guardará en este producto de la comanda.</span>
          <span>{String(value || "").length}/500</span>
        </div>
      </div>
    </Modal>
  );
}