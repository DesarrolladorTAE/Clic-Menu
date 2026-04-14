import { Box, Paper, Stack, Typography } from "@mui/material";

export default function FloorLegendCard({
  statusMeta = [],
  canManageQr = false,
  manageQrBlockReason = null,
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
      <Stack spacing={1.5}>
        <Typography
          sx={{
            fontSize: 16,
            fontWeight: 800,
            color: "text.primary",
          }}
        >
          Referencias
        </Typography>

        <Stack
          direction={{ xs: "column", md: "row" }}
          spacing={1.5}
          useFlexGap
          flexWrap="wrap"
        >
          {statusMeta.map((status) => (
            <Box
              key={status.key}
              sx={{
                flex: "1 1 220px",
                minWidth: 220,
                border: "1px solid",
                borderColor: "divider",
                borderRadius: 1,
                p: 1.5,
                backgroundColor: "background.default",
              }}
            >
              <Stack direction="row" alignItems="center" spacing={1}>
                <Box
                  sx={{
                    width: 14,
                    height: 14,
                    borderRadius: 0.75,
                    backgroundColor: status.color,
                    border: "1px solid",
                    borderColor: status.border,
                    flexShrink: 0,
                  }}
                />
                <Typography
                  sx={{
                    fontSize: 14,
                    fontWeight: 800,
                    color: "text.primary",
                  }}
                >
                  {status.label}
                </Typography>
              </Stack>
            </Box>
          ))}
        </Stack>

        {!canManageQr ? (
          <Box
            sx={{
              mt: 0.5,
              p: 1.5,
              borderRadius: 1,
              border: "1px solid",
              borderColor: "#F3D48B",
              backgroundColor: "#FFF7E8",
            }}
          >
            <Typography
              sx={{
                fontSize: 12,
                color: "#8A5A00",
                fontWeight: 800,
                lineHeight: 1.45,
              }}
            >
              {manageQrBlockReason ||
                "QR desactivado: primero actívalo en Configuración Operativa para administrar códigos QR en esta sucursal."}
            </Typography>
          </Box>
        ) : null}
      </Stack>
    </Paper>
  );
}
