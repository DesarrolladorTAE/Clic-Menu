import {
  Box, Card, CardContent, FormControl, MenuItem, Select, Stack, Typography,
} from "@mui/material";

import KeyboardArrowDownIcon from "@mui/icons-material/KeyboardArrowDown";

const WORK_MODES = [
  { value: "normal", label: "Normal" },
  { value: "sets", label: "Conjuntos" },
  { value: "mixed", label: "Mixto" },
];

const DIRECT_SALE_MODES = [
  { value: "disabled", label: "Desactivada" },
  { value: "with_kitchen", label: "Activada con cocina" },
  { value: "without_kitchen", label: "Activada sin cocina" },
];

export default function BranchSettingsFormCard({
  catalogMode = "",
  cashierDirectMode = "",
  onChangeCatalogMode,
  onChangeCashierDirectMode,
  catalogDisabled = false,
  cashierDisabled = false,
  cashierUnavailableReason = "",
}) {
  return (
    <Card
      sx={{
        borderRadius: 1,
        backgroundColor: "background.paper",
      }}
    >
      <CardContent sx={{ p: { xs: 2.5, sm: 3.5, md: 4 } }}>
        <Stack spacing={3}>
          <SettingsSelectField
            label="Modo de trabajo"
            value={catalogMode}
            onChange={onChangeCatalogMode}
            options={WORK_MODES}
            help="Define si la sucursal venderá productos normales, Conjuntos o ambos."
            disabled={catalogDisabled}
          />

          <SettingsSelectField
            label="Modo de venta directa"
            value={cashierDirectMode}
            onChange={onChangeCashierDirectMode}
            options={DIRECT_SALE_MODES}
            help="Define cómo se realizarán las ventas directas desde Caja."
            disabled={cashierDisabled}
          />

          {cashierUnavailableReason ? (
            <Typography
              sx={{
                fontSize: 12,
                color: "text.secondary",
                lineHeight: 1.5,
              }}
            >
              {cashierUnavailableReason}
            </Typography>
          ) : null}
        </Stack>
      </CardContent>
    </Card>
  );
}

function SettingsSelectField({
  label,
  value,
  onChange,
  options,
  help,
  disabled = false,
}) {
  return (
    <Box>
      <Typography
        sx={{
          fontSize: 15,
          fontWeight: 800,
          color: "text.primary",
          mb: 0.75,
        }}
      >
        {label}
      </Typography>

      {help ? (
        <Typography
          sx={{
            mb: 1.25,
            color: "text.secondary",
            fontSize: 13,
            lineHeight: 1.5,
          }}
        >
          {help}
        </Typography>
      ) : null}

      <FormControl fullWidth disabled={disabled}>
        <Select
          value={value}
          onChange={(e) => onChange(e.target.value)}
          IconComponent={KeyboardArrowDownIcon}
          displayEmpty
          disabled={disabled}
          sx={{
            bgcolor: disabled ? "#ECECEC" : "#F4F4F4",
            borderRadius: 0,
            minHeight: 44,
            "& .MuiOutlinedInput-notchedOutline": {
              border: "none",
            },
            "&:hover .MuiOutlinedInput-notchedOutline": {
              border: "none",
            },
            "&.Mui-focused .MuiOutlinedInput-notchedOutline": {
              border: "1.5px solid #FF9800",
            },
            "& .MuiSelect-select": {
              py: 1.25,
              px: 1.5,
              fontSize: 14,
              color: "text.primary",
            },
            "&.Mui-disabled .MuiSelect-select": {
              color: "text.secondary",
              WebkitTextFillColor: "inherit",
            },
          }}
        >
          {!value ? (
            <MenuItem value="" disabled>
              Selecciona una opción
            </MenuItem>
          ) : null}

          {options.map((option) => (
            <MenuItem
              key={option.value}
              value={option.value}
              sx={{ fontSize: 14 }}
            >
              {option.label}
            </MenuItem>
          ))}
        </Select>
      </FormControl>
    </Box>
  );
}