// src/theme/landingTheme.js
import { createTheme } from "@mui/material/styles";

const landingColors = {
  bg: "#F7FAFC",
  bgSoft: "#F3F6F8",
  bgWarm: "#FFF7F1",
  white: "#FFFFFF",

  text: "#2F3438",
  title: "#15191D",
  muted: "#6F757B",
  softText: "#8A9096",

  primary: "#C95A3B",
  primaryHover: "#AF482F",
  primarySoft: "#FFF0E9",
  primaryLight: "#E8A18C",

  primaryInverse: "#FFFFFF",
  primaryInverseText: "#C95A3B",
  primaryInverseHover: "#FFF0E9",

  terracotta: "#C95A3B",
  terracottaDark: "#9E3E29",
  terracottaSoft: "#F8DED5",

  orange: "#D76845",
  orangeLine: "#C95A3B",
  orangeSoft: "#F4A37F",
  orangePale: "#FFF3EC",

  brown: "#7A3E2E",
  brownSoft: "#A9583D",

  blue: "#123F6D",
  blueHover: "#0D3156",
  blueSoft: "#EAF2FA",

  yellow: "#F2C14E",
  yellowHover: "#DFAE38",

  dark: "#111820",
  darkCard: "#18212B",
  darkSoft: "#202B36",

  border: "rgba(21, 25, 29, 0.10)",
  borderSoft: "rgba(21, 25, 29, 0.07)",
  darkBorder: "rgba(255, 255, 255, 0.12)",

  shadow: "0 22px 60px rgba(17, 24, 32, 0.12)",
  shadowMedium: "0 16px 38px rgba(17, 24, 32, 0.10)",
  shadowSoft: "0 10px 28px rgba(17, 24, 32, 0.07)",
  shadowCard: "0 12px 30px rgba(21, 25, 29, 0.08)",
  shadowButton: "0 12px 24px rgba(201, 90, 59, 0.28)",
  shadowButtonInverse: "0 12px 24px rgba(255, 255, 255, 0.20)",

  radiusXs: 6,
  radiusSm: 6,
  radiusMd: 6,
  radiusLg: 6,
  radiusXl: 6,
  buttonRadius: 12,

  maxWidth: 1180,
};

const landingButtonSx = {
  primary: {
    borderRadius: `${landingColors.buttonRadius}px`,
    color: landingColors.white,
    backgroundColor: landingColors.primary,
    boxShadow: landingColors.shadowButton,

    "&:hover": {
      backgroundColor: landingColors.primaryHover,
      boxShadow: "0 16px 30px rgba(201, 90, 59, 0.34)",
    },
  },

  primaryInverse: {
    borderRadius: `${landingColors.buttonRadius}px`,
    color: landingColors.primary,
    backgroundColor: "rgba(255, 255, 255, 0.94)",
    border: `1.5px solid rgba(201, 90, 59, 0.72)`,
    boxShadow:
      "0 10px 24px rgba(255, 255, 255, 0.16), 0 10px 22px rgba(201, 90, 59, 0.14)",
    backdropFilter: "blur(10px)",

    "&:hover": {
      color: landingColors.white,
      backgroundColor: landingColors.primary,
      borderColor: landingColors.primary,
      boxShadow: "0 16px 30px rgba(201, 90, 59, 0.30)",
    },
  },

  secondary: {
    borderRadius: `${landingColors.buttonRadius}px`,
    color: landingColors.primary,
    backgroundColor: landingColors.white,
    border: `1.5px solid ${landingColors.primary}`,
    boxShadow: "none",

    "&:hover": {
      color: landingColors.primaryHover,
      backgroundColor: landingColors.primarySoft,
      borderColor: landingColors.primaryHover,
      boxShadow: "none",
    },
  },

  dark: {
    borderRadius: `${landingColors.buttonRadius}px`,
    color: landingColors.white,
    backgroundColor: landingColors.dark,
    boxShadow: "0 12px 24px rgba(17, 24, 32, 0.22)",

    "&:hover": {
      backgroundColor: landingColors.darkSoft,
      boxShadow: "0 16px 30px rgba(17, 24, 32, 0.28)",
    },
  },
};

const landingTheme = createTheme({
  palette: {
    mode: "light",

    primary: {
      main: landingColors.primary,
      dark: landingColors.primaryHover,
      light: landingColors.primaryLight,
      contrastText: landingColors.white,
    },

    secondary: {
      main: landingColors.primaryInverse,
      dark: landingColors.primaryInverseHover,
      contrastText: landingColors.primaryInverseText,
    },

    background: {
      default: landingColors.bg,
      paper: landingColors.white,
    },

    text: {
      primary: landingColors.text,
      secondary: landingColors.muted,
    },

    divider: landingColors.border,

    landing: landingColors,
  },

  typography: {
    fontFamily: '"Poppins", Arial, sans-serif',

    h1: {
      fontFamily: '"Poppins", Arial, sans-serif',
      fontWeight: 900,
      color: landingColors.title,
      letterSpacing: "-0.045em",
      lineHeight: 0.98,
      fontSize: "clamp(42px, 5.8vw, 72px)",
      margin: 0,
    },

    h2: {
      fontFamily: '"Poppins", Arial, sans-serif',
      fontWeight: 900,
      color: landingColors.title,
      letterSpacing: "-0.035em",
      lineHeight: 1.06,
      fontSize: "clamp(32px, 4.2vw, 52px)",
      margin: 0,
    },

    h3: {
      fontFamily: '"Poppins", Arial, sans-serif',
      fontWeight: 900,
      color: landingColors.title,
      letterSpacing: "-0.025em",
      lineHeight: 1.14,
      fontSize: "clamp(24px, 3vw, 36px)",
      margin: 0,
    },

    h4: {
      fontFamily: '"Poppins", Arial, sans-serif',
      fontWeight: 900,
      color: landingColors.title,
      letterSpacing: "-0.018em",
      lineHeight: 1.18,
      fontSize: 24,
      margin: 0,
    },

    h5: {
      fontFamily: '"Poppins", Arial, sans-serif',
      fontWeight: 900,
      color: landingColors.title,
      letterSpacing: "-0.014em",
      lineHeight: 1.2,
      fontSize: 20,
      margin: 0,
    },

    body1: {
      fontSize: 16,
      lineHeight: 1.65,
      color: landingColors.muted,
      margin: 0,
    },

    body2: {
      fontSize: 15,
      lineHeight: 1.6,
      color: landingColors.muted,
      margin: 0,
    },

    subtitle1: {
      fontSize: "clamp(16px, 2vw, 19px)",
      lineHeight: 1.6,
      color: landingColors.muted,
      margin: 0,
    },

    subtitle2: {
      fontSize: 12,
      fontWeight: 900,
      letterSpacing: "0.12em",
      textTransform: "uppercase",
      color: landingColors.primary,
      margin: 0,
    },

    button: {
      fontSize: 14,
      fontWeight: 900,
      lineHeight: 1,
      textTransform: "none",
    },

    landingEyebrow: {
      fontSize: 12,
      fontWeight: 900,
      letterSpacing: "0.12em",
      textTransform: "uppercase",
      color: landingColors.primary,
      margin: 0,
    },

    landingTitleXL: {
      fontFamily: '"Poppins", Arial, sans-serif',
      fontWeight: 900,
      color: landingColors.title,
      letterSpacing: "-0.045em",
      lineHeight: 0.98,
      fontSize: "clamp(42px, 5.8vw, 72px)",
      margin: 0,
    },

    landingTitleLG: {
      fontFamily: '"Poppins", Arial, sans-serif',
      fontWeight: 900,
      color: landingColors.title,
      letterSpacing: "-0.035em",
      lineHeight: 1.06,
      fontSize: "clamp(32px, 4.2vw, 52px)",
      margin: 0,
    },

    landingTitleMD: {
      fontFamily: '"Poppins", Arial, sans-serif',
      fontWeight: 900,
      color: landingColors.title,
      letterSpacing: "-0.025em",
      lineHeight: 1.14,
      fontSize: "clamp(24px, 3vw, 36px)",
      margin: 0,
    },

    landingCardTitle: {
      fontFamily: '"Poppins", Arial, sans-serif',
      fontWeight: 900,
      color: landingColors.title,
      letterSpacing: "-0.018em",
      lineHeight: 1.18,
      fontSize: 22,
      margin: 0,
    },

    landingText: {
      fontSize: 16,
      lineHeight: 1.65,
      color: landingColors.muted,
      margin: 0,
    },

    landingTextLG: {
      fontSize: "clamp(16px, 2vw, 19px)",
      lineHeight: 1.6,
      color: landingColors.muted,
      margin: 0,
    },

    landingSmall: {
      fontSize: 13,
      lineHeight: 1.5,
      color: landingColors.softText,
      margin: 0,
    },
  },

  shape: {
    borderRadius: 6,
  },

  shadows: [
    "none",
    landingColors.shadowSoft,
    landingColors.shadowMedium,
    landingColors.shadow,
    ...Array(21).fill(landingColors.shadow),
  ],

  components: {
    MuiCssBaseline: {
      styleOverrides: {
        html: {
          scrollBehavior: "smooth",
        },

        body: {
          margin: 0,
          fontFamily: '"Poppins", Arial, sans-serif',
          color: landingColors.text,
          backgroundColor: landingColors.bg,
        },

        "*": {
          boxSizing: "border-box",
        },

        "button, input, textarea, select": {
          fontFamily: "inherit",
        },

        a: {
          color: "inherit",
          textDecoration: "none",
        },

        "::selection": {
          color: landingColors.white,
          backgroundColor: landingColors.primary,
        },
      },
    },

    MuiContainer: {
      defaultProps: {
        maxWidth: false,
        disableGutters: true,
      },

      styleOverrides: {
        root: {
          width: "min(100% - 48px, 1180px)",
          marginLeft: "auto",
          marginRight: "auto",

          "@media (max-width: 900px)": {
            width: "min(100% - 32px, 1180px)",
          },
        },
      },
    },

    MuiButton: {
      styleOverrides: {
        root: {
          minHeight: 44,
          borderRadius: landingColors.buttonRadius,
          paddingLeft: 24,
          paddingRight: 24,
          fontSize: 14,
          fontWeight: 900,
          lineHeight: 1,
          boxShadow: "none",
          textTransform: "none",
          transition:
            "transform 0.2s ease, box-shadow 0.2s ease, background 0.2s ease, border-color 0.2s ease, color 0.2s ease",

          "&:hover": {
            transform: "translateY(-1px)",
            boxShadow: "none",
          },

          "&.Mui-disabled": {
            opacity: 0.55,
          },
        },

        containedPrimary: landingButtonSx.primary,

        containedSecondary: landingButtonSx.primaryInverse,

        outlinedPrimary: landingButtonSx.secondary,

        outlinedSecondary: landingButtonSx.secondary,
      },
    },

    MuiPaper: {
      styleOverrides: {
        root: {
          backgroundImage: "none",
          borderRadius: 1,
        },

        rounded: {
          borderRadius: 1,
        },
      },
    },

    MuiCard: {
      styleOverrides: {
        root: {
          border: `1px solid ${landingColors.border}`,
          borderRadius: 1,
          backgroundColor: landingColors.white,
          backgroundImage: "none",
          boxShadow: landingColors.shadowCard,
        },
      },
    },

    MuiChip: {
      styleOverrides: {
        root: {
          height: 32,
          borderRadius: 1,
          fontSize: 12,
          fontWeight: 900,
        },
      },
    },

    MuiTypography: {
      styleOverrides: {
        root: {
          margin: 0,
        },
      },
    },
  },
});

const landingTypography = landingTheme.typography;

export default landingTheme;
export { landingColors, landingTypography, landingButtonSx };