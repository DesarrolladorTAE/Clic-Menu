//src/components/menu/menuSets/manage/imports/MenuSetImportHistory.jsx
import { useEffect, useRef, useState } from "react";

import {
  Box, Button, Chip, CircularProgress, Dialog, DialogActions,
  DialogContent, DialogTitle, Paper, Stack, Table, TableBody,
  TableCell, TableContainer, TableHead, TableRow, Typography,
} from "@mui/material";

import HistoryOutlinedIcon from "@mui/icons-material/HistoryOutlined";
import VisibilityOutlinedIcon from "@mui/icons-material/VisibilityOutlined";
import DescriptionOutlinedIcon from "@mui/icons-material/DescriptionOutlined";

import PaginationFooter from "../../../../common/PaginationFooter";

import {
  getMenuSetImportHistory,
  getMenuSetImportHistoryDetail,
} from "../../../../../services/menu/menuSets/menuSetImport.service";

const panelSx = {
  borderRadius: 1, border: "1px solid", borderColor: "divider",
  bgcolor: "background.paper", boxShadow: "none", overflow: "hidden",
};

const STATUS_LABELS = {
  invalid: { label: "Inválida", color: "error" },
  ready_to_publish: { label: "Pendiente de publicación", color: "warning" },
  published: { label: "Publicada", color: "success" },
  expired: { label: "Vista previa vencida", color: "default" },
  failed: { label: "No completada", color: "error" },
};

const CAPACITY_LABELS = {
  none: "Sin límite", daily: "Diaria", weekly: "Semanal",
};

function formatDate(value) {
  if (!value) return "No informada";
  const date = new Date(`${String(value).slice(0, 10)}T12:00:00Z`);
  if (Number.isNaN(date.getTime())) return "No informada";

  return new Intl.DateTimeFormat("es-MX", {
    day: "numeric", month: "short", year: "numeric", timeZone: "UTC",
  }).format(date);
}

function formatDateTime(value, timezone) {
  if (!value) return "No informada";
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return "No informada";

  try {
    return new Intl.DateTimeFormat("es-MX", {
      day: "numeric", month: "short", year: "numeric",
      hour: "numeric", minute: "2-digit", timeZone: timezone,
    }).format(date);
  } catch {
    return "No informada";
  }
}

function getErrorMessage(error) {
  const data = error?.response?.data;
  const fields = data?.errors && typeof data.errors === "object"
    ? Object.values(data.errors).flat() : [];

  return fields.find((value) => typeof value === "string")
    || data?.message || error?.message || "No se pudo consultar el historial.";
}

function StatusChip({ status }) {
  const state = STATUS_LABELS[status] || { label: "Estado no disponible", color: "default" };

  return <Chip size="small" label={state.label} color={state.color} sx={{ fontWeight: 800 }} />;
}

function DetailRow({ label, value }) {
  return (
    <Box sx={{
      p: 1.5, border: "1px solid", borderColor: "divider",
      borderRadius: 1, bgcolor: "background.default",
    }}>
      <Typography sx={{ fontSize: 12, fontWeight: 800, color: "text.secondary" }}>
        {label}
      </Typography>
      <Typography sx={{
        mt: 0.35, fontSize: 14, color: "text.primary",
        fontWeight: 700, overflowWrap: "anywhere",
      }}>
        {value ?? "No informado"}
      </Typography>
    </Box>
  );
}

export default function MenuSetImportHistory({
  restaurantId,
  branchId,
  menuSet,
  refreshToken = 0,
  onAlert,
}) {
  const menuSetId = menuSet?.id;
  const timezone = menuSet?.branch?.timezone || "America/Mexico_City";

  const [page, setPage] = useState(1);
  const [history, setHistory] = useState(null);
  const [loading, setLoading] = useState(true);
  const [detailOpen, setDetailOpen] = useState(false);
  const [detailLoading, setDetailLoading] = useState(false);
  const [detail, setDetail] = useState(null);

  const detailControllerRef = useRef(null);
  const alertRef = useRef(onAlert);

  useEffect(() => {
    alertRef.current = onAlert;
  }, [onAlert]);

  useEffect(() => {
    setPage(1);
    setHistory(null);
  }, [restaurantId, branchId, menuSetId]);

  useEffect(() => {
    const controller = new AbortController();

    if (!restaurantId || !branchId || !menuSetId) {
      setLoading(false);
      return () => controller.abort();
    }

    const load = async () => {
      setLoading(true);

      try {
        const result = await getMenuSetImportHistory(
          restaurantId, branchId, menuSetId, page, controller.signal
        );

        if (controller.signal.aborted) return;

        setHistory(result);
        const lastPage = Math.max(1, Number(result?.last_page || 1));

        if (page > lastPage) setPage(lastPage);
      } catch (error) {
        if (controller.signal.aborted) return;

        alertRef.current?.({
          severity: "error",
          title: "Historial no disponible",
          message: getErrorMessage(error),
        });
      } finally {
        if (!controller.signal.aborted) setLoading(false);
      }
    };

    load();
    return () => controller.abort();
  }, [restaurantId, branchId, menuSetId, page, refreshToken]);

  useEffect(() => {
    return () => detailControllerRef.current?.abort();
  }, []);

  const openDetail = async (importId) => {
    detailControllerRef.current?.abort();

    const controller = new AbortController();
    detailControllerRef.current = controller;

    setDetail(null);
    setDetailOpen(true);
    setDetailLoading(true);

    try {
      const result = await getMenuSetImportHistoryDetail(
        restaurantId, branchId, menuSetId, importId, controller.signal
      );

      if (!controller.signal.aborted) setDetail(result);
    } catch (error) {
      if (controller.signal.aborted) return;

      alertRef.current?.({
        severity: "error",
        title: "Detalle no disponible",
        message: getErrorMessage(error),
      });
    } finally {
      if (!controller.signal.aborted) setDetailLoading(false);
    }
  };

  const closeDetail = () => {
    detailControllerRef.current?.abort();
    detailControllerRef.current = null;
    setDetailOpen(false);
    setDetail(null);
    setDetailLoading(false);
  };

  const rows = Array.isArray(history?.data) ? history.data : [];
  const total = Number(history?.total || 0);
  const totalPages = Math.max(1, Number(history?.last_page || 1));

  return (
    <>
      <Paper sx={panelSx}>
        <Box sx={{ p: { xs: 2, sm: 2.5 }, borderBottom: "1px solid", borderColor: "divider" }}>
          <Stack direction="row" spacing={1.5} alignItems="center">
            <Box sx={{
              width: 44, height: 44, borderRadius: 1,
              display: "grid", placeItems: "center", flexShrink: 0,
              bgcolor: "rgba(214, 122, 58, 0.12)", color: "secondary.main",
            }}>
              <HistoryOutlinedIcon />
            </Box>

            <Box sx={{ minWidth: 0, flex: 1 }}>
              <Typography sx={{ fontSize: 20, fontWeight: 800, color: "text.primary" }}>
                Historial de importaciones
              </Typography>

              <Typography sx={{ mt: 0.4, fontSize: 13, color: "text.secondary" }}>
                Consulta los archivos revisados, sus estados y el resultado de cada intento registrado.
              </Typography>
            </Box>

            {loading && history ? <CircularProgress size={18} /> : null}
          </Stack>
        </Box>

        {loading && !history ? (
          <Stack alignItems="center" spacing={1.5} sx={{ py: 5 }}>
            <CircularProgress size={28} />
            <Typography sx={{ fontSize: 13, color: "text.secondary" }}>
              Consultando importaciones…
            </Typography>
          </Stack>
        ) : rows.length === 0 ? (
          <Box sx={{ p: 4, textAlign: "center" }}>
            <DescriptionOutlinedIcon sx={{ fontSize: 36, color: "text.secondary" }} />
            <Typography sx={{ mt: 1, fontSize: 16, fontWeight: 800 }}>
              Sin importaciones registradas
            </Typography>
            <Typography sx={{ mt: 0.5, fontSize: 13, color: "text.secondary" }}>
              Los intentos de importación registrados aparecerán en esta sección.
            </Typography>
          </Box>
        ) : (
          <>
            <TableContainer sx={{ display: { xs: "none", md: "block" }, overflowX: "auto" }}>
              <Table sx={{ minWidth: 850 }}>
                <TableHead>
                  <TableRow sx={{
                    "& th": {
                      bgcolor: "primary.main", color: "#fff",
                      fontSize: 13, fontWeight: 800, borderBottom: "none",
                    },
                  }}>
                    <TableCell>Archivo</TableCell>
                    <TableCell>Periodo comercial</TableCell>
                    <TableCell>Filas válidas</TableCell>
                    <TableCell>Estado</TableCell>
                    <TableCell align="right">Acciones</TableCell>
                  </TableRow>
                </TableHead>

                <TableBody>
                  {rows.map((item) => (
                    <TableRow key={item.id} hover sx={{
                      "& td": { fontSize: 13, borderColor: "divider", verticalAlign: "middle" },
                    }}>
                      <TableCell sx={{ maxWidth: 240, overflowWrap: "anywhere", fontWeight: 800 }}>
                        {item.original_filename || "Archivo sin nombre"}
                      </TableCell>
                      <TableCell>
                        {formatDate(item.target_week_start)} al {formatDate(item.target_week_end)}
                      </TableCell>
                      <TableCell>
                        {item.rows_valid ?? 0} de {item.rows_processed ?? 0}
                      </TableCell>
                      <TableCell><StatusChip status={item.status} /></TableCell>
                      <TableCell align="right">
                        <Button
                          size="small"
                          variant="outlined"
                          startIcon={<VisibilityOutlinedIcon />}
                          onClick={() => openDetail(item.id)}
                        >
                          Ver detalle
                        </Button>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </TableContainer>

            <Box sx={{
              display: { xs: "grid", md: "none" },
              gridTemplateColumns: { xs: "1fr", sm: "repeat(2, minmax(0, 1fr))" },
              gridAutoRows: "1fr", gap: 1.5, p: 2,
            }}>
              {rows.map((item) => (
                <Paper key={item.id} sx={{
                  p: 2, height: "100%", minWidth: 0,
                  border: "1px solid", borderColor: "divider",
                  borderRadius: 1, boxShadow: "none",
                }}>
                  <Stack spacing={1.5} sx={{ height: "100%" }}>
                    <Box>
                      <Typography sx={{
                        fontSize: 15, fontWeight: 800,
                        color: "text.primary", overflowWrap: "anywhere",
                      }}>
                        {item.original_filename || "Archivo sin nombre"}
                      </Typography>
                      <Typography sx={{ mt: 0.5, fontSize: 13, color: "text.secondary" }}>
                        {formatDate(item.target_week_start)} al {formatDate(item.target_week_end)}
                      </Typography>
                    </Box>

                    <Box><StatusChip status={item.status} /></Box>

                    <Typography sx={{ fontSize: 13, color: "text.secondary" }}>
                      Filas válidas: {item.rows_valid ?? 0} de {item.rows_processed ?? 0}
                    </Typography>

                    <Box sx={{ flex: 1 }} />

                    <Button
                      fullWidth
                      variant="outlined"
                      startIcon={<VisibilityOutlinedIcon />}
                      onClick={() => openDetail(item.id)}
                    >
                      Ver detalle
                    </Button>
                  </Stack>
                </Paper>
              ))}
            </Box>

            <PaginationFooter
              page={Number(history?.current_page || page)}
              totalPages={totalPages}
              startItem={Number(history?.from || 0)}
              endItem={Number(history?.to || 0)}
              total={total}
              hasPrev={page > 1}
              hasNext={page < totalPages}
              onPrev={() => setPage((current) => Math.max(1, current - 1))}
              onNext={() => setPage((current) => Math.min(totalPages, current + 1))}
              itemLabel="importaciones"
            />
          </>
        )}
      </Paper>

      <Dialog
        open={detailOpen}
        onClose={closeDetail}
        fullWidth
        maxWidth="sm"
        PaperProps={{ sx: { borderRadius: 1 } }}
      >
        <DialogTitle sx={{ fontSize: 20, fontWeight: 800 }}>
          Detalle de importación
        </DialogTitle>

        <DialogContent>
          {detailLoading ? (
            <Stack alignItems="center" spacing={1.5} sx={{ py: 4 }}>
              <CircularProgress />
              <Typography sx={{ fontSize: 13, color: "text.secondary" }}>
                Consultando información…
              </Typography>
            </Stack>
          ) : detail?.import ? (
            <Stack spacing={1.5} sx={{ pt: 1 }}>
              <Box><StatusChip status={detail.import.status} /></Box>

              <DetailRow label="Archivo" value={detail.import.original_filename} />

              <DetailRow
                label="Periodo comercial"
                value={`${formatDate(detail.import.target_week_start)} al ${formatDate(detail.import.target_week_end)}`}
              />

              <DetailRow
                label="Fecha de importación"
                value={formatDateTime(detail.import.created_at, timezone)}
              />

              <DetailRow label="Realizada por" value={detail.import.uploader?.name || "No informado"} />

              <DetailRow
                label="Filas revisadas y válidas"
                value={`${detail.import.rows_processed ?? 0} revisadas · ${detail.import.rows_valid ?? 0} válidas`}
              />

              <DetailRow
                label="Errores y advertencias"
                value={`${detail.import.error_count ?? 0} errores · ${detail.import.warning_count ?? 0} advertencias`}
              />

              <DetailRow
                label="Revisión base"
                value={detail.import.base_revision != null
                  ? `Revisión ${detail.import.base_revision}` : "Sin publicación anterior del periodo"}
              />

              {detail.import.publication ? (
                <>
                  <DetailRow
                    label="Revisión publicada"
                    value={`Revisión ${detail.import.publication.revision}`}
                  />
                  <DetailRow
                    label="Capacidad publicada"
                    value={CAPACITY_LABELS[detail.import.publication.capacity_mode_snapshot] || "No informada"}
                  />
                  <DetailRow
                    label="Fecha de publicación"
                    value={formatDateTime(detail.import.publication.published_at, timezone)}
                  />
                </>
              ) : null}

              {detail.already_current ? (
                <Box sx={{
                  p: 1.75, borderRadius: 1,
                  border: "1px solid", borderColor: "divider",
                  bgcolor: "background.default",
                }}>
                  <Typography sx={{ fontSize: 13, color: "text.secondary", lineHeight: 1.55 }}>
                    La programación ya era idéntica a la publicada para este periodo.
                    El intento se completó sin generar una revisión adicional.
                  </Typography>
                </Box>
              ) : null}
            </Stack>
          ) : (
            <Typography sx={{ py: 2, fontSize: 14, color: "text.secondary" }}>
              No fue posible obtener el detalle de esta importación.
            </Typography>
          )}
        </DialogContent>

        <DialogActions sx={{ p: 2 }}>
          <Button variant="outlined" onClick={closeDetail}>
            Cerrar
          </Button>
        </DialogActions>
      </Dialog>
    </>
  );
}