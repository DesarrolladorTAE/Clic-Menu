import React from "react";
import {
  Box,
  Container,
  IconButton,
  Link,
  Stack,
  Typography,
} from "@mui/material";

import FacebookRoundedIcon from "@mui/icons-material/FacebookRounded";
import WhatsAppIcon from "@mui/icons-material/WhatsApp";
import InstagramIcon from "@mui/icons-material/Instagram";
import XIcon from "@mui/icons-material/X";
import YouTubeIcon from "@mui/icons-material/YouTube";
import PinterestIcon from "@mui/icons-material/Pinterest";

import {
  landingColors,
  landingTypography,
} from "../../../theme/landingTheme";

const footerLinks = [
  { label: "Inicio", href: "/" },
  { label: "Planes", href: "/planes" },
  { label: "Sobre nosotros", href: "/sobre-nosotros" },
  { label: "Contactos", href: "/contacto" },
  { label: "Términos y condiciones", href: "/terminos-y-condiciones" },
];

const socialLinks = [
  {
    label: "Facebook",
    href: "https://www.facebook.com/TAELADTI",
    icon: <FacebookRoundedIcon fontSize="small" />,
    hoverColor: "#1877F2",
    shadowColor: "rgba(24, 119, 242, 0.34)",
  },
  {
    label: "WhatsApp",
    href: "https://api.whatsapp.com/send/?phone=527442188925&text&type=phone_number&app_absent=0",
    icon: <WhatsAppIcon fontSize="small" />,
    hoverColor: "#25D366",
    shadowColor: "rgba(37, 211, 102, 0.34)",
  },
  {
    label: "Instagram",
    href: "https://www.instagram.com/taeladmx/",
    icon: <InstagramIcon fontSize="small" />,
    hoverColor: "#E4405F",
    shadowColor: "rgba(228, 64, 95, 0.34)",
  },
  {
    label: "X",
    href: "https://x.com/TAELAD2?s=09",
    icon: <XIcon fontSize="small" />,
    hoverColor: "#000000",
    shadowColor: "rgba(0, 0, 0, 0.42)",
  },
  {
    label: "YouTube",
    href: "https://www.youtube.com/channel/UCZqj4INBI_M6b8b9O3Y3H5w",
    icon: <YouTubeIcon fontSize="small" />,
    hoverColor: "#FF0000",
    shadowColor: "rgba(255, 0, 0, 0.34)",
  },
  {
    label: "Pinterest",
    href: "https://mx.pinterest.com/TAELADMX/_created/",
    icon: <PinterestIcon fontSize="small" />,
    hoverColor: "#BD081C",
    shadowColor: "rgba(189, 8, 28, 0.34)",
  },
];

export default function LandingFooter() {
  return (
    <Box
      component="footer"
      sx={{
        position: "relative",
        overflow: "hidden",
        bgcolor: landingColors.dark,
        color: landingColors.white,
        pt: {
          xs: 8,
          md: 10,
        },
        pb: 3.5,
      }}
    >
      <Box
        sx={{
          position: "absolute",
          top: 0,
          left: 0,
          width: "100%",
          height: 5,
          bgcolor: landingColors.orangeLine,
          zIndex: 2,
          pointerEvents: "none",
        }}
      />

      <Box
        sx={{
          position: "absolute",
          top: 5,
          left: 0,
          width: "100%",
          height: 1,
          bgcolor: "rgba(255, 255, 255, 0.1)",
          zIndex: 2,
          pointerEvents: "none",
        }}
      />

      <Box
        sx={{
          position: "absolute",
          top: {
            xs: -90,
            md: -150,
          },
          right: {
            xs: -100,
            md: -160,
          },
          width: {
            xs: 260,
            md: 420,
          },
          height: {
            xs: 260,
            md: 420,
          },
          borderRadius: "50%",
          bgcolor: "rgba(246, 199, 122, 0.12)",
          zIndex: 0,
          pointerEvents: "none",
        }}
      />

      <Box
        sx={{
          position: "absolute",
          bottom: {
            xs: -130,
            md: -180,
          },
          left: {
            xs: -130,
            md: -180,
          },
          width: {
            xs: 280,
            md: 430,
          },
          height: {
            xs: 280,
            md: 430,
          },
          borderRadius: "50%",
          bgcolor: "rgba(207, 109, 78, 0.14)",
          zIndex: 0,
          pointerEvents: "none",
        }}
      />

      <Container
        sx={{
          position: "relative",
          zIndex: 5,
        }}
      >
        <Box
          sx={{
            display: "grid",
            gridTemplateColumns: {
              xs: "1fr",
              md: "1.2fr 0.8fr",
              lg: "1.35fr 0.75fr 0.85fr 1.2fr",
            },
            gap: {
              xs: 4,
              md: 5,
              lg: 6,
            },
            alignItems: "start",
          }}
        >
          <Box>
            <Box
              component="img"
              src="/images/clicmenu-blanco.png"
              alt="Clic Menu"
              sx={{
                display: "block",
                width: {
                  xs: 168,
                  sm: 190,
                },
                maxWidth: "100%",
                height: "auto",
                mb: 2.5,
              }}
            />

            <Typography
              sx={{
                ...landingTypography.landingText,
                maxWidth: {
                  xs: "100%",
                  lg: 360,
                },
                color: "rgba(255, 255, 255, 0.72)",
              }}
            >
              Clic Menu es una plataforma digital para restaurantes que ayuda a
              controlar pedidos, mesas, cocina, ventas y operación desde un solo
              lugar.
            </Typography>

            <Box
              sx={{
                mt: 3,
                width: 96,
                height: 4,
                borderRadius: 999,
                bgcolor: landingColors.orangeLine,
              }}
            />
          </Box>

          <FooterColumn title="Enlaces">
            <FooterLinks>
              {footerLinks.map((item) => (
                <FooterLink href={item.href} key={item.label}>
                  {item.label}
                </FooterLink>
              ))}
            </FooterLinks>
          </FooterColumn>

          <FooterColumn title="Síguenos">
            <Stack
              direction="row"
              spacing={1.25}
              useFlexGap
              flexWrap="wrap"
              sx={{
                position: "relative",
                zIndex: 10,
              }}
            >
              {socialLinks.map((item) => (
                <SocialButton
                  key={item.label}
                  href={item.href}
                  label={item.label}
                  icon={item.icon}
                  hoverColor={item.hoverColor}
                  shadowColor={item.shadowColor}
                />
              ))}
            </Stack>
          </FooterColumn>

          <FooterColumn title="Contacto">
            <Stack spacing={2.25}>
              <ContactItem
                label="Email"
                value="soporte@clicmenu.com.mx"
              />

              <ContactItem label="Teléfono" value="+52 (744) 218 8925" />

              <ContactItem
                label="Ubicación"
                value="C.24 202, Las Cruces, 39770. Acapulco de Juárez, Gro."
              />
            </Stack>
          </FooterColumn>
        </Box>

        <Box
          sx={{
            mt: {
              xs: 5,
              md: 7,
            },
            pt: 2.75,
            borderTop: `1px solid ${landingColors.darkBorder}`,
            display: "flex",
            flexDirection: {
              xs: "column",
              sm: "row",
            },
            alignItems: "center",
            justifyContent: "space-between",
            gap: 1.5,
            textAlign: {
              xs: "center",
              sm: "left",
            },
          }}
        >
          <Typography
            sx={{
              fontSize: 14,
              color: "rgba(255, 255, 255, 0.62)",
            }}
          >
            © {new Date().getFullYear()} Clic Menu & Tecnologías Administrativas ELAD. Todos los derechos
            reservados.
          </Typography>

        </Box>
      </Container>
    </Box>
  );
}

function FooterColumn({ title, children }) {
  return (
    <Box
      sx={{
        position: "relative",
        zIndex: 5,
      }}
    >
      <Stack spacing={1.25} sx={{ mb: 2.25 }}>
        <Typography
          component="h3"
          sx={{
            ...landingTypography.landingCardTitle,
            color: landingColors.white,
          }}
        >
          {title}
        </Typography>

        <Box
          sx={{
            width: 42,
            height: 3,
            borderRadius: 999,
            bgcolor: landingColors.orangeLine,
          }}
        />
      </Stack>

      {children}
    </Box>
  );
}

function FooterLinks({ children }) {
  return (
    <Stack component="nav" spacing={1.3} alignItems="flex-start">
      {children}
    </Stack>
  );
}

function FooterLink({ href, children }) {
  return (
    <Link
      href={href}
      underline="none"
      sx={{
        width: "fit-content",
        color: "rgba(255, 255, 255, 0.72)",
        fontSize: 15,
        lineHeight: 1.35,
        transition: "color 0.2s ease, transform 0.2s ease",
        "&:hover": {
          color: landingColors.yellow,
          transform: "translateX(3px)",
        },
      }}
    >
      {children}
    </Link>
  );
}

function SocialButton({ href, label, icon, hoverColor, shadowColor }) {
  return (
    <IconButton
      component="a"
      href={href}
      target="_blank"
      rel="noopener noreferrer"
      aria-label={label}
      sx={{
        position: "relative",
        zIndex: 20,
        width: 42,
        height: 42,
        borderRadius: "50%",
        bgcolor: landingColors.white,
        color: landingColors.dark,
        border: `1px solid rgba(255, 255, 255, 0.16)`,
        boxShadow: "0 10px 24px rgba(0, 0, 0, 0.18)",
        cursor: "pointer",
        pointerEvents: "auto",
        transition:
          "transform 0.2s ease, box-shadow 0.2s ease, background 0.2s ease, color 0.2s ease",
        "& svg": {
          transition: "transform 0.2s ease",
        },
        "&:hover": {
          bgcolor: hoverColor,
          color: landingColors.white,
          transform: "translateY(-4px) scale(1.06)",
          boxShadow: `0 16px 30px ${shadowColor}`,
        },
        "&:hover svg": {
          transform: "scale(1.1)",
        },
        "&:active": {
          transform: "translateY(-1px) scale(0.98)",
        },
      }}
    >
      {icon}
    </IconButton>
  );
}

function ContactItem({ label, value }) {
  return (
    <Stack spacing={0.65}>
      <Typography
        component="strong"
        sx={{
          color: landingColors.white,
          fontSize: 14,
          fontWeight: 900,
        }}
      >
        {label}
      </Typography>

      <Typography
        component="span"
        sx={{
          color: "rgba(255, 255, 255, 0.72)",
          fontSize: 15,
          lineHeight: 1.5,
        }}
      >
        {value}
      </Typography>
    </Stack>
  );
}