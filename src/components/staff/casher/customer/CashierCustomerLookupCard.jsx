import React from "react";
import {
  Box,
  Button,
  Card,
  CardContent,
  Divider,
  Stack,
  TextField,
  Typography,
} from "@mui/material";
import PersonSearchRoundedIcon from "@mui/icons-material/PersonSearchRounded";
import LinkRoundedIcon from "@mui/icons-material/LinkRounded";
import CleaningServicesRoundedIcon from "@mui/icons-material/CleaningServicesRounded";

export default function CashierCustomerLookupCard({
  filters,
  onChange,
  onSearch,
  onClearSearch,
  searching = false,
  results = [],
  selectedCustomerId = null,
  onSelectCustomer,
}) {
  const hasFilters = Boolean(
    String(filters?.phone || "").trim() || String(filters?.email || "").trim()
  );
  const hasResults = Array.isArray(results) && results.length > 0;
  const canClear = hasFilters || hasResults || Number(selectedCustomerId || 0) > 0;

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
              Buscar cliente
            </Typography>

            <Typography
              sx={{
                mt: 0.5,
                fontSize: 14,
                color: "text.secondary",
                lineHeight: 1.5,
              }}
            >
              Busca clientes formales por teléfono o correo para consultar sus
              puntos y compras.
            </Typography>
          </Box>

          <Stack direction={{ xs: "column", md: "row" }} spacing={2}>
            <FieldBlock
              label="Teléfono"
              input={
                <TextField
                  fullWidth
                  value={filters?.phone || ""}
                  onChange={(e) => onChange?.("phone", e.target.value)}
                  placeholder="Ej. 7441234567"
                  disabled={searching}
                />
              }
            />

            <FieldBlock
              label="Correo"
              input={
                <TextField
                  fullWidth
                  value={filters?.email || ""}
                  onChange={(e) => onChange?.("email", e.target.value)}
                  placeholder="cliente@correo.com"
                  disabled={searching}
                />
              }
            />
          </Stack>

          <Stack
            direction={{ xs: "column", sm: "row" }}
            spacing={1.5}
            sx={{ width: "100%" }}
          >
            <Button
              variant="contained"
              startIcon={<PersonSearchRoundedIcon />}
              onClick={onSearch}
              disabled={searching}
              sx={{
                flex: 1,
                height: 42,
                borderRadius: 2,
                fontWeight: 800,
              }}
            >
              {searching ? "Buscando…" : "Buscar cliente"}
            </Button>

            <Button
              variant="outlined"
              color="inherit"
              startIcon={<CleaningServicesRoundedIcon />}
              onClick={onClearSearch}
              disabled={searching || !canClear}
              sx={{
                flex: 1,
                height: 42,
                borderRadius: 2,
                fontWeight: 800,
              }}
            >
              Limpiar búsqueda
            </Button>
          </Stack>

          <Divider />

          <Stack spacing={1.25}>
            {results.length > 0 ? (
              results.map((row) => {
                const isSelected =
                  Number(selectedCustomerId || 0) === Number(row?.id || 0);

                return (
                  <Box
                    key={row.id}
                    sx={{
                      border: "1px solid",
                      borderColor: isSelected ? "primary.main" : "divider",
                      borderRadius: 1,
                      backgroundColor: isSelected ? "#FFF8E8" : "#fff",
                      p: 1.5,
                    }}
                  >
                    <Stack
                      direction={{ xs: "column", sm: "row" }}
                      spacing={1.5}
                      justifyContent="space-between"
                      alignItems={{ xs: "flex-start", sm: "center" }}
                    >
                      <Box sx={{ minWidth: 0 }}>
                        <Typography
                          sx={{
                            fontSize: 15,
                            fontWeight: 800,
                            color: "text.primary",
                          }}
                        >
                          {row?.name_alias || "Cliente sin nombre"}
                        </Typography>

                        <Typography
                          sx={{
                            mt: 0.35,
                            fontSize: 13,
                            color: "text.secondary",
                            lineHeight: 1.55,
                            wordBreak: "break-word",
                          }}
                        >
                          {row?.phone || "Sin teléfono"} · {row?.email || "Sin correo"}
                        </Typography>
                      </Box>

                      <Button
                        variant={isSelected ? "contained" : "outlined"}
                        startIcon={<LinkRoundedIcon />}
                        onClick={() => onSelectCustomer?.(row)}
                        sx={{
                          minWidth: { xs: "100%", sm: 180 },
                          height: 40,
                          borderRadius: 2,
                          fontWeight: 800,
                        }}
                      >
                        {isSelected ? "Seleccionado" : "Ver cliente"}
                      </Button>
                    </Stack>
                  </Box>
                );
              })
            ) : (
              <Box
                sx={{
                  border: "1px dashed",
                  borderColor: "divider",
                  borderRadius: 1,
                  p: 2,
                }}
              >
                <Typography
                  sx={{
                    fontSize: 13,
                    color: "text.secondary",
                    lineHeight: 1.55,
                  }}
                >
                  Aquí aparecerán los clientes encontrados.
                </Typography>
              </Box>
            )}
          </Stack>
        </Stack>
      </CardContent>
    </Card>
  );
}

function FieldBlock({ label, input }) {
  return (
    <Box sx={{ flex: 1, width: "100%" }}>
      <Typography sx={fieldLabelSx}>{label}</Typography>
      {input}
    </Box>
  );
}

const fieldLabelSx = {
  fontSize: 14,
  fontWeight: 800,
  color: "text.primary",
  mb: 1,
};