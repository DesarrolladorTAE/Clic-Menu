import React, { useEffect, useMemo, useRef, useState } from "react";
import {
  Box, Button, Card, Chip, Dialog, DialogActions, DialogContent, DialogTitle,
  Drawer, Fab, IconButton, Stack, TextField, Tooltip, Typography,
} from "@mui/material";
import CloseRoundedIcon from "@mui/icons-material/CloseRounded";
import RestaurantMenuRoundedIcon from "@mui/icons-material/RestaurantMenuRounded";

import PaginationFooter from "../../common/PaginationFooter";
import usePagination from "../../../hooks/usePagination";

const PAGE_SIZE = 5;

const CATEGORY_CONFIG = [
  {
    key: "awaiting_finish",
    label: "Por terminar",
    title: "Productos por terminar",
    emptyText: "Aún no hay productos por terminar.",
    statusText: "La cancelación ocurrió durante la preparación.",
    color: "warning",
  },
  {
    key: "awaiting_return",
    label: "Por regresar",
    title: "Productos por regresar",
    emptyText: "Aún no hay productos pendientes de regresar.",
    statusText: "El producto salió de Cocina y debe regresar.",
    color: "info",
  },
  {
    key: "waiting_prepared",
    label: "Disponibles",
    title: "Preparados disponibles",
    emptyText: "Aún no hay productos disponibles para reutilizar.",
    statusText: "Disponible para reutilización.",
    color: "success",
  },
  {
    key: "expired_to_remove",
    label: "Vencidos",
    title: "Productos vencidos",
    emptyText: "Aún no hay productos vencidos por retirar.",
    statusText: "Producto vencido pendiente de retiro físico.",
    color: "error",
  },
];

const INITIAL_CATEGORY_PRIORITY = [
  "awaiting_finish",
  "awaiting_return",
  "expired_to_remove",
  "waiting_prepared",
];

function safeItems(value) {
  return Array.isArray(value) ? value : [];
}

function resolveInitialCategory(recovery = {}) {
  const found = INITIAL_CATEGORY_PRIORITY.find((key) => safeItems(recovery?.[key]).length > 0);
  return found || "awaiting_finish";
}

function formatPreparedTime(value) {
  if (!value) return null;

  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return null;

  return date.toLocaleTimeString("es-MX", {
    hour: "2-digit",
    minute: "2-digit",
  });
}

function modifierNames(modifiers) {
  return safeItems(modifiers)
    .map((modifier) => {
      const name = String(
        modifier?.name ||
        modifier?.name_snapshot ||
        modifier?.modifier_option_name ||
        ""
      ).trim();

      if (!name) return null;

      const quantity = Math.max(1, Number(modifier?.quantity || 1));
      return quantity > 1 ? `${quantity} × ${name}` : name;
    })
    .filter(Boolean);
}

function componentLines(components, depth = 0) {
  const rows = [];

  safeItems(components).forEach((component, index) => {
    const productId = Number(component?.component_product_id || 0);
    const name = String(component?.component_product_name || "").trim() || `Producto #${productId || "—"}`;
    const quantity = Math.max(1, Number(component?.quantity || 1));
    const variant = String(component?.variant_name || "").trim();
    const modifiers = modifierNames(component?.modifiers);

    let text = `${quantity} × ${name}`;
    if (variant) text += ` · ${variant}`;
    if (modifiers.length > 0) text += ` · ${modifiers.join(", ")}`;

    rows.push({
      key: `${depth}-${productId}-${index}`,
      depth,
      text,
    });

    rows.push(...componentLines(component?.components, depth + 1));
  });

  return rows;
}

function PreparedConfiguration({ item }) {
  const modifiers = useMemo(() => modifierNames(item?.modifiers), [item?.modifiers]);
  const components = useMemo(() => componentLines(item?.components), [item?.components]);
  const variantName = String(item?.variant_name || "").trim();

  if (!variantName && modifiers.length === 0 && components.length === 0) return null;

  return (
    <Box
      sx={{
        p: 1.25,
        borderRadius: 1.5,
        bgcolor: "action.hover",
        border: "1px solid",
        borderColor: "divider",
      }}
    >
      <Stack spacing={0.5}>
        {variantName ? (
          <Typography sx={{ fontSize: 12, color: "text.secondary", lineHeight: 1.45 }}>
            <strong>Variante:</strong> {variantName}
          </Typography>
        ) : null}

        {modifiers.length > 0 ? (
          <Typography sx={{ fontSize: 12, color: "text.secondary", lineHeight: 1.45 }}>
            <strong>Configuración:</strong> {modifiers.join(", ")}
          </Typography>
        ) : null}

        {components.map((component) => (
          <Typography
            key={component.key}
            sx={{
              pl: component.depth * 1.5,
              fontSize: 12,
              color: "text.secondary",
              lineHeight: 1.45,
            }}
          >
            {component.depth > 0 ? "↳ " : ""}
            {component.text}
          </Typography>
        ))}
      </Stack>
    </Box>
  );
}

function PreparedItemCard({
  item,
  category,
  busyAction,
  onFinish,
  onConfirmReturn,
  onRequestMarkUnfit,
  onRetireExpired,
}) {
  const config = CATEGORY_CONFIG.find((row) => row.key === category) || CATEGORY_CONFIG[0];
  const itemBusy = Boolean(busyAction);
  const productName = String(item?.product_name || "").trim() || `Producto #${item?.product_id ?? "—"}`;
  const preparedAt = formatPreparedTime(item?.prepared_at);
  const expiresAt = formatPreparedTime(item?.expires_at);

  return (
    <Card
      sx={{
        p: 1.5,
        border: "1px solid",
        borderColor: "divider",
        borderRadius: 2,
        boxShadow: "none",
      }}
    >
      <Stack spacing={1.25}>
        <Stack direction="row" justifyContent="space-between" alignItems="flex-start" spacing={1}>
          <Box sx={{ minWidth: 0 }}>
            <Typography sx={{ fontSize: 16, fontWeight: 800, color: "text.primary", lineHeight: 1.3 }}>
              {productName}
            </Typography>

            {item?.source_order_id ? (
              <Typography sx={{ mt: 0.35, fontSize: 12, color: "text.secondary" }}>
                Orden origen #{item.source_order_id}
              </Typography>
            ) : null}

            <Typography sx={{ fontSize: 12, color: "text.secondary" }}>
              Producto preparado #{item?.id ?? "—"}
            </Typography>
          </Box>

          <Chip
            label={config.label}
            size="small"
            color={config.color}
            variant="outlined"
            sx={{ flexShrink: 0, fontWeight: 800 }}
          />
        </Stack>

        <PreparedConfiguration item={item} />

        {category === "waiting_prepared" ? (
          <Stack spacing={0.25}>
            {preparedAt ? (
              <Typography sx={{ fontSize: 12, color: "text.secondary" }}>
                Preparado: <strong>{preparedAt}</strong>
              </Typography>
            ) : null}

            {expiresAt ? (
              <Typography sx={{ fontSize: 12, color: "text.secondary" }}>
                Vence: <strong>{expiresAt}</strong>
              </Typography>
            ) : null}
          </Stack>
        ) : null}

        {category === "expired_to_remove" && expiresAt ? (
          <Typography sx={{ fontSize: 12, color: "text.secondary" }}>
            Venció: <strong>{expiresAt}</strong>
          </Typography>
        ) : null}

        {category === "awaiting_return" && expiresAt ? (
          <Typography sx={{ fontSize: 12, color: "text.secondary" }}>
            Límite de reutilización: <strong>{expiresAt}</strong>
          </Typography>
        ) : null}

        <Typography sx={{ fontSize: 13, color: "text.primary", lineHeight: 1.5 }}>
          {config.statusText}
        </Typography>

        {category === "awaiting_finish" ? (
          <Stack direction={{ xs: "column", sm: "row" }} spacing={1}>
            <Button
              fullWidth
              variant="contained"
              color="primary"
              disabled={itemBusy}
              onClick={() => onFinish?.(item)}
            >
              {busyAction === "finish" ? "Terminando…" : "Terminar preparación"}
            </Button>

            <Button
              fullWidth
              variant="outlined"
              color="error"
              disabled={itemBusy}
              onClick={() => onRequestMarkUnfit?.(item)}
            >
              Marcar no apto
            </Button>
          </Stack>
        ) : null}

        {category === "awaiting_return" ? (
          <Stack direction={{ xs: "column", sm: "row" }} spacing={1}>
            <Button
              fullWidth
              variant="contained"
              color="primary"
              disabled={itemBusy}
              onClick={() => onConfirmReturn?.(item)}
            >
              {busyAction === "confirm-return" ? "Confirmando…" : "Confirmar regreso"}
            </Button>

            <Button
              fullWidth
              variant="outlined"
              color="error"
              disabled={itemBusy}
              onClick={() => onRequestMarkUnfit?.(item)}
            >
              Marcar no apto
            </Button>
          </Stack>
        ) : null}

        {category === "waiting_prepared" ? (
          <Button
            variant="outlined"
            color="error"
            disabled={itemBusy}
            onClick={() => onRequestMarkUnfit?.(item)}
          >
            Marcar no apto
          </Button>
        ) : null}

        {category === "expired_to_remove" ? (
          <Button
            variant="contained"
            color="error"
            disabled={itemBusy}
            onClick={() => onRetireExpired?.(item)}
          >
            {busyAction === "retire-expired" ? "Retirando…" : "Retirar producto"}
          </Button>
        ) : null}
      </Stack>
    </Card>
  );
}

export default function KitchenPreparedItemsDrawer({
  open,
  onOpen,
  onClose,
  count = 0,
  recovery = {},
  busyItemIds = {},
  onFinish,
  onConfirmReturn,
  onMarkUnfit,
  onRetireExpired,
}) {
  const [activeCategory, setActiveCategory] = useState("awaiting_finish");
  const [unfitItem, setUnfitItem] = useState(null);
  const [unfitNote, setUnfitNote] = useState("");
  const wasOpenRef = useRef(false);

  const counts = useMemo(() => ({
    awaiting_finish: safeItems(recovery?.awaiting_finish).length,
    awaiting_return: safeItems(recovery?.awaiting_return).length,
    waiting_prepared: safeItems(recovery?.waiting_prepared).length,
    expired_to_remove: safeItems(recovery?.expired_to_remove).length,
  }), [recovery]);

  useEffect(() => {
    if (open && !wasOpenRef.current) {
      setActiveCategory(resolveInitialCategory(recovery));
    }

    if (!open) {
      setUnfitItem(null);
      setUnfitNote("");
    }

    wasOpenRef.current = open;
  }, [open, recovery]);

  const activeConfig = CATEGORY_CONFIG.find((row) => row.key === activeCategory) || CATEGORY_CONFIG[0];
  const activeItems = safeItems(recovery?.[activeCategory]);

  const {
    page,
    setPage,
    total,
    totalPages,
    startItem,
    endItem,
    hasPrev,
    hasNext,
    nextPage,
    prevPage,
    paginatedItems,
  } = usePagination({
    items: activeItems,
    initialPage: 1,
    pageSize: PAGE_SIZE,
    mode: "frontend",
    resetKey: activeCategory,
  });

  const changeCategory = (category) => {
    if (category === activeCategory) return;
    setPage(1);
    setActiveCategory(category);
  };

  const openUnfitDialog = (item) => {
    setUnfitItem(item);
    setUnfitNote("");
  };

  const unfitBusy = unfitItem
    ? busyItemIds?.[Number(unfitItem.id)] === "mark-unfit"
    : false;

  const closeUnfitDialog = () => {
    if (unfitBusy) return;
    setUnfitItem(null);
    setUnfitNote("");
  };

  const confirmUnfit = async () => {
    if (!unfitItem || !onMarkUnfit) return;

    const result = await onMarkUnfit(unfitItem, unfitNote.trim());
    if (result === false) return;

    setUnfitItem(null);
    setUnfitNote("");
  };

  const normalizedCount = Math.max(0, Number(count || 0));

  return (
    <>
      {!open ? (
        <Tooltip title="Preparación rápida" placement="left">
          <Fab
            variant="extended"
            color="primary"
            onClick={onOpen}
            aria-label={`Preparación rápida, ${normalizedCount} pendientes`}
            sx={{
              position: "fixed",
              right: { xs: 16, sm: 24 },
              bottom: { xs: 20, sm: 28 },
              zIndex: 1400,
              minWidth: 76,
              height: 52,
              px: 2,
              borderRadius: "999px",
              boxShadow: "0 8px 22px rgba(0,0,0,0.18)",
            }}
          >
            <RestaurantMenuRoundedIcon sx={{ mr: 0.8 }} />

            <Typography component="span" sx={{ fontSize: 15, fontWeight: 900, lineHeight: 1 }}>
              {normalizedCount > 99 ? "99+" : normalizedCount}
            </Typography>
          </Fab>
        </Tooltip>
      ) : null}

      <Drawer
        anchor="right"
        open={open}
        onClose={onClose}
        ModalProps={{ keepMounted: true }}
        slotProps={{
          paper: {
            sx: {
              width: { xs: "100%", sm: 450 },
              maxWidth: "100%",
              borderLeft: "1px solid",
              borderColor: "divider",
              bgcolor: "background.paper",
            },
          },
        }}
      >
        <Box sx={{ height: "100%", display: "flex", flexDirection: "column" }}>
          <Box sx={{ px: 2, py: 1.75, bgcolor: "#111111", color: "#fff" }}>
            <Stack direction="row" justifyContent="space-between" alignItems="flex-start" spacing={2}>
                <Box sx={{ minWidth: 0 }}>
                <Typography sx={{ fontSize: 23, fontWeight: 800, lineHeight: 1.15, color: "#fff" }}>
                    Preparación rápida
                </Typography>

                <Typography sx={{ mt: 0.75, fontSize: 13, lineHeight: 1.45, color: "rgba(255,255,255,0.82)" }}>
                    Controla productos recuperados por cancelaciones antes de volver a utilizarlos.
                </Typography>
                </Box>

                <IconButton
                onClick={onClose}
                aria-label="Cerrar preparación rápida"
                sx={{
                    flexShrink: 0,
                    color: "#fff",
                    bgcolor: "rgba(255,255,255,0.08)",
                    borderRadius: 1,
                    "&:hover": { bgcolor: "rgba(255,255,255,0.16)" },
                }}
                >
                <CloseRoundedIcon />
                </IconButton>
            </Stack>
            </Box>

          <Box
            sx={{
              px: 2,
              pt: 2,
              pb: 1.5,
              bgcolor: "background.default",
              borderBottom: "1px solid",
              borderColor: "divider",
            }}
          >
            <Box sx={{ display: "grid", gridTemplateColumns: "repeat(2, minmax(0, 1fr))", gap: 1 }}>
              {CATEGORY_CONFIG.map((category) => {
                const active = category.key === activeCategory;

                return (
                  <Button
                    key={category.key}
                    variant={active ? "contained" : "outlined"}
                    color="primary"
                    onClick={() => changeCategory(category.key)}
                    aria-pressed={active}
                    sx={{
                      minWidth: 0,
                      minHeight: 58,
                      px: 1.25,
                      borderRadius: 2,
                      textTransform: "none",
                      justifyContent: "space-between",
                      gap: 1,
                      fontWeight: 800,
                      ...(active
                        ? {}
                        : {
                            bgcolor: "background.paper",
                            borderColor: "divider",
                            color: "text.primary",
                            "&:hover": { bgcolor: "action.hover", borderColor: "primary.main" },
                          }),
                    }}
                  >
                    <Typography
                      component="span"
                      sx={{ minWidth: 0, fontSize: 13, fontWeight: 800, lineHeight: 1.2, textAlign: "left", color: "inherit" }}
                    >
                      {category.label}
                    </Typography>

                    <Chip
                      label={counts[category.key] > 99 ? "99+" : counts[category.key]}
                      size="small"
                      sx={{
                        flexShrink: 0,
                        height: 25,
                        minWidth: 31,
                        fontWeight: 900,
                        bgcolor: active ? "rgba(255,255,255,0.18)" : "action.hover",
                        color: active ? "primary.contrastText" : "text.primary",
                        "& .MuiChip-label": { px: 0.8 },
                      }}
                    />
                  </Button>
                );
              })}
            </Box>
          </Box>

          <Box
            sx={{
              flex: 1,
              minHeight: 0,
              overflowY: "auto",
              px: 2,
              py: 2,
              bgcolor: "background.default",
            }}
          >
            <Stack spacing={1.25}>
              <Stack direction="row" alignItems="center" spacing={1}>
                <Typography sx={{ fontSize: 16, fontWeight: 800, color: "text.primary" }}>
                  {activeConfig.title}
                </Typography>

                <Chip label={activeItems.length} size="small" color={activeConfig.color} variant="outlined" sx={{ fontWeight: 800 }} />
              </Stack>

              {activeItems.length === 0 ? (
                <Box
                  sx={{
                    py: 5,
                    px: 2,
                    textAlign: "center",
                    border: "1px dashed",
                    borderColor: "divider",
                    borderRadius: 2,
                    bgcolor: "background.paper",
                  }}
                >
                  <Typography sx={{ fontSize: 13, color: "text.secondary", lineHeight: 1.5 }}>
                    {activeConfig.emptyText}
                  </Typography>
                </Box>
              ) : (
                paginatedItems.map((item) => (
                  <PreparedItemCard
                    key={item.id}
                    item={item}
                    category={activeCategory}
                    busyAction={busyItemIds?.[Number(item.id)] || null}
                    onFinish={onFinish}
                    onConfirmReturn={onConfirmReturn}
                    onRequestMarkUnfit={openUnfitDialog}
                    onRetireExpired={onRetireExpired}
                  />
                ))
              )}
            </Stack>
          </Box>

          {total > PAGE_SIZE ? (
            <Box
              sx={{
                borderTop: "1px solid",
                borderColor: "divider",
                bgcolor: "background.paper",
              }}
            >
              <PaginationFooter
                page={page}
                totalPages={totalPages}
                startItem={startItem}
                endItem={endItem}
                total={total}
                hasPrev={hasPrev}
                hasNext={hasNext}
                onPrev={prevPage}
                onNext={nextPage}
                itemLabel="productos"
              />
            </Box>
          ) : null}
        </Box>
      </Drawer>

      <Dialog
        open={Boolean(unfitItem)}
        onClose={closeUnfitDialog}
        fullWidth
        maxWidth="xs"
      >
        <DialogTitle sx={{ fontWeight: 800 }}>
          Marcar producto como no apto
        </DialogTitle>

        <DialogContent>
          <Stack spacing={2} sx={{ pt: 0.5 }}>
            <Typography sx={{ fontSize: 13, color: "text.secondary", lineHeight: 1.5 }}>
              Este producto dejará de estar disponible para reutilización.
            </Typography>

            {unfitItem ? (
              <Box
                sx={{
                  p: 1.25,
                  borderRadius: 1.5,
                  bgcolor: "action.hover",
                  border: "1px solid",
                  borderColor: "divider",
                }}
              >
                <Typography sx={{ fontSize: 14, fontWeight: 800, color: "text.primary" }}>
                  {unfitItem?.product_name || `Producto #${unfitItem?.product_id ?? "—"}`}
                </Typography>

                <Typography sx={{ mt: 0.25, fontSize: 12, color: "text.secondary" }}>
                  Producto preparado #{unfitItem?.id ?? "—"}
                </Typography>
              </Box>
            ) : null}

            <TextField
              label="Nota opcional"
              value={unfitNote}
              onChange={(event) => setUnfitNote(event.target.value)}
              multiline
              minRows={3}
              fullWidth
              disabled={unfitBusy}
              inputProps={{ maxLength: 255 }}
              helperText={`${unfitNote.length}/255`}
            />
          </Stack>
        </DialogContent>

        <DialogActions sx={{ px: 3, pb: 2.5 }}>
          <Button onClick={closeUnfitDialog} disabled={unfitBusy}>
            Cancelar
          </Button>

          <Button
            variant="contained"
            color="error"
            onClick={confirmUnfit}
            disabled={unfitBusy}
          >
            {unfitBusy ? "Marcando…" : "Marcar no apto"}
          </Button>
        </DialogActions>
      </Dialog>
    </>
  );
}