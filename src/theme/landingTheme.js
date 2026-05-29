// src/theme/landingTheme.js
import { createTheme } from "@mui/material/styles";

const landingColors = {
  bg: "#FFF9F0",
  white: "#FFFFFF",

  text: "#3F3D3A",
  title: "#2F2D2A",
  muted: "#6F6A64",

  yellow: "#EFC84A",
  yellowHover: "#DDB62F",

  terracotta: "#CF6D4E",
  orangeSoft: "#F6C77A",
  orangeLine: "#FF741F",

  dark: "#12100E",
  darkCard: "#1B1917",

  border: "rgba(63, 61, 58, 0.1)",
  darkBorder: "rgba(255, 255, 255, 0.1)",

  shadow: "0 18px 40px rgba(62, 49, 35, 0.08)",
  shadowSoft: "0 10px 28px rgba(62, 49, 35, 0.06)",

  radiusSm: 16,
  radiusMd: 24,
  radiusLg: 32,

  maxWidth: 1180,
};

const landingTheme = createTheme({
  palette: {
    mode: "light",

    primary: {
      main: landingColors.yellow,
      dark: landingColors.yellowHover,
      contrastText: "#111111",
    },

    secondary: {
      main: landingColors.terracotta,
      contrastText: landingColors.white,
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
      fontFamily: '"Bree Serif", Georgia, serif',
      fontWeight: 400,
      color: landingColors.title,
      letterSpacing: "-0.02em",
      lineHeight: 1.05,
      fontSize: "clamp(38px, 5vw, 58px)",
      margin: 0,
    },

    h2: {
      fontFamily: '"Bree Serif", Georgia, serif',
      fontWeight: 400,
      color: landingColors.title,
      letterSpacing: "-0.02em",
      lineHeight: 1.12,
      fontSize: "clamp(30px, 4vw, 44px)",
      margin: 0,
    },

    h3: {
      fontFamily: '"Bree Serif", Georgia, serif',
      fontWeight: 400,
      color: landingColors.title,
      letterSpacing: "-0.02em",
      lineHeight: 1.18,
      fontSize: "clamp(24px, 3vw, 34px)",
      margin: 0,
    },

    h4: {
      fontFamily: '"Bree Serif", Georgia, serif',
      fontWeight: 400,
      color: landingColors.title,
      letterSpacing: "-0.02em",
      lineHeight: 1.2,
      fontSize: 22,
      margin: 0,
    },

    h5: {
      fontFamily: '"Bree Serif", Georgia, serif',
      fontWeight: 400,
      color: landingColors.title,
      letterSpacing: "-0.02em",
      lineHeight: 1.2,
      fontSize: 20,
      margin: 0,
    },

    body1: {
      fontSize: 16,
      lineHeight: 1.55,
      color: landingColors.muted,
      margin: 0,
    },

    body2: {
      fontSize: 15,
      lineHeight: 1.55,
      color: landingColors.muted,
      margin: 0,
    },

    subtitle1: {
      fontSize: "clamp(16px, 2vw, 18px)",
      lineHeight: 1.55,
      color: landingColors.muted,
      margin: 0,
    },

    subtitle2: {
      fontSize: 13,
      fontWeight: 800,
      letterSpacing: "0.12em",
      textTransform: "uppercase",
      color: landingColors.terracotta,
      margin: 0,
    },

    button: {
      fontSize: 14,
      fontWeight: 800,
      lineHeight: 1,
      textTransform: "none",
    },

    landingEyebrow: {
      fontSize: 13,
      fontWeight: 800,
      letterSpacing: "0.12em",
      textTransform: "uppercase",
      color: landingColors.terracotta,
      margin: 0,
    },

    landingTitleXL: {
      fontFamily: '"Bree Serif", Georgia, serif',
      fontWeight: 400,
      color: landingColors.title,
      letterSpacing: "-0.02em",
      lineHeight: 1.05,
      fontSize: "clamp(38px, 5vw, 58px)",
      margin: 0,
    },

    landingTitleLG: {
      fontFamily: '"Bree Serif", Georgia, serif',
      fontWeight: 400,
      color: landingColors.title,
      letterSpacing: "-0.02em",
      lineHeight: 1.12,
      fontSize: "clamp(30px, 4vw, 44px)",
      margin: 0,
    },

    landingTitleMD: {
      fontFamily: '"Bree Serif", Georgia, serif',
      fontWeight: 400,
      color: landingColors.title,
      letterSpacing: "-0.02em",
      lineHeight: 1.18,
      fontSize: "clamp(24px, 3vw, 34px)",
      margin: 0,
    },

    landingCardTitle: {
      fontFamily: '"Bree Serif", Georgia, serif',
      fontWeight: 400,
      color: landingColors.title,
      letterSpacing: "-0.02em",
      lineHeight: 1.2,
      fontSize: 22,
      margin: 0,
    },

    landingText: {
      fontSize: 16,
      lineHeight: 1.55,
      color: landingColors.muted,
      margin: 0,
    },

    landingTextLG: {
      fontSize: "clamp(16px, 2vw, 18px)",
      lineHeight: 1.55,
      color: landingColors.muted,
      margin: 0,
    },
  },

  shape: {
    borderRadius: landingColors.radiusSm,
  },

  shadows: [
    "none",
    landingColors.shadowSoft,
    landingColors.shadow,
    ...Array(22).fill(landingColors.shadow),
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
          minHeight: 46,
          borderRadius: 999,
          paddingLeft: 28,
          paddingRight: 28,
          fontSize: 14,
          fontWeight: 800,
          lineHeight: 1,
          boxShadow: "none",
          textTransform: "none",
          transition:
            "transform 0.2s ease, box-shadow 0.2s ease, background 0.2s ease",

          "&:hover": {
            transform: "translateY(-1px)",
            boxShadow: "none",
          },
        },

        containedPrimary: {
          color: "#111111",
          backgroundColor: landingColors.yellow,
          boxShadow: "0 12px 24px rgba(239, 200, 74, 0.28)",

          "&:hover": {
            backgroundColor: landingColors.yellowHover,
            boxShadow: "0 14px 28px rgba(239, 200, 74, 0.34)",
          },
        },

        outlinedSecondary: {
          color: landingColors.text,
          borderWidth: 1.5,
          borderColor: landingColors.terracotta,

          "&:hover": {
            borderWidth: 1.5,
            borderColor: landingColors.terracotta,
            backgroundColor: "#FFF1E8",
          },
        },
      },
    },

    MuiPaper: {
      styleOverrides: {
        root: {
          backgroundImage: "none",
        },
      },
    },

    MuiCard: {
      styleOverrides: {
        root: {
          border: `1px solid ${landingColors.border}`,
          borderRadius: landingColors.radiusMd,
          backgroundColor: landingColors.white,
          backgroundImage: "none",
          boxShadow: landingColors.shadowSoft,
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
export { landingColors, landingTypography };