//src/components/menu/menuSets/manage/imports/MenuSetImportPublish.jsx
import { useEffect, useRef, useState } from "react";

import {
  Box, Button, Chip, CircularProgress, Dialog, DialogActions,
  DialogContent, DialogTitle, Paper, Stack, Typography,
} from "@mui/material";

import PublishOutlinedIcon from "@mui/icons-material/PublishOutlined";
import TaskAltOutlinedIcon from "@mui/icons-material/TaskAltOutlined";
import InfoOutlinedIcon from "@mui/icons-material/InfoOutlined";
import AccessTimeOutlinedIcon from "@mui/icons-material/AccessTimeOutlined";

import {
  publishMenuSetImport,
} from "../../../../../services/menu/menuSets/menuSetImport.service";

const panelSx = {
  p: { xs: 2, sm: 2.5 },
  borderRadius: 1,
  border: "1px solid",
  borderColor: "divider",
  bgcolor: "background.paper",
  boxShadow: "none",
};

const CAPACITY_LABELS = {
  none: "Sin límite",
  daily: "Diaria",
  weekly: "Semanal",
};

function formatDate(value) {
  if (!value) return "No informada";

  const date = new Date(`${String(value).slice(0, 10)}T12:00:00Z`);
  if (Number.isNaN(date.getTime())) return "No informada";

  return new Intl.DateTimeFormat("es-MX", {
    day: "numeric", month: "long", year: "numeric", timeZone: "UTC",
  }).format(date);
}

function getErrorMessage(error) {
  const data = error?.response?.data;
  const fields = data?.errors && typeof data.errors === "object"
    ? Object.values(data.errors).flat()
    : [];

  return fields.find((message) => typeof message === "string")
    || data?.message || error?.message
    || "No fue posible publicar la programación.";
}

function getErrorTitle(code) {
  const titles = {
    IMPORT_PREVIEW_EXPIRED: "Vista previa vencida",
    PUBLICATION_CHANGED: "La programación cambió",
    MENU_SET_CAPACITY_BELOW_COMMITTED: "Capacidad comprometida",
    MENU_SET_ACTIVE_OPERATION_CONFLICT: "Existen operaciones activas",
    MENU_SET_PUBLICATION_BLOCKED: "Publicación no disponible",
  };

  return titles[code] || "No se pudo publicar";
}

export default function MenuSetImportPublish({
  restaurantId,
  branchId,
  menuSet,
  review,
  publicationResult = null,
  onPublished,
  onInvalid,
  onPublishingChange,
  onAlert,
}) {
  const [confirmOpen, setConfirmOpen] = useState(false);
  const [publishing, setPublishing] = useState(false);
  const [now, setNow] = useState(() => Date.now());

  const publishingRef = useRef(false);
  const requestRef = useRef(null);

  const data = review?.type === "ready" ? review.data : null;
  const expiresAt = data?.preview_expires_at
    ? new Date(data.preview_expires_at).getTime() : NaN;

  const expired = Number.isFinite(expiresAt) && now >= expiresAt;
  const ready = Boolean(
    data?.import_id && data?.publish_allowed === true
    && data?.status === "ready_to_publish" && !expired
  );

  useEffect(() => {
    if (!data?.preview_expires_at) return undefined;

    const timer = window.setInterval(() => setNow(Date.now()), 15000);
    return () => window.clearInterval(timer);
  }, [data?.preview_expires_at]);

  useEffect(() => {
    setNow(Date.now());
    setConfirmOpen(false);
  }, [data?.import_id]);

  useEffect(() => {
    return () => requestRef.current?.abort();
  }, []);

  const handlePublish = async () => {
    if (!ready || publishingRef.current || !restaurantId || !branchId || !menuSet?.id) return;

    const controller = new AbortController();
    requestRef.current = controller;
    publishingRef.current = true;

    setConfirmOpen(false);
    setPublishing(true);
    onPublishingChange?.(true);

    try {
      const response = await publishMenuSetImport(
        restaurantId, branchId, menuSet.id, data.import_id, controller.signal
      );

      if (controller.signal.aborted) return;

      if (response?.ok !== true || !response?.data?.publication_id) {
        throw new Error("No se recibió la confirmación de la publicación.");
      }

      onPublished?.(response.data, response.message);
    } catch (error) {
      if (controller.signal.aborted) return;

      const code = error?.response?.data?.code || "";
      const message = getErrorMessage(error);
      const invalidReview = error?.response?.status === 409
        || error?.response?.status === 422;

      if (invalidReview) {
        onInvalid?.({
          type: "conflict",
          title: getErrorTitle(code),
          filename: review?.filename,
          issues: [message],
        });
      } else {
        onAlert?.({
          severity: "error",
          title: getErrorTitle(code),
          message,
        });
      }
    } finally {
      publishingRef.current = false;
      requestRef.current = null;
      setPublishing(false);
      onPublishingChange?.(false);
    }
  };

  if (publicationResult) {
    const created = publicationResult.created === true;

    return (
      <Paper sx={panelSx}>
        <Stack spacing={2}>
          <Stack
            direction={{ xs: "column", sm: "row" }}
            alignItems={{ xs: "flex-start", sm: "center" }}
            justifyContent="space-between"
            spacing={1.5}
          >
            <Stack direction="row" spacing={1.5} alignItems="center">
              <Box sx={{
                width: 44, height: 44, borderRadius: 1,
                display: "grid", placeItems: "center", flexShrink: 0,
                bgcolor: "rgba(76, 175, 80, 0.10)", color: "success.main",
              }}>
                <TaskAltOutlinedIcon />
              </Box>

              <Box>
                <Typography sx={{ fontSize: 20, fontWeight: 800, color: "text.primary" }}>
                  {created ? "Programación publicada" : "Programación ya publicada"}
                </Typography>

                <Typography sx={{ mt: 0.4, fontSize: 13, color: "text.secondary" }}>
                  {created
                    ? "La nueva revisión quedó registrada para el periodo seleccionado."
                    : "El periodo ya tenía exactamente esta programación. Se conservó la revisión existente."}
                </Typography>
              </Box>
            </Stack>

            <Chip
              size="small"
              color="success"
              label={created ? "Nueva publicación" : "Sin revisión adicional"}
              sx={{ fontWeight: 800 }}
            />
          </Stack>

          <Box sx={{
            display: "grid",
            gridTemplateColumns: { xs: "1fr", sm: "repeat(3, minmax(0, 1fr))" },
            gridAutoRows: "1fr", gap: 1.5,
          }}>
            {[
              {
                label: "Periodo comercial",
                value: `${formatDate(publicationResult.target_week_start)} al ${formatDate(publicationResult.target_week_end)}`,
              },
              { label: "Revisión publicada", value: `Revisión ${publicationResult.revision}` },
              {
                label: "Modalidad de capacidad",
                value: CAPACITY_LABELS[publicationResult.capacity_mode] || "No informada",
              },
            ].map((item) => (
              <Box key={item.label} sx={{
                p: 1.75, border: "1px solid", borderColor: "divider",
                borderRadius: 1, bgcolor: "background.default", height: "100%",
              }}>
                <Typography sx={{ fontSize: 12, fontWeight: 800, color: "text.secondary" }}>
                  {item.label}
                </Typography>
                <Typography sx={{
                  mt: 0.5, fontSize: 15, fontWeight: 800,
                  color: "text.primary", overflowWrap: "anywhere",
                }}>
                  {item.value}
                </Typography>
              </Box>
            ))}
          </Box>
        </Stack>
      </Paper>
    );
  }

  if (!data) return null;

  return (
    <>
      <Paper sx={panelSx}>
        <Stack spacing={2}>
          <Stack direction="row" spacing={1.5} alignItems="flex-start">
            <Box sx={{
              width: 44, height: 44, borderRadius: 1,
              display: "grid", placeItems: "center", flexShrink: 0,
              bgcolor: "rgba(214, 122, 58, 0.12)", color: "secondary.main",
            }}>
              {expired ? <AccessTimeOutlinedIcon /> : <PublishOutlinedIcon />}
            </Box>

            <Box sx={{ minWidth: 0 }}>
              <Typography sx={{ fontSize: 20, fontWeight: 800, color: "text.primary" }}>
                Publicar programación
              </Typography>

              <Typography sx={{
                mt: 0.4, fontSize: 13, color: "text.secondary", lineHeight: 1.55,
              }}>
                {expired
                  ? "La vista previa venció. Revisa nuevamente el archivo para continuar."
                  : "Confirma la programación revisada para registrarla en el periodo comercial seleccionado."}
              </Typography>
            </Box>
          </Stack>

          <Stack direction="row" spacing={1.25} alignItems="flex-start">
            <InfoOutlinedIcon sx={{ fontSize: 20, color: "primary.main", flexShrink: 0 }} />
            <Typography sx={{ fontSize: 13, color: "text.secondary", lineHeight: 1.55 }}>
              La publicación conservará las revisiones anteriores. Antes de guardar,
              se comprobarán nuevamente las operaciones activas y las capacidades comprometidas.
            </Typography>
          </Stack>

          <Stack direction={{ xs: "column", sm: "row" }} justifyContent="flex-end">
            <Button
              type="button"
              variant="contained"
              disabled={!ready || publishing}
              startIcon={publishing
                ? <CircularProgress size={18} color="inherit" />
                : <PublishOutlinedIcon />}
              onClick={() => setConfirmOpen(true)}
              sx={{ minWidth: { xs: "100%", sm: 215 }, height: 44, fontWeight: 800 }}
            >
              {publishing ? "Publicando…" : "Publicar programación"}
            </Button>
          </Stack>
        </Stack>
      </Paper>

      <Dialog
        open={confirmOpen}
        onClose={publishing ? undefined : () => setConfirmOpen(false)}
        fullWidth
        maxWidth="sm"
        PaperProps={{ sx: { borderRadius: 1 } }}
      >
        <DialogTitle sx={{ fontSize: 20, fontWeight: 800 }}>
          Confirmar publicación
        </DialogTitle>

        <DialogContent>
          <Stack spacing={1.5}>
            <Typography sx={{ fontSize: 14, lineHeight: 1.6 }}>
              Se registrará la programación revisada para el siguiente periodo:
            </Typography>

            <Box sx={{
              p: 1.75, border: "1px solid", borderColor: "divider",
              borderRadius: 1, bgcolor: "background.default",
            }}>
              <Typography sx={{ fontSize: 14, fontWeight: 800 }}>
                {formatDate(data.target_week_start)} al {formatDate(data.target_week_end)}
              </Typography>

              <Typography sx={{ mt: 0.5, fontSize: 13, color: "text.secondary" }}>
                Capacidad: {CAPACITY_LABELS[data.capacity_mode] || "No informada"}
              </Typography>
            </Box>

            <Typography sx={{ fontSize: 13, color: "text.secondary", lineHeight: 1.55 }}>
              No se enviará nuevamente el archivo. Se utilizará exclusivamente
              la programación que ya fue validada.
            </Typography>
          </Stack>
        </DialogContent>

        <DialogActions sx={{ p: 2, gap: 1 }}>
          <Button
            variant="outlined"
            color="inherit"
            disabled={publishing}
            onClick={() => setConfirmOpen(false)}
          >
            Cancelar
          </Button>

          <Button
            variant="contained"
            disabled={!ready || publishing}
            onClick={handlePublish}
            startIcon={publishing
              ? <CircularProgress size={18} color="inherit" />
              : <PublishOutlinedIcon />}
          >
            Confirmar publicación
          </Button>
        </DialogActions>
      </Dialog>
    </>
  );
}