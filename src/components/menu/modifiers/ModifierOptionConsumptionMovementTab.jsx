import { useMemo } from "react";
import {
  Box, Button, Card, CardContent, FormControlLabel, MenuItem, Stack, Switch,
  TextField, Typography,
} from "@mui/material";

import Inventory2OutlinedIcon from "@mui/icons-material/Inventory2Outlined";
import ScienceOutlinedIcon from "@mui/icons-material/ScienceOutlined";
import SaveIcon from "@mui/icons-material/Save";
import DeleteOutlineIcon from "@mui/icons-material/DeleteOutline";

import {
  containerSx,
  emptyHelpSx,
  FieldBlock,
  InfoPill,
  noticeSx,
  subtitleSx,
  switchLabelSx,
  titleSx,
} from "./ModifierOptionConsumptionShared";

const EFFECT_ADD = "add";
const EFFECT_OMIT = "omit";
const TYPE_INGREDIENT = "ingredient";
const TYPE_PRODUCT = "product";

export default function ModifierOptionConsumptionMovementTab({
  trackInventory,
  consumptionId,
  ingredients,
  products,
  effect,
  consumptionType,
  ingredientId,
  productId,
  qty,
  status,
  notes,
  saving,
  deleting,
  busy,
  canSave,
  onEffectChange,
  onConsumptionTypeChange,
  onIngredientChange,
  onProductChange,
  onQtyChange,
  onStatusChange,
  onNotesChange,
  onSave,
  onDelete,
}) {
  const selectedIngredient = useMemo(() => {
    return ingredients.find((item) => Number(item.id) === Number(ingredientId)) || null;
  }, [ingredients, ingredientId]);

  const selectedProduct = useMemo(() => {
    return products.find((item) => Number(item.id) === Number(productId)) || null;
  }, [products, productId]);

  if (!trackInventory) {
    return (
      <Card sx={containerSx}>
        <CardContent sx={{ p: { xs: 2, sm: 3 } }}>
          <Stack spacing={2}>
            <Box>
              <Typography sx={titleSx}>Movimiento de inventario</Typography>
              <Typography sx={subtitleSx}>
                Esta opción actualmente no modifica existencias.
              </Typography>
            </Box>

            <Box sx={noticeSx}>
              <Typography sx={{ fontSize: 14, fontWeight: 800, color: "text.primary" }}>
                Control de inventario desactivado
              </Typography>

              <Typography
                sx={{
                  mt: 0.5,
                  fontSize: 13,
                  color: "text.secondary",
                  lineHeight: 1.5,
                }}
              >
                Para agregar u omitir existencias, activa “Controla inventario” al editar la opción.
              </Typography>

              {consumptionId ? (
                <Button
                  variant="outlined"
                  color="error"
                  startIcon={<DeleteOutlineIcon />}
                  onClick={onDelete}
                  disabled={deleting}
                  sx={{ mt: 1.5 }}
                >
                  {deleting ? "Eliminando…" : "Eliminar configuración anterior"}
                </Button>
              ) : null}
            </Box>
          </Stack>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card sx={containerSx}>
      <CardContent sx={{ p: { xs: 2, sm: 3 } }}>
        <Stack spacing={2.5}>
          <Box>
            <Typography sx={titleSx}>Movimiento de inventario</Typography>
            <Typography sx={subtitleSx}>
              Indica qué debe ocurrir físicamente cuando el cliente selecciona esta opción.
            </Typography>
          </Box>

          <Stack direction={{ xs: "column", md: "row" }} spacing={2}>
            <FieldBlock
              label="Acción *"
              input={
                <TextField
                  select
                  value={effect}
                  onChange={(e) => onEffectChange(e.target.value)}
                  disabled={busy}
                >
                  <MenuItem value={EFFECT_ADD}>Agregar consumo</MenuItem>
                  <MenuItem value={EFFECT_OMIT}>Omitir parte del consumo</MenuItem>
                </TextField>
              }
              help={
                effect === EFFECT_ADD
                  ? "Agrega una cantidad adicional de ingrediente o producto."
                  : "Reduce una cantidad de ingrediente cuando esta opción se usa dentro de una receta compatible."
              }
            />

            <FieldBlock
              label="Recurso *"
              input={
                <TextField
                  select
                  value={consumptionType}
                  onChange={(e) => onConsumptionTypeChange(e.target.value)}
                  disabled={busy}
                >
                  <MenuItem value={TYPE_INGREDIENT}>Ingrediente</MenuItem>

                  {effect === EFFECT_ADD ? (
                    <MenuItem value={TYPE_PRODUCT}>Producto</MenuItem>
                  ) : null}
                </TextField>
              }
            />
          </Stack>

          {consumptionType === TYPE_INGREDIENT ? (
            <Stack spacing={2}>
              <FieldBlock
                label="Ingrediente *"
                input={
                  <TextField
                    select
                    value={ingredientId}
                    onChange={(e) => onIngredientChange(e.target.value)}
                    disabled={busy}
                  >
                    {ingredients.map((item) => (
                      <MenuItem key={item.id} value={String(item.id)}>
                        {item.name}{item.unit ? ` (${item.unit})` : ""}
                      </MenuItem>
                    ))}
                  </TextField>
                }
              />

              {ingredients.length === 0 ? (
                <Typography sx={emptyHelpSx}>
                  No hay ingredientes activos disponibles para esta configuración.
                </Typography>
              ) : null}

              {selectedIngredient ? (
                <InfoPill
                  icon={<ScienceOutlinedIcon fontSize="small" />}
                  text={`Ingrediente seleccionado: ${selectedIngredient.name}${
                    selectedIngredient.unit ? ` · Unidad: ${selectedIngredient.unit}` : ""
                  }`}
                />
              ) : null}
            </Stack>
          ) : null}

          {consumptionType === TYPE_PRODUCT ? (
            <Stack spacing={2}>
              <FieldBlock
                label="Producto *"
                input={
                  <TextField
                    select
                    value={productId}
                    onChange={(e) => onProductChange(e.target.value)}
                    disabled={busy}
                  >
                    {products.map((item) => (
                      <MenuItem key={item.id} value={String(item.id)}>
                        {item.name}
                      </MenuItem>
                    ))}
                  </TextField>
                }
              />

              {products.length === 0 ? (
                <Typography sx={emptyHelpSx}>
                  No hay productos activos disponibles para esta configuración.
                </Typography>
              ) : null}

              {selectedProduct ? (
                <InfoPill
                  icon={<Inventory2OutlinedIcon fontSize="small" />}
                  text={`Producto seleccionado: ${selectedProduct.name}`}
                />
              ) : null}
            </Stack>
          ) : null}

          <Stack direction={{ xs: "column", md: "row" }} spacing={2}>
            <FieldBlock
              label="Cantidad *"
              help="Cantidad que se agregará u omitirá por cada vez que se seleccione esta opción."
              input={
                <TextField
                  value={qty}
                  onChange={(e) => onQtyChange(e.target.value)}
                  inputProps={{ inputMode: "decimal" }}
                  placeholder="1"
                  disabled={busy}
                />
              }
            />

            <FieldBlock
              label="Notas"
              input={
                <TextField
                  value={notes}
                  onChange={(e) => onNotesChange(e.target.value)}
                  placeholder="Opcional"
                  disabled={busy}
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
              Estado
            </Typography>

            <FormControlLabel
              sx={{ m: 0 }}
              control={
                <Switch
                  checked={status === "active"}
                  onChange={(e) => onStatusChange(e.target.checked ? "active" : "inactive")}
                  color="primary"
                  disabled={busy}
                />
              }
              label={
                <Typography sx={switchLabelSx}>
                  {status === "active" ? "Activo" : "Inactivo"}
                </Typography>
              }
            />
          </Box>

          <Stack
            direction={{ xs: "column-reverse", sm: "row" }}
            justifyContent="space-between"
            spacing={1.5}
          >
            <Button
              variant="outlined"
              color="error"
              startIcon={<DeleteOutlineIcon />}
              onClick={onDelete}
              disabled={!consumptionId || deleting || saving}
              sx={{
                minWidth: { xs: "100%", sm: 180 },
                height: 44,
              }}
            >
              {deleting ? "Eliminando…" : "Eliminar configuración"}
            </Button>

            <Button
              variant="contained"
              startIcon={<SaveIcon />}
              onClick={onSave}
              disabled={!canSave || saving || deleting}
              sx={{
                minWidth: { xs: "100%", sm: 190 },
                height: 44,
                fontWeight: 800,
              }}
            >
              {saving ? "Guardando…" : "Guardar configuración"}
            </Button>
          </Stack>
        </Stack>
      </CardContent>
    </Card>
  );
}