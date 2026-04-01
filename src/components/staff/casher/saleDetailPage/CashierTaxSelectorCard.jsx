// Tarjetita Impuestos
import React from "react";
import {
  Box,
  Card,
  CardContent,
  MenuItem,
  Stack,
  TextField,
  Typography,
} from "@mui/material";

export default function CashierTaxSelectorCard({
  taxOptions = [],
  value = "",
  onChange,
  disabled = false,
}) {
  return (
    <Card
      sx={{
        border: "1px solid",
        borderColor: "divider",
        borderRadius: 1,
        boxShadow: "none",
        backgroundColor: "background.paper",
      }}
    >
      <CardContent sx={{ p: { xs: 2, sm: 3 } }}>
        <Stack spacing={2}>
          <Box>
            <Typography
              sx={{
                fontSize: 22,
                fontWeight: 800,
                color: "text.primary",
              }}
            >
              Impuestos
            </Typography>

            <Typography
              sx={{
                mt: 0.5,
                fontSize: 14,
                color: "text.secondary",
                lineHeight: 1.5,
              }}
            >
              Selecciona la tasa de consumo antes de generar la vista previa.
            </Typography>
          </Box>

          <Box>
            <Typography sx={fieldLabelSx}>Tasa de consumo *</Typography>

            <TextField
              select
              fullWidth
              value={value}
              onChange={(e) => onChange?.(e.target.value)}
              disabled={disabled}
            >
              <MenuItem value="">Selecciona una tasa</MenuItem>

              {taxOptions.map((option) => (
                <MenuItem key={option.id} value={option.code}>
                  {option.label || option.name}
                </MenuItem>
              ))}
            </TextField>
          </Box>

        </Stack>
      </CardContent>
    </Card>
  );
}

const fieldLabelSx = {
  fontSize: 14,
  fontWeight: 800,
  color: "text.primary",
  mb: 1,
};