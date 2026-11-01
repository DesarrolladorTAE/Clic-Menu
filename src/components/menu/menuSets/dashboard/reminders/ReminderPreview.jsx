//src/components/menu/menuSets/dashboard/reminders/ReminderPreview.jsx
import { useEffect, useMemo, useState } from "react";
import {
  Box, Chip, CircularProgress, LinearProgress, MenuItem, Paper,
  Stack, Table, TableBody, TableCell, TableContainer,
  TableHead, TableRow, TextField, Typography,
} from "@mui/material";

import VisibilityOutlinedIcon from "@mui/icons-material/VisibilityOutlined";
import PaginationFooter from "../../../../common/PaginationFooter";
import { getOwnerReminderPreview } from "../../../../../services/menu/menuSets/dashboard/ownerReminders.service";

const panelSx = {
  p: { xs: 2, sm: 2.5 }, border: "1px solid",
  borderColor: "divider", borderRadius: 1,
  bgcolor: "background.paper", boxShadow: "none",
};

const reminderTypes = {
  one_day_before: "Un día antes",
  deadline: "Hora límite",
  one_day_after: "Un día después",
};

function localInputDateTime() {
  const date = new Date();
  const pad = (value) => String(value).padStart(2, "0");

  return `${date.getFullYear()}-${pad(date.getMonth() + 1)}-${pad(date.getDate())}T${pad(date.getHours())}:${pad(date.getMinutes())}`;
}

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
    || data?.message || error?.message || "No fue posible consultar la simulación.";
}

function MetricCard({ label, value }) {
  return (
    <Box sx={{
      p: 1.75, minHeight: 100, height: "100%",
      border: "1px solid", borderColor: "divider",
      borderRadius: 1, bgcolor: "background.default",
      display: "flex", flexDirection: "column",
      justifyContent: "space-between", gap: 1,
    }}>
      <Typography sx={{ fontSize: 12, fontWeight: 800, color: "text.secondary" }}>
        {label}
      </Typography>
      <Typography sx={{ fontSize: 25, fontWeight: 800 }}>{value ?? "—"}</Typography>
    </Box>
  );
}

function LocalPagination({ page, total, onChange, label }) {
  if (total === 0) return null;

  const totalPages = Math.max(1, Math.ceil(total / 5));
  const currentPage = Math.min(page, totalPages);

  return (
    <Box sx={{ borderTop: "1px solid", borderColor: "divider" }}>
      <PaginationFooter
        page={currentPage}
        totalPages={totalPages}
        startItem={(currentPage - 1) * 5 + 1}
        endItem={Math.min(currentPage * 5, total)}
        total={total}
        hasPrev={currentPage > 1}
        hasNext={currentPage < totalPages}
        onPrev={() => onChange(Math.max(1, currentPage - 1))}
        onNext={() => onChange(Math.min(totalPages, currentPage + 1))}
        itemLabel={label}
      />
    </Box>
  );
}

function CandidateStatus({ eligible }) {
  return (
    <Chip size="small"
      label={eligible ? "Elegible" : "No elegible"}
      color={eligible ? "success" : "default"} />
  );
}

function Candidates({ rows, timezone }) {
  const [page, setPage] = useState(1);
  const currentPage = Math.min(page, Math.max(1, Math.ceil(rows.length / 5)));
  const visibleRows = rows.slice((currentPage - 1) * 5, currentPage * 5);

  return (
    <Stack spacing={1.5}>
      <Box>
        <Typography sx={{ fontSize: 16, fontWeight: 800 }}>Candidatos programados</Typography>
        <Typography sx={{ mt: 0.4, fontSize: 12.5, color: "text.secondary" }}>
          Se muestra por qué cada Conjunto puede o no incluirse en un aviso.
        </Typography>
      </Box>

      {rows.length === 0 ? (
        <Typography sx={{ py: 2, fontSize: 13, color: "text.secondary" }}>
          No hay recordatorios programados dentro del intervalo de ejecución seleccionado.
        </Typography>
      ) : (
        <>
          <TableContainer sx={{ display: { xs: "none", md: "block" } }}>
            <Table size="small" sx={{ minWidth: 780 }}>
              <TableHead>
                <TableRow sx={{ bgcolor: "action.hover" }}>
                  {["Conjunto", "Tipo de aviso", "Fecha programada", "Periodo", "Elegibilidad", "Motivo"].map((label) => (
                    <TableCell key={label} sx={{ fontSize: 12, fontWeight: 800 }}>
                      {label}
                    </TableCell>
                  ))}
                </TableRow>
              </TableHead>
              <TableBody>
                {visibleRows.map((candidate, index) => (
                  <TableRow hover key={`${candidate.menu_set_id}-${candidate.reminder_type}-${index}`}>
                    <TableCell sx={{ fontSize: 12.5, fontWeight: 800 }}>
                      {candidate.menu_set_name || "Conjunto"}
                    </TableCell>
                    <TableCell sx={{ fontSize: 12 }}>{reminderTypes[candidate.reminder_type] || "—"}</TableCell>
                    <TableCell sx={{ fontSize: 12 }}>
                      {formatDateTime(candidate.scheduled_at, timezone)}
                    </TableCell>
                    <TableCell sx={{ fontSize: 12 }}>
                      {formatDate(candidate.target_week_start)}
                    </TableCell>
                    <TableCell><CandidateStatus eligible={candidate.eligible} /></TableCell>
                    <TableCell sx={{ fontSize: 12, minWidth: 180 }}>
                      {candidate.reason || "Sin restricciones informadas."}
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
            {visibleRows.map((candidate, index) => (
              <Box key={`${candidate.menu_set_id}-${candidate.reminder_type}-${index}`} sx={{
                p: 1.75, minHeight: 196, height: "100%",
                border: "1px solid", borderColor: "divider",
                borderRadius: 1, bgcolor: "background.default",
              }}>
                <Stack spacing={1}>
                  <Typography sx={{ fontSize: 14, fontWeight: 800 }}>
                    {candidate.menu_set_name || "Conjunto"}
                  </Typography>
                  <Box><CandidateStatus eligible={candidate.eligible} /></Box>
                  <Typography sx={{ fontSize: 12 }}>
                    Tipo: {reminderTypes[candidate.reminder_type] || "—"}
                  </Typography>
                  <Typography sx={{ fontSize: 12 }}>
                    Programado: {formatDateTime(candidate.scheduled_at, timezone)}
                  </Typography>
                  <Typography sx={{ fontSize: 12, color: "text.secondary", lineHeight: 1.55 }}>
                    {candidate.reason || "Sin restricciones informadas."}
                  </Typography>
                </Stack>
              </Box>
            ))}
          </Box>

          <LocalPagination page={currentPage} total={rows.length}
            onChange={setPage} label="candidatos" />
        </>
      )}
    </Stack>
  );
}

function MessageGroups({ groups, timezone }) {
  const [page, setPage] = useState(1);
  const currentPage = Math.min(page, Math.max(1, Math.ceil(groups.length / 5)));
  const visibleGroups = groups.slice((currentPage - 1) * 5, currentPage * 5);

  return (
    <Stack spacing={1.5}>
      <Box>
        <Typography sx={{ fontSize: 16, fontWeight: 800 }}>Mensajes agrupados</Typography>
        <Typography sx={{ mt: 0.4, fontSize: 12.5, color: "text.secondary" }}>
          Cada grupo corresponde a una sucursal, un periodo, un vencimiento y un tipo de aviso.
        </Typography>
      </Box>

      {groups.length === 0 ? (
        <Typography sx={{ py: 2, fontSize: 13, color: "text.secondary" }}>
          No hay mensajes elegibles para generar en esta simulación.
        </Typography>
      ) : (
        <>
          <Box sx={{
            display: "grid", gridTemplateColumns: {
              xs: "1fr", md: "repeat(2, minmax(0, 1fr))",
            }, gap: 1.5, alignItems: "stretch",
          }}>
            {visibleGroups.map((group, index) => (
              <Box key={`${group.branch_id}-${group.target_week_start}-${group.reminder_type}-${index}`} sx={{
                p: 1.75, height: "100%",
                border: "1px solid", borderColor: "divider",
                borderRadius: 1, bgcolor: "background.default",
              }}>
                <Stack spacing={1.5}>
                  <Box>
                    <Typography sx={{ fontSize: 14, fontWeight: 800 }}>
                      {group.branch_name || "Sucursal"}
                    </Typography>
                    <Typography sx={{ mt: 0.3, fontSize: 12, color: "text.secondary" }}>
                      {reminderTypes[group.reminder_type] || "Aviso"}
                    </Typography>
                  </Box>

                  <Stack direction="row" flexWrap="wrap" gap={0.75}>
                    <Chip size="small" color="primary"
                      label={`${group.total_menu_sets ?? group.menu_sets?.length ?? 0} conjuntos`} />
                    <Chip size="small" variant="outlined"
                      label={`Programado: ${formatDateTime(group.scheduled_at, timezone)}`} />
                  </Stack>

                  <Typography sx={{ fontSize: 12.5 }}>
                    Periodo: {formatDate(group.target_week_start)} al {formatDate(group.target_week_end)}
                  </Typography>

                  <Typography sx={{ fontSize: 12.5 }}>
                    Fecha límite: {formatDateTime(group.deadline_at, timezone)}
                  </Typography>

                  <Box>
                    <Typography sx={{ mb: 0.75, fontSize: 12, fontWeight: 800 }}>
                      Conjuntos incluidos
                    </Typography>
                    <Stack spacing={0.4}>
                      {(group.menu_sets || []).map((item) => (
                        <Typography key={item.id} sx={{ fontSize: 12.5 }}>
                          {item.name}
                        </Typography>
                      ))}
                    </Stack>
                  </Box>

                  <Box sx={{
                    p: 1.5, border: "1px solid", borderColor: "divider",
                    borderRadius: 1, bgcolor: "background.paper",
                  }}>
                    <Typography sx={{ mb: 0.75, fontSize: 12, fontWeight: 800 }}>
                      Contenido del aviso
                    </Typography>
                    <Typography sx={{
                      fontSize: 12, lineHeight: 1.7,
                      whiteSpace: "pre-wrap", overflowWrap: "anywhere",
                    }}>
                      {group.message || "No se recibió el texto del aviso."}
                    </Typography>
                  </Box>
                </Stack>
              </Box>
            ))}
          </Box>

          <LocalPagination page={currentPage} total={groups.length}
            onChange={setPage} label="mensajes" />
        </>
      )}
    </Stack>
  );
}

export default function ReminderPreview({ restaurantId, branchId, onAlert }) {
  const [referenceValue, setReferenceValue] = useState(localInputDateTime);
  const [reminderType, setReminderType] = useState("all");
  const [result, setResult] = useState(null);
  const [loadedKey, setLoadedKey] = useState("");
  const [loading, setLoading] = useState(true);

  const referenceAt = useMemo(() => {
    const date = new Date(referenceValue);
    return !Number.isNaN(date.getTime()) ? date.toISOString() : null;
  }, [referenceValue]);

  const requestKey = [restaurantId, branchId, referenceAt, reminderType].join("|");

  useEffect(() => {
    setReferenceValue(localInputDateTime());
    setReminderType("all");
    setResult(null);
    setLoadedKey("");
  }, [restaurantId, branchId]);

  useEffect(() => {
    if (!restaurantId || !branchId || !referenceAt) {
      setLoading(false);
      return undefined;
    }

    let active = true;
    const controller = new AbortController();
    setLoading(true);

    const timer = setTimeout(() => {
      getOwnerReminderPreview(restaurantId, branchId, {
        reference_at: referenceAt,
        reminder_type: reminderType,
      }, controller.signal)
        .then((response) => {
          if (!active) return;
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
    }, 300);

    return () => {
      active = false;
      clearTimeout(timer);
      controller.abort();
    };
  }, [restaurantId, branchId, referenceAt, reminderType, requestKey, onAlert]);

  const data = loadedKey === requestKey
    && String(result?.branch?.id || "") === String(branchId) ? result : null;

  return (
    <Paper sx={panelSx}>
      <Stack spacing={2}>
        <Stack direction="row" spacing={1.25} alignItems="flex-start">
          <VisibilityOutlinedIcon sx={{ color: "primary.main", fontSize: 25 }} />
          <Box>
            <Typography sx={{ fontSize: 18, fontWeight: 800 }}>Simulación de avisos</Typography>
            <Typography sx={{ mt: 0.5, fontSize: 13, color: "text.secondary", lineHeight: 1.55 }}>
              Consulta qué recordatorios corresponderían al momento seleccionado. Esta consulta no envía mensajes.
            </Typography>
          </Box>
        </Stack>

        <Box sx={{
          display: "grid", gridTemplateColumns: {
            xs: "1fr", md: "repeat(2, minmax(0, 1fr))",
          }, gap: 1.5,
        }}>
          <TextField fullWidth size="small" type="datetime-local"
            label="Fecha y hora de referencia" InputLabelProps={{ shrink: true }}
            value={referenceValue}
            onChange={(event) => setReferenceValue(event.target.value)}
            inputProps={{ "aria-label": "Fecha y hora de referencia" }} />

          <TextField select fullWidth size="small" label="Tipo de aviso"
            value={reminderType}
            onChange={(event) => setReminderType(event.target.value)}>
            <MenuItem value="all">Todos los tipos</MenuItem>
            <MenuItem value="one_day_before">Un día antes</MenuItem>
            <MenuItem value="deadline">Hora límite</MenuItem>
            <MenuItem value="one_day_after">Un día después</MenuItem>
          </TextField>
        </Box>

        <Typography sx={{ fontSize: 12, color: "text.secondary", lineHeight: 1.6 }}>
          La fecha y hora se introducen según tu dispositivo. Los avisos se calculan
          con la zona horaria de cada sucursal y solo aparecen dentro de su intervalo
          de ejecución de cinco minutos. La simulación utiliza las publicaciones
          registradas actualmente; no reconstruye cambios históricos.
        </Typography>

        {!referenceAt ? (
          <Typography sx={{ fontSize: 13, color: "error.main" }}>
            Selecciona una fecha y hora válidas.
          </Typography>
        ) : null}

        {loading && data ? <LinearProgress sx={{ height: 3, borderRadius: 1 }} /> : null}

        {!data && loading ? (
          <Box sx={{ minHeight: 170, display: "grid", placeItems: "center" }}>
            <Stack alignItems="center" spacing={1.25}>
              <CircularProgress size={26} />
              <Typography sx={{ fontSize: 13, color: "text.secondary" }}>
                Consultando simulación…
              </Typography>
            </Stack>
          </Box>
        ) : data ? (
          <>
            <Box sx={{
              display: "grid",
              gridTemplateColumns: { xs: "repeat(2, minmax(0, 1fr))", md: "repeat(3, minmax(0, 1fr))" },
              gridAutoRows: "1fr", gap: 1.5,
            }}>
              <MetricCard label="Candidatos programados" value={data.summary.scheduled_count} />
              <MetricCard label="Candidatos elegibles" value={data.summary.eligible_count} />
              <MetricCard label="Mensajes agrupados" value={data.summary.group_count} />
            </Box>

            <Candidates key={requestKey}
              rows={data.candidates} timezone={data.branch.timezone} />

            <Box sx={{ borderTop: "1px solid", borderColor: "divider", pt: 2 }}>
              <MessageGroups key={requestKey}
                groups={data.groups} timezone={data.branch.timezone} />
            </Box>
          </>
        ) : (
          <Typography sx={{ py: 2, fontSize: 13, color: "text.secondary" }}>
            No hay una simulación disponible para mostrar.
          </Typography>
        )}
      </Stack>
    </Paper>
  );
}