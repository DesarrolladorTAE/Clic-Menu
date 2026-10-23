import {
  Box, Chip, CircularProgress, FormControlLabel,
  IconButton, Paper, Stack, Switch, Table, TableBody,
  TableCell, TableContainer, TableHead, TableRow,
  Tooltip, Typography,
} from "@mui/material";

import EditOutlinedIcon from "@mui/icons-material/EditOutlined";
import DeleteOutlineOutlinedIcon from "@mui/icons-material/DeleteOutlineOutlined";
import LayersOutlinedIcon from "@mui/icons-material/LayersOutlined";

const iconEditSx = {
  width: 40,
  height: 40,
  bgcolor: "#E3C24A",
  color: "#fff",
  borderRadius: 1.5,
  "&:hover": { bgcolor: "#C9AA39" },
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
  "&:hover": { bgcolor: "error.dark" },
  "&.Mui-disabled": {
    bgcolor: "#E0E0E0",
    color: "#9E9E9E",
  },
};

function StatusSwitch({ definition, busy, updatingId, onStatusChange }) {
  const active = definition.is_active === true
    || definition.is_active === 1
    || definition.is_active === "1";

  const allowed = active
    ? definition.can_deactivate === true
    : definition.can_activate === true;

  const reason = active
    ? definition.deactivate_block_reason
    : definition.activate_block_reason;

  const updating = String(updatingId) === String(definition.id);
  const disabled = busy || updating || !allowed;

  return (
    <Tooltip title={!allowed && !updating ? reason || "" : ""} arrow>
      <span>
        <FormControlLabel
          sx={{ m: 0 }}
          control={
            <Switch
              color="primary"
              checked={active}
              onChange={(event) => onStatusChange?.(definition, event.target.checked)}
              disabled={disabled}
              inputProps={{ "aria-label": `Estado de ${definition.name}` }}
            />
          }
          label={
            <Stack direction="row" spacing={1} alignItems="center">
              <Typography sx={{
                fontSize: 13,
                fontWeight: 800,
                color: "text.primary",
              }}>
                {active ? "Activa" : "Inactiva"}
              </Typography>

              {updating ? <CircularProgress size={15} /> : null}
            </Stack>
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
    <Stack
      direction="row"
      spacing={1}
      justifyContent="flex-end"
      alignItems="center"
      sx={{ width: "100%", minWidth: 0 }}
    >
      <Tooltip title={canEdit ? "Editar etapa" : definition.edit_block_reason || ""} arrow>
        <span>
          <IconButton
            type="button"
            sx={iconEditSx}
            onClick={() => onEdit?.(definition)}
            disabled={busy || !canEdit}
            aria-label={`Editar ${definition.name}`}
          >
            <EditOutlinedIcon fontSize="small" />
          </IconButton>
        </span>
      </Tooltip>

      <Tooltip title={canDelete ? "Eliminar etapa" : definition.delete_block_reason || ""} arrow>
        <span>
          <IconButton
            type="button"
            sx={iconDeleteSx}
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

// Tarjeta de etapa predeterminada: únicamente información de consulta.
function SystemDefinitionCard({ definition }) {
  return (
    <Paper sx={{
      minWidth: 0,
      height: "100%",
      p: 2,
      borderRadius: 1,
      border: "1px solid",
      borderColor: "divider",
      bgcolor: "background.default",
      boxShadow: "none",
      display: "flex",
      flexDirection: "column",
      transition: "border-color 0.18s ease",
      "&:hover": {
        borderColor: "primary.main",
      },
    }}>
      <Stack spacing={2} sx={{ height: "100%" }}>
        <Stack direction="row" spacing={1.5} alignItems="flex-start">
          <Box sx={{
            width: 42,
            height: 42,
            borderRadius: 1.5,
            flexShrink: 0,
            display: "grid",
            placeItems: "center",
            bgcolor: "rgba(255, 152, 0, 0.12)",
            color: "primary.main",
          }}>
            <LayersOutlinedIcon />
          </Box>

          <Box sx={{ flex: 1, minWidth: 0 }}>
            <Typography sx={{
              fontSize: 16,
              fontWeight: 800,
              color: "text.primary",
              lineHeight: 1.4,
              overflowWrap: "anywhere",
            }}>
              {definition.name}
            </Typography>

            <Typography sx={{
              mt: 0.5,
              fontSize: 12,
              color: "text.secondary",
            }}>
              Etapa predeterminada
            </Typography>
          </Box>
        </Stack>

        <Box sx={{ mt: "auto !important" }}>
          <Chip
            size="small"
            variant="outlined"
            color="primary"
            label={`Orden ${definition.sort_order ?? 0}`}
            sx={{ fontWeight: 700 }}
          />
        </Box>
      </Stack>
    </Paper>
  );
}

// Tarjeta adaptable para etapas personalizadas.
function CustomDefinitionCard({
  definition,
  busy,
  updatingId,
  onStatusChange,
  onEdit,
  onDelete,
}) {
  return (
    <Paper sx={{
      minWidth: 0,
      minHeight: 205,
      height: "100%",
      borderRadius: 1,
      border: "1px solid",
      borderColor: "divider",
      bgcolor: "background.paper",
      boxShadow: "none",
      overflow: "hidden",
      display: "flex",
      flexDirection: "column",
    }}>
      <Box sx={{
        px: 2,
        py: 1.75,
        borderBottom: "1px solid",
        borderColor: "divider",
      }}>
        <Stack direction="row" justifyContent="space-between" alignItems="flex-start" spacing={1}>
          <Typography sx={{
            flex: 1,
            minWidth: 0,
            fontSize: 16,
            fontWeight: 800,
            color: "text.primary",
            lineHeight: 1.35,
            overflowWrap: "anywhere",
          }}>
            {definition.name}
          </Typography>

          <Chip
            label={`Orden ${definition.sort_order ?? 0}`}
            size="small"
            sx={{
              flexShrink: 0,
              fontWeight: 800,
              bgcolor: "#FFF3E0",
              color: "#A75A00",
            }}
          />
        </Stack>
      </Box>

      <Stack spacing={2} sx={{ p: 2, flex: 1 }}>
        <Box>
          <Typography sx={{
            mb: 0.75,
            fontSize: 12,
            fontWeight: 800,
            color: "text.secondary",
          }}>
            Estado
          </Typography>

          <StatusSwitch
            definition={definition}
            busy={busy}
            updatingId={updatingId}
            onStatusChange={onStatusChange}
          />
        </Box>

        <Box sx={{ flex: 1 }} />

        <DefinitionActions
          definition={definition}
          busy={busy}
          onEdit={onEdit}
          onDelete={onDelete}
        />
      </Stack>
    </Paper>
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
  if (definitions.length === 0) {
    return (
      <Box sx={{
        py: 5,
        px: 2,
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
          <LayersOutlinedIcon />
        </Box>

        <Typography sx={{
          fontSize: 18,
          fontWeight: 800,
          color: "text.primary",
        }}>
          {system ? "No hay etapas predeterminadas" : "No hay etapas personalizadas"}
        </Typography>

        <Typography sx={{
          mt: 0.75,
          fontSize: 13,
          color: "text.secondary",
          lineHeight: 1.55,
        }}>
          {system
            ? "No se encontraron etapas generales disponibles."
            : "Crea una etapa personalizada para comenzar."}
        </Typography>
      </Box>
    );
  }

  // Las etapas predeterminadas se muestran como tarjetas de consulta.
  if (system) {
    return (
      <Box sx={{
        display: "grid",
        gridTemplateColumns: {
          xs: "1fr",
          sm: "repeat(2, minmax(0, 1fr))",
          md: "repeat(3, minmax(0, 1fr))",
        },
        gridAutoRows: "1fr",
        gap: 1.5,
        p: { xs: 2, sm: 2.5 },
        alignItems: "stretch",
      }}>
        {definitions.map((definition) => (
          <SystemDefinitionCard
            key={definition.id}
            definition={definition}
          />
        ))}
      </Box>
    );
  }

  return (
    <>
      {/* Tabla de etapas personalizadas para computadoras */}
      <TableContainer sx={{
        display: { xs: "none", md: "block" },
        width: "100%",
        overflowX: "auto",
        bgcolor: "background.paper",
      }}>
        <Table sx={{ minWidth: 700 }}>
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
              <TableCell>Nombre</TableCell>
              <TableCell>Orden</TableCell>
              <TableCell>Estado</TableCell>
              <TableCell align="right">Acciones</TableCell>
            </TableRow>
          </TableHead>

          <TableBody>
            {definitions.map((definition) => (
              <TableRow
                key={definition.id}
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
                <TableCell sx={{ minWidth: 180, maxWidth: 350 }}>
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
                  {definition.sort_order ?? 0}
                </TableCell>

                <TableCell>
                  <StatusSwitch
                    definition={definition}
                    busy={busy}
                    updatingId={updatingId}
                    onStatusChange={onStatusChange}
                  />
                </TableCell>

                <TableCell align="right">
                  <DefinitionActions
                    definition={definition}
                    busy={busy}
                    onEdit={onEdit}
                    onDelete={onDelete}
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
        {definitions.map((definition) => (
          <CustomDefinitionCard
            key={definition.id}
            definition={definition}
            busy={busy}
            updatingId={updatingId}
            onStatusChange={onStatusChange}
            onEdit={onEdit}
            onDelete={onDelete}
          />
        ))}
      </Box>
    </>
  );
}