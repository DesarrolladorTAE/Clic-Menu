import {
  Box, Button, Chip, FormControlLabel, IconButton, Paper,
  Stack, Switch, Table, TableBody, TableCell, TableContainer,
  TableHead, TableRow, Tooltip, Typography, useMediaQuery,
} from "@mui/material";

import { useTheme } from "@mui/material/styles";

import EditOutlinedIcon from "@mui/icons-material/EditOutlined";
import DeleteOutlineOutlinedIcon from "@mui/icons-material/DeleteOutlineOutlined";
import LayersOutlinedIcon from "@mui/icons-material/LayersOutlined";

const DAYS_DISABLED_REASON = "Esta es una etapa general del sistema y solo puede consultarse.";

function StatusSwitch({ definition, system, busy, updatingId, onStatusChange }) {
  const active = Boolean(definition.is_active);

  const allowed = !system && (
    active
      ? definition.can_deactivate === true
      : definition.can_activate === true
  );

  const reason = system
    ? DAYS_DISABLED_REASON
    : active
      ? definition.deactivate_block_reason
      : definition.activate_block_reason;

  const disabled = system || busy || !allowed;

  return (
    <Tooltip title={disabled && !busy ? reason || "" : ""} arrow>
      <span>
        <FormControlLabel
          sx={{ m: 0 }}
          control={
            <Switch
              size="small"
              color="primary"
              checked={active}
              onChange={(event) => onStatusChange?.(definition, event.target.checked)}
              disabled={disabled}
              inputProps={{ "aria-label": `Estado de ${definition.name}` }}
            />
          }
          label={
            <Typography sx={{
              fontSize: 13,
              fontWeight: 800,
              color: active ? "success.main" : "text.secondary",
            }}>
              {updatingId === definition.id
                ? "Guardando…"
                : active ? "Activa" : "Inactiva"}
            </Typography>
          }
        />
      </span>
    </Tooltip>
  );
}

function DefinitionActions({ definition, busy, onEdit, onDelete }) {
  const canEdit = definition.can_edit === true;
  const canDelete = definition.can_delete === true;

  return (
    <Stack direction="row" spacing={1} justifyContent="flex-end">
      <Tooltip title={!canEdit ? definition.edit_block_reason || "" : "Editar etapa"} arrow>
        <span>
          <IconButton
            type="button"
            color="primary"
            onClick={() => onEdit?.(definition)}
            disabled={busy || !canEdit}
            aria-label={`Editar ${definition.name}`}
          >
            <EditOutlinedIcon fontSize="small" />
          </IconButton>
        </span>
      </Tooltip>

      <Tooltip title={!canDelete ? definition.delete_block_reason || "" : "Eliminar etapa"} arrow>
        <span>
          <IconButton
            type="button"
            color="error"
            onClick={() => onDelete?.(definition)}
            disabled={busy || !canDelete}
            aria-label={`Eliminar ${definition.name}`}
          >
            <DeleteOutlineOutlinedIcon fontSize="small" />
          </IconButton>
        </span>
      </Tooltip>
    </Stack>
  );
}

export default function MenuSetStageDefinitionsList({
  definitions = [],
  system = false,
  busy = false,
  updatingId = null,
  onStatusChange,
  onEdit,
  onDelete,
}) {
  const theme = useTheme();
  const isCompact = useMediaQuery(theme.breakpoints.down("md"));

  if (definitions.length === 0) {
    return (
      <Box sx={{
        py: 5,
        px: 2,
        textAlign: "center",
        bgcolor: "background.default",
        borderRadius: 1,
      }}>
        <LayersOutlinedIcon sx={{ fontSize: 40, color: "text.disabled", mb: 1 }} />

        <Typography sx={{ fontSize: 16, fontWeight: 800, color: "text.primary" }}>
          {system ? "No hay etapas predeterminadas" : "No hay etapas personalizadas"}
        </Typography>

        <Typography sx={{ mt: 0.75, fontSize: 13, color: "text.secondary" }}>
          {system
            ? "No se encontraron etapas generales disponibles."
            : "Crea una etapa personalizada para comenzar."}
        </Typography>
      </Box>
    );
  }

  if (isCompact) {
    return (
      <Box sx={{
        display: "grid",
        gridTemplateColumns: {
          xs: "1fr",
          sm: "repeat(2, minmax(0, 1fr))",
        },
        gap: 1.5,
      }}>
        {definitions.map((definition) => (
          <Paper
            key={definition.id}
            sx={{
              p: 2,
              minWidth: 0,
              minHeight: 220,
              height: "100%",
              borderRadius: 1,
              border: "1px solid",
              borderColor: "divider",
              boxShadow: "none",
              bgcolor: "background.paper",
              display: "flex",
              flexDirection: "column",
            }}
          >
            <Stack spacing={2} sx={{ flex: 1 }}>
              <Stack
                direction="row"
                justifyContent="space-between"
                alignItems="flex-start"
                spacing={1}
              >
                <Box sx={{ minWidth: 0, flex: 1 }}>
                  <Typography sx={{
                    fontSize: 16,
                    fontWeight: 800,
                    color: "text.primary",
                    overflowWrap: "anywhere",
                  }}>
                    {definition.name}
                  </Typography>

                  <Typography sx={{ mt: 0.5, fontSize: 12, color: "text.secondary" }}>
                    Orden: {definition.sort_order ?? 0}
                  </Typography>
                </Box>

                {system ? (
                  <Chip label="Predeterminada" size="small" variant="outlined" color="primary" />
                ) : (
                  <Chip label="Personalizada" size="small" variant="outlined" color="primary" />
                )}
              </Stack>

              <Box sx={{ mt: "auto !important" }}>
                <StatusSwitch
                  definition={definition}
                  system={system}
                  busy={busy}
                  updatingId={updatingId}
                  onStatusChange={onStatusChange}
                />
              </Box>

              {!system ? (
                <Stack direction="row" spacing={1}>
                  <Button
                    type="button"
                    variant="outlined"
                    startIcon={<EditOutlinedIcon />}
                    disabled={busy || definition.can_edit !== true}
                    onClick={() => onEdit?.(definition)}
                    sx={{ flex: 1, minWidth: 0, height: 40 }}
                  >
                    Editar
                  </Button>

                  <Tooltip
                    title={definition.can_delete !== true
                      ? definition.delete_block_reason || ""
                      : ""}
                    arrow
                  >
                    <span style={{ flex: 1 }}>
                      <Button
                        type="button"
                        variant="outlined"
                        color="error"
                        startIcon={<DeleteOutlineOutlinedIcon />}
                        disabled={busy || definition.can_delete !== true}
                        onClick={() => onDelete?.(definition)}
                        sx={{ width: "100%", height: 40 }}
                      >
                        Eliminar
                      </Button>
                    </span>
                  </Tooltip>
                </Stack>
              ) : null}
            </Stack>
          </Paper>
        ))}
      </Box>
    );
  }

  return (
    <TableContainer component={Paper} sx={{
      borderRadius: 1,
      border: "1px solid",
      borderColor: "divider",
      boxShadow: "none",
    }}>
      <Table>
        <TableHead>
          <TableRow sx={{ bgcolor: "background.default" }}>
            <TableCell sx={{ fontWeight: 800, color: "text.primary" }}>
              Nombre
            </TableCell>

            <TableCell sx={{ fontWeight: 800, color: "text.primary" }}>
              Orden
            </TableCell>

            <TableCell sx={{ fontWeight: 800, color: "text.primary" }}>
              Estado
            </TableCell>

            {!system ? (
              <TableCell align="right" sx={{ fontWeight: 800, color: "text.primary" }}>
                Acciones
              </TableCell>
            ) : null}
          </TableRow>
        </TableHead>

        <TableBody>
          {definitions.map((definition) => (
            <TableRow
              key={definition.id}
              hover
              sx={{ "&:last-child td": { borderBottom: 0 } }}
            >
              <TableCell sx={{ maxWidth: 350 }}>
                <Typography sx={{
                  fontSize: 14,
                  fontWeight: 800,
                  color: "text.primary",
                  overflowWrap: "anywhere",
                }}>
                  {definition.name}
                </Typography>
              </TableCell>

              <TableCell>
                <Typography sx={{ fontSize: 14, color: "text.primary" }}>
                  {definition.sort_order ?? 0}
                </Typography>
              </TableCell>

              <TableCell>
                <StatusSwitch
                  definition={definition}
                  system={system}
                  busy={busy}
                  updatingId={updatingId}
                  onStatusChange={onStatusChange}
                />
              </TableCell>

              {!system ? (
                <TableCell align="right">
                  <DefinitionActions
                    definition={definition}
                    busy={busy}
                    onEdit={onEdit}
                    onDelete={onDelete}
                  />
                </TableCell>
              ) : null}
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </TableContainer>
  );
}