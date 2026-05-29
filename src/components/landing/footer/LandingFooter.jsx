import React from "react";
import { Box, Container, Link, Stack, Typography } from "@mui/material";
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
  "Facebook",
  "WhatsApp",
  "Instagram",
  "Twitter",
  "YouTube",
  "Pinterest",
];

export default function LandingFooter() {
  return (
    <Box
      component="footer"
      sx={{
        position: "relative",
        pt: {
          xs: 10.25,
          md: 12,
        },
        pb: 3.5,
        overflow: "hidden",
        bgcolor: landingColors.dark,
        color: landingColors.white,
      }}
    >
      <Box
        sx={{
          position: "absolute",
          top: -1,
          left: 0,
          width: "100%",
          height: 72,
          bgcolor: landingColors.white,
          borderRadius: "0 0 50% 50%",
        }}
      />

      <Container
        sx={{
          position: "relative",
          zIndex: 1,
        }}
      >
        <Box
          sx={{
            display: "grid",
            gridTemplateColumns: {
              xs: "1fr",
              md: "1fr 1fr",
              lg: "1.4fr 0.8fr 0.8fr 1.2fr",
            },
            gap: {
              xs: 4,
              md: 5.25,
            },
          }}
        >
          <Box>
            <Box
              sx={{
                width: 150,
                height: 54,
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                mb: 2.75,
                border: `1px solid ${landingColors.darkBorder}`,
                borderRadius: "18px",
                color: "rgba(255, 255, 255, 0.68)",
                fontWeight: 800,
              }}
            >
              Logo
            </Box>

            <Typography
              sx={{
                ...landingTypography.landingText,
                maxWidth: {
                  xs: "100%",
                  lg: 340,
                },
                color: "rgba(255, 255, 255, 0.72)",
              }}
            >
              Clic Menu es una plataforma digital para restaurantes que ayuda a
              controlar pedidos, mesas, cocina, ventas y operación desde un solo
              lugar.
            </Typography>
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
            <FooterLinks>
              {socialLinks.map((item) => (
                <FooterLink href="#" key={item}>
                  {item}
                </FooterLink>
              ))}
            </FooterLinks>
          </FooterColumn>

          <FooterColumn title="Contacto">
            <Stack spacing={2}>
              <ContactItem label="Email" value="contacto@telorecargo.com" />

              <ContactItem label="Teléfono" value="+52 (744) 218 8925" />

              <ContactItem
                label="Ubicación"
                value="Carretera Cayaco Puerto Marques Oficina 106 A, El Coloso, 39810, Acapulco de Juárez, Gro."
              />
            </Stack>
          </FooterColumn>
        </Box>

        <Box
          sx={{
            mt: {
              xs: 5,
              md: 7.25,
            },
            pt: 2.75,
            borderTop: `1px solid ${landingColors.darkBorder}`,
            textAlign: "center",
          }}
        >
          <Typography
            sx={{
              fontSize: 14,
              color: "rgba(255, 255, 255, 0.62)",
            }}
          >
            Clic Menu desarrollado por{" "}
            <Box
              component="strong"
              sx={{
                color: landingColors.yellow,
                fontWeight: 800,
              }}
            >
              TAE
            </Box>
            .
          </Typography>
        </Box>
      </Container>
    </Box>
  );
}

function FooterColumn({ title, children }) {
  return (
    <Box>
      <Typography
        component="h3"
        sx={{
          ...landingTypography.landingCardTitle,
          mb: 2.25,
          color: landingColors.white,
        }}
      >
        {title}
      </Typography>

      {children}
    </Box>
  );
}

function FooterLinks({ children }) {
  return (
    <Stack
      component="nav"
      spacing={1.35}
      alignItems="flex-start"
    >
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
        color: "rgba(255, 255, 255, 0.7)",
        fontSize: 15,
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

function ContactItem({ label, value }) {
  return (
    <Stack spacing={0.6}>
      <Typography
        component="strong"
        sx={{
          color: landingColors.white,
          fontSize: 14,
          fontWeight: 800,
        }}
      >
        {label}
      </Typography>

      <Typography
        component="span"
        sx={{
          color: "rgba(255, 255, 255, 0.7)",
          fontSize: 15,
          lineHeight: 1.45,
        }}
      >
        {value}
      </Typography>
    </Stack>
  );
}