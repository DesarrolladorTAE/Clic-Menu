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
  payingBusyOrderId,
  onApproveReq,
  onRejectReq,
  onReadReadyNotification,
  onReadBillRequest,
  floatingIcon: FloatingIcon,
}) {
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
        <Box
          sx={{
            height: "100%",
            display: "flex",
            flexDirection: "column",
          }}
        >
          <Box
            sx={{
              px: 2,
              py: 1.75,
              bgcolor: "#111111",
              color: "#fff",
            }}
          >
            <Stack
              direction="row"
              justifyContent="space-between"
              alignItems="flex-start"
              spacing={2}
            >
              <Box>
                <Typography
                  sx={{
                    fontSize: 24,
                    fontWeight: 800,
                    lineHeight: 1.15,
                    color: "#fff",
                  }}
                >
                  Avisos
                </Typography>

                <Typography
                  sx={{
                    mt: 0.75,
                    fontSize: 13,
                    color: "rgba(255,255,255,0.82)",
                  }}
                >
                  Revisa solicitudes, avisos de cocina y peticiones de cuenta.
                </Typography>
              </Box>

              <IconButton
                onClick={onClose}
                sx={{
                  color: "#fff",
                  bgcolor: "rgba(255,255,255,0.08)",
                  borderRadius: 1,
                  "&:hover": {
                    bgcolor: "rgba(255,255,255,0.16)",
                  },
                }}
              >
                <CloseRoundedIcon />
              </IconButton>
            </Stack>
          </Box>

          <Box
            sx={{
              flex: 1,
              overflowY: "auto",
              px: 2,
              py: 2,
              display: "grid",
              gap: 2,
              backgroundColor: "background.default",
            }}
          >
            <NoticeSection
              title="Avisos de cuenta"
              count={billRequests.length}
              emptyText="No hay avisos de cuenta por revisar."
            >
              {billRequests.map((n) => (
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
              ))}
            </NoticeSection>

            <Divider />

            <NoticeSection
              title="Avisos de cocina"
              count={readyNotifications.length}
              emptyText="No hay avisos de cocina pendientes."
            >
              {readyNotifications.map((n) => (
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
              ))}
            </NoticeSection>

            <Divider />

            <NoticeSection
              title="Solicitudes para retomar cuenta"
              count={requests.length}
              emptyText="No hay solicitudes para retomar sesión."
            >
              {requests.map((r) => (
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
              ))}
            </NoticeSection>
          </Box>
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
        children
      ) : (
        <Typography
          sx={{
            fontSize: 13,
            color: "text.secondary",
            lineHeight: 1.5,
          }}
        >
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
        <Typography
          sx={{
            fontSize: 15,
            fontWeight: 800,
            color: "text.primary",
            lineHeight: 1.35,
          }}
        >
          {title}
        </Typography>

        <Typography
          sx={{
            fontSize: 13,
            color: "text.primary",
            lineHeight: 1.5,
          }}
        >
          {subtitle}
        </Typography>

        <Typography
          sx={{
            fontSize: 12,
            color: "text.secondary",
            lineHeight: 1.5,
          }}
        >
          {meta}
        </Typography>

        <Box>{actions}</Box>
      </Stack>
    </Card>
  );
}
