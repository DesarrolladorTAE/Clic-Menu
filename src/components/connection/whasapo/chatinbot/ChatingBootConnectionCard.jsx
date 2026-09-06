import { Box, Button, Chip, CircularProgress, Paper, Stack, Typography } from "@mui/material";
import QRCode from "react-qr-code";

import QrCode2RoundedIcon from "@mui/icons-material/QrCode2Rounded";
import CheckCircleRoundedIcon from "@mui/icons-material/CheckCircleRounded";
import LinkOffRoundedIcon from "@mui/icons-material/LinkOffRounded";
import DeleteOutlineRoundedIcon from "@mui/icons-material/DeleteOutlineRounded";
import AddLinkRoundedIcon from "@mui/icons-material/AddLinkRounded";
import PhoneAndroidRoundedIcon from "@mui/icons-material/PhoneAndroidRounded";

function formatDateTime(value) {
  if (!value) return "—";

  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return "—";

  return date.toLocaleString("es-MX", {
    day: "2-digit",
    month: "short",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  });
}

function statusInfo(connection, reconnectRequired) {
  if (connection?.connected) {
    return {
      label: "Conectado",
      color: "success",
      title: "Tu WhatsApp está vinculado",
      description:
        "La cuenta está lista para utilizarse como conexión de WhatsApp QR.",
    };
  }

  const status = String(connection?.status || "").toLowerCase();

  if (status === "qr" || status === "qrcode") {
    return {
      label: "Esperando escaneo",
      color: "warning",
      title: "Escanea el código QR",
      description:
        "Abre WhatsApp en tu teléfono, entra a Dispositivos vinculados y escanea este código.",
    };
  }

  if (status === "opening") {
    return {
      label: "Vinculando",
      color: "warning",
      title: "Vinculando teléfono",
      description:
        "WhatsApp está terminando de vincular el dispositivo. Espera mientras se completa el inicio de sesión.",
    };
  }

  if (status === "pending") {
    return {
      label: "Preparando",
      color: "warning",
      title: "Preparando tu conexión",
      description:
        "La conexión se está preparando. El código QR aparecerá automáticamente.",
    };
  }

  if (
    reconnectRequired ||
    status === "disconnected" ||
    status === "closed"
  ) {
    return {
      label: "Desconectado",
      color: "error",
      title: "La conexión necesita volver a vincularse",
      description:
        "La cuenta de WhatsApp dejó de estar disponible para esta sucursal.",
    };
  }

  return {
    label: "Pendiente",
    color: "default",
    title: "Conexión pendiente",
    description:
      "Estamos esperando que la conexión esté disponible para continuar.",
  };
}

export default function ChatingBootConnectionCard({
  addonAvailable = false,
  connection = null,
  reconnectRequired = false,
  loading = false,
  working = false,
  confirmingDelete = false,
  onCreate,
  onRequestDelete,
  onCancelDelete,
  onDelete,
}) {
  const state = statusInfo(connection, reconnectRequired);

  if (loading) {
    return (
      <Paper sx={paperSx}>
        <Box
          sx={{
            minHeight: 300,
            display: "grid",
            placeItems: "center",
          }}
        >
          <Stack spacing={1.5} alignItems="center">
            <CircularProgress size={32} />

            <Typography sx={{ fontSize: 13, color: "text.secondary" }}>
              Consultando tu conexión de WhatsApp…
            </Typography>
          </Stack>
        </Box>
      </Paper>
    );
  }

  return (
    <Paper sx={paperSx}>
      <Stack spacing={2.5}>
        <Stack
          direction={{ xs: "column", sm: "row" }}
          spacing={1.5}
          justifyContent="space-between"
          alignItems={{ xs: "flex-start", sm: "center" }}
        >
          <Stack direction="row" spacing={1.5} alignItems="center">
            <Box
              sx={{
                width: 44,
                height: 44,
                borderRadius: 1,
                display: "grid",
                placeItems: "center",
                bgcolor: "action.hover",
                color: "primary.main",
                flexShrink: 0,
              }}
            >
              <QrCode2RoundedIcon />
            </Box>

            <Box>
              <Typography
                sx={{
                  fontSize: 18,
                  fontWeight: 800,
                  color: "text.primary",
                }}
              >
                Conexión por código QR
              </Typography>

              <Typography
                sx={{
                  mt: 0.35,
                  fontSize: 13,
                  color: "text.secondary",
                  lineHeight: 1.5,
                }}
              >
                Vincula el WhatsApp de esta sucursal escaneando un código QR.
              </Typography>
            </Box>
          </Stack>

          {connection ? (
            <Chip
              label={state.label}
              color={state.color}
              variant={state.color === "default" ? "outlined" : "filled"}
              size="small"
              sx={{ fontWeight: 800 }}
            />
          ) : null}
        </Stack>

        {!addonAvailable ? (
          <AddonUnavailableState />
        ) : !connection ? (
          <NoConnectionState working={working} onCreate={onCreate} />
        ) : connection.connected ? (
          <ConnectedState
            connection={connection}
            working={working}
            confirmingDelete={confirmingDelete}
            onRequestDelete={onRequestDelete}
            onCancelDelete={onCancelDelete}
            onDelete={onDelete}
          />
        ) : (
          <PendingConnectionState
            connection={connection}
            state={state}
            reconnectRequired={reconnectRequired}
            working={working}
            confirmingDelete={confirmingDelete}
            onCreate={onCreate}
            onRequestDelete={onRequestDelete}
            onCancelDelete={onCancelDelete}
            onDelete={onDelete}
          />
        )}
      </Stack>
    </Paper>
  );
}

function AddonUnavailableState() {
  return (
    <Box
      sx={{
        border: "1px solid",
        borderColor: "divider",
        borderRadius: 1,
        bgcolor: "background.default",
        p: { xs: 2, sm: 2.5 },
      }}
    >
      <Stack spacing={1.25}>
        <Typography sx={{ fontSize: 16, fontWeight: 800, color: "text.primary" }}>
          Complemento no disponible
        </Typography>

        <Typography sx={{ fontSize: 13, color: "text.secondary", lineHeight: 1.65 }}>
          Esta sucursal no tiene vigente el complemento WhatsApp QR. Cuando el
          complemento esté disponible podrás crear y vincular una conexión desde
          esta misma pantalla.
        </Typography>
      </Stack>
    </Box>
  );
}

function NoConnectionState({ working, onCreate }) {
  return (
    <Box
      sx={{
        minHeight: 260,
        border: "1px solid",
        borderColor: "divider",
        borderRadius: 1,
        bgcolor: "background.default",
        p: { xs: 2.5, sm: 4 },
        display: "grid",
        placeItems: "center",
        textAlign: "center",
      }}
    >
      <Stack spacing={2} alignItems="center" sx={{ maxWidth: 520 }}>
        <Box
          sx={{
            width: 64,
            height: 64,
            borderRadius: 1,
            display: "grid",
            placeItems: "center",
            bgcolor: "action.hover",
            color: "primary.main",
          }}
        >
          <QrCode2RoundedIcon sx={{ fontSize: 34 }} />
        </Box>

        <Box>
          <Typography sx={{ fontSize: 19, fontWeight: 800, color: "text.primary" }}>
            Aún no tienes una conexión vinculada
          </Typography>

          <Typography sx={{ mt: 0.75, fontSize: 13, color: "text.secondary", lineHeight: 1.65 }}>
            Genera una conexión y escanea el código QR desde el WhatsApp que
            utilizará esta sucursal.
          </Typography>
        </Box>

        <Button
          variant="contained"
          startIcon={
            working ? <CircularProgress size={17} color="inherit" /> : <AddLinkRoundedIcon />
          }
          disabled={working}
          onClick={onCreate}
          sx={{
            minWidth: { xs: "100%", sm: 230 },
            height: 44,
            fontWeight: 800,
          }}
        >
          {working ? "Generando..." : "Generar conexión QR"}
        </Button>
      </Stack>
    </Box>
  );
}

function PreparingConnectionState() {
  return (
    <Box
      sx={{
        minHeight: 260,
        border: "1px solid",
        borderColor: "divider",
        borderRadius: 1,
        bgcolor: "background.default",
        p: { xs: 2.5, sm: 4 },
        display: "grid",
        placeItems: "center",
        textAlign: "center",
      }}
    >
      <Stack spacing={2} alignItems="center" sx={{ maxWidth: 520 }}>
        <CircularProgress size={36} />

        <Box>
          <Typography sx={{ fontSize: 19, fontWeight: 800, color: "text.primary" }}>
            Preparando código QR
          </Typography>

          <Typography sx={{ mt: 0.75, fontSize: 13, color: "text.secondary", lineHeight: 1.65 }}>
            Estamos generando el código para vincular WhatsApp. Aparecerá
            automáticamente en unos segundos.
          </Typography>
        </Box>
      </Stack>
    </Box>
  );
}

function OpeningConnectionState() {
  return (
    <Box
      sx={{
        minHeight: 260,
        border: "1px solid",
        borderColor: "divider",
        borderRadius: 1,
        bgcolor: "background.default",
        p: { xs: 2.5, sm: 4 },
        display: "grid",
        placeItems: "center",
        textAlign: "center",
      }}
    >
      <Stack spacing={2} alignItems="center" sx={{ maxWidth: 560 }}>
        <CircularProgress size={36} />

        <Box>
          <Typography sx={{ fontSize: 19, fontWeight: 800, color: "text.primary" }}>
            Vinculando teléfono
          </Typography>

          <Typography sx={{ mt: 0.75, fontSize: 13, color: "text.secondary", lineHeight: 1.65 }}>
            WhatsApp está terminando de vincular el dispositivo. Espera mientras
            se completa el inicio de sesión.
          </Typography>
        </Box>
      </Stack>
    </Box>
  );
}

function PendingConnectionState({
  connection,
  state,
  reconnectRequired,
  working,
  confirmingDelete,
  onCreate,
  onRequestDelete,
  onCancelDelete,
  onDelete,
}) {
  const status = String(connection?.status || "").toLowerCase();
  const qrValue = String(connection?.qrcode || "").trim();
  const hasQr = qrValue !== "";
  const isActivePendingState = ["qr", "qrcode", "pending", "opening"].includes(status);
  const isDisconnected =
    !isActivePendingState &&
    (reconnectRequired || status === "disconnected" || status === "closed");

  if (isDisconnected) {
    return <DisconnectedState working={working} onCreate={onCreate} />;
  }

  if (status === "opening") {
    return <OpeningConnectionState />;
  }

  if (status === "pending" && !hasQr) {
    return <PreparingConnectionState />;
  }

  return (
    <Stack spacing={2}>
      {hasQr ? (
        <QrCard value={qrValue} />
      ) : (
        <Box
          sx={{
            border: "1px solid",
            borderColor: "divider",
            borderRadius: 1,
            bgcolor: "background.default",
            p: { xs: 2, sm: 2.5 },
          }}
        >
          <Typography sx={{ fontSize: 18, fontWeight: 800, color: "text.primary" }}>
            {state.title}
          </Typography>

          <Typography sx={{ mt: 0.75, fontSize: 13, color: "text.secondary", lineHeight: 1.65 }}>
            {state.description}
          </Typography>
        </Box>
      )}

      <DeleteActions
        working={working}
        confirmingDelete={confirmingDelete}
        onRequestDelete={onRequestDelete}
        onCancelDelete={onCancelDelete}
        onDelete={onDelete}
      />
    </Stack>
  );
}

function DisconnectedState({ working, onCreate }) {
  return (
    <Box
      sx={{
        minHeight: 260,
        border: "1px solid",
        borderColor: "divider",
        borderRadius: 1,
        bgcolor: "background.default",
        p: { xs: 2.5, sm: 4 },
        display: "grid",
        placeItems: "center",
        textAlign: "center",
      }}
    >
      <Stack
        spacing={2}
        alignItems="center"
        sx={{
          width: "100%",
          maxWidth: 560,
        }}
      >
        <Box
          sx={{
            width: 64,
            height: 64,
            borderRadius: 1,
            display: "grid",
            placeItems: "center",
            bgcolor: "action.hover",
            color: "error.main",
          }}
        >
          <LinkOffRoundedIcon sx={{ fontSize: 34 }} />
        </Box>

        <Box>
          <Typography sx={{ fontSize: 19, fontWeight: 800, color: "text.primary" }}>
            La conexión necesita volver a vincularse
          </Typography>

          <Typography sx={{ mt: 0.75, fontSize: 13, color: "text.secondary", lineHeight: 1.65 }}>
            La cuenta de WhatsApp dejó de estar disponible para esta sucursal.
          </Typography>
        </Box>

        <Button
          variant="contained"
          startIcon={
            working ? <CircularProgress size={17} color="inherit" /> : <AddLinkRoundedIcon />
          }
          disabled={working}
          onClick={onCreate}
          sx={{
            minWidth: { xs: "100%", sm: 250 },
            height: 44,
            fontWeight: 800,
          }}
        >
          {working ? "Generando..." : "Volver a vincular WhatsApp"}
        </Button>
      </Stack>
    </Box>
  );
}

function ConnectedState({
  connection,
  working,
  confirmingDelete,
  onRequestDelete,
  onCancelDelete,
  onDelete,
}) {
  return (
    <Stack spacing={2}>
      <Box
        sx={{
          border: "1px solid",
          borderColor: "divider",
          borderRadius: 1,
          bgcolor: "background.default",
          p: { xs: 2.5, sm: 3 },
        }}
      >
        <Stack
          direction={{ xs: "column", md: "row" }}
          spacing={2.5}
          alignItems={{ xs: "flex-start", md: "center" }}
        >
          <Box
            sx={{
              width: 64,
              height: 64,
              borderRadius: 1,
              display: "grid",
              placeItems: "center",
              bgcolor: "success.main",
              color: "#fff",
              flexShrink: 0,
            }}
          >
            <CheckCircleRoundedIcon sx={{ fontSize: 36 }} />
          </Box>

          <Box sx={{ flex: 1, minWidth: 0 }}>
            <Typography sx={{ fontSize: 20, fontWeight: 800, color: "text.primary" }}>
              WhatsApp vinculado correctamente
            </Typography>

            <Typography sx={{ mt: 0.75, fontSize: 13, color: "text.secondary", lineHeight: 1.6 }}>
              La conexión está disponible y puede utilizarse para los envíos de
              esta sucursal.
            </Typography>

            <Box
              sx={{
                mt: 2,
                display: "grid",
                gridTemplateColumns: {
                  xs: "1fr",
                  sm: "repeat(3, minmax(0, 1fr))",
                },
                gap: 1.5,
              }}
            >
              <InfoItem
                label="Conexión"
                value={connection?.name || "WhatsApp de la sucursal"}
              />

              <InfoItem
                label="Número vinculado"
                value={connection?.phone_number || "Vinculado"}
                icon={<PhoneAndroidRoundedIcon fontSize="small" />}
              />

              <InfoItem
                label="Última revisión"
                value={formatDateTime(connection?.last_synced_at)}
              />
            </Box>
          </Box>
        </Stack>
      </Box>

      <DeleteActions
        working={working}
        confirmingDelete={confirmingDelete}
        onRequestDelete={onRequestDelete}
        onCancelDelete={onCancelDelete}
        onDelete={onDelete}
      />
    </Stack>
  );
}

function QrCard({ value }) {
  const isImage = value.startsWith("data:image/");

  return (
    <Box
      sx={{
        border: "1px solid",
        borderColor: "divider",
        borderRadius: 1,
        bgcolor: "background.default",
        p: { xs: 2, sm: 3, md: 3.5 },
        display: "grid",
        gridTemplateColumns: {
          xs: "1fr",
          md: "minmax(0, 1fr) minmax(300px, 380px)",
        },
        gap: { xs: 2.5, md: 4 },
        alignItems: "center",
      }}
    >
      <Box sx={{ minWidth: 0 }}>
        <Typography
          sx={{
            fontSize: { xs: 19, sm: 21, md: 23 },
            fontWeight: 800,
            color: "text.primary",
            lineHeight: 1.25,
          }}
        >
          Escanea para vincular WhatsApp
        </Typography>

        <Typography
          sx={{
            mt: { xs: 0.6, sm: 0.75 },
            mb: { xs: 1.5, sm: 2.25 },
            fontSize: { xs: 12.5, sm: 13 },
            color: "text.secondary",
            lineHeight: 1.55,
          }}
        >
          Sigue estos pasos desde el teléfono que utilizará esta sucursal.
        </Typography>

        <Stack spacing={{ xs: 0.65, sm: 1 }}>
          <QrStep number={1} last={false}>
            Abre WhatsApp
          </QrStep>

          <QrStep number={2} last={false}>
            Entra a Dispositivos vinculados
          </QrStep>

          <QrStep number={3} last={false}>
            Selecciona Vincular dispositivo
          </QrStep>

          <QrStep number={4} last>
            Escanea el código QR
          </QrStep>
        </Stack>
      </Box>

      <Stack spacing={1.5} alignItems="center">
        <Box
          sx={{
            width: "100%",
            maxWidth: { xs: 270, sm: 310, md: 340 },
            bgcolor: "#fff",
            border: "1px solid",
            borderColor: "divider",
            borderRadius: 1,
            p: { xs: 1.25, sm: 1.5 },
          }}
        >
          {isImage ? (
            <Box
              component="img"
              src={value}
              alt="Código QR para vincular WhatsApp"
              sx={{ display: "block", width: "100%", height: "auto" }}
            />
          ) : (
            <QRCode
              value={value}
              size={310}
              level="M"
              style={{
                display: "block",
                width: "100%",
                height: "auto",
                maxWidth: "310px",
                margin: "0 auto",
              }}
            />
          )}
        </Box>

        <Typography
          sx={{
            maxWidth: 340,
            textAlign: "center",
            fontSize: { xs: 11.5, sm: 12 },
            color: "text.secondary",
            lineHeight: 1.5,
          }}
        >
          El código se actualiza automáticamente mientras esperas la vinculación.
        </Typography>
      </Stack>
    </Box>
  );
}

function QrStep({ number, children, last = false }) {
  return (
    <Box
      sx={{
        position: "relative",
        display: "grid",
        gridTemplateColumns: { xs: "26px minmax(0, 1fr)", sm: "30px minmax(0, 1fr)" },
        columnGap: { xs: 1.1, sm: 1.4 },
        alignItems: "center",
        minHeight: { xs: 32, sm: 40 },
      }}
    >
      {!last ? (
        <Box
          sx={{
            position: "absolute",
            left: { xs: "12.5px", sm: "14.5px" },
            top: { xs: 25, sm: 29 },
            bottom: { xs: -8, sm: -11 },
            width: "1px",
            bgcolor: "#C96A4A",
            opacity: 0.45,
          }}
        />
      ) : null}

      <Box
        sx={{
          width: { xs: 26, sm: 30 },
          height: { xs: 26, sm: 30 },
          borderRadius: "50%",
          display: "grid",
          placeItems: "center",
          bgcolor: "#C96A4A",
          color: "#fff",
          fontSize: { xs: 12, sm: 13 },
          fontWeight: 800,
          zIndex: 1,
          flexShrink: 0,
        }}
      >
        {number}
      </Box>

      <Typography
        sx={{
          fontSize: { xs: 12.5, sm: 14 },
          fontWeight: 600,
          color: "text.primary",
          lineHeight: { xs: 1.3, sm: 1.45 },
        }}
      >
        {children}
      </Typography>
    </Box>
  );
}

function DeleteActions({
  working,
  confirmingDelete,
  onRequestDelete,
  onCancelDelete,
  onDelete,
}) {
  if (!confirmingDelete) {
    return (
      <Box>
        <Button
          variant="outlined"
          color="error"
          startIcon={<LinkOffRoundedIcon />}
          disabled={working}
          onClick={onRequestDelete}
          sx={{
            minWidth: { xs: "100%", sm: 210 },
            height: 44,
            fontWeight: 800,
          }}
        >
          Desvincular WhatsApp
        </Button>
      </Box>
    );
  }

  return (
    <Box
      sx={{
        border: "1px solid",
        borderColor: "error.main",
        borderRadius: 1,
        bgcolor: "background.default",
        p: 1.75,
      }}
    >
      <Stack
        direction={{ xs: "column", md: "row" }}
        spacing={1.5}
        alignItems={{ xs: "stretch", md: "center" }}
        justifyContent="space-between"
      >
        <Box>
          <Typography sx={{ fontSize: 14, fontWeight: 800, color: "text.primary" }}>
            ¿Desvincular esta cuenta?
          </Typography>

          <Typography sx={{ mt: 0.35, fontSize: 12, color: "text.secondary" }}>
            Tendrás que generar y escanear un nuevo código para volver a
            utilizarla.
          </Typography>
        </Box>

        <Stack direction={{ xs: "column", sm: "row" }} spacing={1}>
          <Button
            variant="outlined"
            disabled={working}
            onClick={onCancelDelete}
            sx={{ height: 42, fontWeight: 800 }}
          >
            Cancelar
          </Button>

          <Button
            variant="contained"
            color="error"
            startIcon={
              working ? (
                <CircularProgress size={16} color="inherit" />
              ) : (
                <DeleteOutlineRoundedIcon />
              )
            }
            disabled={working}
            onClick={onDelete}
            sx={{ height: 42, fontWeight: 800 }}
          >
            {working ? "Desvinculando..." : "Sí, desvincular"}
          </Button>
        </Stack>
      </Stack>
    </Box>
  );
}

function InfoItem({ label, value, icon = null }) {
  return (
    <Box sx={{ minWidth: 0 }}>
      <Typography
        sx={{
          fontSize: 11,
          fontWeight: 800,
          color: "text.secondary",
          textTransform: "uppercase",
          letterSpacing: 0.35,
        }}
      >
        {label}
      </Typography>

      <Stack direction="row" spacing={0.75} alignItems="center" sx={{ mt: 0.4 }}>
        {icon ? (
          <Box sx={{ color: "primary.main", display: "grid" }}>
            {icon}
          </Box>
        ) : null}

        <Typography
          sx={{
            minWidth: 0,
            fontSize: 13.5,
            fontWeight: 700,
            color: "text.primary",
            lineHeight: 1.45,
            wordBreak: "break-word",
          }}
        >
          {value}
        </Typography>
      </Stack>
    </Box>
  );
}

const paperSx = {
  p: { xs: 2, sm: 2.5 },
  borderRadius: 1,
  backgroundColor: "background.paper",
  border: "1px solid",
  borderColor: "divider",
  boxShadow: "none",
};