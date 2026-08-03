// src/components/staff/casher/shared/CashierChoiceCard.jsx
import React from "react";
import { Box, Card, CardActionArea, CardContent, Chip, Stack, Typography } from "@mui/material";

export default function CashierChoiceCard({
  title,
  description,
  icon,
  color = "primary",
  disabled = false,
  disabledReason = "",
  selected = false,
  onClick,
}) {
  const paletteColor = color === "secondary" ? "secondary" : "primary";

  return (
    <Card
      sx={{
        height: "100%",
        border: "1px solid",
        borderColor: selected ? `${paletteColor}.main` : "divider",
        boxShadow: "none",
        backgroundColor: "background.paper",
        opacity: disabled ? 0.58 : 1,
        transition: "border-color 160ms ease, transform 160ms ease, box-shadow 160ms ease",
        "&:hover": disabled
          ? {}
          : {
              transform: "translateY(-2px)",
              borderColor: `${paletteColor}.main`,
              boxShadow: "0 8px 24px rgba(52,39,31,0.08)",
            },
      }}
    >
      <CardActionArea disabled={disabled} onClick={onClick} sx={{ height: "100%", display: "flex", alignItems: "stretch" }}>
        <CardContent
          sx={{
            p: { xs: 2, sm: 2.5 },
            width: "100%",
            minHeight: { xs: 176, sm: 205 },
            display: "flex",
            flexDirection: "column",
            "&:last-child": { pb: { xs: 2, sm: 2.5 } },
          }}
        >
          <Stack spacing={1.5} sx={{ height: "100%" }}>
            <Stack direction="row" justifyContent="space-between" alignItems="flex-start" spacing={1}>
              <Box
                sx={{
                  width: 54,
                  height: 54,
                  display: "grid",
                  placeItems: "center",
                  flexShrink: 0,
                  borderRadius: 1,
                  bgcolor: `${paletteColor}.main`,
                  color: `${paletteColor}.contrastText`,
                }}
              >
                {icon}
              </Box>

              {selected ? <Chip label="Seleccionado" size="small" color={paletteColor} /> : null}
            </Stack>

            <Box sx={{ flex: 1 }}>
              <Typography sx={{ fontSize: { xs: 18, sm: 20 }, fontWeight: 800, lineHeight: 1.25, color: "text.primary" }}>
                {title}
              </Typography>

              <Typography
                sx={{
                  mt: 0.75,
                  fontSize: 13,
                  lineHeight: 1.55,
                  color: disabledReason ? "error.main" : "text.secondary",
                }}
              >
                {disabledReason || description}
              </Typography>
            </Box>
          </Stack>
        </CardContent>
      </CardActionArea>
    </Card>
  );
}
