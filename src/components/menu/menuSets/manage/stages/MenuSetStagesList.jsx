import {
  Box, Button, Chip, CircularProgress, FormControlLabel,
  IconButton, Paper, Stack, Switch, Table, TableBody,
  TableCell, TableContainer, TableHead, TableRow,
  Tooltip, Typography,
} from "@mui/material";

import EditOutlinedIcon from "@mui/icons-material/EditOutlined";
import DeleteOutlineOutlinedIcon from "@mui/icons-material/DeleteOutlineOutlined";
import RestaurantMenuOutlinedIcon from "@mui/icons-material/RestaurantMenuOutlined";
import InfoOutlinedIcon from "@mui/icons-material/InfoOutlined";
import LayersOutlinedIcon from "@mui/icons-material/LayersOutlined";
import FormatListNumberedOutlinedIcon from "@mui/icons-material/FormatListNumberedOutlined";

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

function PermissionInfo({ reason }) {
  if (!reason) return null;

  return (
    <Tooltip title={reason} enterTouchDelay={0} leaveTouchDelay={3500} arrow>
      <IconButton
        size="small"
        aria-label={reason}
        sx={{ p: 0.5, color: "text.secondary" }}
      >
        <InfoOutlinedIcon fontSize="small" />
      </IconButton>
    </Tooltip>
  );
}

function StatusControl({ stage, busy, updating, onStatusChange }) {
  const active = Boolean(stage.is_active);
  const allowed = active ? stage.can_deactivate === true : stage.can_activate === true;
  const reason = active ? stage.deactivate_block_reason : stage.activate_block_reason;

  return (
    <Stack direction="row" spacing={0.5} alignItems="center" sx={{ minWidth: 0 }}>
      <FormControlLabel
        sx={{ m: 0, minWidth: 0 }}
        control={
          <Switch
            color="primary"
            checked={active}
            disabled={busy || !allowed}
            onChange={(event) => onStatusChange(stage, event.target.checked)}
            inputProps={{
              "aria-label": `${active ? "Desactivar" : "Activar"} ${stage.name || "etapa"}`,
            }}
          />
        }
        label={
          <Typography sx={{
            fontSize: 13,
            fontWeight: 800,
            color: "text.primary",
          }}>
            {active ? "Activa" : "Inactiva"}
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

function Actions({ stage, busy, onEdit, onDelete, onConfigureProducts }) {
  const canEdit = stage.can_edit === true;
  const canDelete = stage.can_delete === true;
  const canConfigure = typeof onConfigureProducts === "function";

  return (
    <Stack
      direction="row"
      spacing={1}
      useFlexGap
      flexWrap="wrap"
      justifyContent="flex-end"
      alignItems="center"
      sx={{ width: "100%", minWidth: 0 }}
    >
      {/* Administrar productos */}
      <Tooltip
        title={canConfigure
          ? "Administrar los productos de esta etapa"
          : "La configuración de productos estará disponible en el siguiente paso."}
        arrow
      >
        <span>
          <Button
            type="button"
            variant="outlined"
            size="small"
            startIcon={<RestaurantMenuOutlinedIcon />}
            disabled={busy || !canConfigure}
            onClick={() => onConfigureProducts?.(stage)}
          >
            Productos
          </Button>
        </span>
      </Tooltip>

      {/* Editar etapa */}
      <Tooltip title={canEdit ? "Editar etapa" : stage.edit_block_reason || ""} arrow>
        <span>
          <IconButton
            type="button"
            sx={iconEditSx}
            disabled={busy || !canEdit}
            onClick={() => onEdit(stage)}
            aria-label={`Editar ${stage.name || "etapa"}`}
          >
            <EditOutlinedIcon fontSize="small" />
          </IconButton>
        </span>
      </Tooltip>

      {/* Eliminar etapa */}
      <Tooltip
        title={canDelete ? "Eliminar etapa" : stage.delete_block_reason || ""}
        arrow
      >
        <span>
          <IconButton
            type="button"
            sx={iconDeleteSx}
            disabled={busy || !canDelete}
            onClick={() => onDelete(stage)}
            aria-label={`Eliminar ${stage.name || "etapa"}`}
          >
            <DeleteOutlineOutlinedIcon fontSize="small" />
          </IconButton>
        </span>
      </Tooltip>
    </Stack>
  );
}

function InfoRow({ icon, label, value }) {
  return (
    <Stack direction="row" spacing={1.25} alignItems="flex-start">
      <Box sx={{
        width: 32, height: 32, borderRadius: 1,
        flexShrink: 0, display: "grid", placeItems: "center",
        bgcolor: "rgba(255, 152, 0, 0.12)",
        color: "primary.main",
      }}>
        {icon}
      </Box>

      <Box sx={{ minWidth: 0 }}>
        <Typography sx={{
          fontSize: 11,
          fontWeight: 800,
          color: "text.secondary",
          textTransform: "uppercase",
          letterSpacing: 0.3,
        }}>
          {label}
        </Typography>

        <Typography sx={{
          mt: 0.25,
          fontSize: 13,
          color: "text.primary",
          lineHeight: 1.45,
          overflowWrap: "anywhere",
        }}>
          {value}
        </Typography>
      </Box>
    </Stack>
  );
}

function StageCard({
  stage,
  busy,
  updating,
  onStatusChange,
  onEdit,
  onDelete,
  onConfigureProducts,
}) {
  const productsCount = Number(stage.options_count || 0);

  return (
    <Paper sx={{
      height: "100%",
      minHeight: 315,
      display: "flex",
      flexDirection: "column",
      border: "1px solid",
      borderColor: "divider",
      borderRadius: 1,
      backgroundColor: "background.paper",
      boxShadow: "none",
      overflow: "hidden",
    }}>
      <Box sx={{
        px: 2,
        py: 1.75,
        borderBottom: "1px solid",
        borderColor: "divider",
      }}>
        <Stack direction="row" justifyContent="space-between" alignItems="flex-start" spacing={1}>
          <Typography sx={{
            minWidth: 0,
            fontSize: 17,
            fontWeight: 800,
            color: "text.primary",
            lineHeight: 1.35,
            overflowWrap: "anywhere",
          }}>
            {stage.name || "Etapa sin nombre"}
          </Typography>

          <Chip
            size="small"
            label={stage.required ? "Obligatoria" : "Opcional"}
            color={stage.required ? "primary" : "default"}
            variant={stage.required ? "filled" : "outlined"}
          />
        </Stack>

        <Box sx={{ mt: 0.75 }}>
          <StatusControl
            stage={stage}
            busy={busy}
            updating={updating}
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
            fontSize: 11,
            fontWeight: 800,
            color: "text.secondary",
            textTransform: "uppercase",
          }}>
            Selecciones permitidas
          </Typography>

          <Typography sx={{
            mt: 0.5,
            fontSize: 20,
            fontWeight: 800,
            color: "primary.main",
          }}>
            {stage.min_selections} a {stage.max_selections}
          </Typography>
        </Box>

        <InfoRow
          icon={<RestaurantMenuOutlinedIcon fontSize="small" />}
          label="Productos asignados"
          value={`${productsCount} ${productsCount === 1 ? "producto" : "productos"}`}
        />

        <InfoRow
          icon={<FormatListNumberedOutlinedIcon fontSize="small" />}
          label="Orden de presentación"
          value={stage.sort_order ?? 0}
        />

        <Box sx={{ flex: 1 }} />

        <Actions
          stage={stage}
          busy={busy}
          onEdit={onEdit}
          onDelete={onDelete}
          onConfigureProducts={onConfigureProducts}
        />
      </Stack>
    </Paper>
  );
}

export default function MenuSetStagesList({
  stages = [],
  busy = false,
  updatingStageId = null,
  hasFilters = false,
  onStatusChange,
  onEdit,
  onDelete,
  onConfigureProducts,
}) {
  if (stages.length === 0) {
    return (
      <Box sx={{
        px: 3,
        py: 6,
        textAlign: "center",
        backgroundColor: "background.paper",
      }}>
        <Box sx={{
          width: 56, height: 56,
          mx: "auto", mb: 2,
          borderRadius: 1,
          display: "grid",
          placeItems: "center",
          bgcolor: "rgba(255, 152, 0, 0.12)",
          color: "primary.main",
        }}>
          <LayersOutlinedIcon />
        </Box>

        <Typography sx={{ fontSize: 20, fontWeight: 800, color: "text.primary" }}>
          {hasFilters ? "No se encontraron etapas" : "Este conjunto todavía no tiene etapas"}
        </Typography>

        <Typography sx={{
          mt: 1,
          fontSize: 14,
          color: "text.secondary",
          lineHeight: 1.55,
        }}>
          {hasFilters
            ? "No hay etapas que coincidan con la búsqueda o el estado seleccionado."
            : "Agrega la primera etapa para comenzar a organizar los productos del conjunto."}
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
        backgroundColor: "background.paper",
        overflowX: "auto",
      }}>
        <Table sx={{ minWidth: 1050 }}>
          <TableHead>
            <TableRow sx={{
              "& th": {
                bgcolor: "primary.main",
                color: "#fff",
                fontSize: 13,
                fontWeight: 800,
                borderBottom: "none",
                whiteSpace: "nowrap",
              },
            }}>
              <TableCell>Etapa</TableCell>
              <TableCell>Tipo</TableCell>
              <TableCell align="center">Mínimo</TableCell>
              <TableCell align="center">Máximo</TableCell>
              <TableCell align="center">Orden</TableCell>
              <TableCell align="center">Productos</TableCell>
              <TableCell>Estado</TableCell>
              <TableCell align="right">Acciones</TableCell>
            </TableRow>
          </TableHead>

          <TableBody>
            {stages.map((stage) => (
              <TableRow key={stage.id} hover sx={{
                "& td": {
                  borderBottom: "1px solid",
                  borderColor: "divider",
                  fontSize: 14,
                  color: "text.primary",
                  verticalAlign: "middle",
                },
              }}>
                <TableCell sx={{ minWidth: 145, maxWidth: 220 }}>
                  <Typography sx={{
                    fontSize: 14,
                    fontWeight: 800,
                    color: "text.primary",
                    overflowWrap: "anywhere",
                  }}>
                    {stage.name || "Etapa sin nombre"}
                  </Typography>

                  <Typography sx={{
                    mt: 0.35,
                    fontSize: 12,
                    color: "text.secondary",
                  }}>
                    {stage.stage_definition?.is_system
                      ? "Predeterminada"
                      : "Personalizada"}
                  </Typography>
                </TableCell>

                <TableCell>
                  <Chip
                    size="small"
                    label={stage.required ? "Obligatoria" : "Opcional"}
                    color={stage.required ? "primary" : "default"}
                    variant={stage.required ? "filled" : "outlined"}
                  />
                </TableCell>

                <TableCell align="center">{stage.min_selections}</TableCell>
                <TableCell align="center">{stage.max_selections}</TableCell>
                <TableCell align="center">{stage.sort_order}</TableCell>
                <TableCell align="center">{stage.options_count ?? 0}</TableCell>

                <TableCell>
                  <StatusControl
                    stage={stage}
                    busy={busy}
                    updating={String(updatingStageId) === String(stage.id)}
                    onStatusChange={onStatusChange}
                  />
                </TableCell>

                <TableCell align="right">
                  <Actions
                    stage={stage}
                    busy={busy}
                    onEdit={onEdit}
                    onDelete={onDelete}
                    onConfigureProducts={onConfigureProducts}
                  />
                </TableCell>
              </TableRow>
            ))}
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
        p: 2,
        alignItems: "stretch",
      }}>
        {stages.map((stage) => (
          <StageCard
            key={stage.id}
            stage={stage}
            busy={busy}
            updating={String(updatingStageId) === String(stage.id)}
            onStatusChange={onStatusChange}
            onEdit={onEdit}
            onDelete={onDelete}
            onConfigureProducts={onConfigureProducts}
          />
        ))}
      </Box>
    </>
  );
}