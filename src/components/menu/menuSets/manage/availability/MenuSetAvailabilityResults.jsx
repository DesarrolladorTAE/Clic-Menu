
import { useMemo } from "react";

import {
  Box, Chip, Divider, Paper, Stack, Table, TableBody,
  TableCell, TableContainer, TableHead, TableRow,
  Typography,
} from "@mui/material";

import Inventory2OutlinedIcon from "@mui/icons-material/Inventory2Outlined";
import CheckCircleOutlineRoundedIcon from "@mui/icons-material/CheckCircleOutlineRounded";
import EventAvailableOutlinedIcon from "@mui/icons-material/EventAvailableOutlined";
import InfoOutlinedIcon from "@mui/icons-material/InfoOutlined";

import PaginationFooter from "../../../../common/PaginationFooter";
import usePagination from "../../../../../hooks/usePagination";

const STAGES_PAGE_SIZE = 2;
const PRODUCTS_PAGE_SIZE = 5;

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
  borderRadius: 1,
  border: "1px solid",
  borderColor: "divider",
  bgcolor: "background.paper",
  boxShadow: "none",
  overflow: "hidden",
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
  return STATUS_CONFIG[availability?.status] || {
    label: "Sin información",
    color: "default",
  };
}

function getPreparedMessage(availability) {
  if (!availability?.prepared_selection_required) return null;

  const choices = Array.isArray(availability.prepared_choices)
    ? availability.prepared_choices : [];

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

function SummaryCard({ icon, label, value }) {
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
      <Stack spacing={1} sx={{ height: "100%" }}>
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
            overflowWrap: "anywhere",
          }}>
            {label}
          </Typography>
        </Stack>

        <Typography sx={{
          mt: "auto !important",
          fontSize: 19,
          fontWeight: 800,
          color: "text.primary",
          overflowWrap: "anywhere",
          lineHeight: 1.35,
        }}>
          {value}
        </Typography>
      </Stack>
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
              lineHeight: 1.4,
              overflowWrap: "anywhere",
            }}>
              {option.product_name || "Producto sin nombre"}
            </Typography>

            <Typography sx={{
              mt: 0.35,
              fontSize: 12,
              color: "text.secondary",
            }}>
              Producto del conjunto
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
              overflowWrap: "anywhere",
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
              label="Cupo restante"
              value={availability.capacity_remaining}
            />

            <DetailItem
              label="Disponibilidad física"
              value={availability.physical_available}
            />

            <Box sx={{ gridColumn: "1 / -1" }}>
              <DetailItem
                label="Disponible efectivo"
                value={availability.effective_available}
              />
            </Box>
          </Box>
        </Box>
      </Stack>
    </Paper>
  );
}

function AvailabilityTable({ options }) {
  return (
    <TableContainer sx={{
      display: { xs: "none", md: "block" },
      width: "100%",
      overflowX: "auto",
    }}>
      <Table sx={{ minWidth: 900 }}>
        <TableHead>
          <TableRow sx={{
            "& th": {
              bgcolor: "primary.main",
              color: "#fff",
              fontWeight: 800,
              fontSize: 13,
              borderBottom: "none",
              whiteSpace: "nowrap",
            },
          }}>
            <TableCell sx={{ width: "20%" }}>
              Producto
            </TableCell>

            <TableCell sx={{ width: "17%" }}>
              Estado
            </TableCell>

            <TableCell sx={{ width: "27%" }}>
              Motivo
            </TableCell>

            <TableCell align="center" sx={{ width: "12%" }}>
              Cupo restante
            </TableCell>

            <TableCell align="center" sx={{ width: "12%" }}>
              Disponibilidad física
            </TableCell>

            <TableCell align="center" sx={{ width: "12%" }}>
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
                sx={{
                  "& td": {
                    py: 2,
                    borderBottom: "1px solid",
                    borderColor: "divider",
                    fontSize: 14,
                    color: "text.primary",
                    verticalAlign: "middle",
                  },
                }}
              >
                <TableCell>
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

                <TableCell>
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
                      overflowWrap: "anywhere",
                    }}>
                      {preparedMessage}
                    </Typography>
                  ) : null}
                </TableCell>

                <TableCell align="center">
                  <Typography sx={{
                    fontSize: 14,
                    fontWeight: 800,
                    color: "text.primary",
                    overflowWrap: "anywhere",
                  }}>
                    {formatQuantity(availability.capacity_remaining)}
                  </Typography>
                </TableCell>

                <TableCell align="center">
                  <Typography sx={{
                    fontSize: 14,
                    fontWeight: 800,
                    color: "text.primary",
                    overflowWrap: "anywhere",
                  }}>
                    {formatQuantity(availability.physical_available)}
                  </Typography>
                </TableCell>

                <TableCell align="center">
                  <Typography sx={{
                    fontSize: 14,
                    fontWeight: 800,
                    color: "text.primary",
                    overflowWrap: "anywhere",
                  }}>
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

function StageGroup({ group }) {
  const pagination = usePagination({
    items: group.options,
    initialPage: 1,
    pageSize: PRODUCTS_PAGE_SIZE,
    mode: "frontend",
    resetKey: group.id,
  });

  return (
    <Paper sx={{
      ...panelSx,
      border: "1.5px solid",
      borderColor: "#E5A67F",
      boxShadow: "0 2px 8px rgba(140, 75, 45, 0.08)",
    }}>
      {/* Encabezado de la etapa */}
      <Box sx={{
        px: { xs: 2, sm: 2.5 },
        py: 1.75,
        borderBottom: "1px solid",
        borderColor: "divider",
      }}>
        <Stack
          direction={{ xs: "column", sm: "row" }}
          justifyContent="space-between"
          alignItems={{ xs: "flex-start", sm: "center" }}
          spacing={1.5}
        >
          <Stack direction="row" spacing={1.25} alignItems="center" sx={{ minWidth: 0 }}>
            <Box sx={{
              width: 40,
              height: 40,
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
              fontSize: { xs: 17, sm: 19 },
              fontWeight: 800,
              color: "text.primary",
              lineHeight: 1.4,
              overflowWrap: "anywhere",
            }}>
              {group.name}
            </Typography>
          </Stack>

          <Chip
            label={`${group.options.length} ${group.options.length === 1 ? "producto" : "productos"}`}
            size="small"
            variant="outlined"
            sx={{
              fontWeight: 800,
              color: "text.primary",
              flexShrink: 0,
            }}
          />
        </Stack>
      </Box>

      {/* Tabla para computadoras */}
      <AvailabilityTable options={pagination.paginatedItems} />

      {/* Tarjetas para teléfonos y tabletas */}
      <Box sx={{
        display: { xs: "grid", md: "none" },
        gridTemplateColumns: {
          xs: "1fr",
          sm: "repeat(2, minmax(0, 1fr))",
        },
        gridAutoRows: "1fr",
        gap: 1.5,
        p: { xs: 2, sm: 2.5 },
        alignItems: "stretch",
      }}>
        {pagination.paginatedItems.map((option) => (
          <AvailabilityCard
            key={option.option_id}
            option={option}
          />
        ))}
      </Box>

      {/* Paginación independiente de cada etapa */}
      {pagination.total > 0 ? (
        <Box sx={{
          borderTop: "1px solid",
          borderColor: "divider",
        }}>
          <PaginationFooter
            page={pagination.page}
            totalPages={pagination.totalPages}
            startItem={pagination.startItem}
            endItem={pagination.endItem}
            total={pagination.total}
            hasPrev={pagination.hasPrev}
            hasNext={pagination.hasNext}
            onPrev={pagination.prevPage}
            onNext={pagination.nextPage}
            itemLabel="productos"
          />
        </Box>
      ) : null}
    </Paper>
  );
}

export default function MenuSetAvailabilityResults({
  result,
  queryChanged = false,
}) {
  const options = useMemo(() => {
    return Array.isArray(result?.options) ? result.options : [];
  }, [result]);

  const total = options.length;

  const availableCount = useMemo(() => {
    return options.filter((option) => option.availability?.is_available === true).length;
  }, [options]);

  const unavailableCount = total - availableCount;

  // Agrupar todos los productos por etapa antes de paginar.
  const groups = useMemo(() => {
    const map = new Map();

    options.forEach((option) => {
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
  }, [options]);

  // Mostrar dos etapas por página.
  const stagePagination = usePagination({
    items: groups,
    initialPage: 1,
    pageSize: STAGES_PAGE_SIZE,
    mode: "frontend",
    resetKey: `${result?.menu_set_id ?? ""}|${result?.service_date ?? ""}|${result?.quantity ?? ""}`,
  });

  if (total === 0) {
    return (
      <Paper sx={{
        ...panelSx,
        p: { xs: 2, sm: 2.5 },
        py: 5,
        textAlign: "center",
      }}>
        <Inventory2OutlinedIcon sx={{
          fontSize: 44,
          color: "text.disabled",
          mb: 1,
        }} />

        <Typography sx={{
          fontSize: 19,
          fontWeight: 800,
          color: "text.primary",
        }}>
          No hay productos para consultar
        </Typography>

        <Typography sx={{
          mt: 1,
          fontSize: 14,
          color: "text.secondary",
          lineHeight: 1.55,
        }}>
          Este conjunto todavía no tiene productos registrados en sus etapas.
        </Typography>
      </Paper>
    );
  }

  return (
    <Stack spacing={3}>
      {/* Resumen de la consulta */}
      <Paper sx={{
        ...panelSx,
        p: { xs: 2, sm: 2.5 },
      }}>
        <Stack spacing={2}>
          <Stack
            direction={{ xs: "column", md: "row" }}
            justifyContent="space-between"
            alignItems={{ xs: "flex-start", md: "center" }}
            spacing={1.5}
          >
            <Box sx={{ minWidth: 0 }}>
              <Typography sx={{
                fontSize: 18,
                fontWeight: 800,
                color: "text.primary",
              }}>
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
              <Chip
                label="Consulta anterior"
                color="warning"
                size="small"
                variant="outlined"
              />
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
            />

            <SummaryCard
              icon={<InfoOutlinedIcon fontSize="small" />}
              label="Opciones no disponibles"
              value={unavailableCount}
            />
          </Box>

          <Typography sx={{
            fontSize: 12,
            color: "text.secondary",
            lineHeight: 1.6,
          }}>
            La consulta corresponde a las opciones base de los productos. Las variantes
            no se comprueban individualmente y estos resultados no determinan si el
            conjunto completo puede venderse.
          </Typography>
        </Stack>
      </Paper>

      {/* Disponibilidad agrupada por etapas */}
      <Paper sx={panelSx}>
        <Box sx={{
          px: { xs: 2, sm: 2.5 },
          py: 1.75,
          borderBottom: "1px solid",
          borderColor: "divider",
        }}>
          <Typography sx={{
            fontSize: 20,
            fontWeight: 800,
            color: "text.primary",
          }}>
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

        {/* Dos etapas por página, cada una con su propia paginación */}
        <Stack spacing={2.5} sx={{ p: { xs: 2, sm: 2.5 } }}>
          {stagePagination.paginatedItems.map((group) => (
            <StageGroup
              key={group.id}
              group={group}
            />
          ))}
        </Stack>

        {/* Paginación general de etapas */}
        {stagePagination.total > 0 ? (
          <Box sx={{
            borderTop: "1px solid",
            borderColor: "divider",
          }}>
            <PaginationFooter
              page={stagePagination.page}
              totalPages={stagePagination.totalPages}
              startItem={stagePagination.startItem}
              endItem={stagePagination.endItem}
              total={stagePagination.total}
              hasPrev={stagePagination.hasPrev}
              hasNext={stagePagination.hasNext}
              onPrev={stagePagination.prevPage}
              onNext={stagePagination.nextPage}
              itemLabel="etapas"
            />
          </Box>
        ) : null}
      </Paper>
    </Stack>
  );
}