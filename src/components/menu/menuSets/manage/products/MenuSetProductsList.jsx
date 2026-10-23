import {
  Box, Chip, CircularProgress, FormControlLabel,
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

const switchLabelSx = {
  fontSize: 14,
  fontWeight: 700,
  color: "text.primary",
};

const iconEditSx = {
  width: 40,
  height: 40,
  bgcolor: "#E3C24A",
  color: "#fff",
  borderRadius: 1.5,
  "&:hover": {
    bgcolor: "#C9AA39",
  },
  "&.Mui-disabled": {
    bgcolor: "#E0E0E0",
    color: "#9E9E9E",
  },
};

const iconDeleteSx = {
  width: 40,
  height: 40,
  bgcolor: "error.main",
  color: "#fff",
  borderRadius: 1.5,
  "&:hover": {
    bgcolor: "error.dark",
  },
  "&.Mui-disabled": {
    bgcolor: "#E0E0E0",
    color: "#9E9E9E",
  },
};

function formatDays(days) {
  if (!Array.isArray(days) || days.length === 0) return "Sin días configurados";

  return [...new Set(days.map(Number))]
    .sort((a, b) => a - b)
    .filter((day) => day >= 1 && day <= 7)
    .map((day) => DAYS[day - 1])
    .join(", ");
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
          <Typography sx={switchLabelSx}>
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
      flexWrap="nowrap"
      sx={{ minWidth: 0 }}
    >
      <Tooltip title={canEdit ? "Editar" : option.edit_block_reason || "Edición no disponible"} arrow>
        <span>
          <IconButton
            type="button"
            onClick={() => onEdit(option)}
            disabled={disabled || !canEdit}
            aria-label={`Editar ${option.name || option.product?.name || "producto"}`}
            sx={iconEditSx}
          >
            <EditOutlinedIcon fontSize="small" />
          </IconButton>
        </span>
      </Tooltip>

      <Tooltip title={canDelete ? "Retirar producto" : option.delete_block_reason || "Eliminación no disponible"} arrow>
        <span>
          <IconButton
            type="button"
            onClick={() => onDelete(option)}
            disabled={disabled || !canDelete}
            aria-label={`Retirar ${option.name || option.product?.name || "producto"}`}
            sx={iconDeleteSx}
          >
            <DeleteOutlineOutlinedIcon fontSize="small" />
          </IconButton>
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
  option, disabled, updating,
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
      display: "flex",
      flexDirection: "column",
    }}>
      <Stack spacing={2} sx={{ p: 2, flex: 1 }}>
        {/* Información del producto */}
        <Stack
          direction="row"
          justifyContent="space-between"
          alignItems="flex-start"
          spacing={1}
        >
          <Typography sx={{
            fontSize: 15,
            fontWeight: 800,
            color: "text.primary",
            lineHeight: 1.35,
            overflowWrap: "anywhere",
            minWidth: 0,
          }}>
            {option.name || option.product?.name || "Producto sin nombre"}
          </Typography>

          <Chip
            label={`Orden ${option.sort_order ?? 0}`}
            size="small"
            sx={{
              fontWeight: 800,
              bgcolor: "#FFF3E0",
              color: "#A75A00",
              flexShrink: 0,
            }}
          />
        </Stack>

        {/* Días de servicio */}
        <InfoRow
          icon={<EventAvailableOutlinedIcon fontSize="small" />}
          label="Días de servicio"
          value={formatDays(option.service_days)}
        />

        <Box sx={{ flex: 1 }} />

        {/* Estado y acciones */}
        <Stack
          direction="row"
          justifyContent="space-between"
          alignItems="center"
          spacing={1}
          useFlexGap
          flexWrap="wrap"
        >
          <StatusControl
            option={option}
            updating={updating}
            disabled={disabled}
            onStatusChange={onStatusChange}
          />

          <Actions
            option={option}
            disabled={disabled}
            onEdit={onEdit}
            onDelete={onDelete}
          />
        </Stack>
      </Stack>
    </Paper>
  );
}

export default function MenuSetProductsList({
  options = [],
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
      <Box sx={{ p: 4, bgcolor: "background.paper" }}>
        <Stack spacing={2} alignItems="center">
          <CircularProgress color="primary" />

          <Typography sx={{ fontSize: 14, color: "text.secondary" }}>
            Cargando productos…
          </Typography>
        </Stack>
      </Box>
    );
  }

  if (options.length === 0) {
    return (
      <Box sx={{
        px: 3,
        py: 6,
        textAlign: "center",
        bgcolor: "background.paper",
      }}>
        <Box sx={{
          width: 56,
          height: 56,
          mx: "auto",
          mb: 2,
          borderRadius: 1,
          display: "grid",
          placeItems: "center",
          bgcolor: "rgba(255, 152, 0, 0.12)",
          color: "primary.main",
        }}>
          <Inventory2OutlinedIcon />
        </Box>

        <Typography sx={{ fontSize: 20, fontWeight: 800, color: "text.primary" }}>
          {hasFilters ? "No se encontraron productos" : "Esta etapa todavía no tiene productos"}
        </Typography>

        <Typography sx={{
          mt: 1,
          fontSize: 14,
          color: "text.secondary",
          lineHeight: 1.55,
        }}>
          {hasFilters
            ? "No hay productos que coincidan con la búsqueda o el estado seleccionado."
            : "Agrega productos existentes del catálogo para configurar esta etapa."}
        </Typography>
      </Box>
    );
  }

  return (
    <>
      {/* Tabla para computadoras */}
      <TableContainer sx={{
        display: { xs: "none", md: "block" },
        width: "100%",
        overflowX: "auto",
        bgcolor: "background.paper",
      }}>
        <Table sx={{ minWidth: 850 }}>
          <TableHead>
            <TableRow sx={{
              "& th": {
                backgroundColor: "primary.main",
                color: "#fff",
                fontWeight: 800,
                fontSize: 13,
                borderBottom: "none",
                whiteSpace: "nowrap",
              },
            }}>
              <TableCell>Producto</TableCell>
              <TableCell>Días de servicio</TableCell>
              <TableCell>Orden</TableCell>
              <TableCell align="center">Estado</TableCell>
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
                    maxWidth: 230,
                    fontWeight: 800,
                    overflowWrap: "anywhere",
                  }}>
                    {option.name || option.product?.name}
                  </TableCell>

                  <TableCell sx={{
                    maxWidth: 240,
                    overflowWrap: "anywhere",
                  }}>
                    {formatDays(option.service_days)}
                  </TableCell>

                  <TableCell>
                    {option.sort_order ?? 0}
                  </TableCell>

                  <TableCell align="center">
                    <Box sx={{
                      display: "flex",
                      justifyContent: "center",
                      alignItems: "center",
                    }}>
                      <StatusControl
                        option={option}
                        updating={updating}
                        disabled={busy}
                        onStatusChange={onStatusChange}
                      />
                    </Box>
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
          xs: "minmax(0, 1fr)",
          sm: "repeat(2, minmax(0, 1fr))",
        },
        gridAutoRows: "1fr",
        gap: 1.5,
        p: 2,
        alignItems: "stretch",
        bgcolor: "background.paper",
      }}>
        {options.map((option) => (
          <ProductCard
            key={option.id}
            option={option}
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