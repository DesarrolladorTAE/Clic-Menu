//src/components/menu/menuSets/dashboard/reminders/ReminderHistory.jsx
import { useEffect, useState } from "react";
import {
  Box, Button, Chip, CircularProgress, LinearProgress, MenuItem, Paper,
  Stack, Table, TableBody, TableCell, TableContainer, TableHead,
  TableRow, TextField, Typography,
} from "@mui/material";

import HistoryOutlinedIcon from "@mui/icons-material/HistoryOutlined";
import ExpandMoreOutlinedIcon from "@mui/icons-material/ExpandMoreOutlined";
import ExpandLessOutlinedIcon from "@mui/icons-material/ExpandLessOutlined";

import PaginationFooter from "../../../../common/PaginationFooter";
import { getOwnerReminderHistory } from "../../../../../services/menu/menuSets/dashboard/ownerReminders.service";

const panelSx = {
  p: { xs: 2, sm: 2.5 }, border: "1px solid",
  borderColor: "divider", borderRadius: 1,
  bgcolor: "background.paper", boxShadow: "none",
};

const types = {
  one_day_before: "Un día antes",
  deadline: "Hora límite",
  one_day_after: "Un día después",
};

function formatDate(value) {
  if (!/^\d{4}-\d{2}-\d{2}/.test(String(value || ""))) return "—";
  const [year, month, day] = String(value).slice(0, 10).split("-");
  return `${day}/${month}/${year}`;
}

function formatDateTime(value, timezone) {
  if (!value) return "—";
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return "—";

  try {
    return new Intl.DateTimeFormat("es-MX", {
      timeZone: timezone || "America/Mexico_City",
      day: "2-digit", month: "2-digit", year: "numeric",
      hour: "2-digit", minute: "2-digit", hour12: false,
    }).format(date);
  } catch {
    return "—";
  }
}

function getErrorMessage(error) {
  const data = error?.response?.data;
  const errors = data?.errors && typeof data.errors === "object"
    ? Object.values(data.errors).flat() : [];

  return errors.find((value) => typeof value === "string")
    || data?.message || error?.message || "No fue posible consultar el historial de avisos.";
}

function channelLabel(row) {
  if (row.channel === "chatingboot") return "WhatsApp QR";
  if (row.channel === "whasapo" && row.whasapo_mode === "custom") return "WhatsApp personalizado";
  if (row.channel === "whasapo") return "WhatsApp del sistema";
  return "No informado";
}

function ReminderStatus({ row }) {
  const unknown = row.status === "processing"
    && row.error_code === "DELIVERY_RESULT_UNKNOWN";

  const states = {
    sent: { label: "Aceptado por proveedor", color: "success" },
    failed: { label: "Fallido", color: "error" },
    processing: { label: "En proceso", color: "warning" },
  };

  const state = unknown
    ? { label: "Resultado sin confirmar", color: "warning" }
    : states[row.status] || { label: "No informado", color: "default" };

  return <Chip size="small" label={state.label} color={state.color} />;
}

function HistoryDetail({ reminder, onClose }) {
  const [itemsPage, setItemsPage] = useState(1);
  const items = Array.isArray(reminder.menu_sets) ? reminder.menu_sets : [];
  const totalPages = Math.max(1, Math.ceil(items.length / 5));
  const page = Math.min(itemsPage, totalPages);
  const visibleItems = items.slice((page - 1) * 5, page * 5);

  const fields = [
    ["Tipo de aviso", types[reminder.reminder_type] || "No informado"],
    ["Estado", reminder.status === "sent" ? "Aceptado por proveedor"
      : reminder.status === "failed" ? "Fallido"
      : reminder.error_code === "DELIVERY_RESULT_UNKNOWN" ? "Resultado sin confirmar" : "En proceso"],
    ["Destinatario", reminder.recipient_phone || "Sin teléfono registrado"],
    ["Canal utilizado", channelLabel(reminder)],
    ["Periodo comercial", `${formatDate(reminder.target_week_start)} al ${formatDate(reminder.target_week_end)}`],
    ["Fecha límite", formatDateTime(reminder.deadline_at, reminder.timezone)],
    ["Programado para", formatDateTime(reminder.scheduled_at, reminder.timezone)],
    ["Intentado el", formatDateTime(reminder.attempted_at, reminder.timezone)],
    ["Aceptado el", formatDateTime(reminder.sent_at, reminder.timezone)],
    ["Conjuntos incluidos", reminder.total_menu_sets ?? items.length],
  ];

  return (
    <Paper sx={panelSx}>
      <Stack spacing={2}>
        <Stack direction={{ xs: "column", sm: "row" }}
          alignItems={{ sm: "center" }} justifyContent="space-between" spacing={1.5}>
          <Box>
            <Typography sx={{ fontSize: 18, fontWeight: 800 }}>
              Detalle del aviso
            </Typography>
            <Typography sx={{ mt: 0.4, fontSize: 12.5, color: "text.secondary" }}>
              {reminder.branch_name} · {types[reminder.reminder_type] || "Aviso"}
            </Typography>
          </Box>

          <Button variant="outlined" startIcon={<ExpandLessOutlinedIcon />} onClick={onClose}>
            Cerrar detalle
          </Button>
        </Stack>

        <Box><ReminderStatus row={reminder} /></Box>

        <Box sx={{
          display: "grid", gridTemplateColumns: {
            xs: "repeat(2, minmax(0, 1fr))",
            md: "repeat(3, minmax(0, 1fr))",
            lg: "repeat(4, minmax(0, 1fr))",
          }, gap: 1.5,
        }}>
          {fields.map(([label, value]) => (
            <Box key={label} sx={{
              p: 1.5, minHeight: 78, height: "100%",
              border: "1px solid", borderColor: "divider",
              borderRadius: 1, bgcolor: "background.default",
            }}>
              <Typography sx={{ fontSize: 11.5, color: "text.secondary" }}>{label}</Typography>
              <Typography sx={{
                mt: 0.5, fontSize: 12.5, fontWeight: 800,
                overflowWrap: "anywhere",
              }}>
                {value}
              </Typography>
            </Box>
          ))}
        </Box>

        <Box sx={{
          p: 1.5, border: "1px solid", borderColor: "divider",
          borderRadius: 1, bgcolor: "background.default",
        }}>
          <Typography sx={{ fontSize: 12, fontWeight: 800 }}>Resultado registrado</Typography>
          <Typography sx={{ mt: 0.6, fontSize: 13, lineHeight: 1.6 }}>
            {reminder.result_message || "No se recibió una descripción del resultado."}
          </Typography>
        </Box>

        {reminder.fallback_used || reminder.reconnect_required ? (
          <Stack direction="row" flexWrap="wrap" gap={0.75}>
            {reminder.fallback_used ? (
              <Chip size="small" variant="outlined" color="info"
                label="Se utilizó un canal alternativo" />
            ) : null}
            {reminder.reconnect_required ? (
              <Chip size="small" variant="outlined" color="warning"
                label="La conexión requiere revisión" />
            ) : null}
          </Stack>
        ) : null}

        <Box>
          <Typography sx={{ fontSize: 16, fontWeight: 800 }}>Conjuntos incluidos</Typography>
          <Typography sx={{ mt: 0.4, fontSize: 12.5, color: "text.secondary" }}>
            Se conservan los nombres registrados al generar el aviso.
          </Typography>
        </Box>

        {items.length === 0 ? (
          <Typography sx={{ fontSize: 13, color: "text.secondary" }}>
            No se encontraron Conjuntos asociados a este aviso.
          </Typography>
        ) : (
          <>
            <TableContainer sx={{ display: { xs: "none", md: "block" } }}>
              <Table size="small">
                <TableHead>
                  <TableRow sx={{ bgcolor: "action.hover" }}>
                    {["Conjunto", "Periodo comercial", "Tipo de aviso"].map((label) => (
                      <TableCell key={label} sx={{ fontSize: 12, fontWeight: 800 }}>
                        {label}
                      </TableCell>
                    ))}
                  </TableRow>
                </TableHead>
                <TableBody>
                  {visibleItems.map((item, index) => (
                    <TableRow key={`${item.menu_set_id_snapshot}-${index}`}>
                      <TableCell sx={{ fontSize: 12.5, fontWeight: 800 }}>
                        {item.menu_set_name_snapshot}
                      </TableCell>
                      <TableCell sx={{ fontSize: 12.5 }}>
                        {formatDate(item.target_week_start)}
                      </TableCell>
                      <TableCell sx={{ fontSize: 12.5 }}>
                        {types[item.reminder_type] || "—"}
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </TableContainer>

            <Box sx={{
              display: { xs: "grid", md: "none" },
              gridTemplateColumns: { xs: "1fr", sm: "repeat(2, minmax(0, 1fr))" },
              gap: 1.5,
            }}>
              {visibleItems.map((item, index) => (
                <Box key={`${item.menu_set_id_snapshot}-${index}`} sx={{
                  p: 1.5, minHeight: 105, height: "100%",
                  border: "1px solid", borderColor: "divider",
                  borderRadius: 1, bgcolor: "background.default",
                }}>
                  <Stack spacing={0.6}>
                    <Typography sx={{ fontSize: 13, fontWeight: 800 }}>
                      {item.menu_set_name_snapshot}
                    </Typography>
                    <Typography sx={{ fontSize: 12, color: "text.secondary" }}>
                      Periodo: {formatDate(item.target_week_start)}
                    </Typography>
                    <Typography sx={{ fontSize: 12, color: "text.secondary" }}>
                      {types[item.reminder_type] || "Aviso"}
                    </Typography>
                  </Stack>
                </Box>
              ))}
            </Box>

            <Box sx={{ borderTop: "1px solid", borderColor: "divider" }}>
              <PaginationFooter
                page={page}
                totalPages={totalPages}
                startItem={(page - 1) * 5 + 1}
                endItem={Math.min(page * 5, items.length)}
                total={items.length}
                hasPrev={page > 1}
                hasNext={page < totalPages}
                onPrev={() => setItemsPage(Math.max(1, page - 1))}
                onNext={() => setItemsPage(Math.min(totalPages, page + 1))}
                itemLabel="conjuntos"
              />
            </Box>
          </>
        )}
      </Stack>
    </Paper>
  );
}

export default function ReminderHistory({ restaurantId, branchId, onAlert }) {
  const [reminderType, setReminderType] = useState("all");
  const [status, setStatus] = useState("all");
  const [page, setPage] = useState(1);
  const [selectedId, setSelectedId] = useState(null);

  const [result, setResult] = useState(null);
  const [loadedKey, setLoadedKey] = useState("");
  const [loading, setLoading] = useState(true);

  const requestKey = [restaurantId, branchId, reminderType, status, page].join("|");

  useEffect(() => {
    setReminderType("all");
    setStatus("all");
    setPage(1);
    setSelectedId(null);
    setResult(null);
    setLoadedKey("");
  }, [restaurantId, branchId]);

  useEffect(() => {
    if (!restaurantId || !branchId) {
      setLoading(false);
      return undefined;
    }

    let active = true;
    const controller = new AbortController();
    setLoading(true);

    getOwnerReminderHistory(restaurantId, branchId, {
      reminder_type: reminderType, status, page,
    }, controller.signal)
      .then((response) => {
        if (!active) return;

        const lastPage = Math.max(1, Number(response.last_page) || 1);
        if (page > lastPage) {
          setPage(lastPage);
          return;
        }

        setResult(response);
        setLoadedKey(requestKey);
      })
      .catch((error) => {
        if (!active || controller.signal.aborted) return;
        setResult(null);
        setLoadedKey("");
        onAlert?.({ message: getErrorMessage(error) });
      })
      .finally(() => {
        if (active) setLoading(false);
      });

    return () => {
      active = false;
      controller.abort();
    };
  }, [restaurantId, branchId, reminderType, status, page, requestKey, onAlert]);

  const data = loadedKey === requestKey ? result : null;
  const rows = data?.data || [];
  const selected = rows.find((row) => String(row.id) === String(selectedId)) || null;

  const handleFilter = (field, value) => {
    if (field === "type") setReminderType(value);
    if (field === "status") setStatus(value);
    setPage(1);
    setSelectedId(null);
  };

  const handlePage = (nextPage) => {
    setPage(nextPage);
    setSelectedId(null);
  };

  return (
    <Paper sx={panelSx}>
      <Stack spacing={2}>
        <Stack direction="row" spacing={1.25} alignItems="flex-start">
          <HistoryOutlinedIcon sx={{ fontSize: 25, color: "primary.main" }} />
          <Box>
            <Typography sx={{ fontSize: 18, fontWeight: 800 }}>Historial de avisos</Typography>
            <Typography sx={{ mt: 0.5, fontSize: 13, color: "text.secondary" }}>
              Consulta los intentos registrados y la respuesta obtenida del proveedor.
            </Typography>
          </Box>
        </Stack>

        <Box sx={{
          display: "grid", gridTemplateColumns: {
            xs: "1fr", md: "repeat(2, minmax(0, 1fr))",
          }, gap: 1.5,
        }}>
          <TextField select fullWidth size="small" label="Tipo de aviso"
            value={reminderType} onChange={(event) => handleFilter("type", event.target.value)}>
            <MenuItem value="all">Todos los tipos</MenuItem>
            <MenuItem value="one_day_before">Un día antes</MenuItem>
            <MenuItem value="deadline">Hora límite</MenuItem>
            <MenuItem value="one_day_after">Un día después</MenuItem>
          </TextField>

          <TextField select fullWidth size="small" label="Estado de envío"
            value={status} onChange={(event) => handleFilter("status", event.target.value)}>
            <MenuItem value="all">Todos los estados</MenuItem>
            <MenuItem value="sent">Aceptados por proveedor</MenuItem>
            <MenuItem value="failed">Fallidos</MenuItem>
            <MenuItem value="processing">En proceso o sin confirmación</MenuItem>
          </TextField>
        </Box>

        {loading && data ? <LinearProgress sx={{ height: 3, borderRadius: 1 }} /> : null}

        {!data && loading ? (
          <Box sx={{ minHeight: 180, display: "grid", placeItems: "center" }}>
            <Stack alignItems="center" spacing={1.25}>
              <CircularProgress size={26} />
              <Typography sx={{ fontSize: 13, color: "text.secondary" }}>
                Consultando historial…
              </Typography>
            </Stack>
          </Box>
        ) : data ? (
          <>
            <Typography sx={{ fontSize: 12.5, color: "text.secondary" }}>
              {data.total} avisos registrados con los filtros seleccionados.
            </Typography>

            {rows.length === 0 ? (
              <Typography sx={{ py: 2, fontSize: 13, color: "text.secondary" }}>
                No hay avisos registrados para los filtros seleccionados.
              </Typography>
            ) : (
              <>
                <TableContainer sx={{ display: { xs: "none", md: "block" } }}>
                  <Table size="small" sx={{ minWidth: 850 }}>
                    <TableHead>
                      <TableRow sx={{ bgcolor: "action.hover" }}>
                        {["Tipo", "Estado", "Programado", "Destinatario", "Canal", "Conjuntos", "Detalle"].map((label) => (
                          <TableCell key={label} sx={{ fontSize: 12, fontWeight: 800 }}>
                            {label}
                          </TableCell>
                        ))}
                      </TableRow>
                    </TableHead>
                    <TableBody>
                      {rows.map((row) => (
                        <TableRow hover key={row.id}>
                          <TableCell sx={{ fontSize: 12.5 }}>
                            {types[row.reminder_type] || "—"}
                          </TableCell>
                          <TableCell><ReminderStatus row={row} /></TableCell>
                          <TableCell sx={{ fontSize: 12 }}>
                            {formatDateTime(row.scheduled_at, row.timezone)}
                          </TableCell>
                          <TableCell sx={{ fontSize: 12 }}>
                            {row.recipient_phone || "Sin teléfono"}
                          </TableCell>
                          <TableCell sx={{ fontSize: 12 }}>{channelLabel(row)}</TableCell>
                          <TableCell sx={{ fontSize: 12.5 }}>
                            {row.total_menu_sets ?? row.menu_sets?.length ?? 0}
                          </TableCell>
                          <TableCell>
                            <Button size="small" variant="outlined"
                              onClick={() => setSelectedId((current) =>
                                String(current) === String(row.id) ? null : row.id)}
                              endIcon={String(selectedId) === String(row.id)
                                ? <ExpandLessOutlinedIcon /> : <ExpandMoreOutlinedIcon />}>
                              {String(selectedId) === String(row.id) ? "Cerrar" : "Ver detalle"}
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
                  gap: 1.5, alignItems: "stretch",
                }}>
                  {rows.map((row) => (
                    <Box key={row.id} sx={{
                      p: 1.75, minHeight: 220, height: "100%",
                      border: "1px solid", borderColor: "divider",
                      borderRadius: 1, bgcolor: "background.default",
                    }}>
                      <Stack spacing={1.2} sx={{ height: "100%" }}>
                        <Typography sx={{ fontSize: 14, fontWeight: 800 }}>
                          {types[row.reminder_type] || "Aviso"}
                        </Typography>
                        <Box><ReminderStatus row={row} /></Box>
                        <Typography sx={{ fontSize: 12 }}>
                          Programado: {formatDateTime(row.scheduled_at, row.timezone)}
                        </Typography>
                        <Typography sx={{ fontSize: 12, color: "text.secondary" }}>
                          Destinatario: {row.recipient_phone || "Sin teléfono"}
                        </Typography>
                        <Typography sx={{ fontSize: 12, color: "text.secondary" }}>
                          Canal: {channelLabel(row)}
                        </Typography>
                        <Typography sx={{ fontSize: 12, color: "text.secondary" }}>
                          Conjuntos: {row.total_menu_sets ?? row.menu_sets?.length ?? 0}
                        </Typography>

                        <Box sx={{ mt: "auto !important" }}>
                          <Button fullWidth variant="outlined"
                            onClick={() => setSelectedId((current) =>
                              String(current) === String(row.id) ? null : row.id)}
                            endIcon={String(selectedId) === String(row.id)
                              ? <ExpandLessOutlinedIcon /> : <ExpandMoreOutlinedIcon />}>
                            {String(selectedId) === String(row.id) ? "Cerrar" : "Ver detalle"}
                          </Button>
                        </Box>
                      </Stack>
                    </Box>
                  ))}
                </Box>
              </>
            )}

            {Number(data.total) > 0 ? (
              <Box sx={{ borderTop: "1px solid", borderColor: "divider" }}>
                <PaginationFooter
                  page={data.current_page}
                  totalPages={data.last_page}
                  startItem={data.from || 0}
                  endItem={data.to || 0}
                  total={data.total}
                  hasPrev={data.current_page > 1}
                  hasNext={data.current_page < data.last_page}
                  onPrev={() => handlePage(Math.max(1, page - 1))}
                  onNext={() => handlePage(Math.min(data.last_page, page + 1))}
                  itemLabel="avisos"
                />
              </Box>
            ) : null}

            {selected ? (
              <HistoryDetail key={selected.id} reminder={selected}
                onClose={() => setSelectedId(null)} />
            ) : null}
          </>
        ) : (
          <Typography sx={{ py: 2, fontSize: 13, color: "text.secondary" }}>
            No hay información del historial para mostrar.
          </Typography>
        )}
      </Stack>
    </Paper>
  );
}