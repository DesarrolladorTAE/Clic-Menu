import { MenuItem, Paper, Stack, TextField, Typography } from "@mui/material";
import KeyboardArrowDownIcon from "@mui/icons-material/KeyboardArrowDown";
import { fieldLabelSx } from "./catalogShared";

export default function ComponentSelectorPanel({
  label = "Componente",
  items = [],
  selectedValue = "",
  onChange,
  disabled = false,
  getItemValue = (item) => item?.component_product_id,
  getItemLabel = (item) => item?.component_product?.name || "Componente sin nombre",
  emptyText = "No hay componentes disponibles",
  helperText = "",
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
      <Stack spacing={1.25}>
        <Typography sx={fieldLabelSx}>{label}</Typography>

        <TextField
          select
          value={selectedValue}
          onChange={(e) => onChange(e.target.value)}
          SelectProps={{
            IconComponent: KeyboardArrowDownIcon,
          }}
          disabled={disabled}
        >
          {items.length === 0 ? (
            <MenuItem disabled value="">
              {emptyText}
            </MenuItem>
          ) : (
            items.map((item) => (
              <MenuItem
                key={String(getItemValue(item))}
                value={String(getItemValue(item))}
              >
                {getItemLabel(item)}
              </MenuItem>
            ))
          )}
        </TextField>

        <Typography
          sx={{
            fontSize: 12,
            color: "text.secondary",
          }}
        >
          {helperText}
        </Typography>
      </Stack>
    </Paper>
  );
}
