import React from "react";
import { Box, Card, CardContent, Chip, Container, Stack, Typography } from "@mui/material";

import AdminPanelSettingsRoundedIcon from "@mui/icons-material/AdminPanelSettingsRounded";
import { useSystemAdminAuth } from "../../context/SystemAdminAuthContext";

export default function SystemAdminDashboard() {
  const { adminUser } = useSystemAdminAuth();

  const adminName = adminUser?.name || "Administrador";

  return (
    <Box
      sx={{
        minHeight: "100vh",
        bgcolor: "background.default",
        py: { xs: 4, md: 5 },
      }}
    >
      <Container maxWidth="xl">
        <Stack spacing={3}>
          <Card
            sx={{
              borderRadius: 1,
              boxShadow: "none",
              border: "1px solid",
              borderColor: "divider",
              bgcolor: "background.paper",
            }}
          >
            <CardContent sx={{ p: { xs: 3, md: 4 } }}>
              <Stack spacing={1.5}>
                <Typography
                  variant="h4"
                  sx={{
                    fontWeight: 950,
                    color: "text.primary",
                    lineHeight: 1.1,
                  }}
                >
                  Bienvenido, {adminName}
                </Typography>

                <Typography
                  sx={{
                    color: "text.secondary",
                    maxWidth: 780,
                    fontSize: 15,
                    lineHeight: 1.6,
                  }}
                >
                  Desde este panel podrás gestionar propietarios, restaurantes,
                  sucursales, suscripciones y ventas mensuales del sistema.
                </Typography>

                <Chip
                  icon={<AdminPanelSettingsRoundedIcon />}
                  label="Panel interno"
                  sx={{
                    width: "fit-content",
                    fontWeight: 900,
                    bgcolor: "primary.light",
                    color: "primary.dark",
                    "& .MuiChip-icon": {
                      color: "primary.dark",
                    },
                  }}
                />
              </Stack>
            </CardContent>
          </Card>

          <Card
            sx={{
                borderRadius: 1,
                boxShadow: "none",
                border: "1px solid",
                borderColor: "divider",
                bgcolor: "background.paper",
            }}
          >
            <CardContent sx={{ p: { xs: 3, md: 5 } }}>
                <Stack
                spacing={1}
                alignItems="center"
                textAlign="center"
                >
                <Typography
                    sx={{
                    fontWeight: 950,
                    fontSize: { xs: 22, md: 30 },
                    color: "text.primary",
                    lineHeight: 1.1,
                    }}
                >
                    ¿Qué haremos hoy?
                </Typography>

                <Typography
                    sx={{
                    color: "text.secondary",
                    maxWidth: 720,
                    fontSize: 15,
                    lineHeight: 1.7,
                    }}
                >
                    Usa el menú lateral para entrar a la sección que necesitas
                    administrar.
                </Typography>
                </Stack>
            </CardContent>
          </Card>
        </Stack>
      </Container>
    </Box>
  );
}