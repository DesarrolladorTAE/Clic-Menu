import { useEffect, useMemo, useState } from "react";
import { useNavigate, useParams, useLocation } from "react-router-dom";

import { getRestaurantSubscriptionStatus } from "../../services/restaurant/restaurant.service";
import { getRestaurantSettings } from "../../services/restaurant/restaurantSettings.service";
import { getBranch } from "../../services/restaurant/branch.service"; // si no tienes, comenta y deja nombre genérico

import {
  getBranchSalesChannels,
  upsertBranchSalesChannel,
} from "../../services/restaurant/branchSalesChannels.service";

export default function BranchSalesChannelsPage() {
  const nav = useNavigate();
  const { restaurantId, branchId } = useParams();
  const location = useLocation();

  const [loading, setLoading] = useState(true);
  const [err, setErr] = useState("");

  const [savingMap, setSavingMap] = useState({}); // { [salesChannelId]: boolean }

  const [branchName, setBranchName] = useState("");
  const [mode, setMode] = useState("global"); // no se usa aquí, pero mantenemos consistencia
  const [rows, setRows] = useState([]); // [{ sales_channel, branch }]

  const [search, setSearch] = useState("");
  const [onlyRestaurantActive, setOnlyRestaurantActive] = useState(false); // filtra por channel.status
  const [onlyBranchEnabled, setOnlyBranchEnabled] = useState(false); // filtra por effective_is_active

  const effectiveRestaurantId = Number(restaurantId);
  const effectiveBranchId = Number(branchId);

  // ===== helpers =====
  const setSaving = (salesChannelId, v) =>
    setSavingMap((prev) => ({ ...prev, [salesChannelId]: v }));

  const isSaving = (salesChannelId) => !!savingMap[salesChannelId];

  const title = useMemo(() => {
    const bl = branchName?.trim()
      ? branchName.trim()
      : `Sucursal ${effectiveBranchId}`;
    return `Canales de venta — ${bl}`;
  }, [branchName, effectiveBranchId]);

  const load = async () => {
    setErr("");
    setLoading(true);

    try {
      // 1) validar restaurante operativo (igual que el resto del sistema)
      const st = await getRestaurantSubscriptionStatus(effectiveRestaurantId);
      if (st?.is_operational !== true) {
        nav(`/owner/restaurants/${effectiveRestaurantId}/plans`, {
          state: {
            notice: "Este restaurante está bloqueado. Contrata un plan para operar.",
            code: st?.code || "SUBSCRIPTION_REQUIRED",
          },
        });
        return;
      }

      // 2) cargar modo de productos (no se usa aquí, pero mantiene patrón del sistema)
      let pm = location?.state?.products_mode;
      if (!pm) {
        const settings = await getRestaurantSettings(effectiveRestaurantId);
        pm = settings?.products_mode || "global";
      }
      setMode(pm);

      // 3) branch name (opcional)
      try {
        const b = await getBranch(effectiveRestaurantId, effectiveBranchId);
        setBranchName(b?.name || "");
      } catch {
        setBranchName("");
      }

      // 4) cargar canales de venta (restaurant channels + override por sucursal)
      const list = await getBranchSalesChannels(effectiveRestaurantId, effectiveBranchId);
      setRows(Array.isArray(list) ? list : []);

    } catch (e) {
      setErr(
        e?.response?.data?.message || "No se pudieron cargar los canales de venta"
      );
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    load();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [restaurantId, branchId]);

  const filtered = useMemo(() => {
    const q = search.trim().toLowerCase();

    return rows
      .filter((r) => {
        const ch = r?.sales_channel;
        const br = r?.branch;

        if (onlyRestaurantActive && ch?.status !== "active") return false;
        if (onlyBranchEnabled && br?.effective_is_active !== true) return false;

        if (!q) return true;
        const name = (ch?.name || "").toLowerCase();
        const code = (ch?.code || "").toLowerCase();
        return name.includes(q) || code.includes(q);
      })
      .sort((a, b) => {
        // primero los efectivos activos
        const ea = a?.branch?.effective_is_active ? 1 : 0;
        const eb = b?.branch?.effective_is_active ? 1 : 0;
        if (ea !== eb) return eb - ea;

        // luego por nombre
        return (a?.sales_channel?.name || "").localeCompare(
          b?.sales_channel?.name || ""
        );
      });
  }, [rows, search, onlyRestaurantActive, onlyBranchEnabled]);

  const onToggle = async (row) => {
    const ch = row?.sales_channel;
    const br = row?.branch;

    const salesChannelId = ch?.id;
    if (!salesChannelId) return;

    setErr("");
    if (isSaving(salesChannelId)) return;

    // regla dura: si canal está inactive en restaurante, no se puede prender en sucursal
    if (ch?.status !== "active") {
      setErr("Este canal está INACTIVO a nivel restaurante. Actívalo primero.");
      return;
    }

    const prev = !!br?.is_active; // lo que la sucursal “quiere”
    const next = !prev;

    // UI optimista: cambiamos is_active y effective_is_active
    setRows((prevRows) =>
      prevRows.map((r) => {
        if (r?.sales_channel?.id !== salesChannelId) return r;
        return {
          ...r,
          branch: {
            ...(r.branch || {}),
            is_active: next,
            effective_is_active: next, // como status es active, effective = is_active
            blocked_by_channel_status: false,
          },
        };
      })
    );

    setSaving(salesChannelId, true);

    try {
      await upsertBranchSalesChannel(
        effectiveRestaurantId,
        effectiveBranchId,
        salesChannelId,
        next
      );

      // recarga para mantener consistencia
      const list = await getBranchSalesChannels(effectiveRestaurantId, effectiveBranchId);
      setRows(Array.isArray(list) ? list : []);

    } catch (e) {
      // rollback: recarga completa
      setErr(
        e?.response?.data?.message ||
          "No se pudo actualizar el canal en esta sucursal"
      );
      await load();
    } finally {
      setSaving(salesChannelId, false);
    }
  };

  const onConfig = (row) => {
  const ch = row?.sales_channel;
  const br = row?.branch;

  const salesChannelId = ch?.id;
    if (!salesChannelId) return;

    // Solo si efectivo activo (habilitado realmente en la sucursal)
    if (br?.effective_is_active !== true) {
      setErr("Activa este canal en la sucursal antes de configurar productos.");
      return;
    }

    nav(
      `/owner/restaurants/${effectiveRestaurantId}/branches/${effectiveBranchId}/sales-channels/${salesChannelId}/products`,
      {
        state: {
          sales_channel: ch,          // opcional, por si quieres mostrar nombre sin recargar
          branch_name: branchName,    // opcional
          products_mode: mode,        // opcional
        },
      }
    );
  };


  if (loading) return <div style={{ padding: 16 }}>Cargando canales…</div>;

  const branchLabel = branchName?.trim()
    ? branchName.trim()
    : `Sucursal ${effectiveBranchId}`;

  return (
    <div style={{ maxWidth: 980, margin: "30px auto", padding: 16 }}>
      <div style={{ display: "flex", justifyContent: "space-between", gap: 12 }}>
        <div>
          <h2 style={{ margin: 0 }}>{title}</h2>
          <div style={{ marginTop: 6, opacity: 0.85 }}>
            Restaurante: <strong>{restaurantId}</strong> · {branchLabel}
          </div>

          <div style={{ marginTop: 6, fontSize: 12, opacity: 0.75 }}>
            Aquí activas/desactivas canales por sucursal. Aún no se configuran
            productos en esta pantalla.
          </div>
        </div>

        <div style={{ display: "flex", gap: 8 }}>
          <button
            onClick={() => nav(`/owner/restaurants`)}
            style={{ padding: "10px 14px", cursor: "pointer" }}
          >
            ← Volver
          </button>

          <button
            onClick={load}
            style={{ padding: "10px 14px", cursor: "pointer" }}
            title="Recargar"
          >
            Actualizar
          </button>
        </div>
      </div>

      {err && (
        <div
          style={{
            marginTop: 12,
            background: "#ffe5e5",
            padding: 10,
            whiteSpace: "pre-line",
          }}
        >
          {err}
        </div>
      )}

      {/* filtros */}
      <div
        style={{
          marginTop: 14,
          padding: 12,
          border: "1px solid #ddd",
          borderRadius: 10,
          display: "flex",
          gap: 12,
          alignItems: "center",
          flexWrap: "wrap",
        }}
      >
        <div style={{ flex: 1, minWidth: 240 }}>
          <div style={{ fontSize: 12, fontWeight: 800, marginBottom: 6 }}>
            Buscar
          </div>
          <input
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Buscar por nombre o code..."
            style={{
              width: "100%",
              padding: 10,
              borderRadius: 8,
              border: "1px solid #ddd",
            }}
          />
        </div>

        <div>
          <div style={{ fontSize: 12, fontWeight: 800, marginBottom: 6 }}>
            Filtros
          </div>

          <label style={{ display: "flex", gap: 8, alignItems: "center" }}>
            <input
              type="checkbox"
              checked={onlyRestaurantActive}
              onChange={(e) => setOnlyRestaurantActive(e.target.checked)}
            />
            Solo canales activos (restaurante)
          </label>

          <label style={{ display: "flex", gap: 8, alignItems: "center", marginTop: 6 }}>
            <input
              type="checkbox"
              checked={onlyBranchEnabled}
              onChange={(e) => setOnlyBranchEnabled(e.target.checked)}
            />
            Solo activos en sucursal
          </label>
        </div>

        <div style={{ marginLeft: "auto", fontSize: 12, opacity: 0.8 }}>
          Mostrando: <strong>{filtered.length}</strong> / {rows.length}
        </div>
      </div>

      {/* tabla */}
      <div style={{ marginTop: 14, border: "1px solid #ddd", borderRadius: 10 }}>
        <div
          style={{
            display: "grid",
            gridTemplateColumns: "1fr 160px 220px",
            padding: "10px 12px",
            borderBottom: "1px solid #eee",
            fontWeight: 900,
            background: "#fafafa",
            borderTopLeftRadius: 10,
            borderTopRightRadius: 10,
          }}
        >
          <div>Canal</div>
          <div style={{ textAlign: "center" }}>Activo</div>
          <div style={{ textAlign: "right" }}>Acciones</div>
        </div>

        {filtered.length === 0 ? (
          <div style={{ padding: 12, opacity: 0.8 }}>
            No hay canales para mostrar con este filtro.
          </div>
        ) : (
          <div style={{ display: "grid" }}>
            {filtered.map((r) => {
              const ch = r.sales_channel;
              const br = r.branch;

              const restaurantActive = ch?.status === "active";
              const enabled = !!br?.effective_is_active; // lo que realmente aplica
              const busy = isSaving(ch.id);

              // bloqueado si el canal restaurante está inactive
              const disabledSwitch = busy || !restaurantActive;

              const badgeText = restaurantActive ? "Activo" : "Inactivo";
              const badgeBg = restaurantActive ? "#e6ffed" : "#eee";
              const badgeColor = restaurantActive ? "#0a7a2f" : "#444";

              return (
                <div
                  key={ch.id}
                  style={{
                    display: "grid",
                    gridTemplateColumns: "1fr 160px 220px",
                    padding: "12px 12px",
                    borderTop: "1px solid #f0f0f0",
                    alignItems: "center",
                  }}
                >
                  <div style={{ minWidth: 0 }}>
                    <div
                      style={{
                        fontWeight: 900,
                        display: "flex",
                        gap: 10,
                        alignItems: "center",
                      }}
                    >
                      <span
                        style={{
                          overflow: "hidden",
                          textOverflow: "ellipsis",
                          whiteSpace: "nowrap",
                        }}
                      >
                        {ch?.name || "Canal sin nombre"}
                      </span>

                      <span
                        style={{
                          fontSize: 11,
                          padding: "2px 8px",
                          borderRadius: 999,
                          border: "1px solid rgba(0,0,0,0.08)",
                          background: badgeBg,
                          color: badgeColor,
                          fontWeight: 900,
                        }}
                        title="Estado del canal a nivel restaurante"
                      >
                        {badgeText} (restaurante)
                      </span>

                      {busy && (
                        <span style={{ fontSize: 12, opacity: 0.7 }}>
                          guardando...
                        </span>
                      )}
                    </div>

                    <div style={{ marginTop: 4, fontSize: 12, opacity: 0.8 }}>
                      Code: <strong style={{ fontFamily: "monospace" }}>{ch?.code}</strong>
                    </div>

                    {!restaurantActive && (
                      <div style={{ marginTop: 6, fontSize: 12, opacity: 0.75 }}>
                        Este canal está inactivo a nivel restaurante. No se puede usar en
                        sucursales.
                      </div>
                    )}
                  </div>

                  <div style={{ display: "flex", justifyContent: "center" }}>
                    <input
                      type="checkbox"
                      checked={enabled}
                      disabled={disabledSwitch}
                      onChange={() => onToggle(r)}
                      title={
                        !restaurantActive
                          ? "Canal inactivo en restaurante"
                          : "Activar / desactivar en esta sucursal"
                      }
                    />
                  </div>

                  <div style={{ display: "flex", justifyContent: "flex-end" }}>
                    <button
                      onClick={() => onConfig(r)}
                      disabled={br?.effective_is_active !== true}
                      style={{
                        padding: "8px 10px",
                        cursor: br?.effective_is_active === true ? "pointer" : "not-allowed",
                        opacity: br?.effective_is_active === true ? 1 : 0.6,
                        background: "#f0f0ff",
                        border: "1px solid #cfcfff",
                        borderRadius: 8,
                        fontWeight: 900,
                      }}
                      title={
                        br?.effective_is_active === true
                          ? "Configurar productos (siguiente pantalla)"
                          : "Activa el canal primero"
                      }
                    >
                      🔧 Configurar productos
                    </button>

                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>

      <div style={{ marginTop: 12, fontSize: 12, opacity: 0.75 }}>
        Nota: Un canal <strong>Inactivo</strong> a nivel restaurante no puede activarse
        en sucursales.
      </div>
    </div>
  );
}
