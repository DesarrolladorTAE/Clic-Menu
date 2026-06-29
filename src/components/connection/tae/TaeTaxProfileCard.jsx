import { Box, Chip, Paper, Stack, Typography } from "@mui/material";

function formatValue(value, fallback = "Sin datos") {
  if (value === null || typeof value === "undefined" || value === "") {
    return fallback;
  }

  if (typeof value === "boolean") {
    return value ? "Sí" : "No";
  }

  return String(value);
}

function formatDate(value) {
  if (!value) return "Sin datos";

  const date = new Date(value);

  if (Number.isNaN(date.getTime())) {
    return String(value);
  }

  return date.toLocaleString("es-MX", {
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
    hour: "2-digit",
    minute: "2-digit",
  });
}

export default function TaeTaxProfileCard({ profile }) {
  const hasProfile =
    !!profile?.exists || !!profile?.id || !!profile?.rfc || !!profile?.business_name;

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
            Datos fiscales obtenidos
          </Typography>

          <Typography
            sx={{
              mt: 0.5,
              fontSize: 13,
              color: "text.secondary",
            }}
          >
            Información devuelta por Taeconta. Estos campos son solo de lectura.
          </Typography>
        </Box>

        <Chip
          label={hasProfile ? "Sincronizado" : "Sin datos"}
          size="small"
          color={hasProfile ? "success" : "default"}
          variant={hasProfile ? "filled" : "outlined"}
        />
      </Box>

      {!hasProfile ? (
        <Box
          sx={{
            px: 3,
            py: 5,
            textAlign: "center",
          }}
        >
          <Typography
            sx={{
              fontSize: 20,
              fontWeight: 800,
              color: "text.primary",
            }}
          >
            No hay datos fiscales sincronizados
          </Typography>

          <Typography
            sx={{
              mt: 1,
              color: "text.secondary",
              fontSize: 14,
              lineHeight: 1.55,
            }}
          >
            Guarda credenciales válidas de Taeconta para que el sistema obtenga
            RFC, razón social, timbres e indicadores.
          </Typography>
        </Box>
      ) : (
        <Box sx={{ p: { xs: 2, sm: 2.5 } }}>
          <Stack spacing={2.5}>
            <SectionTitle title="Identificación fiscal" />

            <InfoGrid>
              <InfoItem label="RFC" value={formatValue(profile?.rfc)} />

              <InfoItem
                label="Razón social / Nombre"
                value={formatValue(profile?.business_name)}
              />

              <InfoItem
                label="Código postal fiscal"
                value={formatValue(profile?.fiscal_zip_code)}
              />
            </InfoGrid>

            <SectionTitle title="Estado de cuenta e indicadores" />

            <InfoGrid>
              <InfoItem
                label="Timbres disponibles"
                value={formatValue(profile?.available_stamps)}
              />

              <InfoItem
                label="Facturas timbradas"
                value={formatValue(profile?.stamped_invoices)}
              />

              <InfoItem
                label="Facturas canceladas"
                value={formatValue(profile?.cancelled_invoices)}
              />
            </InfoGrid>

            <SectionTitle title="Fechas de sincronización" />

            <InfoGrid>
              <InfoItem
                label="Sincronizado"
                value={formatDate(profile?.synced_at)}
              />

              <InfoItem
                label="Creado"
                value={formatDate(profile?.created_at)}
              />

              <InfoItem
                label="Actualizado"
                value={formatDate(profile?.updated_at)}
              />
            </InfoGrid>
          </Stack>
        </Box>
      )}
    </Paper>
  );
}

function SectionTitle({ title }) {
  return (
    <Typography
      sx={{
        fontSize: 15,
        fontWeight: 800,
        color: "primary.main",
        pt: 0.5,
      }}
    >
      {title}
    </Typography>
  );
}

function InfoGrid({ children }) {
  return (
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
      {children}
    </Box>
  );
}

function InfoItem({ label, value }) {
  return (
    <Box
      sx={{
        position: "relative",
        border: "1px solid",
        borderColor: "divider",
        borderRadius: 1,
        p: 1.75,
        pl: 2.25,
        backgroundColor: "background.default",
        minHeight: 96,
        overflow: "hidden",
        "&::before": {
          content: '""',
          position: "absolute",
          left: 0,
          top: 0,
          bottom: 0,
          width: 5,
          bgcolor: "primary.main",
        },
      }}
    >
      <Typography
        sx={{
          fontSize: 11,
          fontWeight: 800,
          color: "text.secondary",
          textTransform: "uppercase",
          letterSpacing: 0.3,
        }}
      >
        {label}
      </Typography>

      <Typography
        sx={{
          mt: 0.75,
          fontSize: 14,
          color: "text.primary",
          lineHeight: 1.45,
          wordBreak: "break-word",
        }}
      >
        {value || "Sin datos"}
      </Typography>
    </Box>
  );
}