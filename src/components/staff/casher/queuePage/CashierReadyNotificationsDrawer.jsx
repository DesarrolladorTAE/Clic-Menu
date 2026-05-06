import React from "react";
import {
  Badge,
  Box,
  Button,
  Card,
  Chip,
  Divider,
  Drawer,
  Fab,
  IconButton,
  Stack,
  Typography,
} from "@mui/material";
import CloseRoundedIcon from "@mui/icons-material/CloseRounded";
import NotificationsNoneRoundedIcon from "@mui/icons-material/NotificationsNoneRounded";
import PointOfSaleRoundedIcon from "@mui/icons-material/PointOfSaleRounded";
import KitchenRoundedIcon from "@mui/icons-material/KitchenRounded";

export default function CashierReadyNotificationsDrawer({
  open,
  onOpen,
  onClose,
  notifications = [],
  busyId = null,
  onReadNotification,
}) {
  const count = Array.isArray(notifications) ? notifications.length : 0;

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
            aria-label="Abrir avisos de caja"
            sx={{
              boxShadow: "0 8px 22px rgba(0,0,0,0.18)",
              position: "relative",
              zIndex: 1,
              overflow: "visible",
            }}
          >
            <NotificationsNoneRoundedIcon />
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
              width: { xs: "100%", sm: 410 },
              maxWidth: "100%",
              borderLeft: "1px solid",
              borderColor: "divider",
              backgroundColor: "background.default",
            },
          },
        }}
      >
        <Box sx={{ height: "100%", display: "flex", flexDirection: "column" }}>
          <Box
            sx={{
              px: 2,
              py: 1.75,
              bgcolor: "#111111",
              color: "#fff",
            }}
          >
            <Stack direction="row" alignItems="flex-start" spacing={1.5}>
              <IconButton
                onClick={onClose}
                sx={{
                  color: "#fff",
                  bgcolor: "rgba(255,255,255,0.08)",
                  borderRadius: 1,
                  mt: 0.1,
                  flexShrink: 0,
                  "&:hover": {
                    bgcolor: "rgba(255,255,255,0.16)",
                  },
                }}
              >
                <CloseRoundedIcon />
              </IconButton>

              <Box sx={{ minWidth: 0 }}>
                <Stack direction="row" spacing={1} alignItems="center">
                  <PointOfSaleRoundedIcon sx={{ color: "#fff" }} />

                  <Typography
                    sx={{
                      fontSize: 24,
                      fontWeight: 800,
                      lineHeight: 1.15,
                      color: "#fff",
                    }}
                  >
                    Avisos de caja
                  </Typography>
                </Stack>

                <Typography
                  sx={{
                    mt: 0.75,
                    fontSize: 13,
                    color: "rgba(255,255,255,0.82)",
                    lineHeight: 1.5,
                  }}
                >
                  Revisa las órdenes de venta directa que cocina marcó como
                  listas para entregar.
                </Typography>
              </Box>
            </Stack>
          </Box>

          <Box
            sx={{
              flex: 1,
              overflowY: "auto",
              px: 2,
              py: 2,
              backgroundColor: "background.default",
            }}
          >
            <NoticeSection
              title="Órdenes listas"
              count={count}
              emptyText="No hay avisos de cocina pendientes para caja."
            >
              {notifications.map((notification) => (
                <CashierReadyNoticeCard
                  key={notification.id}
                  notification={notification}
                  busy={Number(busyId || 0) === Number(notification.id)}
                  onRead={() => onReadNotification?.(notification.id)}
                />
              ))}
            </NoticeSection>
          </Box>
        </Box>
      </Drawer>
    </>
  );
}

function CashierReadyNoticeCard({ notification, busy = false, onRead }) {
  const order = notification?.order || null;
  const sale = notification?.sale || null;

  return (
    <Card
      sx={{
        p: 1.5,
        border: "1px solid",
        borderColor: "divider",
        borderRadius: 1,
        boxShadow: "none",
        backgroundColor: "background.paper",
      }}
    >
      <Stack spacing={1.25}>
        <Stack
          direction="row"
          spacing={1}
          alignItems="flex-start"
          justifyContent="space-between"
        >
          <Box sx={{ minWidth: 0 }}>
            <Typography
              sx={{
                fontSize: 15,
                fontWeight: 800,
                color: "text.primary",
                lineHeight: 1.35,
                wordBreak: "break-word",
              }}
            >
              {notification?.title || "Orden lista para entregar"}
            </Typography>

            <Typography
              sx={{
                mt: 0.35,
                fontSize: 13,
                color: "text.primary",
                lineHeight: 1.5,
                wordBreak: "break-word",
              }}
            >
              {notification?.message ||
                `Orden #${
                  notification?.order_id || "—"
                } lista para entregar en caja.`}
            </Typography>
          </Box>

          <Chip
            icon={<KitchenRoundedIcon />}
            label="Cocina"
            size="small"
            sx={{
              flexShrink: 0,
              fontWeight: 800,
              bgcolor: "#FFF3E0",
              color: "#A75A00",
            }}
          />
        </Stack>

        <Divider />

        <Stack spacing={0.65}>
          <InfoRow label="Orden" value={`#${notification?.order_id || "—"}`} />
          <InfoRow
            label="Venta"
            value={notification?.sale_id ? `#${notification.sale_id}` : "—"}
          />
          <InfoRow
            label="Cliente"
            value={order?.customer_name || "Cliente mostrador"}
          />
          <InfoRow
            label="Total"
            value={formatCurrency(sale?.total ?? order?.total ?? 0)}
          />
          <InfoRow label="Pagada" value={formatDateTime(sale?.paid_at)} />
          <InfoRow label="Aviso" value={formatDateTime(notification?.notified_at)} />
        </Stack>

        <Button
          variant="contained"
          color="success"
          disabled={busy}
          onClick={onRead}
          sx={{
            height: 40,
            borderRadius: 2,
            fontWeight: 800,
          }}
        >
          {busy ? "Marcando…" : "Marcar como leído"}
        </Button>
      </Stack>
    </Card>
  );
}

function NoticeSection({ title, count, emptyText, children }) {
  const hasItems = React.Children.count(children) > 0;

  return (
    <Box
      sx={{
        display: "grid",
        gap: 1.5,
        alignContent: "flex-start",
      }}
    >
      <Stack direction="row" alignItems="center" spacing={1}>
        <Typography
          sx={{
            fontSize: 16,
            fontWeight: 800,
            color: "text.primary",
          }}
        >
          {title}
        </Typography>

        <Chip
          label={count}
          size="small"
          sx={{
            fontWeight: 800,
            bgcolor: "#FFF3E0",
            color: "#A75A00",
          }}
        />
      </Stack>

      {hasItems ? (
        <Stack spacing={1.5}>{children}</Stack>
      ) : (
        <Box
          sx={{
            border: "1px dashed",
            borderColor: "divider",
            borderRadius: 1,
            backgroundColor: "background.paper",
            p: 2,
          }}
        >
          <Typography
            sx={{
              fontSize: 13,
              color: "text.secondary",
              lineHeight: 1.5,
            }}
          >
            {emptyText}
          </Typography>
        </Box>
      )}
    </Box>
  );
}

function InfoRow({ label, value }) {
  return (
    <Stack direction="row" justifyContent="space-between" spacing={1.5}>
      <Typography sx={{ fontSize: 13, fontWeight: 700, color: "text.secondary" }}>
        {label}
      </Typography>

      <Typography
        sx={{
          fontSize: 13,
          fontWeight: 800,
          color: "text.primary",
          textAlign: "right",
          wordBreak: "break-word",
        }}
      >
        {value || "—"}
      </Typography>
    </Stack>
  );
}

function formatCurrency(value) {
  const safe = Number(value || 0);

  try {
    return new Intl.NumberFormat("es-MX", {
      style: "currency",
      currency: "MXN",
      minimumFractionDigits: 2,
    }).format(safe);
  } catch {
    return `$${safe.toFixed(2)}`;
  }
}

function formatDateTime(value) {
  if (!value) return "—";

  try {
    return new Date(value).toLocaleString("es-MX", {
      dateStyle: "medium",
      timeStyle: "short",
    });
  } catch {
    return value;
  }
}