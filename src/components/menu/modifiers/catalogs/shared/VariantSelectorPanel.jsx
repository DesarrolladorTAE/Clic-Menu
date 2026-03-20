import { MenuItem, Paper, Stack, TextField, Typography } from "@mui/material";
import KeyboardArrowDownIcon from "@mui/icons-material/KeyboardArrowDown";
import { fieldLabelSx } from "./catalogShared";

export default function VariantSelectorPanel({
  label = "Variante",
  items = [],
  selectedValue = "",
  onChange,
  disabled = false,
  getItemValue = (item) => item?.variant?.id,
  getItemLabel = (item) => item?.variant?.name || "Variante sin nombre",
  emptyText = "No hay variantes disponibles",
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