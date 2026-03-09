import React from "react";
import { Box, Stack, Typography } from "@mui/material";

export default function AuthBrandPanel({
  logoSrc,
  logoAlt = "CLICMENU",
  title = "Bienvenido de nuevo",
  subtitle = "Accede a tu cuenta y administra tus restaurantes y sucursales.",
  side = "left",
}) {
  return (
    <Box
      sx={{
        order: { xs: 1, md: side === "left" ? 1 : 2 },
        width: "100%",
        minHeight: "100vh",
        display: { xs: "none", md: "flex" }, // en móvil lo ocultamos
        alignItems: "center",
        justifyContent: "center",
        bgcolor: "primary.main",
        color: "#fff",
      }}
    >
      <Stack
        spacing={3}
        sx={{
          width: "100%",
          maxWidth: 420,
          alignItems: "center",
          textAlign: "center",
          px: 6,
        }}
      >
        {logoSrc && (
          <Box
            component="img"
            src={logoSrc}
            alt={logoAlt}
            sx={{
              width: "100%",
              maxWidth: 220,
              height: "auto",
              objectFit: "contain",
            }}
          />
        )}

        <Typography
          sx={{
            fontSize: 28,
            fontWeight: 700,
            mt: 2,
          }}
        >
          {title}
        </Typography>

        <Typography
          sx={{
            fontSize: 15,
            opacity: 0.9,
            lineHeight: 1.6,
            maxWidth: 300,
          }}
        >
          {subtitle}
        </Typography>
      </Stack>
    </Box>
  );
}