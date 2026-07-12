import {
  Box,
  ButtonBase,
  Chip,
  FormControlLabel,
  Paper,
  Stack,
  Switch,
  TextField,
  Typography,
} from "@mui/material";

import { PROMOTION_TYPE_OPTIONS } from "./promotionForm.helpers";

import {
  PromotionFieldBlock,
  PromotionSectionTitle,
} from "./PromotionFormField";

export default function PromotionInformationStep({
  form,
  branches,
  loading = false,
  onFieldChange,
  onTypeChange,
}) {
  const selectedBranch =
    branches.find(
      (branch) =>
        String(branch.id) === String(form.branch_id)
    ) || null;

  return (
    <Paper
      sx={{
        p: { xs: 2, sm: 3 },
        borderRadius: 1,
        backgroundColor: "background.paper",
        border: "1px solid",
        borderColor: "divider",
        boxShadow: "none",
      }}
    >
      <Stack spacing={2.5}>
        <Typography
          sx={{
            fontSize: { xs: 18, sm: 20 },
            fontWeight: 800,
            color: "text.primary",
          }}
        >
          Información de la promoción
        </Typography>

        <PromotionSectionTitle>
          Datos generales
        </PromotionSectionTitle>

        <PromotionFieldBlock
          label="Sucursal *"
          help="La promoción pertenecerá únicamente a la sucursal seleccionada."
          input={
            <TextField
              value={
                selectedBranch?.name ||
                "Sucursal no disponible"
              }
              disabled
            />
          }
        />

        <PromotionFieldBlock
          label="Nombre de la promoción *"
          help="Usa un nombre que permita identificarla fácilmente en el listado."
          input={
            <TextField
              value={form.name}
              onChange={(event) =>
                onFieldChange(
                  "name",
                  event.target.value
                )
              }
              placeholder="Ej. Rollos 2x1"
              disabled={loading}
            />
          }
        />

        <PromotionFieldBlock
          label="Descripción"
          help="Opcional. Describe brevemente las condiciones de la promoción."
          input={
            <TextField
              value={form.description}
              onChange={(event) =>
                onFieldChange(
                  "description",
                  event.target.value
                )
              }
              placeholder="Ej. Compra dos rollos participantes y paga uno"
              multiline
              minRows={3}
              disabled={loading}
            />
          }
        />

        <PromotionSectionTitle>
          Tipo de promoción
        </PromotionSectionTitle>

        <Box
          sx={{
            display: "grid",
            gridTemplateColumns: {
              xs: "1fr",
              md: "repeat(3, minmax(0, 1fr))",
            },
            gap: 2,
          }}
        >
          {PROMOTION_TYPE_OPTIONS.map((option) => {
            const selected =
              form.type === option.value;

            return (
              <ButtonBase
                key={option.value}
                onClick={() =>
                  onTypeChange(option.value)
                }
                disabled={loading}
                sx={{
                  width: "100%",
                  minHeight: 138,
                  p: 2,
                  borderRadius: 1,
                  border: "1px solid",
                  borderColor: selected
                    ? "secondary.main"
                    : "divider",
                  backgroundColor: selected
                    ? "rgba(214, 122, 58, 0.10)"
                    : "background.default",
                  textAlign: "left",
                  alignItems: "stretch",
                  justifyContent: "stretch",
                  transition:
                    "border-color 0.18s ease, background-color 0.18s ease",
                  "&:hover": {
                    borderColor: "secondary.main",
                    backgroundColor:
                      "rgba(214, 122, 58, 0.07)",
                  },
                  "&.Mui-focusVisible": {
                    outline: "2px solid",
                    outlineColor: "secondary.main",
                    outlineOffset: 2,
                  },
                }}
              >
                <Stack
                  spacing={1}
                  sx={{
                    width: "100%",
                  }}
                >
                  <Stack
                    direction="row"
                    justifyContent="space-between"
                    alignItems="flex-start"
                    spacing={1}
                  >
                    <Typography
                      sx={{
                        fontSize: 16,
                        fontWeight: 800,
                        color: selected
                          ? "secondary.main"
                          : "text.primary",
                      }}
                    >
                      {option.label}
                    </Typography>

                    {selected ? (
                      <Chip
                        label="Seleccionada"
                        size="small"
                        color="secondary"
                      />
                    ) : null}
                  </Stack>

                  <Typography
                    sx={{
                      fontSize: 13,
                      color: "text.secondary",
                      lineHeight: 1.5,
                    }}
                  >
                    {option.description}
                  </Typography>
                </Stack>
              </ButtonBase>
            );
          })}
        </Box>

        <PromotionSectionTitle>
          Vigencia y prioridad
        </PromotionSectionTitle>

        <Stack
          direction={{ xs: "column", md: "row" }}
          spacing={2}
        >
          <PromotionFieldBlock
            label="Prioridad *"
            help="Un número menor representa una prioridad mayor."
            input={
              <TextField
                type="number"
                value={form.priority}
                onChange={(event) =>
                  onFieldChange(
                    "priority",
                    event.target.value
                  )
                }
                inputProps={{
                  min: 1,
                  step: 1,
                }}
                disabled={loading}
              />
            }
          />

          <PromotionFieldBlock
            label="Fecha inicial"
            help="Déjala vacía si la promoción no tiene límite inicial."
            input={
              <TextField
                type="date"
                value={form.starts_on}
                onChange={(event) =>
                  onFieldChange(
                    "starts_on",
                    event.target.value
                  )
                }
                InputLabelProps={{
                  shrink: true,
                }}
                disabled={loading}
              />
            }
          />

          <PromotionFieldBlock
            label="Fecha final"
            help="Déjala vacía si la promoción no tiene límite final."
            input={
              <TextField
                type="date"
                value={form.ends_on}
                onChange={(event) =>
                  onFieldChange(
                    "ends_on",
                    event.target.value
                  )
                }
                InputLabelProps={{
                  shrink: true,
                }}
                disabled={loading}
              />
            }
          />
        </Stack>

        <Box>
          <Typography
            sx={{
              fontSize: 14,
              fontWeight: 800,
              color: "text.primary",
              mb: 1,
            }}
          >
            Estado inicial
          </Typography>

          <FormControlLabel
            sx={{ m: 0 }}
            control={
              <Switch
                checked={!!form.is_active}
                onChange={(event) =>
                  onFieldChange(
                    "is_active",
                    event.target.checked
                  )
                }
                disabled={loading}
                color="primary"
              />
            }
            label={
              <Typography
                sx={{
                  fontSize: 14,
                  fontWeight: 700,
                  color: "text.primary",
                }}
              >
                {form.is_active
                  ? "Activa"
                  : "Inactiva"}
              </Typography>
            }
          />
        </Box>
      </Stack>
    </Paper>
  );
}