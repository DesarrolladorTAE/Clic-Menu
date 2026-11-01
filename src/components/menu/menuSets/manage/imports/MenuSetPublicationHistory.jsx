//src/components/menu/menuSets/manage/imports/MenuSetPublicationHistory.jsx
import { useEffect, useRef, useState } from "react";

import {
  Box, Chip, CircularProgress, Paper, Stack, Table,
  TableBody, TableCell, TableContainer, TableHead,
  TableRow, Typography,
} from "@mui/material";

import HistoryEduOutlinedIcon from "@mui/icons-material/HistoryEduOutlined";
import EventNoteOutlinedIcon from "@mui/icons-material/EventNoteOutlined";

import PaginationFooter from "../../../../common/PaginationFooter";

import {
  getMenuSetPublicationHistory,
} from "../../../../../services/menu/menuSets/menuSetImport.service";

const panelSx = {
  borderRadius: 1, border: "1px solid",
  borderColor: "divider", bgcolor: "background.paper",
  boxShadow: "none", overflow: "hidden",
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
    || data?.message || error?.message || "No se pudieron consultar las publicaciones.";
}

function CycleChip({ current }) {
  return (
    <Chip
      size="small"
      label={current ? "Ciclo actual" : "Ciclo anterior"}
      color={current ? "primary" : "default"}
      variant="outlined"
      sx={{ fontWeight: 800 }}
    />
  );
}

export default function MenuSetPublicationHistory({
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
        const result = await getMenuSetPublicationHistory(
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
          title: "Publicaciones no disponibles",
          message: getErrorMessage(error),
        });
      } finally {
        if (!controller.signal.aborted) setLoading(false);
      }
    };

    load();
    return () => controller.abort();
  }, [restaurantId, branchId, menuSetId, page, refreshToken]);

  const rows = Array.isArray(history?.data) ? history.data : [];
  const totalPages = Math.max(1, Number(history?.last_page || 1));
  const total = Number(history?.total || 0);

  return (
    <Paper sx={panelSx}>
      <Box sx={{ p: { xs: 2, sm: 2.5 }, borderBottom: "1px solid", borderColor: "divider" }}>
        <Stack direction="row" spacing={1.5} alignItems="center">
          <Box sx={{
            width: 44, height: 44, borderRadius: 1,
            display: "grid", placeItems: "center", flexShrink: 0,
            bgcolor: "rgba(214, 122, 58, 0.12)", color: "secondary.main",
          }}>
            <HistoryEduOutlinedIcon />
          </Box>

          <Box sx={{ minWidth: 0, flex: 1 }}>
            <Typography sx={{ fontSize: 20, fontWeight: 800, color: "text.primary" }}>
              Historial de publicaciones
            </Typography>

            <Typography sx={{
              mt: 0.4, fontSize: 13, color: "text.secondary", lineHeight: 1.55,
            }}>
              Consulta las revisiones registradas, incluidas las pertenecientes a ciclos
              administrativos anteriores.
            </Typography>
          </Box>

          {loading && history ? <CircularProgress size={18} /> : null}
        </Stack>
      </Box>

      {loading && !history ? (
        <Stack alignItems="center" spacing={1.5} sx={{ py: 5 }}>
          <CircularProgress size={28} />
          <Typography sx={{ fontSize: 13, color: "text.secondary" }}>
            Consultando publicaciones…
          </Typography>
        </Stack>
      ) : rows.length === 0 ? (
        <Box sx={{ p: 4, textAlign: "center" }}>
          <EventNoteOutlinedIcon sx={{ fontSize: 36, color: "text.secondary" }} />
          <Typography sx={{ mt: 1, fontSize: 16, fontWeight: 800 }}>
            Sin publicaciones registradas
          </Typography>
          <Typography sx={{ mt: 0.5, fontSize: 13, color: "text.secondary" }}>
            Las revisiones publicadas aparecerán aquí.
          </Typography>
        </Box>
      ) : (
        <>
          {/* Tabla para computadoras */}
          <TableContainer sx={{ display: { xs: "none", md: "block" }, overflowX: "auto" }}>
            <Table sx={{ minWidth: 830 }}>
              <TableHead>
                <TableRow sx={{
                  "& th": {
                    bgcolor: "primary.main", color: "#fff",
                    fontSize: 13, fontWeight: 800, borderBottom: "none",
                  },
                }}>
                  <TableCell>Periodo comercial</TableCell>
                  <TableCell>Revisión</TableCell>
                  <TableCell>Capacidad</TableCell>
                  <TableCell>Fecha de publicación</TableCell>
                  <TableCell>Ciclo administrativo</TableCell>
                </TableRow>
              </TableHead>

              <TableBody>
                {rows.map((item) => (
                  <TableRow key={item.id} hover sx={{
                    "& td": {
                      fontSize: 13, color: "text.primary",
                      borderColor: "divider", verticalAlign: "middle",
                    },
                  }}>
                    <TableCell sx={{ fontWeight: 800 }}>
                      {formatDate(item.target_week_start)} al {formatDate(item.target_week_end)}
                    </TableCell>
                    <TableCell>
                      <Chip
                        label={`Revisión ${item.revision}`}
                        size="small"
                        variant="outlined"
                        color="primary"
                        sx={{ fontWeight: 800 }}
                      />
                    </TableCell>
                    <TableCell>{CAPACITY_LABELS[item.capacity_mode] || "No informada"}</TableCell>
                    <TableCell>{formatDateTime(item.published_at, timezone)}</TableCell>
                    <TableCell>
                      <CycleChip current={item.is_current_management_cycle === true} />
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </TableContainer>

          {/* Tarjetas para teléfonos y tabletas */}
          <Box sx={{
            display: { xs: "grid", md: "none" },
            gridTemplateColumns: { xs: "1fr", sm: "repeat(2, minmax(0, 1fr))" },
            gridAutoRows: "1fr", gap: 1.5, p: 2,
          }}>
            {rows.map((item) => (
              <Paper key={item.id} sx={{
                p: 2, minWidth: 0, height: "100%",
                border: "1px solid", borderColor: "divider",
                borderRadius: 1, boxShadow: "none",
              }}>
                <Stack spacing={1.5} sx={{ height: "100%" }}>
                  <Stack
                    direction="row"
                    justifyContent="space-between"
                    alignItems="flex-start"
                    spacing={1}
                    flexWrap="wrap"
                  >
                    <Typography sx={{ fontSize: 15, fontWeight: 800 }}>
                      Revisión {item.revision}
                    </Typography>
                    <CycleChip current={item.is_current_management_cycle === true} />
                  </Stack>

                  <Box>
                    <Typography sx={{ fontSize: 12, fontWeight: 800, color: "text.secondary" }}>
                      Periodo comercial
                    </Typography>
                    <Typography sx={{ mt: 0.4, fontSize: 14, fontWeight: 800 }}>
                      {formatDate(item.target_week_start)} al {formatDate(item.target_week_end)}
                    </Typography>
                  </Box>

                  <Box>
                    <Typography sx={{ fontSize: 12, fontWeight: 800, color: "text.secondary" }}>
                      Modalidad de capacidad
                    </Typography>
                    <Typography sx={{ mt: 0.4, fontSize: 13 }}>
                      {CAPACITY_LABELS[item.capacity_mode] || "No informada"}
                    </Typography>
                  </Box>

                  <Box sx={{ flex: 1 }} />

                  <Box>
                    <Typography sx={{ fontSize: 12, fontWeight: 800, color: "text.secondary" }}>
                      Fecha de publicación
                    </Typography>
                    <Typography sx={{ mt: 0.4, fontSize: 13 }}>
                      {formatDateTime(item.published_at, timezone)}
                    </Typography>
                  </Box>
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
            itemLabel="publicaciones"
          />
        </>
      )}
    </Paper>
  );
}