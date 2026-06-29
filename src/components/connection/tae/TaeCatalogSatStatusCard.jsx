import {
  Box,
  Chip,
  LinearProgress,
  Paper,
  Stack,
  Typography,
} from "@mui/material";

import Inventory2OutlinedIcon from "@mui/icons-material/Inventory2Outlined";
import CheckCircleOutlineOutlinedIcon from "@mui/icons-material/CheckCircleOutlineOutlined";
import ErrorOutlineOutlinedIcon from "@mui/icons-material/ErrorOutlineOutlined";
import InfoOutlinedIcon from "@mui/icons-material/InfoOutlined";

function formatValue(value) {
  if (value === null || typeof value === "undefined" || value === "") {
    return "Sin datos";
  }

  if (typeof value === "boolean") {
    return value ? "Sí" : "No";
  }

  return String(value);
}

function toNumber(value) {
  const parsed = Number(value);
  return Number.isFinite(parsed) ? parsed : 0;
}

export default function TaeCatalogSatStatusCard({ catalogSatStatus }) {
  const hasData =
    catalogSatStatus &&
    typeof catalogSatStatus === "object" &&
    Object.keys(catalogSatStatus).length > 0;

  const totalProducts = toNumber(catalogSatStatus?.total_products);
  const productsWithSat = toNumber(catalogSatStatus?.products_with_sat);
  const productsMissingSat = toNumber(catalogSatStatus?.products_missing_sat);
  const isComplete = !!catalogSatStatus?.is_complete;
  const message = catalogSatStatus?.message || "";

  const progress =
    totalProducts > 0
      ? Math.min(100, Math.round((productsWithSat / totalProducts) * 100))
      : 0;

  const statusLabel = !hasData
    ? "Sin datos"
    : isComplete
    ? "Completo"
    : "Pendiente";

  const statusColor = !hasData
    ? "default"
    : isComplete
    ? "success"
    : "warning";

  return (
    <Paper
      sx={{
        p: 0,
        overflow: "hidden",
        borderRadius: 1,
        backgroundColor: "background.paper",
        border: "1px solid",
        borderColor: "divider",
        boxShadow: "none",
      }}
    >
      <Box
        sx={{
          px: 2,
          py: 1.75,
          borderBottom: "1px solid",
          borderColor: "divider",
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
          gap: 2,
          flexWrap: "wrap",
        }}
      >
        <Box>
          <Typography
            sx={{
              fontSize: 18,
              fontWeight: 800,
              color: "text.primary",
            }}
          >
            Estado del catálogo SAT
          </Typography>

          <Typography
            sx={{
              mt: 0.5,
              fontSize: 13,
              color: "text.secondary",
            }}
          >
            Revisa si tus productos tienen la información SAT necesaria para
            facturar correctamente.
          </Typography>
        </Box>

        <Chip
          label={statusLabel}
          size="small"
          color={statusColor}
          variant={statusColor === "default" ? "outlined" : "filled"}
        />
      </Box>

      {!hasData ? (
        <Box
          sx={{
            px: 3,
            py: 5,
            textAlign: "center",
          }}
        >
          <Box
            sx={{
              width: 54,
              height: 54,
              borderRadius: 2,
              mx: "auto",
              mb: 2,
              display: "grid",
              placeItems: "center",
              bgcolor: "rgba(255, 152, 0, 0.12)",
              color: "primary.main",
            }}
          >
            <Inventory2OutlinedIcon />
          </Box>

          <Typography
            sx={{
              fontSize: 20,
              fontWeight: 800,
              color: "text.primary",
            }}
          >
            Sin información del catálogo SAT
          </Typography>

          <Typography
            sx={{
              mt: 1,
              color: "text.secondary",
              fontSize: 14,
              lineHeight: 1.55,
            }}
          >
            Cuando el sistema revise tus productos, aquí se mostrará el resumen
            de claves SAT configuradas.
          </Typography>
        </Box>
      ) : (
        <Box sx={{ p: { xs: 2, sm: 2.5 } }}>
          <Stack spacing={2.5}>
            <Box
              sx={{
                p: 1.75,
                borderRadius: 1,
                border: "1px solid",
                borderColor: isComplete ? "#B8E2C3" : "#F3D48B",
                backgroundColor: isComplete ? "#EAF8EE" : "#FFF7E8",
              }}
            >
              <Stack spacing={1.25}>
                <Stack
                  direction={{ xs: "column", sm: "row" }}
                  justifyContent="space-between"
                  alignItems={{ xs: "flex-start", sm: "center" }}
                  spacing={1}
                >
                  <Box>
                    <Typography
                      sx={{
                        fontSize: 14,
                        fontWeight: 800,
                        color: isComplete ? "#1D6B2A" : "#8A5A00",
                      }}
                    >
                      Avance de configuración SAT
                    </Typography>

                    <Typography
                      sx={{
                        mt: 0.35,
                        fontSize: 13,
                        color: isComplete ? "#1D6B2A" : "#8A5A00",
                        lineHeight: 1.45,
                      }}
                    >
                      {productsWithSat} de {totalProducts} producto(s) cuentan
                      con clave SAT configurada.
                    </Typography>
                  </Box>

                  <Typography
                    sx={{
                      fontSize: 18,
                      fontWeight: 900,
                      color: isComplete ? "#1D6B2A" : "#8A5A00",
                    }}
                  >
                    {progress}%
                  </Typography>
                </Stack>

                <LinearProgress
                  variant="determinate"
                  value={progress}
                  sx={{
                    height: 8,
                    borderRadius: 999,
                    bgcolor: "rgba(255,255,255,0.75)",
                    "& .MuiLinearProgress-bar": {
                      borderRadius: 999,
                    },
                  }}
                />
              </Stack>
            </Box>

            <Box
              sx={{
                display: "grid",
                gridTemplateColumns: {
                  xs: "1fr",
                  sm: "repeat(2, minmax(0, 1fr))",
                  lg: "repeat(3, minmax(0, 1fr))",
                },
                gap: 2,
              }}
            >
              <StatusCard
                icon={<Inventory2OutlinedIcon fontSize="small" />}
                label="Productos registrados"
                value={formatValue(totalProducts)}
                helper="Total de productos activos revisados."
                chipLabel="Total"
                chipColor="primary"
              />

              <StatusCard
                icon={<CheckCircleOutlineOutlinedIcon fontSize="small" />}
                label="Productos con clave SAT"
                value={formatValue(productsWithSat)}
                helper="Productos listos para facturación."
                chipLabel="Configurados"
                chipColor="success"
              />

              <StatusCard
                icon={<ErrorOutlineOutlinedIcon fontSize="small" />}
                label="Productos sin clave SAT"
                value={formatValue(productsMissingSat)}
                helper="Productos que requieren completar información SAT."
                chipLabel={productsMissingSat > 0 ? "Pendientes" : "Sin pendientes"}
                chipColor={productsMissingSat > 0 ? "warning" : "success"}
              />
            </Box>

            {message ? (
              <Box
                sx={{
                  p: 1.5,
                  borderRadius: 1,
                  border: "1px solid",
                  borderColor: productsMissingSat > 0 ? "#F3D48B" : "#B8E2C3",
                  backgroundColor:
                    productsMissingSat > 0 ? "#FFF7E8" : "#EAF8EE",
                }}
              >
                <Stack direction="row" spacing={1.25} alignItems="flex-start">
                  <Box
                    sx={{
                      width: 30,
                      height: 30,
                      borderRadius: 1.5,
                      display: "grid",
                      placeItems: "center",
                      bgcolor: "#fff",
                      color: productsMissingSat > 0 ? "#A75A00" : "success.main",
                      flexShrink: 0,
                    }}
                  >
                    <InfoOutlinedIcon fontSize="small" />
                  </Box>

                  <Box>
                    <Typography
                      sx={{
                        fontSize: 13,
                        fontWeight: 800,
                        color: productsMissingSat > 0 ? "#8A5A00" : "#1D6B2A",
                      }}
                    >
                      Aviso del catálogo SAT
                    </Typography>

                    <Typography
                      sx={{
                        mt: 0.35,
                        fontSize: 13,
                        color: productsMissingSat > 0 ? "#8A5A00" : "#1D6B2A",
                        lineHeight: 1.45,
                      }}
                    >
                      {message}
                    </Typography>
                  </Box>
                </Stack>
              </Box>
            ) : null}
          </Stack>
        </Box>
      )}
    </Paper>
  );
}

function StatusCard({
  icon,
  label,
  value,
  helper,
  chipLabel,
  chipColor = "default",
}) {
  return (
    <Box
      sx={{
        border: "1px solid",
        borderColor: "divider",
        borderRadius: 1,
        p: 1.75,
        backgroundColor: "background.default",
        minHeight: 150,
        height: "100%",
      }}
    >
      <Stack spacing={1.25} sx={{ height: "100%" }}>
        <Stack direction="row" alignItems="center" spacing={1}>
          <Box
            sx={{
              width: 34,
              height: 34,
              borderRadius: 1.5,
              display: "grid",
              placeItems: "center",
              bgcolor: "rgba(255, 152, 0, 0.12)",
              color: "primary.main",
              flexShrink: 0,
            }}
          >
            {icon}
          </Box>

          <Typography
            sx={{
              fontSize: 14,
              fontWeight: 800,
              color: "text.primary",
            }}
          >
            {label}
          </Typography>
        </Stack>

        <Typography
          sx={{
            fontSize: 26,
            fontWeight: 900,
            color: "text.primary",
            lineHeight: 1.1,
          }}
        >
          {value}
        </Typography>

        <Typography
          sx={{
            fontSize: 12,
            color: "text.secondary",
            lineHeight: 1.45,
            minHeight: 34,
          }}
        >
          {helper}
        </Typography>

        <Box sx={{ mt: "auto" }}>
          <Chip
            label={chipLabel}
            size="small"
            color={chipColor}
            variant={chipColor === "default" ? "outlined" : "filled"}
          />
        </Box>
      </Stack>
    </Box>
  );
}