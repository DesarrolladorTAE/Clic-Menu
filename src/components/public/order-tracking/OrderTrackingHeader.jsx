//Encabezado de la pagina de seguimiento
import React from "react";
import {
  Avatar, Box, Card, Stack, Typography,
} from "@mui/material";

import AccessTimeRoundedIcon from "@mui/icons-material/AccessTimeRounded";
import LocationOnOutlinedIcon from "@mui/icons-material/LocationOnOutlined";
import PhoneOutlinedIcon from "@mui/icons-material/PhoneOutlined";
import RestaurantRoundedIcon from "@mui/icons-material/RestaurantRounded";

export default function OrderTrackingHeader({ data, themeColor }) {
  const publicMenu = data?.public_menu || {};
  const branch = publicMenu?.branch || {};
  const restaurantName = data?.restaurant?.trade_name || "Restaurante";
  const branchName = branch?.name || "Sucursal";

  const coverUrl = publicMenu?.cover_image_url || "";
  const logoUrl = publicMenu?.logo_url || "";
  const phone = String(branch?.phone || "").trim();
  const address = String(branch?.address || "").trim();
  const openTime = String(branch?.open_time || "").trim();
  const closeTime = String(branch?.close_time || "").trim();

  return (
    <Card
      sx={{
        width: "100%",
        overflow: "visible",
        border: "1px solid",
        borderColor: "divider",
        borderRadius: { xs: 0, sm: 1 },
        boxShadow: "none",
        backgroundColor: "background.paper",
      }}
    >
      <Box
        sx={{
          position: "relative",
          height: { xs: 185, sm: 225, md: 245 },
          overflow: "hidden",
          borderRadius: { xs: 0, sm: "6px 6px 0 0" },
          background: coverUrl
            ? undefined
            : `linear-gradient(135deg, ${themeColor} 0%, ${themeColor}CC 48%, ${themeColor}88 100%)`,
        }}
      >
        {coverUrl ? (
          <>
            <Box
              component="img"
              src={coverUrl}
              alt={`Portada de ${branchName}`}
              sx={{ width: "100%", height: "100%", objectFit: "cover", display: "block" }}
            />

            <Box
              sx={{
                position: "absolute",
                inset: 0,
                background:
                  "linear-gradient(180deg, rgba(0,0,0,0.04) 40%, rgba(0,0,0,0.34) 100%)",
              }}
            />
          </>
        ) : null}
      </Box>

      <Box
        sx={{
          position: "relative",
          px: { xs: 2, sm: 3 },
          pb: { xs: 2.5, sm: 3 },
          pt: { xs: 6.5, sm: 2.5 },
        }}
      >
        <Avatar
          src={logoUrl || undefined}
          alt={`Logo de ${branchName}`}
          sx={{
            position: "absolute",
            left: { xs: 18, sm: 26 },
            top: { xs: -48, sm: -54 },
            width: { xs: 96, sm: 108 },
            height: { xs: 96, sm: 108 },
            border: "4px solid",
            borderColor: "background.paper",
            backgroundColor: themeColor,
            color: "#fff",
            boxShadow: "0 6px 18px rgba(0,0,0,0.15)",
          }}
        >
          <RestaurantRoundedIcon sx={{ fontSize: 44 }} />
        </Avatar>

        <Box sx={{ pl: { xs: 0, sm: 15 }, minHeight: { sm: 70 } }}>
          <Typography
            sx={{
              fontSize: { xs: 22, sm: 26 },
              fontWeight: 900,
              color: "text.primary",
              lineHeight: 1.15,
              wordBreak: "break-word",
            }}
          >
            {restaurantName}
          </Typography>

          <Typography
            sx={{
              mt: 0.5,
              fontSize: { xs: 14, sm: 15 },
              fontWeight: 800,
              color: themeColor,
            }}
          >
            {branchName}
          </Typography>

          <Stack
            direction="row"
            useFlexGap
            flexWrap="wrap"
            spacing={1.5}
            sx={{ mt: 1.5, rowGap: 1 }}
          >
            {phone ? (
              <InfoRow
                icon={<PhoneOutlinedIcon />}
                text={phone}
                href={`tel:${phone.replace(/[^\d+]/g, "")}`}
              />
            ) : null}

            {address ? (
              <InfoRow icon={<LocationOnOutlinedIcon />} text={address} />
            ) : null}

            {openTime && closeTime ? (
              <InfoRow
                icon={<AccessTimeRoundedIcon />}
                text={`${openTime} - ${closeTime}`}
              />
            ) : null}
          </Stack>
        </Box>
      </Box>
    </Card>
  );
}

function InfoRow({ icon, text, href }) {
  const content = (
    <Stack direction="row" spacing={0.6} alignItems="center">
      <Box sx={{ display: "flex", color: "text.secondary", "& svg": { fontSize: 17 } }}>
        {icon}
      </Box>

      <Typography sx={{ fontSize: 12.5, color: "text.secondary", lineHeight: 1.4 }}>
        {text}
      </Typography>
    </Stack>
  );

  if (!href) return content;

  return (
    <Box
      component="a"
      href={href}
      sx={{ color: "inherit", textDecoration: "none" }}
    >
      {content}
    </Box>
  );
}
