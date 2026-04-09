import React from "react";
import { empty } from "./kitchen.helpers";

export default function KitchenEmptyState() {
  return (
    <div style={empty}>
      <div style={{ fontWeight: 950 }}>No hay ítems pendientes en cocina.</div>
      <div style={{ opacity: 0.7, marginTop: 6 }}>
        Si esperabas ver algo, quizá la orden ya está <b>lista</b>, o no hay
        comandas <b>abiertas</b>.
      </div>
    </div>
  );
}
