import React, { useState } from "react";
import {
  Badge, Box, Button, Card, Chip, Drawer, Fab, IconButton, Stack, Typography,
} from "@mui/material";
import CloseRoundedIcon from "@mui/icons-material/CloseRounded";
import NavigateBeforeIcon from "@mui/icons-material/NavigateBefore";
import NavigateNextIcon from "@mui/icons-material/NavigateNext";

import usePagination from "../../../hooks/usePagination";

const PAGE_SIZE = 5;

const CANCELLATION_REASON_LABELS = {
  customer_changed_mind: "Cambio de opinión",
  capture_error: "Error en el pedido",
  service_issue: "Incidencia de servicio",
  quality_issue: "Problema de calidad",
  preparation_incident: "Incidencia de preparación",
  courtesy_compensation: "Cortesía o compensación",
  other: "Otro",
};

function cancellationReasonLabel(code) {
  return CANCELLATION_REASON_LABELS[String(code || "").trim()] || "Motivo no especificado";
}

function formatCancellationDate(value) {
  if (!value) return null;

  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return null;

  return date.toLocaleString("es-MX", {
    dateStyle: "short",
    timeStyle: "short",
  });
}

export default function WaiterNoticesDrawer({
  open,
  onOpen,
  onClose,
  count = 0,
  requests = [],
  reqBusyId,
  readyNotifications = [],
  readyBusyId,
  billRequests = [],
  billBusyId,
  cancellationRequests = [],
  onReviewCancellation,
  payingBusyOrderId,
  onApproveReq,
  onRejectReq,
  onReadReadyNotification,
  onReadBillRequest,
  floatingIcon: FloatingIcon,
}) {
  /*
   * La primera categoría visible al montar el drawer siempre es Cancelaciones.
   * Después el mesero puede cambiar libremente entre las cuatro opciones.
   */
  const [activeNoticeType, setActiveNoticeType] = useState("cancellations");

  const noticeTabs = [
    {
      key: "cancellations",
      label: "Cancelaciones",
      title: "Solicitudes de cancelación",
      emptyText: "Aún no hay avisos de cancelación.",
      items: Array.isArray(cancellationRequests) ? cancellationRequests : [],
    },
    {
      key: "bill",
      label: "Cuenta",
      title: "Avisos de cuenta",
      emptyText: "Aún no hay avisos de cuenta.",
      items: Array.isArray(billRequests) ? billRequests : [],
    },
    {
      key: "ready",
      label: "Cocina",
      title: "Avisos de cocina",
      emptyText: "Aún no hay avisos de cocina.",
      items: Array.isArray(readyNotifications) ? readyNotifications : [],
    },
    {
      key: "session",
      label: "Sesión",
      title: "Solicitudes para retomar cuenta",
      emptyText: "Aún no hay avisos de sesión.",
      items: Array.isArray(requests) ? requests : [],
    },
  ];

  const activeTab = noticeTabs.find((tab) => tab.key === activeNoticeType) || noticeTabs[0];

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
    items: activeTab.items,
    initialPage: 1,
    pageSize: PAGE_SIZE,
    mode: "frontend",
    resetKey: activeNoticeType,
  });

  const changeNoticeType = (type) => {
    if (type === activeNoticeType) return;
    setPage(1);
    setActiveNoticeType(type);
  };

  return (
    <>
      {!open ? (
        <Badge
          badgeContent={count > 99 ? "99+" : count}
          invisible={!count}
          color="error"
          overlap="circular"
          anchorOrigin={{ vertical: "top", horizontal: "right" }}
          sx={{
            position: "fixed",
            right: 24,
            bottom: 28,
            zIndex: 1400,
            overflow: "visible",
            "& .MuiBadge-badge": {
              fontWeight: 800,
              minWidth: 24,
              height: 24,
              borderRadius: "999px",
              fontSize: 11,
              lineHeight: 1,
              padding: "0 6px",
              border: "2px solid #fff",
              boxShadow: "0 4px 10px rgba(0,0,0,0.16)",
              zIndex: 2,
              top: 2,
              right: 2,
              transform: "scale(1) translate(35%, -35%)",
              transformOrigin: "100% 0%",
            },
          }}
        >
          <Fab
            color="primary"
            onClick={onOpen}
            aria-label="Abrir avisos"
            sx={{
              boxShadow: "0 8px 22px rgba(0,0,0,0.18)",
              position: "relative",
              zIndex: 1,
              overflow: "visible",
            }}
          >
            <FloatingIcon />
          </Fab>
        </Badge>
      ) : null}

      <Drawer
        anchor="right"
        open={open}
        onClose={onClose}
        ModalProps={{ keepMounted: true }}
        slotProps={{
          paper: {
            sx: {
              width: { xs: "100%", sm: 390 },
              maxWidth: "100%",
              borderLeft: "1px solid",
              borderColor: "divider",
              backgroundColor: "background.paper",
            },
          },
        }}
      >
        <Box sx={{ height: "100%", display: "flex", flexDirection: "column" }}>
          <Box sx={{ px: 2, py: 1.75, bgcolor: "#111111", color: "#fff" }}>
            <Stack direction="row" justifyContent="space-between" alignItems="flex-start" spacing={2}>
              <Box>
                <Typography sx={{ fontSize: 24, fontWeight: 800, lineHeight: 1.15, color: "#fff" }}>
                  Avisos
                </Typography>

                <Typography sx={{ mt: 0.75, fontSize: 13, color: "rgba(255,255,255,0.82)" }}>
                  Revisa cancelaciones, avisos de cocina, cuenta y solicitudes de sesión.
                </Typography>
              </Box>

              <IconButton
                onClick={onClose}
                sx={{
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

          {/* Selector fijo de categorías */}
          <Box
            sx={{
              px: 2,
              pt: 2,
              pb: 1.5,
              backgroundColor: "background.default",
              borderBottom: "1px solid",
              borderColor: "divider",
            }}
          >
            <Box sx={{ display: "grid", gridTemplateColumns: "repeat(2, minmax(0, 1fr))", gap: 1 }}>
              {noticeTabs.map((tab) => {
                const active = tab.key === activeNoticeType;

                return (
                  <Button
                    key={tab.key}
                    color="primary"
                    variant={active ? "contained" : "outlined"}
                    onClick={() => changeNoticeType(tab.key)}
                    aria-pressed={active}
                    sx={{
                      minWidth: 0,
                      minHeight: 52,
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
                            "&:hover": {
                              bgcolor: "action.hover",
                              borderColor: "primary.main",
                            },
                          }),
                    }}
                  >
                    <Typography
                      component="span"
                      sx={{
                        minWidth: 0,
                        fontSize: 13,
                        fontWeight: 800,
                        lineHeight: 1.2,
                        textAlign: "left",
                        color: "inherit",
                      }}
                    >
                      {tab.label}
                    </Typography>

                    <Chip
                      label={tab.items.length > 99 ? "99+" : tab.items.length}
                      size="small"
                      sx={{
                        flexShrink: 0,
                        height: 24,
                        minWidth: 30,
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

          {/* Sólo la categoría seleccionada puede hacer scroll */}
          <Box
            sx={{
              flex: 1,
              minHeight: 0,
              overflowY: "auto",
              px: 2,
              py: 2,
              backgroundColor: "background.default",
            }}
          >
            <NoticeSection
              title={activeTab.title}
              count={activeTab.items.length}
              emptyText={activeTab.emptyText}
            >
              {activeNoticeType === "cancellations"
                ? paginatedItems.map((cancellation) => {
                    const isFull = String(cancellation?.type || "").toLowerCase() === "full";
                    const items = Array.isArray(cancellation?.items) ? cancellation.items : [];
                    const reasonLabel = cancellationReasonLabel(cancellation?.reason_code);
                    const reasonNote = String(cancellation?.reason_note || "").trim();
                    const requestedAt = formatCancellationDate(cancellation?.created_at);

                    return (
                      <NoticeCard
                        key={cancellation.id}
                        title={isFull ? "Cancelación total de comanda" : "Cancelación parcial"}
                        subtitle={
                          <>
                            <strong>
                              Mesa #{cancellation?.table_id ?? "—"} · Orden #{cancellation?.order_id ?? "—"}
                            </strong>

                            {items.length > 0 ? <br /> : null}

                            {items.map((item, index) => (
                              <React.Fragment key={item?.order_item_id || index}>
                                {item?.product_name || "Producto"} · {Number(item?.requested_quantity || 0)}
                                {index < items.length - 1 ? <br /> : null}
                              </React.Fragment>
                            ))}
                          </>
                        }
                        meta={
                          <>
                            Motivo: {reasonLabel}
                            {reasonNote ? (
                              <>
                                <br />
                                Nota: {reasonNote}
                              </>
                            ) : null}
                            {requestedAt ? (
                              <>
                                <br />
                                Solicitada: {requestedAt}
                              </>
                            ) : null}
                          </>
                        }
                        actions={
                          <Button
                            variant="contained"
                            color="primary"
                            disabled={!onReviewCancellation}
                            onClick={() => onReviewCancellation?.(cancellation)}
                          >
                            Revisar solicitud
                          </Button>
                        }
                      />
                    );
                  })
                : null}

              {activeNoticeType === "bill"
                ? paginatedItems.map((n) => (
                    <NoticeCard
                      key={n.id}
                      title={n.title || "Pidió cuenta"}
                      subtitle={n.message || `Orden #${n.order_id} pidió cuenta`}
                      meta={`Mesa: ${n.table_id ?? "—"} · Orden: #${n.order_id ?? "—"} · ${n.requested_by || "customer"}`}
                      actions={
                        <Button
                          variant="contained"
                          color="success"
                          disabled={billBusyId === n.id || payingBusyOrderId === n.order_id}
                          onClick={() => onReadBillRequest(n.id)}
                        >
                          {billBusyId === n.id ? "Marcando…" : "Leído"}
                        </Button>
                      }
                    />
                  ))
                : null}

              {activeNoticeType === "ready"
                ? paginatedItems.map((n) => (
                    <NoticeCard
                      key={n.id}
                      title={n.title || "Pedido listo"}
                      subtitle={n.message || `Pedido #${n.order_id} listo`}
                      meta={`Mesa: ${n.table_id ?? "—"} · Orden: #${n.order_id ?? "—"}`}
                      actions={
                        <Button
                          variant="contained"
                          color="success"
                          disabled={readyBusyId === n.id}
                          onClick={() => onReadReadyNotification(n.id)}
                        >
                          {readyBusyId === n.id ? "Marcando…" : "Leído"}
                        </Button>
                      }
                    />
                  ))
                : null}

              {activeNoticeType === "session"
                ? paginatedItems.map((r) => (
                    <NoticeCard
                      key={r.id}
                      title={`Mesa: ${r.table_name || `#${r.table_id}`} · Orden #${r.order_id}`}
                      subtitle={`Dispositivo: ${r.device_identifier}`}
                      meta={r.expires_at ? `Expira: ${r.expires_at}` : "Sin expiración visible"}
                      actions={
                        <Stack direction="row" spacing={1}>
                          <Button
                            variant="contained"
                            color="success"
                            disabled={reqBusyId === r.id}
                            onClick={() => onApproveReq(r.id)}
                          >
                            Aprobar
                          </Button>

                          <Button
                            variant="contained"
                            color="error"
                            disabled={reqBusyId === r.id}
                            onClick={() => onRejectReq(r.id)}
                          >
                            Rechazar
                          </Button>
                        </Stack>
                      }
                    />
                  ))
                : null}
            </NoticeSection>
          </Box>

          {/* Paginación común para cualquiera de las cuatro categorías */}
          {total > PAGE_SIZE ? (
            <NoticePagination
              page={page}
              totalPages={totalPages}
              startItem={startItem}
              endItem={endItem}
              total={total}
              hasPrev={hasPrev}
              hasNext={hasNext}
              onPrev={prevPage}
              onNext={nextPage}
            />
          ) : null}
        </Box>
      </Drawer>
    </>
  );
}

function NoticeSection({ title, count, emptyText, children }) {
  const hasItems = React.Children.count(children) > 0;

  return (
    <Box sx={{ display: "grid", gap: 1.25 }}>
      <Stack direction="row" alignItems="center" spacing={1}>
        <Typography sx={{ fontSize: 16, fontWeight: 800, color: "text.primary" }}>
          {title}
        </Typography>

        <Chip
          label={count}
          size="small"
          sx={{ fontWeight: 800, bgcolor: "#FFF3E0", color: "#A75A00" }}
        />
      </Stack>

      {hasItems ? (
        children
      ) : (
        <Typography sx={{ fontSize: 13, color: "text.secondary", lineHeight: 1.5 }}>
          {emptyText}
        </Typography>
      )}
    </Box>
  );
}

function NoticeCard({ title, subtitle, meta, actions }) {
  return (
    <Card
      sx={{
        p: 1.5,
        border: "1px solid",
        borderColor: "divider",
        borderRadius: 1,
        boxShadow: "none",
      }}
    >
      <Stack spacing={1.25}>
        <Typography sx={{ fontSize: 15, fontWeight: 800, color: "text.primary", lineHeight: 1.35 }}>
          {title}
        </Typography>

        <Typography sx={{ fontSize: 13, color: "text.primary", lineHeight: 1.5 }}>
          {subtitle}
        </Typography>

        <Typography sx={{ fontSize: 12, color: "text.secondary", lineHeight: 1.5 }}>
          {meta}
        </Typography>

        <Box>{actions}</Box>
      </Stack>
    </Card>
  );
}

function NoticePagination({
  page,
  totalPages,
  startItem,
  endItem,
  total,
  hasPrev,
  hasNext,
  onPrev,
  onNext,
}) {
  return (
    <Box
      sx={{
        px: 2,
        py: 1.25,
        borderTop: "1px solid",
        borderColor: "divider",
        bgcolor: "background.paper",
      }}
    >
      <Typography sx={{ mb: 1, fontSize: 12, color: "text.secondary", textAlign: "center" }}>
        Mostrando {startItem} - {endItem} de {total} avisos
      </Typography>

      <Stack direction="row" alignItems="center" justifyContent="space-between" spacing={1}>
        <Button
          variant="outlined"
          color="primary"
          startIcon={<NavigateBeforeIcon />}
          onClick={onPrev}
          disabled={!hasPrev}
          sx={{ minWidth: 0, flex: 1, height: 38, borderRadius: 2 }}
        >
          Anterior
        </Button>

        <Typography
          sx={{
            flexShrink: 0,
            minWidth: 52,
            textAlign: "center",
            fontSize: 12,
            fontWeight: 800,
            color: "text.primary",
          }}
        >
          {page} / {totalPages}
        </Typography>

        <Button
          variant="outlined"
          color="primary"
          endIcon={<NavigateNextIcon />}
          onClick={onNext}
          disabled={!hasNext}
          sx={{ minWidth: 0, flex: 1, height: 38, borderRadius: 2 }}
        >
          Siguiente
        </Button>
      </Stack>
    </Box>
  );
}