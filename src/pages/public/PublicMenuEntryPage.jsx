// src/pages/public/PublicMenuEntryPage.jsx
import React, { useEffect, useMemo, useRef, useState } from "react";
import { useParams } from "react-router-dom";
import { fetchResolvedMenu, callWaiter } from "../../services/public/publicMenu.service";

// Helpers UI
function money(n) {
  const num = Number(n || 0);
  try {
    return num.toLocaleString("es-MX", { style: "currency", currency: "MXN" });
  } catch {
    return `$${num.toFixed(2)}`;
  }
}

function translateStatus(value) {
  const v = String(value || "").toLowerCase();
  const map = {
    active: "Activo",
    inactive: "Inactivo",
    disabled: "Deshabilitado",
    suspended: "Suspendido",
    deleted: "Eliminado",
    pending: "Pendiente",
  };
  return map[v] || (value ? String(value) : "—");
}

function translateOrderingMode(value) {
  const v = String(value || "").toLowerCase();
  const map = {
    waiter_only: "Solo mesero",
    customer_assisted: "Cliente asistido",
  };
  return map[v] || (value ? String(value) : "—");
}

function translateTableServiceMode(value) {
  const v = String(value || "").toLowerCase();
  const map = {
    assigned_waiter: "Mesero asignado",
    free_for_all: "Libre",
  };
  return map[v] || (value ? String(value) : "—");
}

function Badge({ children, tone = "default", title }) {
  const map = {
    default: { bg: "#eef2ff", bd: "#cfcfff", fg: "#2d2d7a" },
    ok: { bg: "#e6ffed", bd: "#8ae99c", fg: "#0a7a2f" },
    warn: { bg: "#fff3cd", bd: "#ffe08a", fg: "#8a6d3b" },
    err: { bg: "#ffe5e5", bd: "#ffb3b3", fg: "#a10000" },
    dark: { bg: "#111827", bd: "#1f2937", fg: "#ffffff" },
  };
  const c = map[tone] || map.default;

  return (
    <span
      title={title}
      style={{
        display: "inline-flex",
        alignItems: "center",
        gap: 6,
        padding: "4px 10px",
        borderRadius: 999,
        border: `1px solid ${c.bd}`,
        background: c.bg,
        color: c.fg,
        fontSize: 12,
        fontWeight: 900,
        whiteSpace: "nowrap",
      }}
    >
      {children}
    </span>
  );
}

function SkeletonCard() {
  const row = (w) => (
    <div style={{ height: 12, width: w, borderRadius: 8, background: "rgba(0,0,0,0.08)" }} />
  );

  return (
    <div
      style={{
        border: "1px solid rgba(0,0,0,0.10)",
        borderRadius: 16,
        padding: 14,
        background: "#fff",
        display: "grid",
        gap: 10,
      }}
    >
      <div style={{ height: 120, borderRadius: 14, background: "rgba(0,0,0,0.06)" }} />
      {row("70%")}
      {row("45%")}
      {row("55%")}
    </div>
  );
}

function PillButton({ onClick, children, tone = "default", title, disabled }) {
  const map = {
    default: { bg: "#fff", bd: "rgba(0,0,0,0.12)", fg: "#111" },
    soft: { bg: "#eef2ff", bd: "#cfcfff", fg: "#111" },
    dark: { bg: "#111827", bd: "#1f2937", fg: "#fff" },
    danger: { bg: "#ffe5e5", bd: "#ffb3b3", fg: "#a10000" },
  };
  const c = map[tone] || map.default;

  return (
    <button
      onClick={onClick}
      disabled={!!disabled}
      title={title}
      style={{
        cursor: disabled ? "not-allowed" : "pointer",
        borderRadius: 12,
        border: `1px solid ${c.bd}`,
        background: c.bg,
        color: c.fg,
        padding: "10px 12px",
        fontWeight: 950,
        height: 40,
        opacity: disabled ? 0.55 : 1,
      }}
    >
      {children}
    </button>
  );
}

function ProductThumb({ imageUrl, title }) {
  const [failed, setFailed] = useState(false);
  useEffect(() => setFailed(false), [imageUrl]);

  const wrapStyle = {
    width: "100%",
    height: 130,
    borderRadius: 16,
    border: "1px solid rgba(0,0,0,0.10)",
    background: "#f3f4f6",
    overflow: "hidden",
    display: "grid",
    placeItems: "center",
  };

  const labelStyle = {
    fontSize: 12,
    fontWeight: 900,
    opacity: 0.75,
    textAlign: "center",
    padding: 10,
    lineHeight: 1.1,
  };

  if (!imageUrl) {
    return (
      <div style={wrapStyle} aria-label="Sin imagen">
        <div style={labelStyle}>Sin imagen</div>
      </div>
    );
  }

  if (failed) {
    return (
      <div style={wrapStyle} aria-label="Imagen no disponible">
        <div style={labelStyle}>Imagen no disponible</div>
      </div>
    );
  }

  return (
    <div style={wrapStyle}>
      <img
        src={imageUrl}
        alt={title}
        loading="lazy"
        onError={() => setFailed(true)}
        style={{ width: "100%", height: "100%", objectFit: "cover", display: "block" }}
      />
    </div>
  );
}

function CategoryChip({ active, label, onClick }) {
  return (
    <button
      onClick={onClick}
      style={{
        cursor: "pointer",
        borderRadius: 999,
        border: `1px solid ${active ? "#ff7a00" : "rgba(0,0,0,0.12)"}`,
        background: active ? "#ff7a00" : "#fff",
        color: active ? "#fff" : "#111",
        padding: "10px 14px",
        fontWeight: 950,
        fontSize: 13,
        boxShadow: active ? "0 8px 18px rgba(255,122,0,0.22)" : "none",
        whiteSpace: "nowrap",
      }}
      title={label}
    >
      {label}
    </button>
  );
}

function SearchBar({ value, onChange }) {
  return (
    <div
      style={{
        display: "flex",
        gap: 10,
        alignItems: "center",
        border: "1px solid rgba(0,0,0,0.12)",
        borderRadius: 14,
        background: "#fff",
        padding: "10px 12px",
      }}
    >
      <span style={{ fontSize: 14, opacity: 0.6 }}>🔎</span>
      <input
        value={value}
        onChange={(e) => onChange(e.target.value)}
        placeholder="Buscar plato…"
        style={{
          border: "none",
          outline: "none",
          width: "100%",
          fontSize: 14,
          fontWeight: 700,
          background: "transparent",
        }}
      />
      {value ? (
        <button
          onClick={() => onChange("")}
          title="Limpiar"
          style={{
            cursor: "pointer",
            border: "1px solid rgba(0,0,0,0.12)",
            background: "#fff",
            borderRadius: 10,
            padding: "6px 10px",
            fontWeight: 900,
          }}
        >
          ✕
        </button>
      ) : null}
    </div>
  );
}

function Collapse({ open, children }) {
  return (
    <div style={{ maxHeight: open ? 800 : 0, overflow: "hidden", transition: "max-height 220ms ease" }}>
      <div style={{ paddingTop: open ? 10 : 0 }}>{children}</div>
    </div>
  );
}

const PUBLIC_QR_DISABLED_MSG =
  "Menú digital temporalmente fuera de servicio. Por favor, solicita una carta física";

const PUBLIC_QR_WRONG_MODE_MSG =
  "Este QR ya no es válido para el modo actual de toma de pedidos. Solicita que generen un QR nuevo.";

function isQrDisabledPublicError(e) {
  const status = e?.response?.status;
  if (status !== 403) return false;

  const msg = String(e?.response?.data?.message || e?.response?.data?.error || e?.message || "").toLowerCase();

  return (
    msg.includes("qr desactivado") ||
    msg.includes("no está habilitado") ||
    msg.includes("servicio por qr") ||
    msg.includes("no está habilitado aquí") ||
    msg.includes("desactivado")
  );
}

function isQrWrongModeError(e) {
  const status = e?.response?.status;
  if (status !== 403) return false;

  const msg = String(e?.response?.data?.message || e?.response?.data?.error || e?.message || "").toLowerCase();

  return (
    msg.includes("qr no válido") ||
    msg.includes("modo actual") ||
    msg.includes("toma de pedidos") ||
    msg.includes("genera un qr nuevo")
  );
}

export default function PublicMenuEntryPage() {
  const { token } = useParams();

  const [loading, setLoading] = useState(true);
  const [errorMsg, setErrorMsg] = useState("");
  const [data, setData] = useState(null);

  // WEB selector
  const [webChannelId, setWebChannelId] = useState("");

  const [categoryFilter, setCategoryFilter] = useState("all");
  const [q, setQ] = useState("");
  const [expanded, setExpanded] = useState(() => new Set());

  const [selected, setSelected] = useState(() => new Set());
  const [guestName, setGuestName] = useState("");

  const [calling, setCalling] = useState(false);
  const [callToast, setCallToast] = useState("");

  const pollRef = useRef(null);
  const lastPayloadHashRef = useRef("");

  const safeHash = (obj) => {
    try {
      const s = JSON.stringify(obj || []);
      return `${s.length}:${s.slice(0, 160)}`;
    } catch {
      return String(Date.now());
    }
  };

  const load = async ({ silent = false } = {}) => {
    if (!silent) {
      setLoading(true);
      setErrorMsg("");
    }
    try {
      const payload = await fetchResolvedMenu(token);
      const normalized = payload;

      // Si es WEB y no hay canal seleccionado, usar default_channel_id
      if (String(normalized?.type) === "web") {
        const def = normalized?.default_channel_id ? String(normalized.default_channel_id) : "";
        setWebChannelId((prev) => prev || def);
      } else {
        setWebChannelId("");
      }

      // Hash basado en “sections activas” (depende si web o no)
      const sectionsForHash =
        String(normalized?.type) === "web"
          ? normalized?.menus_by_channel?.[String(normalized?.default_channel_id || "")]?.sections || []
          : normalized?.sections || [];

      const h = safeHash(sectionsForHash);
      if (h !== lastPayloadHashRef.current) {
        lastPayloadHashRef.current = h;
        setData(normalized);
      } else if (!data) {
        setData(normalized);
      }
    } catch (e) {
      if (!silent) {
        if (isQrWrongModeError(e)) {
          setErrorMsg(PUBLIC_QR_WRONG_MODE_MSG);
          setData(null);
        } else if (isQrDisabledPublicError(e)) {
          setErrorMsg(PUBLIC_QR_DISABLED_MSG);
          setData(null);
        } else {
          const msg = e?.response?.data?.message || e?.response?.data?.error || e?.message || "No se pudo cargar el menú.";
          setErrorMsg(msg);
          setData(null);
        }
      }
    } finally {
      if (!silent) setLoading(false);
    }
  };

  useEffect(() => {
    load();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [token]);

  useEffect(() => {
    const start = () => {
      if (pollRef.current) return;
      pollRef.current = setInterval(() => {
        if (document.visibilityState === "visible") load({ silent: true });
      }, 15000);
    };
    const stop = () => {
      if (pollRef.current) {
        clearInterval(pollRef.current);
        pollRef.current = null;
      }
    };
    start();
    return stop;
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [token]);

  const isWeb = useMemo(() => String(data?.type) === "web", [data]);

  const webChannels = useMemo(() => {
    if (!isWeb) return [];
    return Array.isArray(data?.channels) ? data.channels : [];
  }, [data, isWeb]);

  const activeWebChannelId = useMemo(() => {
    if (!isWeb) return "";
    const chosen = String(webChannelId || "");
    if (chosen) return chosen;
    const def = data?.default_channel_id ? String(data.default_channel_id) : "";
    return def;
  }, [isWeb, webChannelId, data]);

  const activeMenuPayload = useMemo(() => {
    if (!data) return null;
    if (!isWeb) return data;

    const by = data?.menus_by_channel || {};
    const picked = by?.[String(activeWebChannelId)] || null;

    // Si no existe (caso raro), intenta con el default
    if (picked) return { ...picked, ui: data?.ui, table: data?.table, ordering_mode: data?.ordering_mode, table_service_mode: data?.table_service_mode, type: data?.type };

    const def = data?.default_channel_id ? String(data.default_channel_id) : "";
    const fallback = def ? by?.[def] : null;
    return fallback
      ? { ...fallback, ui: data?.ui, table: data?.table, ordering_mode: data?.ordering_mode, table_service_mode: data?.table_service_mode, type: data?.type }
      : { ...data, sections: [] };
  }, [data, isWeb, activeWebChannelId]);

  // Para evitar basura de filtros cuando cambias canal WEB
  useEffect(() => {
    setCategoryFilter("all");
    setQ("");
    setExpanded(new Set());
    setSelected(new Set());
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [activeWebChannelId]);

  const header = useMemo(() => {
    if (!activeMenuPayload) return null;
    const r = activeMenuPayload.restaurant;
    const b = activeMenuPayload.branch;
    const sc = activeMenuPayload.sales_channel;
    const t = activeMenuPayload.table;

    return {
      restaurantName: r?.trade_name || "Restaurante",
      restaurantStatus: r?.status,
      branchName: b?.name || "Sucursal",
      branchStatus: b?.status,
      channelName: sc?.name || "Canal",
      tableName: t?.name || null,
      orderingMode: activeMenuPayload.ordering_mode || null,
      tableServiceMode: activeMenuPayload.table_service_mode || null,
    };
  }, [activeMenuPayload]);

  const ui = useMemo(() => activeMenuPayload?.ui || {}, [activeMenuPayload]);
  const hasTable = !!activeMenuPayload?.table?.id;

  const badgeUi = useMemo(() => {
    if (!ui?.ui_mode) return { tone: "default", label: "Menú" };
    if (ui.ui_mode === "selectable") return { tone: "ok", label: "Seleccionable" };
    return { tone: "default", label: "Solo lectura" };
  }, [ui]);

  const sections = useMemo(() => activeMenuPayload?.sections || [], [activeMenuPayload]);

  const categoryNameById = useMemo(() => {
    const map = new Map();
    for (const s of sections || []) {
      for (const c of s?.categories || []) {
        if (c?.id) map.set(Number(c.id), c?.name || "");
      }
    }
    return map;
  }, [sections]);

  const categoryOptions = useMemo(() => {
    const opts = [{ value: "all", label: "Todos" }];
    const seen = new Set();
    for (const s of sections || []) {
      for (const c of s?.categories || []) {
        if (!c?.id || seen.has(c.id)) continue;
        seen.add(c.id);
        opts.push({ value: String(c.id), label: c.name || "Categoría" });
      }
    }
    return opts;
  }, [sections]);

  const allProducts = useMemo(() => {
    const out = [];
    for (const s of sections || []) {
      for (const c of s?.categories || []) {
        const catName = c?.name || "";
        for (const p of c?.products || []) out.push({ ...p, __categoryName: catName });
      }
    }
    return out;
  }, [sections]);

  const filteredProducts = useMemo(() => {
    const needle = (q || "").trim().toLowerCase();
    const catId = categoryFilter === "all" ? null : Number(categoryFilter);

    const matchText = (txt) => {
      if (!needle) return true;
      return String(txt || "").toLowerCase().includes(needle);
    };

    return (allProducts || []).filter((p) => {
      if (catId && Number(p.category_id) !== catId) return false;
      if (!needle) return true;

      const title = p.display_name || p.name;
      if (matchText(title)) return true;

      const vars = Array.isArray(p.variants) ? p.variants : [];
      return vars.some((v) => matchText(v?.name || v?.display_name));
    });
  }, [allProducts, categoryFilter, q]);

  const toggleVariants = (pid) => {
    setExpanded((prev) => {
      const next = new Set(prev);
      if (next.has(pid)) next.delete(pid);
      else next.add(pid);
      return next;
    });
  };

  const canSelect = !!ui?.can_select_products && ui?.ui_mode === "selectable";
  const showSelectBtn = !!ui?.show_select_button && canSelect;
  const showCallWaiterBtn = !!ui?.show_call_waiter_button && hasTable;

  const toggleSelectProduct = (id) => {
    setSelected((prev) => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });
  };

  const onCallWaiter = async () => {
    setCalling(true);
    setCallToast("");
    try {
      await callWaiter(token);
      setCallToast("✅ Listo. Se registró tu solicitud para llamar al mesero.");
      setTimeout(() => setCallToast(""), 4500);
    } catch (e) {
      const status = e?.response?.status;
      const msg = e?.response?.data?.message || e?.response?.data?.error || e?.message || "No se pudo llamar al mesero.";

      if (status === 404) {
        setCallToast("⚠️ Botón listo, endpoint aún no está publicado. (POST call waiter)");
      } else {
        setCallToast(`⚠️ ${msg}`);
      }
      setTimeout(() => setCallToast(""), 4500);
    } finally {
      setCalling(false);
    }
  };

  if (loading) {
    return (
      <div style={{ maxWidth: 1200, margin: "18px auto", padding: 16 }}>
        <div style={{ display: "flex", justifyContent: "space-between", gap: 12, flexWrap: "wrap" }}>
          <div>
            <div style={{ fontSize: 18, fontWeight: 950 }}>Cargando menú…</div>
            <div style={{ fontSize: 12, opacity: 0.75, marginTop: 6 }}>
              {/* público: el token existe, no es “ID interno”, aquí sí es útil */}
              Token: <strong style={{ letterSpacing: 0.5 }}>{token}</strong>
            </div>
          </div>
          <Badge tone="default">Solo lectura</Badge>
        </div>

        <div
          style={{
            marginTop: 14,
            display: "grid",
            gridTemplateColumns: "repeat(4, minmax(0, 1fr))",
            gap: 12,
          }}
        >
          <SkeletonCard />
          <SkeletonCard />
          <SkeletonCard />
          <SkeletonCard />
        </div>
      </div>
    );
  }

  if (errorMsg) {
    const isQrDisabledMsg = errorMsg === PUBLIC_QR_DISABLED_MSG;
    const isWrongModeMsg = errorMsg === PUBLIC_QR_WRONG_MODE_MSG;

    return (
      <div style={{ maxWidth: 1200, margin: "18px auto", padding: 16 }}>
        <div
          style={{
            border: `1px solid ${
              isWrongModeMsg
                ? "rgba(255,0,0,0.25)"
                : isQrDisabledMsg
                ? "rgba(255,122,0,0.28)"
                : "rgba(255,0,0,0.25)"
            }`,
            background: isWrongModeMsg ? "#ffe5e5" : isQrDisabledMsg ? "#fff3cd" : "#ffe5e5",
            borderRadius: 16,
            padding: 14,
          }}
        >
          <div style={{ display: "flex", justifyContent: "space-between", gap: 10, flexWrap: "wrap" }}>
            <div>
              <div style={{ fontWeight: 950, color: isQrDisabledMsg ? "#8a6d3b" : "#a10000" }}>
                {isWrongModeMsg ? "QR inválido" : isQrDisabledMsg ? "Menú no disponible" : "No se pudo cargar el menú"}
              </div>
              <div style={{ marginTop: 6, fontSize: 13, whiteSpace: "pre-line" }}>{errorMsg}</div>
              <div style={{ marginTop: 8, fontSize: 12, opacity: 0.8 }}>
                Token: <strong>{token}</strong>
              </div>
            </div>

            {!isQrDisabledMsg && !isWrongModeMsg ? (
              <PillButton onClick={() => load()} title="Volver a intentar">
                Reintentar
              </PillButton>
            ) : null}
          </div>
        </div>
      </div>
    );
  }

  if (!data || !activeMenuPayload) {
    return (
      <div style={{ maxWidth: 1200, margin: "18px auto", padding: 16 }}>
        <div
          style={{
            border: "1px solid rgba(0,0,0,0.12)",
            background: "#fff",
            borderRadius: 16,
            padding: 14,
          }}
        >
          <div style={{ fontWeight: 950 }}>Sin data</div>
          <div style={{ fontSize: 13, opacity: 0.8, marginTop: 6 }}>
            Esto no debería pasar… pero aquí estamos.
          </div>
        </div>
      </div>
    );
  }

  const uiFlags = ui || {};
  const showCallBtn = !!uiFlags?.show_call_waiter_button && hasTable;

  return (
    <div
      style={{
        maxWidth: 1200,
        margin: "18px auto",
        padding: 16,
        background: "linear-gradient(180deg, rgba(238,242,255,0.55), rgba(255,255,255,0))",
      }}
    >
      <div
        style={{
          border: "1px solid rgba(0,0,0,0.12)",
          borderRadius: 18,
          background: "#fff",
          padding: 14,
          boxShadow: "0 10px 30px rgba(0,0,0,0.06)",
        }}
      >
        <div style={{ display: "flex", justifyContent: "space-between", gap: 12, flexWrap: "wrap" }}>
          <div style={{ display: "grid", gap: 4 }}>
            <div style={{ fontSize: 18, fontWeight: 950 }}>{header?.restaurantName}</div>
            <div style={{ fontSize: 13, opacity: 0.85 }}>
              <strong>{header?.branchName}</strong> · {header?.channelName}
              {header?.tableName ? ` · Mesa ${header.tableName}` : " · General"}
            </div>

            {/* ✅ WEB selector (aquí estaba tu bug: ahora sí muestra canales) */}
            {isWeb ? (
              <div style={{ marginTop: 10, display: "grid", gap: 6, maxWidth: 420 }}>
                <div style={{ fontSize: 12, fontWeight: 900, opacity: 0.85 }}>Canal a visualizar</div>
                <select
                  value={activeWebChannelId}
                  onChange={(e) => setWebChannelId(e.target.value)}
                  style={{
                    width: "100%",
                    padding: "10px 12px",
                    borderRadius: 12,
                    border: "1px solid rgba(0,0,0,0.12)",
                    outline: "none",
                    fontWeight: 850,
                    background: "#fff",
                  }}
                >
                  {(webChannels || []).map((ch) => (
                    <option key={ch.id} value={String(ch.id)}>
                      {ch.name}
                    </option>
                  ))}
                </select>
              </div>
            ) : null}

            <div style={{ marginTop: 6, display: "flex", gap: 8, flexWrap: "wrap" }}>
              <Badge tone={header?.restaurantStatus === "active" ? "ok" : "warn"}>
                Restaurante: {translateStatus(header?.restaurantStatus)}
              </Badge>
              <Badge tone={header?.branchStatus === "active" ? "ok" : "warn"}>
                Sucursal: {translateStatus(header?.branchStatus)}
              </Badge>
              <Badge tone={badgeUi.tone} title={uiFlags?.reason || ""}>
                {badgeUi.label}
              </Badge>
              <Badge tone="dark" title="Se actualiza cada 15s si la pestaña está visible">
                🔁 Auto
              </Badge>
            </div>

            {(header?.orderingMode || header?.tableServiceMode) && (
              <div style={{ marginTop: 6, fontSize: 12, opacity: 0.85 }}>
                {header?.orderingMode ? (
                  <>
                    Modo de pedido: <strong>{translateOrderingMode(header.orderingMode)}</strong>
                  </>
                ) : null}
                {header?.orderingMode && header?.tableServiceMode ? " · " : null}
                {header?.tableServiceMode ? (
                  <>
                    Servicio de mesa: <strong>{translateTableServiceMode(header.tableServiceMode)}</strong>
                  </>
                ) : null}
              </div>
            )}

            {canSelect && hasTable ? (
              <div style={{ marginTop: 10, display: "grid", gap: 6 }}>
                <div style={{ fontSize: 12, fontWeight: 900, opacity: 0.85 }}>Nombre (solo UI por ahora)</div>
                <input
                  value={guestName}
                  onChange={(e) => setGuestName(e.target.value)}
                  placeholder="Ej: Juan, Mesa 5"
                  style={{
                    padding: "10px 12px",
                    borderRadius: 12,
                    border: "1px solid rgba(0,0,0,0.12)",
                    outline: "none",
                    fontWeight: 800,
                    maxWidth: 420,
                  }}
                />
              </div>
            ) : null}
          </div>

          <div style={{ display: "flex", gap: 10, alignItems: "start", flexWrap: "wrap" }}>
            {showCallBtn ? (
              <PillButton tone="soft" onClick={onCallWaiter} disabled={calling} title="Enviar una solicitud al mesero">
                {calling ? "⏳ Llamando..." : "🔔 Llamar al mesero"}
              </PillButton>
            ) : null}

            <PillButton onClick={() => load()} title="Recargar menú">
              🔄 Recargar
            </PillButton>

            <PillButton
              tone="soft"
              onClick={() => {
                try {
                  navigator.clipboard.writeText(window.location.href);
                } catch {}
              }}
              title="Copiar URL del menú"
            >
              📋 Copiar URL
            </PillButton>
          </div>
        </div>

        {callToast ? (
          <div
            style={{
              marginTop: 12,
              border: "1px solid rgba(0,0,0,0.10)",
              background: "#fff",
              borderRadius: 14,
              padding: 10,
              fontSize: 13,
              fontWeight: 850,
            }}
          >
            {callToast}
          </div>
        ) : null}

        <div style={{ marginTop: 14 }}>
          <div style={{ display: "flex", gap: 10, overflowX: "auto", paddingBottom: 6, WebkitOverflowScrolling: "touch" }}>
            {categoryOptions.map((c) => (
              <CategoryChip key={c.value} label={c.label} active={categoryFilter === c.value} onClick={() => setCategoryFilter(c.value)} />
            ))}
          </div>

          <div style={{ marginTop: 10 }}>
            <SearchBar value={q} onChange={setQ} />
          </div>

          <div style={{ marginTop: 10, display: "flex", gap: 10, flexWrap: "wrap", alignItems: "center" }}>
            <Badge tone="default">
              Mostrando: <strong style={{ marginLeft: 6 }}>{filteredProducts.length}</strong>
            </Badge>

            {canSelect ? (
              <Badge tone="ok" title="Selección solo visual por ahora">
                Seleccionados: <strong style={{ marginLeft: 6 }}>{selected.size}</strong>
              </Badge>
            ) : null}

            {(categoryFilter !== "all" || q) && (
              <PillButton
                onClick={() => {
                  setCategoryFilter("all");
                  setQ("");
                }}
                title="Limpiar filtros"
              >
                🧹 Limpiar
              </PillButton>
            )}
          </div>
        </div>
      </div>

      {/* warnings por canal (en web, depende del canal) */}
      {activeMenuPayload?.warning ? (
        <div
          style={{
            marginTop: 12,
            border: "1px solid #ffe08a",
            background: "#fff3cd",
            borderRadius: 16,
            padding: 12,
            color: "#8a6d3b",
            fontWeight: 800,
            whiteSpace: "pre-line",
          }}
        >
          {activeMenuPayload.warning}
        </div>
      ) : null}

      <div style={{ marginTop: 14 }}>
        <style>
          {`
            .menuGrid {
              display: grid;
              gap: 12px;
              grid-template-columns: repeat(1, minmax(0, 1fr));
            }
            @media (min-width: 640px) { .menuGrid { grid-template-columns: repeat(2, minmax(0, 1fr)); } }
            @media (min-width: 900px) { .menuGrid { grid-template-columns: repeat(3, minmax(0, 1fr)); } }
            @media (min-width: 1200px) { .menuGrid { grid-template-columns: repeat(4, minmax(0, 1fr)); } }
          `}
        </style>

        <div className="menuGrid">
          {filteredProducts.length > 0 ? (
            filteredProducts.map((p) => {
              const title = p.display_name || p.name;
              const variants = Array.isArray(p.variants) ? p.variants : [];
              const hasVariants = variants.length > 0;

              const categoryName = p.__categoryName || categoryNameById.get(Number(p.category_id)) || "Sin categoría";

              const isOpen = expanded.has(p.id);
              const isSelected = selected.has(`p:${p.id}`);

              return (
                <div
                  key={p.id}
                  style={{
                    border: "1px solid rgba(0,0,0,0.10)",
                    borderRadius: 18,
                    background: "#fff",
                    overflow: "hidden",
                    boxShadow: "0 10px 26px rgba(0,0,0,0.05)",
                    display: "grid",
                  }}
                >
                  <div style={{ padding: 10 }}>
                    <ProductThumb imageUrl={p.image_url || null} title={title} />
                  </div>

                  <div style={{ padding: "0 12px 12px 12px", display: "grid", gap: 8 }}>
                    <div style={{ display: "flex", justifyContent: "space-between", gap: 10, alignItems: "start" }}>
                      <div style={{ fontWeight: 950, fontSize: 14, lineHeight: 1.15 }}>{title}</div>
                      <div style={{ fontWeight: 950, fontSize: 14, whiteSpace: "nowrap" }}>{money(p.price)}</div>
                    </div>

                    <div style={{ fontSize: 12, opacity: 0.72 }}>
                      Categoría: <strong>{categoryName}</strong>
                    </div>

                    {showSelectBtn ? (
                      <PillButton
                        tone={isSelected ? "dark" : "default"}
                        onClick={() => toggleSelectProduct(`p:${p.id}`)}
                        title="Solo visual por ahora"
                      >
                        {isSelected ? "✅ Seleccionado" : "➕ Seleccionar"}
                      </PillButton>
                    ) : null}

                    {hasVariants ? (
                      <div style={{ marginTop: 2 }}>
                        <button
                          onClick={() => toggleVariants(p.id)}
                          style={{
                            cursor: "pointer",
                            width: "100%",
                            borderRadius: 14,
                            border: "1px solid rgba(0,0,0,0.12)",
                            background: "#fafafa",
                            padding: "10px 12px",
                            fontWeight: 950,
                            display: "flex",
                            alignItems: "center",
                            justifyContent: "space-between",
                            gap: 10,
                          }}
                          title="Ver variantes"
                        >
                          <span>Variantes ({variants.length})</span>
                          <span style={{ opacity: 0.75 }}>{isOpen ? "▲" : "▼"}</span>
                        </button>

                        <Collapse open={isOpen}>
                          <div style={{ display: "grid", gap: 8 }}>
                            {variants.map((v, idx) => {
                              const vid = v.id || idx;
                              const vSel = selected.has(`v:${p.id}:${vid}`);
                              return (
                                <div
                                  key={vid}
                                  style={{
                                    display: "grid",
                                    gap: 8,
                                    padding: "10px 12px",
                                    borderRadius: 14,
                                    border: "1px solid rgba(0,0,0,0.10)",
                                    background: "#fff",
                                  }}
                                >
                                  <div style={{ display: "flex", justifyContent: "space-between", gap: 10 }}>
                                    <div style={{ fontWeight: 850, fontSize: 13, minWidth: 0 }}>
                                      {v.name || v.display_name || `Variante ${idx + 1}`}
                                    </div>
                                    <div style={{ fontWeight: 950, fontSize: 13, whiteSpace: "nowrap" }}>{money(v.price)}</div>
                                  </div>

                                  {showSelectBtn ? (
                                    <PillButton
                                      tone={vSel ? "dark" : "default"}
                                      onClick={() => toggleSelectProduct(`v:${p.id}:${vid}`)}
                                      title="Solo visual por ahora"
                                    >
                                      {vSel ? "✅ Seleccionado" : "➕ Seleccionar"}
                                    </PillButton>
                                  ) : null}
                                </div>
                              );
                            })}
                          </div>
                        </Collapse>
                      </div>
                    ) : (
                      <div style={{ display: "flex", gap: 8, flexWrap: "wrap" }}>
                        <Badge tone="default">Sin variantes</Badge>
                      </div>
                    )}
                  </div>
                </div>
              );
            })
          ) : (
            <div
              style={{
                gridColumn: "1 / -1",
                border: "1px solid rgba(0,0,0,0.12)",
                borderRadius: 18,
                background: "#fff",
                padding: 14,
                boxShadow: "0 10px 30px rgba(0,0,0,0.05)",
              }}
            >
              <div style={{ fontWeight: 950 }}>Sin resultados</div>
              <div style={{ marginTop: 6, fontSize: 13, opacity: 0.8 }}>Con esos filtros no hay nada que mostrar.</div>
            </div>
          )}
        </div>
      </div>

      <div style={{ marginTop: 14, fontSize: 11, opacity: 0.65 }}>
        Token: <strong>{token}</strong>
      </div>
    </div>
  );
}
