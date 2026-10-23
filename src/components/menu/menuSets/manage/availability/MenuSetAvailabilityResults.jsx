import { useMemo, useState } from "react";

import {
  Box, Chip, Divider, Pagination, Paper, Stack,
  Table, TableBody, TableCell, TableContainer,
  TableHead, TableRow, Typography, useMediaQuery,
} from "@mui/material";

import { useTheme } from "@mui/material/styles";

import Inventory2OutlinedIcon from "@mui/icons-material/Inventory2Outlined";
import CheckCircleOutlineRoundedIcon from "@mui/icons-material/CheckCircleOutlineRounded";
import EventAvailableOutlinedIcon from "@mui/icons-material/EventAvailableOutlined";
import InfoOutlinedIcon from "@mui/icons-material/InfoOutlined";

const PAGE_SIZE = 5;

const STATUS_CONFIG = {
  available: {
    label: "Disponible",
    color: "success",
  },
  capacity_exhausted: {
    label: "Capacidad agotada",
    color: "warning",
  },
  inventory_exhausted: {
    label: "Sin inventario",
    color: "error",
  },
  both_exhausted: {
    label: "Sin cupo ni inventario",
    color: "error",
  },
  configuration_unavailable: {
    label: "No disponible",
    color: "default",
  },
};

const numberFormatter = new Intl.NumberFormat("es-MX", {
  maximumFractionDigits: 3,
});

const panelSx = {
  p: { xs: 2, sm: 2.5 },
  borderRadius: 1,
  border: "1px solid",
  borderColor: "divider",
  bgcolor: "background.paper",
  boxShadow: "none",
};

function formatQuantity(value) {
  if (value === null) return "Sin límite";
  if (value === undefined || value === "") return "No informado";

  const number = Number(value);

  if (!Number.isFinite(number)) return "No informado";

  return numberFormatter.format(number);
}

function formatDate(value) {
  if (!value) return "Sin fecha";

  const date = new Date(`${value}T12:00:00Z`);

  if (Number.isNaN(date.getTime())) return value;

  return new Intl.DateTimeFormat("es-MX", {
    day: "numeric",
    month: "long",
    year: "numeric",
    timeZone: "UTC",
  }).format(date);
}

function getStatus(availability) {
  const status = availability?.status;

  if (STATUS_CONFIG[status]) {
    return STATUS_CONFIG[status];
  }

  return {
    label: "Sin información",
    color: "default",
  };
}

function getPreparedMessage(availability) {
  if (!availability?.prepared_selection_required) return null;

  const choices = Array.isArray(availability.prepared_choices)
    ? availability.prepared_choices
    : [];

  const count = choices.length;

  if (count === 0) return null;

  return count === 1
    ? "Existe una preparación rápida alternativa que requiere selección específica."
    : `Existen ${count} preparaciones rápidas alternativas que requieren selección específica.`;
}

function getReason(availability) {
  const reason = availability?.reason;

  if (typeof reason === "string" && reason.trim()) {
    return reason.trim();
  }

  if (availability?.is_available === true) {
    return "Sin restricciones detectadas para la cantidad consultada.";
  }

  return "No se proporcionó un motivo adicional.";
}

function StatusChip({ availability }) {
  const status = getStatus(availability);

  return (
    <Chip
      label={status.label}
      color={status.color}
      size="small"
      variant={status.color === "default" ? "outlined" : "filled"}
      sx={{
        fontWeight: 800,
        maxWidth: "100%",
        "& .MuiChip-label": {
          overflow: "hidden",
          textOverflow: "ellipsis",
        },
      }}
    />
  );
}

function DetailItem({ label, value }) {
  return (
    <Box sx={{ minWidth: 0 }}>
      <Typography sx={{
        fontSize: 12,
        fontWeight: 800,
        color: "text.secondary",
      }}>
        {label}
      </Typography>

      <Typography sx={{
        mt: 0.35,
        fontSize: 14,
        fontWeight: 800,
        color: "text.primary",
        overflowWrap: "anywhere",
      }}>
        {formatQuantity(value)}
      </Typography>
    </Box>
  );
}

function AvailabilityCard({ option }) {
  const availability = option.availability || {};
  const preparedMessage = getPreparedMessage(availability);

  return (
    <Paper sx={{
      p: 2,
      minWidth: 0,
      minHeight: 300,
      height: "100%",
      borderRadius: 1,
      border: "1px solid",
      borderColor: "divider",
      bgcolor: "background.paper",
      boxShadow: "none",
      display: "flex",
      flexDirection: "column",
    }}>
      <Stack spacing={2} sx={{ flex: 1 }}>
        <Stack direction="row" alignItems="flex-start" spacing={1.25}>
          <Box sx={{
            width: 38,
            height: 38,
            flexShrink: 0,
            borderRadius: 1,
            display: "grid",
            placeItems: "center",
            bgcolor: "rgba(255, 152, 0, 0.12)",
            color: "primary.main",
          }}>
            <Inventory2OutlinedIcon fontSize="small" />
          </Box>

          <Box sx={{ minWidth: 0, flex: 1 }}>
            <Typography sx={{
              fontSize: 16,
              fontWeight: 800,
              color: "text.primary",
              overflowWrap: "anywhere",
              lineHeight: 1.4,
            }}>
              {option.product_name || "Producto sin nombre"}
            </Typography>

            <Typography sx={{
              mt: 0.35,
              fontSize: 12,
              color: "text.secondary",
            }}>
              Producto del Conjunto
            </Typography>
          </Box>
        </Stack>

        <Box>
          <StatusChip availability={availability} />

          <Typography sx={{
            mt: 1,
            fontSize: 13,
            color: "text.secondary",
            lineHeight: 1.55,
            overflowWrap: "anywhere",
          }}>
            {getReason(availability)}
          </Typography>

          {preparedMessage ? (
            <Typography sx={{
              mt: 1,
              fontSize: 12,
              color: "primary.main",
              fontWeight: 700,
              lineHeight: 1.5,
            }}>
              {preparedMessage}
            </Typography>
          ) : null}
        </Box>

        <Box sx={{ mt: "auto !important" }}>
          <Divider sx={{ mb: 1.5 }} />

          <Box sx={{
            display: "grid",
            gridTemplateColumns: "repeat(2, minmax(0, 1fr))",
            gap: 1.5,
          }}>
            <DetailItem
              label="Capacidad restante"
              value={availability.capacity_remaining}
            />

            <DetailItem
              label="Disponibilidad física"
              value={availability.physical_available}
            />

            <DetailItem
              label="Disponibilidad efectiva"
              value={availability.effective_available}
            />
          </Box>
        </Box>
      </Stack>
    </Paper>
  );
}

function AvailabilityTable({ options }) {
  return (
    <TableContainer component={Paper} sx={{
      borderRadius: 1,
      border: "1px solid",
      borderColor: "divider",
      boxShadow: "none",
    }}>
      <Table size="small" sx={{ minWidth: 820 }}>
        <TableHead>
          <TableRow sx={{ bgcolor: "background.default" }}>
            <TableCell sx={{ fontWeight: 800, color: "text.primary", width: "20%" }}>
              Producto
            </TableCell>

            <TableCell sx={{ fontWeight: 800, color: "text.primary", width: "17%" }}>
              Estado
            </TableCell>

            <TableCell sx={{ fontWeight: 800, color: "text.primary", width: "27%" }}>
              Motivo
            </TableCell>

            <TableCell align="center" sx={{ fontWeight: 800, color: "text.primary", width: "12%" }}>
              Cupo restante
            </TableCell>

            <TableCell align="center" sx={{ fontWeight: 800, color: "text.primary", width: "12%" }}>
              Disponibilidad física
            </TableCell>

            <TableCell align="center" sx={{ fontWeight: 800, color: "text.primary", width: "12%" }}>
              Disponible efectivo
            </TableCell>
          </TableRow>
        </TableHead>

        <TableBody>
          {options.map((option) => {
            const availability = option.availability || {};
            const preparedMessage = getPreparedMessage(availability);

            return (
              <TableRow
                key={option.option_id}
                hover
                sx={{ "&:last-child td": { borderBottom: 0 } }}
              >
                <TableCell sx={{ py: 2 }}>
                  <Typography sx={{
                    fontSize: 14,
                    fontWeight: 800,
                    color: "text.primary",
                    overflowWrap: "anywhere",
                  }}>
                    {option.product_name || "Producto sin nombre"}
                  </Typography>
                </TableCell>

                <TableCell>
                  <StatusChip availability={availability} />
                </TableCell>

                <TableCell sx={{ py: 2 }}>
                  <Typography sx={{
                    fontSize: 13,
                    color: "text.secondary",
                    lineHeight: 1.5,
                    overflowWrap: "anywhere",
                  }}>
                    {getReason(availability)}
                  </Typography>

                  {preparedMessage ? (
                    <Typography sx={{
                      mt: 0.75,
                      fontSize: 12,
                      color: "primary.main",
                      fontWeight: 700,
                      lineHeight: 1.45,
                    }}>
                      {preparedMessage}
                    </Typography>
                  ) : null}
                </TableCell>

                <TableCell align="center">
                  <Typography sx={{ fontSize: 14, fontWeight: 800, color: "text.primary" }}>
                    {formatQuantity(availability.capacity_remaining)}
                  </Typography>
                </TableCell>

                <TableCell align="center">
                  <Typography sx={{ fontSize: 14, fontWeight: 800, color: "text.primary" }}>
                    {formatQuantity(availability.physical_available)}
                  </Typography>
                </TableCell>

                <TableCell align="center">
                  <Typography sx={{ fontSize: 14, fontWeight: 800, color: "text.primary" }}>
                    {formatQuantity(availability.effective_available)}
                  </Typography>
                </TableCell>
              </TableRow>
            );
          })}
        </TableBody>
      </Table>
    </TableContainer>
  );
}

function StageGroup({ group, mobile }) {
  return (
    <Stack spacing={1.5}>
      <Stack
        direction={{ xs: "column", sm: "row" }}
        justifyContent="space-between"
        alignItems={{ xs: "flex-start", sm: "center" }}
        spacing={1}
      >
        <Stack direction="row" spacing={1.25} alignItems="center">
          <Box sx={{
            width: 36,
            height: 36,
            borderRadius: 1,
            flexShrink: 0,
            display: "grid",
            placeItems: "center",
            bgcolor: "rgba(255, 152, 0, 0.12)",
            color: "primary.main",
          }}>
            <CheckCircleOutlineRoundedIcon fontSize="small" />
          </Box>

          <Typography sx={{
            fontSize: { xs: 17, sm: 18 },
            fontWeight: 800,
            color: "text.primary",
            overflowWrap: "anywhere",
          }}>
            {group.name}
          </Typography>
        </Stack>

        <Chip
          label={`${group.options.length} ${group.options.length === 1 ? "producto" : "productos"} en esta página`}
          size="small"
          variant="outlined"
        />
      </Stack>

      {mobile ? (
        <Box sx={{
          display: "grid",
          gridTemplateColumns: {
            xs: "1fr",
            sm: "repeat(2, minmax(0, 1fr))",
          },
          gridAutoRows: "1fr",
          gap: 1.5,
        }}>
          {group.options.map((option) => (
            <AvailabilityCard key={option.option_id} option={option} />
          ))}
        </Box>
      ) : (
        <AvailabilityTable options={group.options} />
      )}
    </Stack>
  );
}

export default function MenuSetAvailabilityResults({
  result,
  queryChanged = false,
}) {
  const theme = useTheme();
  const mobile = useMediaQuery(theme.breakpoints.down("md"));

  const [page, setPage] = useState(1);

  const options = useMemo(() => {
    return Array.isArray(result?.options) ? result.options : [];
  }, [result]);

  const total = options.length;
  const totalPages = Math.max(1, Math.ceil(total / PAGE_SIZE));
  const currentPage = Math.min(page, totalPages);

  const startIndex = (currentPage - 1) * PAGE_SIZE;
  const endIndex = Math.min(startIndex + PAGE_SIZE, total);

  const paginatedOptions = useMemo(() => {
    return options.slice(startIndex, endIndex);
  }, [options, startIndex, endIndex]);

  const groups = useMemo(() => {
    const map = new Map();

    paginatedOptions.forEach((option) => {
      const key = String(option.stage_id ?? "sin-etapa");

      if (!map.has(key)) {
        map.set(key, {
          id: key,
          name: option.stage_name || "Etapa sin nombre",
          options: [],
        });
      }

      map.get(key).options.push(option);
    });

    return Array.from(map.values());
  }, [paginatedOptions]);

  const availableCount = useMemo(() => {
    return options.filter((option) => option.availability?.is_available === true).length;
  }, [options]);

  const unavailableCount = total - availableCount;

  if (total === 0) {
    return (
      <Paper sx={{ ...panelSx, py: 5, textAlign: "center" }}>
        <Inventory2OutlinedIcon sx={{ fontSize: 44, color: "text.disabled", mb: 1 }} />

        <Typography sx={{ fontSize: 19, fontWeight: 800, color: "text.primary" }}>
          No hay productos para consultar
        </Typography>

        <Typography sx={{
          mt: 1,
          fontSize: 14,
          color: "text.secondary",
          lineHeight: 1.55,
        }}>
          Este Conjunto todavía no tiene opciones de productos registradas en sus etapas.
        </Typography>
      </Paper>
    );
  }

  return (
    <Stack spacing={3}>
      {/* Resumen de consulta */}
      <Paper sx={panelSx}>
        <Stack spacing={2}>
          <Stack
            direction={{ xs: "column", md: "row" }}
            justifyContent="space-between"
            alignItems={{ xs: "flex-start", md: "center" }}
            spacing={1.5}
          >
            <Box>
              <Typography sx={{ fontSize: 18, fontWeight: 800, color: "text.primary" }}>
                Resultados de disponibilidad
              </Typography>

              <Typography sx={{
                mt: 0.5,
                fontSize: 13,
                color: "text.secondary",
                lineHeight: 1.5,
              }}>
                {queryChanged
                  ? "Estos resultados corresponden a la última consulta realizada."
                  : "Disponibilidad de los productos para la fecha y cantidad consultadas."}
              </Typography>
            </Box>

            {queryChanged ? (
              <Chip label="Consulta anterior" color="warning" size="small" variant="outlined" />
            ) : null}
          </Stack>

          <Box sx={{
            display: "grid",
            gridTemplateColumns: {
              xs: "1fr",
              sm: "repeat(2, minmax(0, 1fr))",
              md: "repeat(4, minmax(0, 1fr))",
            },
            gridAutoRows: "1fr",
            gap: 1.5,
          }}>
            <SummaryCard
              icon={<EventAvailableOutlinedIcon fontSize="small" />}
              label="Fecha consultada"
              value={formatDate(result.service_date)}
            />

            <SummaryCard
              icon={<Inventory2OutlinedIcon fontSize="small" />}
              label="Cantidad solicitada"
              value={formatQuantity(result.quantity)}
            />

            <SummaryCard
              icon={<CheckCircleOutlineRoundedIcon fontSize="small" />}
              label="Opciones disponibles"
              value={availableCount}
              color="success.main"
            />

            <SummaryCard
              icon={<InfoOutlinedIcon fontSize="small" />}
              label="Opciones no disponibles"
              value={unavailableCount}
              color="text.primary"
            />
          </Box>

          <Typography sx={{
            fontSize: 12,
            color: "text.secondary",
            lineHeight: 1.6,
          }}>
            La consulta corresponde a las opciones base de los productos. Las variantes no se
            comprueban individualmente y estos resultados no determinan si el Conjunto completo
            puede venderse.
          </Typography>
        </Stack>
      </Paper>

      {/* Resultados agrupados */}
      <Paper sx={panelSx}>
        <Stack spacing={3}>
          <Box>
            <Typography sx={{ fontSize: 20, fontWeight: 800, color: "text.primary" }}>
              Disponibilidad por etapas
            </Typography>

            <Typography sx={{
              mt: 0.5,
              fontSize: 13,
              color: "text.secondary",
              lineHeight: 1.55,
            }}>
              Consulta el estado individual de cada producto y los motivos que afectan su disponibilidad.
            </Typography>
          </Box>

          {groups.map((group, index) => (
            <Box key={group.id}>
              {index > 0 ? <Divider sx={{ mb: 3 }} /> : null}

              <StageGroup group={group} mobile={mobile} />
            </Box>
          ))}

          {/* Paginación */}
          {total > PAGE_SIZE ? (
            <Stack spacing={1.5} alignItems="center" sx={{ pt: 1 }}>
              <Typography sx={{ fontSize: 12, color: "text.secondary", textAlign: "center" }}>
                Mostrando {startIndex + 1} a {endIndex} de {total} productos
              </Typography>

              <Pagination
                count={totalPages}
                page={currentPage}
                onChange={(_, nextPage) => setPage(nextPage)}
                color="primary"
                shape="rounded"
                size={mobile ? "small" : "medium"}
                siblingCount={mobile ? 0 : 1}
                boundaryCount={1}
                showFirstButton={!mobile}
                showLastButton={!mobile}
                sx={{
                  "& .MuiPaginationItem-root": {
                    fontWeight: 700,
                  },
                }}
              />
            </Stack>
          ) : null}
        </Stack>
      </Paper>
    </Stack>
  );
}

function SummaryCard({ icon, label, value, color = "text.primary" }) {
  return (
    <Box sx={{
      p: 1.75,
      minWidth: 0,
      height: "100%",
      border: "1px solid",
      borderColor: "divider",
      borderRadius: 1,
      bgcolor: "background.default",
    }}>
      <Stack spacing={1} height="100%">
        <Stack direction="row" alignItems="center" spacing={1}>
          <Box sx={{
            width: 34,
            height: 34,
            flexShrink: 0,
            borderRadius: 1,
            display: "grid",
            placeItems: "center",
            bgcolor: "rgba(255, 152, 0, 0.12)",
            color: "primary.main",
          }}>
            {icon}
          </Box>

          <Typography sx={{
            fontSize: 13,
            fontWeight: 800,
            color: "text.secondary",
          }}>
            {label}
          </Typography>
        </Stack>

        <Typography sx={{
          mt: "auto !important",
          fontSize: 19,
          fontWeight: 800,
          color,
          overflowWrap: "anywhere",
          lineHeight: 1.35,
        }}>
          {value}
        </Typography>
      </Stack>
    </Box>
  );
}