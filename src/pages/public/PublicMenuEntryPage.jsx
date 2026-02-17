// src/pages/public/PublicMenuEntryPage.jsx
import React, { useEffect, useMemo, useState } from "react";
import { useParams } from "react-router-dom";
import { fetchResolvedMenu } from "../../services/menu/publicMenu.service";

// Helpers UI
function money(n) {
  const num = Number(n || 0);
  try {
    return num.toLocaleString("es-MX", { style: "currency", currency: "MXN" });
  } catch {
    return `$${num.toFixed(2)}`;
  }
}

function Badge({ children, tone = "default" }) {
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
    <div
      style={{
        height: 12,
        width: w,
        borderRadius: 8,
        background: "rgba(0,0,0,0.08)",
      }}
    />
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
      {row("35%")}
      {row("70%")}
      {row("55%")}
      <div style={{ height: 1, background: "rgba(0,0,0,0.08)", margin: "8px 0" }} />
      {row("80%")}
      {row("60%")}
      {row("72%")}
    </div>
  );
}

// UI bits
function Select({ value, onChange, options, label }) {
  return (
    <label style={{ display: "grid", gap: 6, minWidth: 220 }}>
      <span style={{ fontSize: 12, fontWeight: 900, opacity: 0.8 }}>{label}</span>
      <select
        value={value}
        onChange={(e) => onChange(e.target.value)}
        style={{
          height: 40,
          borderRadius: 12,
          border: "1px solid rgba(0,0,0,0.14)",
          padding: "0 10px",
          background: "#fff",
          fontWeight: 800,
          outline: "none",
        }}
      >
        {options.map((o) => (
          <option key={o.value} value={o.value}>
            {o.label}
          </option>
        ))}
      </select>
    </label>
  );
}

function TextInput({ value, onChange, placeholder, label }) {
  return (
    <label style={{ display: "grid", gap: 6, minWidth: 240, flex: "1 1 240px" }}>
      <span style={{ fontSize: 12, fontWeight: 900, opacity: 0.8 }}>{label}</span>
      <input
        value={value}
        onChange={(e) => onChange(e.target.value)}
        placeholder={placeholder}
        style={{
          height: 40,
          borderRadius: 12,
          border: "1px solid rgba(0,0,0,0.14)",
          padding: "0 12px",
          background: "#fff",
          fontWeight: 700,
          outline: "none",
        }}
      />
    </label>
  );
}

function PillButton({ onClick, children, tone = "default", title }) {
  const map = {
    default: { bg: "#fff", bd: "rgba(0,0,0,0.12)" },
    soft: { bg: "#eef2ff", bd: "#cfcfff" },
  };
  const c = map[tone] || map.default;

  return (
    <button
      onClick={onClick}
      title={title}
      style={{
        cursor: "pointer",
        borderRadius: 12,
        border: `1px solid ${c.bd}`,
        background: c.bg,
        padding: "10px 12px",
        fontWeight: 950,
        height: 40,
      }}
    >
      {children}
    </button>
  );
}

export default function PublicMenuEntryPage() {
  const { token } = useParams();

  const [loading, setLoading] = useState(true);
  const [errorMsg, setErrorMsg] = useState("");
  const [data, setData] = useState(null);

  // Filtros UI
  const [categoryFilter, setCategoryFilter] = useState("all"); // "all" o categoryId string
  const [q, setQ] = useState("");

  const load = async () => {
    setLoading(true);
    setErrorMsg("");
    try {
      const payload = await fetchResolvedMenu(token);
      setData(payload);
    } catch (e) {
      const msg =
        e?.response?.data?.message ||
        e?.response?.data?.error ||
        e?.message ||
        "No se pudo cargar el menú.";
      setErrorMsg(msg);
      setData(null);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    load();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [token]);

  const header = useMemo(() => {
    if (!data) return null;
    const r = data.restaurant;
    const b = data.branch;
    const sc = data.sales_channel;
    const t = data.table;

    return {
      restaurantName: r?.trade_name || "Restaurante",
      restaurantStatus: r?.status,
      branchName: b?.name || "Sucursal",
      branchStatus: b?.status,
      channelName: sc?.name || "Canal",
      tableName: t?.name || null,
      productsMode: data.products_mode || "global",
      orderingMode: data.ordering_mode || null,
      tableServiceMode: data.table_service_mode || null,
    };
  }, [data]);

  const counts = useMemo(() => {
    if (!data?.sections?.length) return { sections: 0, categories: 0, products: 0 };
    let categories = 0;
    let products = 0;
    for (const s of data.sections) {
      const cats = s?.categories || [];
      categories += cats.length;
      for (const c of cats) products += (c?.products || []).length;
    }
    return { sections: data.sections.length, categories, products };
  }, [data]);

  // Catálogo global de categorías (para selector "Todas, categoría 1, ...")
  const categoryOptions = useMemo(() => {
    const opts = [{ value: "all", label: "Todas" }];
    if (!data?.sections?.length) return opts;

    const seen = new Set();
    for (const s of data.sections) {
      for (const c of s?.categories || []) {
        if (!c?.id || seen.has(c.id)) continue;
        seen.add(c.id);
        opts.push({ value: String(c.id), label: c.name || `Categoría ${c.id}` });
      }
    }
    return opts;
  }, [data]);

  // Filtrado: por categoría + búsqueda (nombre producto/variante)
  const filteredSections = useMemo(() => {
    if (!data?.sections?.length) return [];

    const needle = (q || "").trim().toLowerCase();
    const catId = categoryFilter === "all" ? null : Number(categoryFilter);

    const matchText = (txt) => {
      if (!needle) return true;
      return String(txt || "").toLowerCase().includes(needle);
    };

    return data.sections
      .map((section) => {
        const categories = (section.categories || [])
          .map((cat) => {
            if (catId && Number(cat.id) !== catId) return null;

            const products = (cat.products || [])
              .map((p) => {
                const productName = p.display_name || p.name;

                // Si no hay búsqueda, entra directo.
                if (!needle) return p;

                // Coincide por producto
                if (matchText(productName)) return p;

                // O por variantes
                const vars = Array.isArray(p.variants) ? p.variants : [];
                const anyVar = vars.some((v) => matchText(v?.name || v?.display_name));
                return anyVar ? p : null;
              })
              .filter(Boolean);

            // Mantener la categoría si:
            // - tiene productos (post filtro)
            // - o si no hay filtro de búsqueda y quieres ver vacío (aquí NO, para que se vea limpio)
            if (products.length === 0) return null;

            return { ...cat, products };
          })
          .filter(Boolean);

        if (categories.length === 0) return null;
        return { ...section, categories };
      })
      .filter(Boolean);
  }, [data, categoryFilter, q]);

  // Resumen post-filtro
  const filteredCounts = useMemo(() => {
    let cats = 0;
    let prods = 0;
    for (const s of filteredSections) {
      cats += (s.categories || []).length;
      for (const c of s.categories || []) prods += (c.products || []).length;
    }
    return { cats, prods };
  }, [filteredSections]);

  if (loading) {
    return (
      <div style={{ maxWidth: 1100, margin: "18px auto", padding: 16 }}>
        <div style={{ display: "flex", justifyContent: "space-between", gap: 12, flexWrap: "wrap" }}>
          <div>
            <div style={{ fontSize: 18, fontWeight: 950 }}>Cargando menú…</div>
            <div style={{ fontSize: 12, opacity: 0.75, marginTop: 6 }}>
              Token: <strong style={{ letterSpacing: 0.5 }}>{token}</strong>
            </div>
          </div>
          <Badge tone="default">Solo lectura</Badge>
        </div>

        <div style={{ marginTop: 14, display: "grid", gap: 12 }}>
          <SkeletonCard />
          <SkeletonCard />
          <SkeletonCard />
        </div>
      </div>
    );
  }

  if (errorMsg) {
    return (
      <div style={{ maxWidth: 1100, margin: "18px auto", padding: 16 }}>
        <div
          style={{
            border: "1px solid rgba(255,0,0,0.25)",
            background: "#ffe5e5",
            borderRadius: 16,
            padding: 14,
          }}
        >
          <div style={{ display: "flex", justifyContent: "space-between", gap: 10, flexWrap: "wrap" }}>
            <div>
              <div style={{ fontWeight: 950, color: "#a10000" }}>No se pudo cargar el menú</div>
              <div style={{ marginTop: 6, fontSize: 13, whiteSpace: "pre-line" }}>{errorMsg}</div>
              <div style={{ marginTop: 8, fontSize: 12, opacity: 0.8 }}>
                Token: <strong>{token}</strong>
              </div>
            </div>

            <PillButton onClick={load} title="Volver a intentar">
              Reintentar
            </PillButton>
          </div>
        </div>
      </div>
    );
  }

  if (!data) {
    return (
      <div style={{ maxWidth: 1100, margin: "18px auto", padding: 16 }}>
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

  return (
    <div style={{ maxWidth: 1100, margin: "18px auto", padding: 16 }}>
      {/* Header */}
      <div
        style={{
          border: "1px solid rgba(0,0,0,0.12)",
          borderRadius: 18,
          background: "#fff",
          padding: 14,
        }}
      >
        <div style={{ display: "flex", justifyContent: "space-between", gap: 12, flexWrap: "wrap" }}>
          <div style={{ display: "grid", gap: 4 }}>
            <div style={{ fontSize: 18, fontWeight: 950 }}>{header?.restaurantName}</div>
            <div style={{ fontSize: 13, opacity: 0.85 }}>
              <strong>{header?.branchName}</strong> · {header?.channelName}
              {header?.tableName ? ` · Mesa ${header.tableName}` : ""}
            </div>

            <div style={{ marginTop: 6, display: "flex", gap: 8, flexWrap: "wrap" }}>
              <Badge tone={header?.restaurantStatus === "active" ? "ok" : "warn"}>
                Restaurante: {header?.restaurantStatus || "—"}
              </Badge>
              <Badge tone={header?.branchStatus === "active" ? "ok" : "warn"}>
                Sucursal: {header?.branchStatus || "—"}
              </Badge>
              <Badge tone="default">Modo productos: {header?.productsMode}</Badge>
              <Badge tone="default">Secciones: {counts.sections}</Badge>
              <Badge tone="default">Categorías: {counts.categories}</Badge>
              <Badge tone="default">Productos: {counts.products}</Badge>
              <Badge tone="dark">Solo lectura</Badge>
            </div>

            {(header?.orderingMode || header?.tableServiceMode) && (
              <div style={{ marginTop: 8, fontSize: 12, opacity: 0.85 }}>
                {header?.orderingMode ? (
                  <>
                    Modo pedido: <strong>{header.orderingMode}</strong>
                  </>
                ) : null}
                {header?.orderingMode && header?.tableServiceMode ? " · " : null}
                {header?.tableServiceMode ? (
                  <>
                    Servicio de mesa: <strong>{header.tableServiceMode}</strong>
                  </>
                ) : null}
              </div>
            )}
          </div>

          <div style={{ display: "flex", gap: 10, alignItems: "start", flexWrap: "wrap" }}>
            <PillButton onClick={load} title="Recargar menú">
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

        {/* Filtros */}
        <div
          style={{
            marginTop: 14,
            paddingTop: 12,
            borderTop: "1px solid rgba(0,0,0,0.08)",
            display: "flex",
            gap: 12,
            flexWrap: "wrap",
            alignItems: "end",
          }}
        >
          <Select
            label="Filtrar por categoría"
            value={categoryFilter}
            onChange={(v) => setCategoryFilter(v)}
            options={categoryOptions}
          />

          <TextInput
            label="Buscar"
            value={q}
            onChange={(v) => setQ(v)}
            placeholder="Ej. barbacoa, coca, harina…"
          />

          <div style={{ display: "flex", gap: 8, flexWrap: "wrap", alignItems: "center" }}>
            <Badge tone="default">Resultado: {filteredCounts.cats} cat · {filteredCounts.prods} prod</Badge>
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

      {/* Warning del backend (si llega) */}
      {data.warning ? (
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
          {data.warning}
        </div>
      ) : null}

      {/* Sections */}
      <div style={{ marginTop: 14, display: "grid", gap: 12 }}>
        {Array.isArray(filteredSections) && filteredSections.length > 0 ? (
          filteredSections.map((section) => (
            <div
              key={section.id}
              style={{
                border: "1px solid rgba(0,0,0,0.12)",
                borderRadius: 18,
                background: "#fff",
                overflow: "hidden",
              }}
            >
              <div
                style={{
                  padding: 14,
                  borderBottom: "1px solid rgba(0,0,0,0.08)",
                  display: "flex",
                  justifyContent: "space-between",
                  alignItems: "center",
                  gap: 10,
                }}
              >
                <div style={{ fontWeight: 950, fontSize: 16 }}>{section.name}</div>
                <Badge tone="default">{(section.categories || []).length} categorías</Badge>
              </div>

              <div style={{ padding: 14, display: "grid", gap: 12 }}>
                {(section.categories || []).map((cat) => (
                  <div
                    key={cat.id}
                    style={{
                      border: "1px solid rgba(0,0,0,0.10)",
                      borderRadius: 16,
                      padding: 12,
                      background: "#fafafa",
                    }}
                  >
                    <div style={{ display: "flex", justifyContent: "space-between", gap: 10, flexWrap: "wrap" }}>
                      <div style={{ display: "flex", gap: 10, alignItems: "center", flexWrap: "wrap" }}>
                        <div style={{ fontWeight: 950, fontSize: 15 }}>{cat.name}</div>
                        <Badge tone="default">#{cat.id}</Badge>
                      </div>

                      <Badge tone="default">{(cat.products || []).length} productos</Badge>
                    </div>

                    <div style={{ marginTop: 10, display: "grid", gap: 10 }}>
                      {(cat.products || []).map((p) => {
                        const title = p.display_name || p.name;
                        const variants = Array.isArray(p.variants) ? p.variants : [];
                        const hasVariants = variants.length > 0;

                        return (
                          <div
                            key={p.id}
                            style={{
                              border: "1px solid rgba(0,0,0,0.10)",
                              borderRadius: 14,
                              padding: 12,
                              background: "#fff",
                              display: "grid",
                              gap: 8,
                            }}
                          >
                            <div style={{ display: "flex", justifyContent: "space-between", gap: 10, flexWrap: "wrap" }}>
                              <div style={{ fontWeight: 950, fontSize: 15 }}>{title}</div>
                              <div style={{ fontWeight: 950 }}>{money(p.price)}</div>
                            </div>

                            <div style={{ fontSize: 12, opacity: 0.75 }}>
                              #{p.id} · categoría #{p.category_id}
                            </div>

                            <div style={{ display: "flex", gap: 8, flexWrap: "wrap" }}>
                              {hasVariants ? (
                                <Badge tone="warn">Variantes: {variants.length}</Badge>
                              ) : (
                                <Badge tone="default">Sin variantes</Badge>
                              )}
                            </div>

                            {/* Variantes (con precio) */}
                            {hasVariants ? (
                              <div
                                style={{
                                  marginTop: 4,
                                  borderTop: "1px dashed rgba(0,0,0,0.15)",
                                  paddingTop: 10,
                                  display: "grid",
                                  gap: 8,
                                }}
                              >
                                <div style={{ fontWeight: 900, fontSize: 13 }}>Variantes</div>

                                <div style={{ display: "grid", gap: 8 }}>
                                  {variants.map((v, idx) => (
                                    <div
                                      key={v.id || idx}
                                      style={{
                                        display: "flex",
                                        justifyContent: "space-between",
                                        gap: 10,
                                        alignItems: "center",
                                        padding: "8px 10px",
                                        borderRadius: 12,
                                        border: "1px solid rgba(0,0,0,0.10)",
                                        background: "#fafafa",
                                      }}
                                    >
                                      <div style={{ fontWeight: 800, fontSize: 13 }}>
                                        {v.name || v.display_name || `Variante ${idx + 1}`}
                                      </div>
                                      <div style={{ fontWeight: 950, fontSize: 13 }}>
                                        {money(v.price)}
                                      </div>
                                    </div>
                                  ))}
                                </div>

                                <div style={{ fontSize: 11, opacity: 0.65 }}>
                                  Nota: estos precios vienen del canal/sucursal, no de magia.
                                </div>
                              </div>
                            ) : null}
                          </div>
                        );
                      })}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          ))
        ) : (
          <div
            style={{
              border: "1px solid rgba(0,0,0,0.12)",
              borderRadius: 18,
              background: "#fff",
              padding: 14,
            }}
          >
            <div style={{ fontWeight: 950 }}>Sin resultados</div>
            <div style={{ marginTop: 6, fontSize: 13, opacity: 0.8 }}>
              Con esos filtros no hay nada que mostrar. O sí hay, pero alguien deshabilitó precios en el pivote.
            </div>
          </div>
        )}
      </div>

      {/* Footer debug */}
      <div style={{ marginTop: 14, fontSize: 11, opacity: 0.7 }}>
        Token: <strong>{token}</strong>
      </div>
    </div>
  );
}
