import {
  Box, Button, FormControlLabel, IconButton, Stack, Switch, TextField, Typography,
} from "@mui/material";

import AddOutlinedIcon from "@mui/icons-material/AddOutlined";
import DeleteOutlineOutlinedIcon from "@mui/icons-material/DeleteOutlineOutlined";

import PaginationFooter from "../../../common/PaginationFooter";

const ITEMS_PER_PAGE = 2;

export function getScheduleBlockKey(block) {
  if (block?.id) return `guardado-${block.id}`;
  return block?.local_id || "";
}

export default function ScheduledPointDaySchedule({
  day,
  blocks = [],
  page = 1,
  disabled = false,
  defaultCapacity = null,
  validationErrors = {},
  onPageChange,
  onAdd,
  onChange,
  onRemove,
}) {
  const orderedBlocks = [...blocks].sort(sortByOrder);
  const totalPages = Math.max(1, Math.ceil(orderedBlocks.length / ITEMS_PER_PAGE));
  const safePage = Math.min(page, totalPages);
  const start = (safePage - 1) * ITEMS_PER_PAGE;
  const visibleBlocks = orderedBlocks.slice(start, start + ITEMS_PER_PAGE);

  return (
    <Box
      sx={{
        border: "1px solid",
        borderColor: "divider",
        borderRadius: 1,
        backgroundColor: "background.default",
        overflow: "hidden",
      }}
    >
      <Stack spacing={1.5} sx={{ p: { xs: 1.5, sm: 2 } }}>
        <Stack
          direction={{ xs: "column", sm: "row" }}
          justifyContent="space-between"
          alignItems={{ xs: "stretch", sm: "center" }}
          spacing={1.25}
        >
          <Typography sx={{ fontSize: 14, fontWeight: 800, color: "text.primary" }}>
            {day.label}
          </Typography>

          <Button
            type="button"
            variant="outlined"
            startIcon={<AddOutlinedIcon />}
            onClick={() => onAdd(day.value)}
            disabled={disabled}
            sx={{ minWidth: { xs: "100%", sm: 170 }, height: 42 }}
          >
            Agregar horario
          </Button>
        </Stack>

        {visibleBlocks.length === 0 ? (
          <Typography sx={{ fontSize: 12.5, color: "text.secondary", py: 0.5 }}>
            Sin horarios configurados.
          </Typography>
        ) : (
          <Stack spacing={1.25}>
            {visibleBlocks.map((block) => {
              const blockKey = getScheduleBlockKey(block);
              const errors = validationErrors?.[blockKey] || {};

              return (
                <Box
                  key={blockKey}
                  sx={{
                    p: 1.5,
                    border: "1px solid",
                    borderColor: "divider",
                    borderRadius: 1,
                    backgroundColor: "background.paper",
                  }}
                >
                  <Box
                    sx={{
                      display: "grid",
                      gridTemplateColumns: {
                        xs: "1fr",
                        md: "minmax(0, 1fr) minmax(0, 1fr) minmax(150px, 0.8fr) auto auto",
                      },
                      gap: 1.25,
                      alignItems: "start",
                    }}
                  >
                    <ScheduleField
                      label="Hora inicial *"
                      input={
                        <TextField
                          type="time"
                          value={block.start_time || ""}
                          onChange={(event) =>
                            onChange(blockKey, "start_time", event.target.value)
                          }
                          disabled={disabled}
                          error={!!errors.start_time}
                          helperText={errors.start_time || ""}
                        />
                      }
                    />

                    <ScheduleField
                      label="Hora final *"
                      input={
                        <TextField
                          type="time"
                          value={block.end_time || ""}
                          onChange={(event) =>
                            onChange(blockKey, "end_time", event.target.value)
                          }
                          disabled={disabled}
                          error={!!errors.end_time}
                          helperText={errors.end_time || ""}
                        />
                      }
                    />

                    <ScheduleField
                      label="Capacidad"
                      input={
                        <TextField
                          type="text"
                          value={block.capacity_override ?? ""}
                          onChange={(event) =>
                            onChange(
                              blockKey,
                              "capacity_override",
                              cleanInteger(event.target.value)
                            )
                          }
                          disabled={disabled}
                          error={!!errors.capacity_override}
                          helperText={
                            errors.capacity_override ||
                            (defaultCapacity
                              ? `Vacío: se utilizará la capacidad general de ${defaultCapacity}.`
                              : "Opcional.")
                          }
                          placeholder="Opcional"
                          inputProps={{
                            inputMode: "numeric",
                            pattern: "[0-9]*",
                          }}
                        />
                      }
                    />

                    <Box sx={{ minWidth: { md: 112 } }}>
                      <Typography sx={fieldLabelSx}>
                        Estado
                      </Typography>

                      <FormControlLabel
                        sx={{ m: 0, minHeight: 40 }}
                        control={
                          <Switch
                            checked={!!block.is_active}
                            onChange={(event) =>
                              onChange(blockKey, "is_active", event.target.checked)
                            }
                            disabled={disabled}
                            color="primary"
                          />
                        }
                        label={
                          <Typography sx={{ fontSize: 13, fontWeight: 700, color: "text.primary" }}>
                            {block.is_active ? "Activo" : "Inactivo"}
                          </Typography>
                        }
                      />
                    </Box>

                    <Box
                      sx={{
                        display: "flex",
                        alignItems: { xs: "flex-start", md: "center" },
                        justifyContent: { xs: "flex-end", md: "center" },
                        pt: { xs: 0, md: 3.4 },
                      }}
                    >
                      <IconButton
                        type="button"
                        color="error"
                        onClick={() => onRemove(blockKey)}
                        disabled={disabled}
                        aria-label="Eliminar horario"
                      >
                        <DeleteOutlineOutlinedIcon />
                      </IconButton>
                    </Box>
                  </Box>
                </Box>
              );
            })}
          </Stack>
        )}
      </Stack>

      {orderedBlocks.length > ITEMS_PER_PAGE ? (
        <PaginationFooter
          page={safePage}
          totalPages={totalPages}
          startItem={orderedBlocks.length === 0 ? 0 : start + 1}
          endItem={Math.min(start + ITEMS_PER_PAGE, orderedBlocks.length)}
          total={orderedBlocks.length}
          hasPrev={safePage > 1}
          hasNext={safePage < totalPages}
          onPrev={() => onPageChange(Math.max(1, safePage - 1))}
          onNext={() => onPageChange(Math.min(totalPages, safePage + 1))}
          itemLabel="horarios"
        />
      ) : null}
    </Box>
  );
}

function ScheduleField({ label, input }) {
  return (
    <Box sx={{ width: "100%" }}>
      <Typography sx={fieldLabelSx}>
        {label}
      </Typography>

      {input}
    </Box>
  );
}

const fieldLabelSx = {
  fontSize: 12.5,
  fontWeight: 800,
  color: "text.primary",
  mb: 0.75,
};

function cleanInteger(value) {
  return String(value || "").replace(/\D/g, "");
}

function sortByOrder(a, b) {
  return Number(a?.sort_order || 0) - Number(b?.sort_order || 0);
}