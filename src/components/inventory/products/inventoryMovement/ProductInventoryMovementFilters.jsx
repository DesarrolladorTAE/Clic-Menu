import {
  FormControl, MenuItem, Paper, Select, Stack, Typography,
} from "@mui/material";
import KeyboardArrowDownIcon from "@mui/icons-material/KeyboardArrowDown";

const TYPE_OPTIONS = [
  { value: "", label: "Todos" },
  { value: "IN", label: "Entradas" },
  { value: "OUT", label: "Salidas" },
  { value: "ADJUST", label: "Ajustes" },
];

const REASON_OPTIONS = [
  { value: "", label: "Todas" },
  { value: "purchase", label: "Compra" },
  { value: "manual_adjustment", label: "Ajuste manual" },
  { value: "correction", label: "Corrección" },
  { value: "initial_load", label: "Carga inicial" },
  { value: "other", label: "Otro" },
];

export default function ProductInventoryMovementFilters({
  productId,
  onChangeProductId,
  productOptions = [],
  type,
  onChangeType,
  reason,
  onChangeReason,
  total = 0,
}) {
  return (
    <Paper
      sx={{
        p: { xs: 2, sm: 2.5 },
        borderRadius: 1,
        backgroundColor: "background.paper",
        border: "1px solid",
        borderColor: "divider",
        boxShadow: "none",
      }}
    >
      <Stack spacing={2}>
        <Stack
          direction={{ xs: "column", md: "row" }}
          spacing={2}
          alignItems={{ xs: "stretch", md: "flex-end" }}
        >
          <BoxField
            label="Producto"
            helper="Filtra por producto con stock directo."
            sx={{ flex: 1 }}
          >
            <FormControl fullWidth>
              <Select
                value={productId}
                onChange={(e) => onChangeProductId(e.target.value)}
                displayEmpty
                IconComponent={KeyboardArrowDownIcon}
              >
                <MenuItem value="">Todos los productos</MenuItem>
                {productOptions.map((item) => (
                  <MenuItem key={item.value} value={String(item.value)}>
                    {item.label}
                  </MenuItem>
                ))}
              </Select>
            </FormControl>
          </BoxField>

          <BoxField
            label="Tipo"
            helper="Filtra por tipo de movimiento."
            sx={{ width: { xs: "100%", md: 220 } }}
          >
            <FormControl fullWidth>
              <Select
                value={type}
                onChange={(e) => onChangeType(e.target.value)}
                IconComponent={KeyboardArrowDownIcon}
              >
                {TYPE_OPTIONS.map((item) => (
                  <MenuItem key={item.value} value={item.value}>
                    {item.label}
                  </MenuItem>
                ))}
              </Select>
            </FormControl>
          </BoxField>

          <BoxField
            label="Razón"
            helper="Filtra por motivo."
            sx={{ width: { xs: "100%", md: 240 } }}
          >
            <FormControl fullWidth>
              <Select
                value={reason}
                onChange={(e) => onChangeReason(e.target.value)}
                IconComponent={KeyboardArrowDownIcon}
              >
                {REASON_OPTIONS.map((item) => (
                  <MenuItem key={item.value} value={item.value}>
                    {item.label}
                  </MenuItem>
                ))}
              </Select>
            </FormControl>
          </BoxField>
        </Stack>

        <Typography
          sx={{
            fontSize: 13,
            color: "text.secondary",
            fontWeight: 700,
          }}
        >
          Mostrando {total} movimientos
        </Typography>
      </Stack>
    </Paper>
  );
}

function BoxField({ label, helper, children, sx }) {
  return (
    <Stack spacing={1} sx={sx}>
      <Typography sx={fieldLabelSx}>{label}</Typography>
      {children}
      {helper ? (
        <Typography
          sx={{
            fontSize: 12,
            color: "text.secondary",
          }}
        >
          {helper}
        </Typography>
      ) : null}
    </Stack>
  );
}

const fieldLabelSx = {
  fontSize: 14,
  fontWeight: 800,
  color: "text.primary",
};
