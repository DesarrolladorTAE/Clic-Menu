import React from "react";
import { empty } from "./kitchen.helpers";

export default function KitchenEmptyState({ tab = "preparing" }) {
  const readyMode = tab === "ready";

  return (
    <div style={empty}>
      <div style={{ fontWeight: 950 }}>
        {readyMode ? "No hay pedidos listos para avisar." : "No hay pedidos en preparación."}
      </div>

      <div style={{ opacity: 0.7, marginTop: 6 }}>
        {readyMode
          ? "Cuando Cocina termine todas las partidas de un pedido, aparecerá aquí."
          : "Las nuevas comandas aparecerán aquí cuando estén listas para comenzar."}
      </div>
    </div>
  );
}