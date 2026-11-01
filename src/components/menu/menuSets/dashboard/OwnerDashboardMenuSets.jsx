//src/components/menu/menuSets/dashboard/OwnerDashboardMenuSets.jsx
import { useEffect, useState } from "react";
import {
  Box, Button, Chip, CircularProgress, MenuItem, Paper, Stack,
  Table, TableBody, TableCell, TableContainer, TableHead,
  TableRow, TextField, Typography,
} from "@mui/material";

import LayersOutlinedIcon from "@mui/icons-material/LayersOutlined";
import ExpandMoreOutlinedIcon from "@mui/icons-material/ExpandMoreOutlined";
import ExpandLessOutlinedIcon from "@mui/icons-material/ExpandLessOutlined";

import PaginationFooter from "../../../common/PaginationFooter";
import {
  getOwnerMenuSetsDashboard,
  getOwnerMenuSetDashboardDetail,
} from "../../../../services/menu/menuSets/dashboard/ownerMenuSetsDashboard.service";

const panelSx = {
  p: { xs: 2, sm: 2.5 }, borderRadius: 1,
  border: "1px solid", borderColor: "divider",
  bgcolor: "background.paper", boxShadow: "none",
};

const statuses = {
  available: { label: "Disponible", color: "success" },
  capacity_exhausted: { label: "Sin cupo", color: "warning" },
  inventory_exhausted: { label: "Sin inventario", color: "error" },
  both_exhausted: { label: "Sin cupo ni inventario", color: "error" },
  configuration_unavailable: { label: "Configuración no disponible", color: "default" },
};

function formatNumber(value, fallback = "—") {
  if (value === null || value === undefined || value === "") return fallback;
  const number = Number(value);
  return Number.isFinite(number)
    ? new Intl.NumberFormat("es-MX", { maximumFractionDigits: 3 }).format(number)
    : fallback;
}

function formatDate(value) {
  if (!/^\d{4}-\d{2}-\d{2}/.test(String(value || ""))) return "—";
  const [year, month, day] = String(value).slice(0, 10).split("-");
  return `${day}/${month}/${year}`;
}

function getErrorMessage(error) {
  const data = error?.response?.data;
  const messages = data?.errors && typeof data.errors === "object"
    ? Object.values(data.errors).flat() : [];

  return messages.find((value) => typeof value === "string")
    || data?.message || error?.message || "No fue posible consultar los Conjuntos.";
}

function managementLabel(value) {
  return value === "mass_import" ? "Administración masiva"
    : value === "manual" ? "Administración manual" : "No informada";
}

function capacityModeLabel(value) {
  return value === "daily" ? "Diaria"
    : value === "weekly" ? "Semanal"
    : value === "none" ? "Sin límite"
    : "No informada";
}

function publicationLabel(row) {
  if (row?.publication?.has_exact_publication) return "Publicación del periodo";
  if (row?.publication?.is_inherited) return "Programación heredada";
  if (row?.configuration_source === "manual_fallback") return "Configuración manual provisional";
  if (row?.configuration_source === "manual") return "Configuración manual";
  return "Configuración no informada";
}

function StatusChip({ status }) {
  const config = statuses[status] || { label: "No informado", color: "default" };
  return <Chip size="small" label={config.label} color={config.color} />;
}

function SummaryMetric({ label, value }) {
  return (
    <Box sx={{
      p: 1.75, minHeight: 108, height: "100%",
      border: "1px solid", borderColor: "divider",
      borderRadius: 1, bgcolor: "background.default",
      display: "flex", flexDirection: "column",
      justifyContent: "space-between", gap: 1,
    }}>
      <Typography sx={{ fontSize: 12, fontWeight: 800, color: "text.secondary" }}>
        {label}
      </Typography>
      <Typography sx={{ fontSize: 26, fontWeight: 800, color: "text.primary" }}>
        {formatNumber(value)}
      </Typography>
    </Box>
  );
}

function DashboardPagination({ pagination, onChange, itemLabel }) {
  if (!pagination || Number(pagination.total) === 0) return null;

  const currentPage = Number(pagination.current_page) || 1;
  const totalPages = Math.max(1, Number(pagination.last_page) || 1);

  return (
    <Box sx={{ mt: 1.5, borderTop: "1px solid", borderColor: "divider" }}>
      <PaginationFooter
        page={currentPage}
        totalPages={totalPages}
        startItem={pagination.from || 0}
        endItem={pagination.to || 0}
        total={Number(pagination.total) || 0}
        hasPrev={currentPage > 1}
        hasNext={currentPage < totalPages}
        onPrev={() => onChange(Math.max(1, currentPage - 1))}
        onNext={() => onChange(Math.min(totalPages, currentPage + 1))}
        itemLabel={itemLabel}
      />
    </Box>
  );
}

function CapacityDetail({ capacity }) {
  const [dayPage, setDayPage] = useState(1);

  if (!capacity) {
    return (
      <Typography sx={{ fontSize: 12.5, color: "text.secondary" }}>
        No se recibió la capacidad de esta opción.
      </Typography>
    );
  }

  if (!capacity.is_configured) {
    return (
      <Typography sx={{ fontSize: 12.5, color: "text.secondary", lineHeight: 1.6 }}>
        {capacity.reason || "No se pudo consultar la capacidad de esta opción."}
      </Typography>
    );
  }

  const days = Array.isArray(capacity.daily_breakdown) ? capacity.daily_breakdown : [];
  const totalPages = Math.max(1, Math.ceil(days.length / 5));
  const currentPage = Math.min(dayPage, totalPages);
  const visibleDays = days.slice((currentPage - 1) * 5, currentPage * 5);

  const values = [
    ["Límite", capacity.limit, capacity.mode === "none" ? "Sin límite" : "—"],
    ["Reservado", capacity.reserved],
    ["Consumido", capacity.consumed],
    ["Comprometido", capacity.committed],
    ["Restante", capacity.remaining, capacity.mode === "none" ? "Sin límite" : "—"],
  ];

  return (
    <Stack spacing={1.5}>
      <Typography sx={{ fontSize: 13, fontWeight: 800 }}>
        Capacidad {capacityModeLabel(capacity.mode).toLowerCase()}
      </Typography>

      {capacity.from && capacity.to ? (
        <Typography sx={{ fontSize: 12, color: "text.secondary" }}>
          Periodo: {formatDate(capacity.from)} al {formatDate(capacity.to)}
        </Typography>
      ) : null}

      <Box sx={{
        display: "grid",
        gridTemplateColumns: { xs: "repeat(2, minmax(0, 1fr))", sm: "repeat(3, minmax(0, 1fr))", lg: "repeat(5, minmax(0, 1fr))" },
        gap: 1,
      }}>
        {values.map(([label, value, fallback]) => (
          <Box key={label} sx={{
            p: 1.25, border: "1px solid", borderColor: "divider",
            borderRadius: 1, bgcolor: "background.paper", minHeight: 74,
          }}>
            <Typography sx={{ fontSize: 11, color: "text.secondary" }}>{label}</Typography>
            <Typography sx={{ mt: 0.6, fontSize: 17, fontWeight: 800 }}>
              {formatNumber(value, fallback || "—")}
            </Typography>
          </Box>
        ))}
      </Box>

      {capacity.mode === "none" ? (
        <Typography sx={{ fontSize: 12, color: "text.secondary" }}>
          Esta opción no tiene un límite comercial cuantificado.
        </Typography>
      ) : null}

      {days.length > 0 ? (
        <>
          <Typography sx={{ fontSize: 13, fontWeight: 800 }}>
            Compromisos por día
          </Typography>

          <TableContainer sx={{ display: { xs: "none", md: "block" } }}>
            <Table size="small">
              <TableHead>
                <TableRow sx={{ bgcolor: "action.hover" }}>
                  {["Fecha", "Reservado", "Consumido", "Comprometido"].map((label) => (
                    <TableCell key={label} sx={{ fontSize: 12, fontWeight: 800 }}>{label}</TableCell>
                  ))}
                </TableRow>
              </TableHead>
              <TableBody>
                {visibleDays.map((day) => (
                  <TableRow key={day.service_date}>
                    <TableCell sx={{ fontSize: 12 }}>{formatDate(day.service_date)}</TableCell>
                    <TableCell sx={{ fontSize: 12 }}>{formatNumber(day.reserved)}</TableCell>
                    <TableCell sx={{ fontSize: 12 }}>{formatNumber(day.consumed)}</TableCell>
                    <TableCell sx={{ fontSize: 12, fontWeight: 800 }}>
                      {formatNumber(day.committed)}
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </TableContainer>

          <Box sx={{
            display: { xs: "grid", md: "none" },
            gridTemplateColumns: { xs: "1fr", sm: "repeat(2, minmax(0, 1fr))" },
            gap: 1,
          }}>
            {visibleDays.map((day) => (
              <Box key={day.service_date} sx={{
                p: 1.25, minHeight: 100, height: "100%",
                border: "1px solid", borderColor: "divider", borderRadius: 1,
              }}>
                <Typography sx={{ fontSize: 12.5, fontWeight: 800 }}>
                  {formatDate(day.service_date)}
                </Typography>
                <Typography sx={{ mt: 0.6, fontSize: 12 }}>
                  Reservado: {formatNumber(day.reserved)}
                </Typography>
                <Typography sx={{ fontSize: 12 }}>
                  Consumido: {formatNumber(day.consumed)}
                </Typography>
                <Typography sx={{ fontSize: 12, fontWeight: 800 }}>
                  Comprometido: {formatNumber(day.committed)}
                </Typography>
              </Box>
            ))}
          </Box>

          <DashboardPagination
            pagination={{
              current_page: currentPage, last_page: totalPages,
              total: days.length, from: (currentPage - 1) * 5 + 1,
              to: Math.min(currentPage * 5, days.length),
            }}
            onChange={setDayPage}
            itemLabel="días"
          />
        </>
      ) : null}
    </Stack>
  );
}

function StageOptions({ options }) {
  const [page, setPage] = useState(1);
  const [selectedOptionId, setSelectedOptionId] = useState(null);

  const totalPages = Math.max(1, Math.ceil(options.length / 5));
  const currentPage = Math.min(page, totalPages);
  const visibleOptions = options.slice((currentPage - 1) * 5, currentPage * 5);

  const selectedOption = visibleOptions.find(
    (option) => String(option.option_id) === String(selectedOptionId)
  ) || null;

  const changePage = (nextPage) => {
    setPage(nextPage);
    setSelectedOptionId(null);
  };

  const toggleCapacity = (option) => {
    setSelectedOptionId((current) =>
      String(current) === String(option.option_id) ? null : option.option_id
    );
  };

  if (options.length === 0) {
    return (
      <Typography sx={{ fontSize: 12.5, color: "text.secondary" }}>
        No hay opciones disponibles para consultar en esta etapa.
      </Typography>
    );
  }

  return (
    <Stack spacing={1.5}>
      <TableContainer sx={{ display: { xs: "none", md: "block" } }}>
        <Table size="small">
          <TableHead>
            <TableRow sx={{ bgcolor: "action.hover" }}>
              {["Producto", "Disponibilidad", "Inventario", "Cupo restante", "Disponibilidad efectiva", "Acciones"].map((label) => (
                <TableCell key={label} sx={{ fontSize: 12, fontWeight: 800 }}>
                  {label}
                </TableCell>
              ))}
            </TableRow>
          </TableHead>

          <TableBody>
            {visibleOptions.map((option) => (
              <TableRow hover key={option.option_id}>
                <TableCell sx={{ minWidth: 160 }}>
                  <Typography sx={{ fontSize: 12.5, fontWeight: 800 }}>
                    {option.product_name}
                  </Typography>
                  {option.available_via_prepared_item ? (
                    <Typography sx={{ fontSize: 11, color: "text.secondary" }}>
                      Preparación específica
                    </Typography>
                  ) : null}
                </TableCell>

                <TableCell>
                  <StatusChip status={option.availability_status} />
                </TableCell>
                <TableCell sx={{ fontSize: 12.5 }}>
                  {formatNumber(option.physical_available, "No cuantificada")}
                </TableCell>
                <TableCell sx={{ fontSize: 12.5 }}>
                  {formatNumber(option.capacity_remaining, "Sin límite indicado")}
                </TableCell>
                <TableCell sx={{ fontSize: 12.5 }}>
                  {formatNumber(option.effective_available, "No cuantificada")}
                </TableCell>
                <TableCell>
                  <Button type="button" size="small" variant="outlined"
                    onClick={() => toggleCapacity(option)}
                    endIcon={String(selectedOptionId) === String(option.option_id)
                      ? <ExpandLessOutlinedIcon /> : <ExpandMoreOutlinedIcon />}>
                    {String(selectedOptionId) === String(option.option_id) ? "Cerrar" : "Ver capacidad"}
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
        {visibleOptions.map((option) => (
          <Box key={option.option_id} sx={{
            p: 1.75, minHeight: 220, height: "100%",
            border: "1px solid", borderColor: "divider",
            borderRadius: 1, bgcolor: "background.default",
          }}>
            <Stack spacing={1.2} sx={{ height: "100%" }}>
              <Typography sx={{ fontSize: 14, fontWeight: 800 }}>
                {option.product_name}
              </Typography>
              <Box><StatusChip status={option.availability_status} /></Box>

              <Typography sx={{ fontSize: 12 }}>
                Inventario: {formatNumber(option.physical_available, "No cuantificada")}
              </Typography>
              <Typography sx={{ fontSize: 12 }}>
                Cupo restante: {formatNumber(option.capacity_remaining, "Sin límite indicado")}
              </Typography>
              <Typography sx={{ fontSize: 12 }}>
                Disponibilidad efectiva: {formatNumber(option.effective_available, "No cuantificada")}
              </Typography>

              {option.available_via_prepared_item ? (
                <Typography sx={{ fontSize: 11.5, color: "text.secondary" }}>
                  Requiere una preparación específica.
                </Typography>
              ) : null}

              <Box sx={{ mt: "auto !important" }}>
                <Button type="button" fullWidth variant="outlined"
                  onClick={() => toggleCapacity(option)}
                  endIcon={String(selectedOptionId) === String(option.option_id)
                    ? <ExpandLessOutlinedIcon /> : <ExpandMoreOutlinedIcon />}>
                  {String(selectedOptionId) === String(option.option_id) ? "Cerrar" : "Ver capacidad"}
                </Button>
              </Box>
            </Stack>
          </Box>
        ))}
      </Box>

      {visibleOptions.map((option) => {
        const preparedMessage = option.available_via_prepared_item
          ? "Este producto puede estar disponible mediante una preparación específica. Debe seleccionarse esa preparación al registrar el pedido."
          : option.prepared_selection_required
            ? "Existe una preparación específica que debe seleccionarse para utilizar esta disponibilidad."
            : null;

        return (
          <Box key={`reason-${option.option_id}`}>
            {option.reason || preparedMessage ? (
              <Typography sx={{ fontSize: 12, color: "text.secondary", lineHeight: 1.55 }}>
                <Box component="span" sx={{ fontWeight: 800 }}>
                  {option.product_name}:
                </Box>{" "}
                {option.reason || preparedMessage}
              </Typography>
            ) : null}
          </Box>
        );
      })}

      <DashboardPagination
        pagination={{
          current_page: currentPage, last_page: totalPages,
          total: options.length, from: (currentPage - 1) * 5 + 1,
          to: Math.min(currentPage * 5, options.length),
        }}
        onChange={changePage}
        itemLabel="opciones"
      />

      {selectedOption ? (
        <Paper sx={{ ...panelSx, bgcolor: "background.default" }}>
          <Stack spacing={1.5}>
            <Typography sx={{ fontSize: 15, fontWeight: 800 }}>
              Capacidad de {selectedOption.product_name}
            </Typography>
            <CapacityDetail key={selectedOption.option_id} capacity={selectedOption.capacity} />
          </Stack>
        </Paper>
      ) : null}
    </Stack>
  );
}

function MenuSetDetail({ detail, onClose }) {
  const [stagePage, setStagePage] = useState(1);

  const stages = Array.isArray(detail.stages) ? detail.stages : [];
  const totalPages = Math.max(1, Math.ceil(stages.length / 5));
  const currentPage = Math.min(stagePage, totalPages);
  const visibleStages = stages.slice((currentPage - 1) * 5, currentPage * 5);
  const publication = detail.publication || {};
  const importStatus = detail.import_status;

  const publicationPeriod = publication.publication_week_start && publication.publication_week_end
    ? `${formatDate(publication.publication_week_start)} al ${formatDate(publication.publication_week_end)}`
    : null;

  return (
    <Stack spacing={2}>
      <Paper sx={panelSx}>
        <Stack spacing={2}>
          <Stack direction={{ xs: "column", sm: "row" }} justifyContent="space-between" spacing={1.5}>
            <Box sx={{ minWidth: 0 }}>
              <Typography sx={{ fontSize: 20, fontWeight: 800 }}>{detail.name}</Typography>
              <Typography sx={{ mt: 0.4, fontSize: 12.5, color: "text.secondary" }}>
                {managementLabel(detail.management_mode)} · {publicationLabel(detail)}
              </Typography>
            </Box>

            <Button type="button" variant="outlined" onClick={onClose}
              startIcon={<ExpandLessOutlinedIcon />} sx={{ flexShrink: 0, alignSelf: "flex-start" }}>
              Cerrar detalle
            </Button>
          </Stack>

          <Stack direction="row" flexWrap="wrap" gap={1}>
            <Chip size="small" label={detail.is_active ? "Activo" : "Inactivo"}
              color={detail.is_active ? "primary" : "default"} />
            <StatusChip status={detail.availability_status} />
            <Chip size="small"
              label={detail.is_sellable ? "Disponible para venta" : "No disponible para venta"}
              color={detail.is_sellable ? "success" : "default"} />
          </Stack>

          {detail.reason ? (
            <Typography sx={{ fontSize: 13, lineHeight: 1.6, color: "text.secondary" }}>
              {detail.reason}
            </Typography>
          ) : null}

          <Box sx={{
            display: "grid",
            gridTemplateColumns: { xs: "repeat(2, minmax(0, 1fr))", md: "repeat(4, minmax(0, 1fr))" },
            gridAutoRows: "1fr", gap: 1.25,
          }}>
            <SummaryMetric label="Etapas" value={detail.total_stages} />
            <SummaryMetric label="Etapas completas" value={detail.satisfied_stages} />
            <SummaryMetric label="Opciones" value={detail.option_summary?.total} />
            <SummaryMetric label="Opciones disponibles" value={detail.option_summary?.available} />
          </Box>

          <Box sx={{
            p: 1.5, border: "1px solid", borderColor: "divider",
            borderRadius: 1, bgcolor: "background.default",
          }}>
            <Stack spacing={0.8}>
              <Typography sx={{ fontSize: 13, fontWeight: 800 }}>
                Configuración aplicable
              </Typography>

              <Typography sx={{ fontSize: 12.5, color: "text.secondary" }}>
                Fecha de servicio: {formatDate(detail.service_date)}
              </Typography>
              <Typography sx={{ fontSize: 12.5, color: "text.secondary" }}>
                Capacidad: {capacityModeLabel(detail.effective_capacity_mode)}
              </Typography>

              {publicationPeriod ? (
                <Typography sx={{ fontSize: 12.5, color: "text.secondary" }}>
                  Periodo publicado: {publicationPeriod}
                </Typography>
              ) : null}

              {publication.revision !== null && publication.revision !== undefined ? (
                <Typography sx={{ fontSize: 12.5, color: "text.secondary" }}>
                  Revisión publicada: {publication.revision}
                </Typography>
              ) : null}

              {importStatus?.is_update_overdue ? (
                <Chip size="small" color="error" label="Actualización vencida"
                  sx={{ alignSelf: "flex-start" }} />
              ) : importStatus?.is_update_due ? (
                <Chip size="small" color="warning" label="Actualización requerida"
                  sx={{ alignSelf: "flex-start" }} />
              ) : importStatus?.is_update_pending ? (
                <Chip size="small" color="warning" label="Actualización pendiente"
                  sx={{ alignSelf: "flex-start" }} />
              ) : null}
            </Stack>
          </Box>
        </Stack>
      </Paper>

      <Paper sx={panelSx}>
        <Stack spacing={2}>
          <Box>
            <Typography sx={{ fontSize: 18, fontWeight: 800 }}>Etapas y opciones</Typography>
            <Typography sx={{ mt: 0.5, fontSize: 12.5, color: "text.secondary" }}>
              Disponibilidad y capacidades correspondientes a la programación efectiva de esta fecha.
            </Typography>
          </Box>

          {stages.length === 0 ? (
            <Typography sx={{ py: 2, fontSize: 13, color: "text.secondary" }}>
              No hay etapas disponibles para la fecha seleccionada.
            </Typography>
          ) : visibleStages.map((stage) => (
            <Box key={stage.stage_id} sx={{
              p: { xs: 1.5, sm: 2 }, border: "1px solid",
              borderColor: "divider", borderRadius: 1,
            }}>
              <Stack spacing={1.75}>
                <Stack direction={{ xs: "column", sm: "row" }}
                  justifyContent="space-between" alignItems={{ sm: "center" }} spacing={1}>
                  <Box>
                    <Typography sx={{ fontSize: 16, fontWeight: 800 }}>{stage.name}</Typography>
                    <Typography sx={{ mt: 0.4, fontSize: 12, color: "text.secondary" }}>
                      {stage.required ? "Obligatoria" : "Opcional"} · Mínimo: {stage.min_selections} · Máximo: {stage.max_selections}
                    </Typography>
                  </Box>

                  <Chip size="small" color={stage.is_satisfied ? "success" : "warning"}
                    label={stage.is_satisfied ? "Etapa disponible" : "Etapa no disponible"} />
                </Stack>

                <Typography sx={{ fontSize: 12.5, color: "text.secondary" }}>
                  {stage.available_options} opciones disponibles de {stage.total_options}.
                </Typography>

                {stage.reason ? (
                  <Typography sx={{ fontSize: 12.5, lineHeight: 1.55, color: "text.secondary" }}>
                    {stage.reason}
                  </Typography>
                ) : null}

                <StageOptions key={stage.stage_id} options={stage.options || []} />
              </Stack>
            </Box>
          ))}

          <DashboardPagination
            pagination={{
              current_page: currentPage, last_page: totalPages,
              total: stages.length, from: (currentPage - 1) * 5 + 1,
              to: Math.min(currentPage * 5, stages.length),
            }}
            onChange={setStagePage}
            itemLabel="etapas"
          />
        </Stack>
      </Paper>
    </Stack>
  );
}

export default function OwnerDashboardMenuSets({
  restaurantId, branchId, serviceDate, onAlert,
}) {
  const [availabilityStatus, setAvailabilityStatus] = useState("all");
  const [page, setPage] = useState(1);
  const [selectedMenuSetId, setSelectedMenuSetId] = useState(null);

  const [result, setResult] = useState(null);
  const [loadedKey, setLoadedKey] = useState("");
  const [loading, setLoading] = useState(true);

  const [detail, setDetail] = useState(null);
  const [detailLoading, setDetailLoading] = useState(false);

  const requestKey = [
    restaurantId, branchId, serviceDate, availabilityStatus, page,
  ].join("|");

  useEffect(() => {
    setAvailabilityStatus("all");
    setPage(1);
    setSelectedMenuSetId(null);
    setResult(null);
    setLoadedKey("");
    setDetail(null);
  }, [restaurantId, branchId]);

  useEffect(() => {
    if (!restaurantId || !branchId || !serviceDate) {
      setLoading(false);
      return undefined;
    }

    let active = true;
    const controller = new AbortController();
    setLoading(true);

    getOwnerMenuSetsDashboard(restaurantId, branchId, {
      service_date: serviceDate,
      availability_status: availabilityStatus,
      page,
    }, controller.signal)
      .then((response) => {
        if (!active) return;

        if (page > Number(response.pagination.last_page || 1)) {
          setPage(Math.max(1, Number(response.pagination.last_page) || 1));
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
  }, [restaurantId, branchId, serviceDate, availabilityStatus, page, requestKey, onAlert]);

  useEffect(() => {
    if (!restaurantId || !branchId || !selectedMenuSetId || !serviceDate) {
      setDetail(null);
      setDetailLoading(false);
      return undefined;
    }

    let active = true;
    const controller = new AbortController();
    setDetail(null);
    setDetailLoading(true);

    getOwnerMenuSetDashboardDetail(
      restaurantId, branchId, selectedMenuSetId, serviceDate, controller.signal
    )
      .then((response) => {
        if (active) setDetail(response);
      })
      .catch((error) => {
        if (!active || controller.signal.aborted) return;
        setDetail(null);
        onAlert?.({ message: getErrorMessage(error) });
      })
      .finally(() => {
        if (active) setDetailLoading(false);
      });

    return () => {
      active = false;
      controller.abort();
    };
  }, [restaurantId, branchId, selectedMenuSetId, serviceDate, onAlert]);

  const data = loadedKey === requestKey
    && String(result?.context?.branch_id || "") === String(branchId)
    && result?.context?.service_date === serviceDate
    ? result : null;

  const visibleDetail = detail
    && String(detail.id) === String(selectedMenuSetId)
    && detail.service_date === serviceDate ? detail : null;

  const updateFilter = (value) => {
    setAvailabilityStatus(value);
    setPage(1);
    setSelectedMenuSetId(null);
  };

  const changePage = (nextPage) => {
    setPage(nextPage);
    setSelectedMenuSetId(null);
  };

  const toggleDetail = (menuSet) => {
    setSelectedMenuSetId((current) =>
      String(current) === String(menuSet.id) ? null : menuSet.id
    );
  };

  const rows = data?.rows || [];
  const summary = data?.summary || {};

  const summaryFields = [
    ["total_menu_sets", "Conjuntos evaluados"],
    ["active_menu_sets", "Activos"],
    ["sellable_menu_sets", "Disponibles para venta"],
    ["unsellable_menu_sets", "No disponibles para venta"],
    ["capacity_exhausted_menu_sets", "Sin cupo"],
    ["inventory_exhausted_menu_sets", "Sin inventario"],
    ["both_exhausted_menu_sets", "Sin cupo ni inventario"],
    ["configuration_unavailable_menu_sets", "Configuración no disponible"],
    ["mass_import_menu_sets", "Administración masiva"],
    ["pending_updates", "Actualizaciones pendientes"],
    ["overdue_updates", "Actualizaciones vencidas"],
  ];

  return (
    <Stack spacing={2.5}>
      {/* Filtros */}
      <Paper sx={panelSx}>
        <Stack spacing={2}>
          <Box>
            <Typography sx={{ fontSize: 18, fontWeight: 800 }}>Disponibilidad de Conjuntos</Typography>
            <Typography sx={{ mt: 0.5, fontSize: 13, color: "text.secondary" }}>
              Consulta los Conjuntos para la fecha de servicio seleccionada.
            </Typography>
          </Box>

          <TextField select size="small" fullWidth label="Disponibilidad"
            value={availabilityStatus} onChange={(event) => updateFilter(event.target.value)}
            sx={{ maxWidth: { sm: 340 } }}>
            <MenuItem value="all">Todos los estados</MenuItem>
            <MenuItem value="available">Disponible</MenuItem>
            <MenuItem value="capacity_exhausted">Sin cupo</MenuItem>
            <MenuItem value="inventory_exhausted">Sin inventario</MenuItem>
            <MenuItem value="both_exhausted">Sin cupo ni inventario</MenuItem>
            <MenuItem value="configuration_unavailable">Configuración no disponible</MenuItem>
          </TextField>
        </Stack>
      </Paper>

      {!data && loading ? (
        <Paper sx={{ ...panelSx, minHeight: 250, display: "grid", placeItems: "center" }}>
          <Stack alignItems="center" spacing={1.5}>
            <CircularProgress size={28} />
            <Typography sx={{ fontSize: 13, color: "text.secondary" }}>
              Consultando Conjuntos…
            </Typography>
          </Stack>
        </Paper>
      ) : data ? (
        <>
          {/* Indicadores */}
          <Paper sx={panelSx}>
            <Stack spacing={1.5}>
              <Typography sx={{ fontSize: 18, fontWeight: 800 }}>Resumen de Conjuntos</Typography>
              <Typography sx={{ fontSize: 12, color: "text.secondary" }}>
                Los indicadores consideran todos los Conjuntos que coinciden con el filtro, no solamente esta página.
              </Typography>

              <Box sx={{
                display: "grid",
                gridTemplateColumns: { xs: "repeat(2, minmax(0, 1fr))", md: "repeat(3, minmax(0, 1fr))", lg: "repeat(4, minmax(0, 1fr))" },
                gridAutoRows: "1fr", gap: 1.5,
              }}>
                {summaryFields.map(([key, label]) => (
                  <SummaryMetric key={key} label={label} value={summary[key]} />
                ))}
              </Box>
            </Stack>
          </Paper>

          {/* Listado */}
          <Paper sx={panelSx}>
            <Stack spacing={1.5}>
              <Typography sx={{ fontSize: 18, fontWeight: 800 }}>Listado operativo</Typography>

              {rows.length === 0 ? (
                <Typography sx={{ py: 3, fontSize: 13, color: "text.secondary" }}>
                  No hay Conjuntos que coincidan con los filtros seleccionados.
                </Typography>
              ) : (
                <>
                  <TableContainer sx={{ display: { xs: "none", md: "block" } }}>
                    <Table size="small">
                      <TableHead>
                        <TableRow sx={{ bgcolor: "action.hover" }}>
                          {["Conjunto", "Administración", "Estado", "Disponibilidad", "Programación", "Acciones"].map((label) => (
                            <TableCell key={label} sx={{ fontSize: 12, fontWeight: 800 }}>
                              {label}
                            </TableCell>
                          ))}
                        </TableRow>
                      </TableHead>

                      <TableBody>
                        {rows.map((menuSet) => (
                          <TableRow hover key={menuSet.id}>
                            <TableCell sx={{ minWidth: 160 }}>
                              <Typography sx={{ fontSize: 13, fontWeight: 800 }}>{menuSet.name}</Typography>
                              <Typography sx={{ fontSize: 11.5, color: "text.secondary" }}>
                                {menuSet.total_stages} etapas · {menuSet.option_summary?.total || 0} opciones
                              </Typography>
                            </TableCell>
                            <TableCell sx={{ fontSize: 12.5 }}>{managementLabel(menuSet.management_mode)}</TableCell>
                            <TableCell sx={{ fontSize: 12.5 }}>
                              {menuSet.is_active ? "Activo" : "Inactivo"}
                            </TableCell>
                            <TableCell>
                              <Stack spacing={0.6} alignItems="flex-start">
                                <StatusChip status={menuSet.availability_status} />
                                <Typography sx={{ fontSize: 11, color: "text.secondary" }}>
                                  {menuSet.is_sellable ? "Disponible para venta" : "No disponible para venta"}
                                </Typography>
                              </Stack>
                            </TableCell>
                            <TableCell sx={{ fontSize: 12 }}>
                              {publicationLabel(menuSet)}
                            </TableCell>
                            <TableCell>
                              <Button type="button" size="small" variant="outlined"
                                onClick={() => toggleDetail(menuSet)}
                                endIcon={String(selectedMenuSetId) === String(menuSet.id)
                                  ? <ExpandLessOutlinedIcon /> : <ExpandMoreOutlinedIcon />}>
                                {String(selectedMenuSetId) === String(menuSet.id) ? "Cerrar" : "Ver detalle"}
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
                    {rows.map((menuSet) => (
                      <Box key={menuSet.id} sx={{
                        p: 1.75, minHeight: 240, height: "100%",
                        border: "1px solid", borderColor: "divider",
                        borderRadius: 1, bgcolor: "background.default",
                      }}>
                        <Stack spacing={1.2} sx={{ height: "100%" }}>
                          <Box>
                            <Typography sx={{ fontSize: 15, fontWeight: 800 }}>
                              {menuSet.name}
                            </Typography>
                            <Typography sx={{ fontSize: 12, color: "text.secondary" }}>
                              {managementLabel(menuSet.management_mode)}
                            </Typography>
                          </Box>

                          <Stack direction="row" flexWrap="wrap" gap={0.75}>
                            <Chip size="small" label={menuSet.is_active ? "Activo" : "Inactivo"}
                              color={menuSet.is_active ? "primary" : "default"} />
                            <StatusChip status={menuSet.availability_status} />
                          </Stack>

                          <Typography sx={{ fontSize: 12, color: "text.secondary" }}>
                            {publicationLabel(menuSet)}
                          </Typography>

                          <Typography sx={{ fontSize: 12, fontWeight: 800 }}>
                            {menuSet.is_sellable ? "Disponible para venta" : "No disponible para venta"}
                          </Typography>

                          <Typography sx={{ fontSize: 12, color: "text.secondary" }}>
                            {menuSet.total_stages} etapas · {menuSet.option_summary?.total || 0} opciones
                          </Typography>

                          <Box sx={{ mt: "auto !important" }}>
                            <Button type="button" fullWidth variant="outlined"
                              onClick={() => toggleDetail(menuSet)}
                              endIcon={String(selectedMenuSetId) === String(menuSet.id)
                                ? <ExpandLessOutlinedIcon /> : <ExpandMoreOutlinedIcon />}>
                              {String(selectedMenuSetId) === String(menuSet.id) ? "Cerrar" : "Ver detalle"}
                            </Button>
                          </Box>
                        </Stack>
                      </Box>
                    ))}
                  </Box>
                </>
              )}

              <DashboardPagination
                pagination={data.pagination}
                onChange={changePage}
                itemLabel="conjuntos"
              />
            </Stack>
          </Paper>

          {/* Detalle dentro del mismo panel */}
          {selectedMenuSetId && detailLoading ? (
            <Paper sx={{ ...panelSx, minHeight: 180, display: "grid", placeItems: "center" }}>
              <Stack alignItems="center" spacing={1.5}>
                <CircularProgress size={26} />
                <Typography sx={{ fontSize: 13, color: "text.secondary" }}>
                  Consultando detalle del Conjunto…
                </Typography>
              </Stack>
            </Paper>
          ) : visibleDetail ? (
            <MenuSetDetail
              key={`${visibleDetail.id}-${visibleDetail.service_date}`}
              detail={visibleDetail}
              onClose={() => setSelectedMenuSetId(null)}
            />
          ) : null}
        </>
      ) : (
        <Paper sx={{ ...panelSx, py: 4, textAlign: "center" }}>
          <LayersOutlinedIcon sx={{ fontSize: 40, color: "text.disabled" }} />
          <Typography sx={{ mt: 1, fontSize: 13, color: "text.secondary" }}>
            No hay información de Conjuntos para mostrar.
          </Typography>
        </Paper>
      )}
    </Stack>
  );
}