import {
  Box, Button, Chip, CircularProgress, FormControlLabel,
  IconButton, Paper, Stack, Switch, Table, TableBody,
  TableCell, TableContainer, TableHead, TableRow,
  Tooltip, Typography,
} from "@mui/material";

import EditOutlinedIcon from "@mui/icons-material/EditOutlined";
import DeleteOutlineOutlinedIcon from "@mui/icons-material/DeleteOutlineOutlined";
import Inventory2OutlinedIcon from "@mui/icons-material/Inventory2Outlined";
import EventAvailableOutlinedIcon from "@mui/icons-material/EventAvailableOutlined";
import NumbersOutlinedIcon from "@mui/icons-material/NumbersOutlined";
import InfoOutlinedIcon from "@mui/icons-material/InfoOutlined";

const DAYS = ["Lun", "Mar", "Mié", "Jue", "Vie", "Sáb", "Dom"];

function formatDays(days) {
  if (!Array.isArray(days) || days.length === 0) return "Sin días configurados";

  return [...new Set(days.map(Number))]
    .sort((a, b) => a - b)
    .filter((day) => day >= 1 && day <= 7)
    .map((day) => DAYS[day - 1])
    .join(", ");
}

function formatCapacity(option, mode) {
  if (mode === "none") return "Sin límite";

  if (mode === "weekly") {
    if (option.weekly_capacity === null || option.weekly_capacity === undefined) {
      return "Sin configurar";
    }

    return `${Number(option.weekly_capacity).toLocaleString("es-MX")} por semana`;
  }

  if (mode === "daily") {
    const days = Array.isArray(option.service_days) ? option.service_days : [];

    if (days.length === 0) return "Sin días configurados";

    return [...days].sort((a, b) => a - b).map((day) => {
      const value = option.daily_capacities?.[String(day)];
      const label = DAYS[Number(day) - 1] || `Día ${day}`;

      return `${label}: ${value === null || value === undefined ? "—" : Number(value).toLocaleString("es-MX")}`;
    }).join(" · ");
  }

  return "No configurada";
}

function PermissionInfo({ reason }) {
  if (!reason) return null;

  return (
    <Tooltip title={reason} enterTouchDelay={0} leaveTouchDelay={3500} arrow>
      <IconButton size="small" aria-label={reason} sx={{ color: "text.secondary", p: 0.5 }}>
        <InfoOutlinedIcon fontSize="small" />
      </IconButton>
    </Tooltip>
  );
}

function StatusControl({ option, updating, disabled, onStatusChange }) {
  const active = Boolean(option.is_active);
  const allowed = active
    ? option.can_deactivate === true
    : option.can_activate === true;

  const reason = active
    ? option.deactivate_block_reason
    : option.activate_block_reason;

  return (
    <Stack direction="row" spacing={0.5} alignItems="center" sx={{ minWidth: 0 }}>
      <FormControlLabel
        sx={{ m: 0, minWidth: 0 }}
        control={
          <Switch
            color="primary"
            checked={active}
            disabled={disabled || updating || !allowed}
            onChange={(event) => onStatusChange(option, event.target.checked)}
            inputProps={{
              "aria-label": `${active ? "Desactivar" : "Activar"} ${option.name || "producto"}`,
            }}
          />
        }
        label={
          <Typography sx={{
            fontSize: 13, fontWeight: 800,
            color: active ? "success.main" : "text.secondary",
          }}>
            {active ? "Activo" : "Inactivo"}
          </Typography>
        }
      />

      {updating ? (
        <CircularProgress size={16} />
      ) : !allowed ? (
        <PermissionInfo reason={reason} />
      ) : null}
    </Stack>
  );
}

function Actions({ option, disabled, onEdit, onDelete }) {
  const canEdit = option.can_edit === true;
  const canDelete = option.can_delete === true;

  return (
    <Stack
      direction="row"
      spacing={1}
      justifyContent="flex-end"
      alignItems="center"
      sx={{ width: "100%", minWidth: 0 }}
    >
      <Box sx={{ flex: { xs: 1, sm: "0 0 auto" }, minWidth: 0 }}>
        <Tooltip title={canEdit ? "" : option.edit_block_reason || ""} arrow>
          <span>
            <Button
              type="button"
              variant="outlined"
              startIcon={<EditOutlinedIcon />}
              disabled={disabled || !canEdit}
              onClick={() => onEdit(option)}
              sx={{ width: { xs: "100%", sm: "auto" } }}
            >
              Editar
            </Button>
          </span>
        </Tooltip>
      </Box>

      <Tooltip title={canDelete ? "Retirar producto" : option.delete_block_reason || ""} arrow>
        <span>
          <Button
            type="button"
            variant="outlined"
            color="error"
            disabled={disabled || !canDelete}
            onClick={() => onDelete(option)}
            aria-label={`Retirar ${option.name || "producto"}`}
            sx={{
              minWidth: 42, width: 42, height: 42,
              p: 0, flexShrink: 0,
            }}
          >
            <DeleteOutlineOutlinedIcon fontSize="small" />
          </Button>
        </span>
      </Tooltip>

      {!canDelete ? <PermissionInfo reason={option.delete_block_reason} /> : null}
    </Stack>
  );
}

function InfoRow({ icon, label, value }) {
  return (
    <Stack direction="row" spacing={1.25} alignItems="flex-start">
      <Box sx={{
        width: 32, height: 32, borderRadius: 1,
        display: "grid", placeItems: "center", flexShrink: 0,
        bgcolor: "rgba(255, 152, 0, 0.12)", color: "primary.main",
      }}>
        {icon}
      </Box>

      <Box sx={{ minWidth: 0 }}>
        <Typography sx={{
          fontSize: 11, fontWeight: 800,
          color: "text.secondary", textTransform: "uppercase",
          letterSpacing: 0.3,
        }}>
          {label}
        </Typography>

        <Typography sx={{
          mt: 0.25, fontSize: 13,
          color: "text.primary", lineHeight: 1.5,
          overflowWrap: "anywhere",
        }}>
          {value}
        </Typography>
      </Box>
    </Stack>
  );
}

function ProductCard({
  option, mode, disabled, updating,
  onStatusChange, onEdit, onDelete,
}) {
  return (
    <Paper sx={{
      border: "1px solid",
      borderColor: "divider",
      borderRadius: 1,
      boxShadow: "none",
      backgroundColor: "background.paper",
      overflow: "hidden",
      height: "100%",
      minHeight: 330,
      display: "flex",
      flexDirection: "column",
    }}>
      <Box sx={{
        px: 2, py: 1.75,
        borderBottom: "1px solid",
        borderColor: "divider",
      }}>
        <Stack direction="row" justifyContent="space-between" alignItems="flex-start" spacing={1}>
          <Typography sx={{
            fontSize: 17, fontWeight: 800,
            color: "text.primary", lineHeight: 1.35,
            overflowWrap: "anywhere", minWidth: 0,
          }}>
            {option.name || option.product?.name || "Producto sin nombre"}
          </Typography>

          <Chip
            size="small"
            label={option.is_active ? "Activo" : "Inactivo"}
            color={option.is_active ? "success" : "default"}
            variant={option.is_active ? "filled" : "outlined"}
          />
        </Stack>

        <Box sx={{ mt: 0.75 }}>
          <StatusControl
            option={option}
            updating={updating}
            disabled={disabled}
            onStatusChange={onStatusChange}
          />
        </Box>
      </Box>

      <Stack spacing={1.75} sx={{ p: 2, flex: 1 }}>
        <Box sx={{
          p: 1.5,
          border: "1px solid",
          borderColor: "divider",
          borderRadius: 1,
          bgcolor: "background.default",
        }}>
          <Typography sx={{
            fontSize: 11, fontWeight: 800,
            color: "text.secondary", textTransform: "uppercase",
          }}>
            Capacidad
          </Typography>

          <Typography sx={{
            mt: 0.5, fontSize: 14, fontWeight: 800,
            color: "primary.main", lineHeight: 1.5,
            overflowWrap: "anywhere",
          }}>
            {formatCapacity(option, mode)}
          </Typography>
        </Box>

        <InfoRow
          icon={<EventAvailableOutlinedIcon fontSize="small" />}
          label="Días de servicio"
          value={formatDays(option.service_days)}
        />

        <InfoRow
          icon={<NumbersOutlinedIcon fontSize="small" />}
          label="Orden de presentación"
          value={option.sort_order ?? 0}
        />

        <Box sx={{ flex: 1 }} />

        <Actions
          option={option}
          disabled={disabled}
          onEdit={onEdit}
          onDelete={onDelete}
        />
      </Stack>
    </Paper>
  );
}

export default function MenuSetProductsList({
  options = [],
  mode = "none",
  loading = false,
  busy = false,
  updatingOptionId = null,
  hasFilters = false,
  onStatusChange,
  onEdit,
  onDelete,
}) {
  if (loading) {
    return (
      <Paper sx={{
        p: 4, borderRadius: 1,
        border: "1px solid", borderColor: "divider",
        bgcolor: "background.paper", boxShadow: "none",
      }}>
        <Stack spacing={2} alignItems="center">
          <CircularProgress color="primary" />

          <Typography sx={{ fontSize: 14, color: "text.secondary" }}>
            Cargando productos…
          </Typography>
        </Stack>
      </Paper>
    );
  }

  if (options.length === 0) {
    return (
      <Paper sx={{
        px: 3, py: 6,
        textAlign: "center",
        borderRadius: 1,
        border: "1px solid",
        borderColor: "divider",
        bgcolor: "background.paper",
        boxShadow: "none",
      }}>
        <Box sx={{
          width: 56, height: 56,
          mx: "auto", mb: 2,
          borderRadius: 1,
          display: "grid", placeItems: "center",
          bgcolor: "rgba(255, 152, 0, 0.12)",
          color: "primary.main",
        }}>
          <Inventory2OutlinedIcon />
        </Box>

        <Typography sx={{ fontSize: 20, fontWeight: 800, color: "text.primary" }}>
          {hasFilters ? "No se encontraron productos" : "Esta etapa todavía no tiene productos"}
        </Typography>

        <Typography sx={{
          mt: 1, fontSize: 14,
          color: "text.secondary", lineHeight: 1.55,
        }}>
          {hasFilters
            ? "No hay productos que coincidan con la búsqueda o el estado seleccionado."
            : "Agrega productos existentes del catálogo para configurar esta etapa."}
        </Typography>
      </Paper>
    );
  }

  return (
    <>
      {/* Tabla para computadoras */}
      <TableContainer component={Paper} sx={{
        display: { xs: "none", md: "block" },
        border: "1px solid",
        borderColor: "divider",
        borderRadius: 1,
        boxShadow: "none",
        bgcolor: "background.paper",
        overflowX: "auto",
      }}>
        <Table sx={{ minWidth: 1000 }}>
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
              <TableCell>Producto</TableCell>
              <TableCell>Días de servicio</TableCell>
              <TableCell>Capacidad</TableCell>
              <TableCell>Orden</TableCell>
              <TableCell>Estado</TableCell>
              <TableCell align="right">Acciones</TableCell>
            </TableRow>
          </TableHead>

          <TableBody>
            {options.map((option) => {
              const updating = String(updatingOptionId) === String(option.id);

              return (
                <TableRow key={option.id} hover sx={{
                  "& td": {
                    borderBottom: "1px solid",
                    borderColor: "divider",
                    fontSize: 14,
                    color: "text.primary",
                    verticalAlign: "middle",
                  },
                }}>
                  <TableCell sx={{
                    maxWidth: 230, fontWeight: 800,
                    overflowWrap: "anywhere",
                  }}>
                    {option.name || option.product?.name}
                  </TableCell>

                  <TableCell sx={{ maxWidth: 170, overflowWrap: "anywhere" }}>
                    {formatDays(option.service_days)}
                  </TableCell>

                  <TableCell sx={{
                    maxWidth: 220,
                    overflowWrap: "anywhere",
                    fontWeight: 700,
                    color: "primary.main !important",
                  }}>
                    {formatCapacity(option, mode)}
                  </TableCell>

                  <TableCell>{option.sort_order ?? 0}</TableCell>

                  <TableCell>
                    <StatusControl
                      option={option}
                      updating={updating}
                      disabled={busy}
                      onStatusChange={onStatusChange}
                    />
                  </TableCell>

                  <TableCell align="right">
                    <Actions
                      option={option}
                      disabled={busy}
                      onEdit={onEdit}
                      onDelete={onDelete}
                    />
                  </TableCell>
                </TableRow>
              );
            })}
          </TableBody>
        </Table>
      </TableContainer>

      {/* Tarjetas para teléfonos y tabletas */}
      <Box sx={{
        display: { xs: "grid", md: "none" },
        gridTemplateColumns: {
          xs: "1fr",
          sm: "repeat(2, minmax(0, 1fr))",
        },
        gridAutoRows: "1fr",
        gap: 2,
        alignItems: "stretch",
      }}>
        {options.map((option) => (
          <ProductCard
            key={option.id}
            option={option}
            mode={mode}
            disabled={busy}
            updating={String(updatingOptionId) === String(option.id)}
            onStatusChange={onStatusChange}
            onEdit={onEdit}
            onDelete={onDelete}
          />
        ))}
      </Box>
    </>
  );
}