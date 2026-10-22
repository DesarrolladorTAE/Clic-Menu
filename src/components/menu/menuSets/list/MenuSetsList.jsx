import {
  Box, Button, Chip, CircularProgress, FormControlLabel,
  IconButton, LinearProgress, Paper, Stack, Switch,
  Table, TableBody, TableCell, TableContainer, TableHead,
  TableRow, Tooltip, Typography,
} from "@mui/material";

import DeleteOutlineOutlinedIcon from "@mui/icons-material/DeleteOutlineOutlined";
import EventAvailableOutlinedIcon from "@mui/icons-material/EventAvailableOutlined";
import RestaurantMenuOutlinedIcon from "@mui/icons-material/RestaurantMenuOutlined";
import InfoOutlinedIcon from "@mui/icons-material/InfoOutlined";
import LayersOutlinedIcon from "@mui/icons-material/LayersOutlined";

const DAYS = ["Lun", "Mar", "Mié", "Jue", "Vie", "Sáb", "Dom"];

const formatMoney = (value) => new Intl.NumberFormat("es-MX", {
  style: "currency",
  currency: "MXN",
  minimumFractionDigits: 2,
}).format(Number(value || 0));

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
      <IconButton
        size="small"
        aria-label={reason}
        sx={{ color: "text.secondary", p: 0.5 }}
      >
        <InfoOutlinedIcon fontSize="small" />
      </IconButton>
    </Tooltip>
  );
}

function StatusControl({ menuSet, updating, onStatusChange }) {
  const isActive = Boolean(menuSet.is_active);
  const allowed = isActive ? menuSet.can_deactivate === true : menuSet.can_activate === true;
  const reason = isActive
    ? menuSet.deactivate_block_reason
    : menuSet.activate_block_reason;

  return (
    <Stack direction="row" spacing={0.5} alignItems="center" sx={{ minWidth: 0 }}>
      <FormControlLabel
        sx={{ m: 0, minWidth: 0 }}
        control={
          <Switch
            color="primary"
            checked={isActive}
            disabled={updating || !allowed}
            onChange={(event) => onStatusChange(menuSet, event.target.checked)}
            inputProps={{ "aria-label": `${isActive ? "Desactivar" : "Activar"} ${menuSet.name}` }}
          />
        }
        label={
          <Typography sx={{
            fontSize: 13, fontWeight: 800,
            color: isActive ? "success.main" : "text.secondary",
          }}>
            {isActive ? "Activo" : "Inactivo"}
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

function Actions({ menuSet, updating, onDelete, onManage }) {
  const canDelete = menuSet.can_delete === true;

  return (
    <Stack
      direction="row"
      spacing={1}
      justifyContent="flex-end"
      alignItems="center"
      sx={{ width: "100%", minWidth: 0 }}
    >
      <Box sx={{ flex: { xs: 1, sm: "0 0 auto" }, minWidth: 0 }}>
        <Button
          type="button"
          variant="outlined"
          disabled={updating}
          onClick={() => onManage(menuSet)}
          sx={{ width: { xs: "100%", sm: "auto" } }}
        >
          Administrar
        </Button>
      </Box>

      <Tooltip title="Eliminar conjunto" arrow>
        <span>
          <Button
            type="button"
            variant="outlined"
            color="error"
            disabled={updating || !canDelete}
            onClick={() => onDelete(menuSet)}
            aria-label={`Eliminar ${menuSet.name || "conjunto"}`}
            sx={{
              minWidth: 42,
              width: 42,
              height: 42,
              p: 0,
              flexShrink: 0,
            }}
          >
            <DeleteOutlineOutlinedIcon fontSize="small" />
          </Button>
        </span>
      </Tooltip>

      {!canDelete ? <PermissionInfo reason={menuSet.delete_block_reason} /> : null}
    </Stack>
  );
}

function InfoRow({ icon, label, value }) {
  return (
    <Stack direction="row" spacing={1.25} alignItems="flex-start">
      <Box sx={{
        width: 32, height: 32, borderRadius: 1, flexShrink: 0,
        display: "grid", placeItems: "center",
        bgcolor: "rgba(255, 152, 0, 0.12)", color: "primary.main",
      }}>
        {icon}
      </Box>

      <Box sx={{ minWidth: 0 }}>
        <Typography sx={{
          fontSize: 11, fontWeight: 800, color: "text.secondary",
          textTransform: "uppercase", letterSpacing: 0.3,
        }}>
          {label}
        </Typography>

        <Typography sx={{
          mt: 0.25, fontSize: 13, color: "text.primary",
          lineHeight: 1.45, overflowWrap: "anywhere",
        }}>
          {value}
        </Typography>
      </Box>
    </Stack>
  );
}

function MenuSetCard({ menuSet, updating, onStatusChange, onDelete, onManage }) {
  const assignedCount = Number(menuSet.assigned_menus_count || 0);

  return (
    <Paper sx={{
      border: "1px solid", borderColor: "divider",
      borderRadius: 1, boxShadow: "none",
      backgroundColor: "background.paper",
      overflow: "hidden", height: "100%", minHeight: 330,
      display: "flex", flexDirection: "column",
    }}>
      <Box sx={{ px: 2, py: 1.75, borderBottom: "1px solid", borderColor: "divider" }}>
        <Stack direction="row" justifyContent="space-between" alignItems="flex-start" spacing={1}>
          <Typography sx={{
            fontSize: 17, fontWeight: 800, color: "text.primary",
            lineHeight: 1.35, overflowWrap: "anywhere", minWidth: 0,
          }}>
            {menuSet.name || "Conjunto sin nombre"}
          </Typography>

          <Chip
            size="small"
            label={menuSet.is_active ? "Activo" : "Inactivo"}
            color={menuSet.is_active ? "success" : "default"}
            variant={menuSet.is_active ? "filled" : "outlined"}
          />
        </Stack>

        <Box sx={{ mt: 0.75 }}>
          <StatusControl
            menuSet={menuSet}
            updating={updating}
            onStatusChange={onStatusChange}
          />
        </Box>
      </Box>

      <Stack spacing={1.75} sx={{ p: 2, flex: 1 }}>
        <Box sx={{
          p: 1.5, border: "1px solid", borderColor: "divider",
          borderRadius: 1, bgcolor: "background.default",
        }}>
          <Typography sx={{
            fontSize: 11, fontWeight: 800, color: "text.secondary",
            textTransform: "uppercase",
          }}>
            Precio del conjunto
          </Typography>

          <Typography sx={{ mt: 0.5, fontSize: 20, fontWeight: 800, color: "primary.main" }}>
            {formatMoney(menuSet.price)}
          </Typography>
        </Box>

        <InfoRow
          icon={<EventAvailableOutlinedIcon fontSize="small" />}
          label="Días de servicio"
          value={formatDays(menuSet.service_days)}
        />

        <InfoRow
          icon={<RestaurantMenuOutlinedIcon fontSize="small" />}
          label="Menús asociados"
          value={`${assignedCount} ${assignedCount === 1 ? "menú" : "menús"}`}
        />

        <Box sx={{ flex: 1 }} />

        <Actions
          menuSet={menuSet}
          updating={updating}
          onDelete={onDelete}
          onManage={onManage}
        />
      </Stack>
    </Paper>
  );
}

export default function MenuSetsList({
  menuSets = [],
  loading = false,
  updatingIds = new Set(),
  onStatusChange,
  onDelete,
  onManage,
}) {
  return (
    <Stack spacing={2}>
      {loading ? <LinearProgress sx={{ height: 4, borderRadius: 999 }} /> : null}

      {!loading && menuSets.length === 0 ? (
        <Paper sx={{
          px: 3, py: 6, textAlign: "center", borderRadius: 1,
          border: "1px solid", borderColor: "divider",
          backgroundColor: "background.paper", boxShadow: "none",
        }}>
          <Box sx={{
            width: 56, height: 56, mx: "auto", mb: 2, borderRadius: 1,
            display: "grid", placeItems: "center",
            bgcolor: "rgba(255, 152, 0, 0.12)", color: "primary.main",
          }}>
            <LayersOutlinedIcon />
          </Box>

          <Typography sx={{ fontSize: 20, fontWeight: 800, color: "text.primary" }}>
            No se encontraron conjuntos
          </Typography>

          <Typography sx={{ mt: 1, fontSize: 14, color: "text.secondary", lineHeight: 1.55 }}>
            No hay conjuntos que coincidan con la búsqueda o el estado seleccionado.
          </Typography>
        </Paper>
      ) : !loading ? (
        <>
          {/* Tabla para computadoras y tabletas con espacio suficiente. */}
          <TableContainer component={Paper} sx={{
            display: { xs: "none", md: "block" },
            border: "1px solid",
            borderColor: "divider",
            borderRadius: 1,
            boxShadow: "none",
            backgroundColor: "background.paper",
            overflowX: "auto",
          }}>
            <Table sx={{ minWidth: 980 }}>
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
                  <TableCell>Conjunto</TableCell>
                  <TableCell>Precio</TableCell>
                  <TableCell>Días de servicio</TableCell>
                  <TableCell>Menús asociados</TableCell>
                  <TableCell>Estado</TableCell>
                  <TableCell align="right">Acciones</TableCell>
                </TableRow>
              </TableHead>

              <TableBody>
                {menuSets.map((menuSet) => {
                  const updating = updatingIds.has(String(menuSet.id));
                  const assignedCount = Number(menuSet.assigned_menus_count || 0);

                  return (
                    <TableRow
                      key={menuSet.id}
                      hover
                      sx={{
                        "& td": {
                          borderBottom: "1px solid",
                          borderColor: "divider",
                          fontSize: 14,
                          color: "text.primary",
                          verticalAlign: "middle",
                        },
                      }}
                    >
                      <TableCell sx={{
                        maxWidth: 230, fontWeight: 800,
                        color: "text.primary", overflowWrap: "anywhere",
                      }}>
                        {menuSet.name}
                      </TableCell>

                      <TableCell sx={{ fontWeight: 800, color: "primary.main" }}>
                        {formatMoney(menuSet.price)}
                      </TableCell>

                      <TableCell sx={{ maxWidth: 170, overflowWrap: "anywhere" }}>
                        {formatDays(menuSet.service_days)}
                      </TableCell>

                      <TableCell>{assignedCount}</TableCell>

                      <TableCell>
                        <StatusControl
                          menuSet={menuSet}
                          updating={updating}
                          onStatusChange={onStatusChange}
                        />
                      </TableCell>

                      <TableCell align="right">
                        <Actions
                          menuSet={menuSet}
                          updating={updating}
                          onDelete={onDelete}
                          onManage={onManage}
                        />
                      </TableCell>
                    </TableRow>
                  );
                })}
              </TableBody>
            </Table>
          </TableContainer>

          {/* Tarjetas para teléfonos y tabletas pequeñas. */}
          <Box sx={{
            display: { xs: "grid", md: "none" },
            gridTemplateColumns: { xs: "1fr", sm: "repeat(2, minmax(0, 1fr))" },
            gridAutoRows: "1fr", gap: 2, alignItems: "stretch",
          }}>
            {menuSets.map((menuSet) => (
              <MenuSetCard
                key={menuSet.id}
                menuSet={menuSet}
                updating={updatingIds.has(String(menuSet.id))}
                onStatusChange={onStatusChange}
                onDelete={onDelete}
                onManage={onManage}
              />
            ))}
          </Box>
        </>
      ) : null}
    </Stack>
  );
}