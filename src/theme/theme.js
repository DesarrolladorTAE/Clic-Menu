import { createTheme } from "@mui/material/styles";

const theme = createTheme({
  palette: {
    primary: {
      main: "#FF9800",
      light: "#FFB547",
      dark: "#E68900",
      contrastText: "#FFFFFF",
    },
    secondary: {
      main: "#D67A3A",
      light: "#E59A63",
      dark: "#B96328",
      contrastText: "#FFFFFF",
    },
    success: {
      main: "#2EAF2E",
      contrastText: "#FFFFFF",
    },
    warning: {
      main: "#F57C00",
      contrastText: "#FFFFFF",
    },
    error: {
      main: "#F2642A",
      contrastText: "#FFFFFF",
    },
    info: {
      main: "#1976D2",
      contrastText: "#FFFFFF",
    },
    background: {
      default: "#F3F1F1",
      paper: "#FBF8F8",
    },
    text: {
      primary: "#3F3A52",
      secondary: "#6E6A6A",
    },
    divider: "#D9D3D3",
  },

  shape: {
    borderRadius: 6,
  },

  typography: {
    fontFamily: `"Roboto", "Arial", sans-serif`,
    h1: {
      fontWeight: 700,
      color: "#3F3A52",
    },
    h2: {
      fontWeight: 700,
      color: "#3F3A52",
    },
    h3: {
      fontWeight: 700,
      color: "#3F3A52",
    },
    h4: {
      fontWeight: 700,
      color: "#3F3A52",
    },
    h5: {
      fontWeight: 700,
      color: "#3F3A52",
    },
    h6: {
      fontWeight: 700,
      color: "#3F3A52",
    },
    button: {
      fontWeight: 700,
      textTransform: "none",
      letterSpacing: 0.3,
    },
  },

  components: {
    MuiCssBaseline: {
      styleOverrides: {
        body: {
          backgroundColor: "#F3F1F1",
          color: "#3F3A52",
        },
      },
    },

    MuiButton: {
      styleOverrides: {
        root: {
          borderRadius: 12,
          padding: "8px 18px",
          minHeight: 42,
          boxShadow: "none",
          fontWeight: 700,
        },
        containedPrimary: {
          backgroundColor: "#FF9800",
          "&:hover": {
            backgroundColor: "#E68900",
            boxShadow: "none",
          },
        },
        containedSecondary: {
          backgroundColor: "#D67A3A",
          "&:hover": {
            backgroundColor: "#B96328",
            boxShadow: "none",
          },
        },
        outlined: {
          borderWidth: "1.5px",
          "&:hover": {
            borderWidth: "1.5px",
          },
        },
      },
    },

    MuiPaper: {
      styleOverrides: {
        root: {
          backgroundImage: "none",
          borderRadius: 6,
          boxShadow: "0 2px 10px rgba(0,0,0,0.04)",
        },
      },
    },

    MuiCard: {
      styleOverrides: {
        root: {
          borderRadius: 6,
          boxShadow: "0 2px 10px rgba(0,0,0,0.04)",
          backgroundColor: "#FBF8F8",
        },
      },
    },

    MuiTextField: {
      defaultProps: {
        variant: "outlined",
        size: "medium",
        fullWidth: true,
      },
    },

    MuiOutlinedInput: {
      styleOverrides: {
        root: {
          backgroundColor: "#F4F4F4",
          borderRadius: 0,
          "& .MuiOutlinedInput-notchedOutline": {
            border: "none",
          },
          "&:hover .MuiOutlinedInput-notchedOutline": {
            border: "none",
          },
          "&.Mui-focused .MuiOutlinedInput-notchedOutline": {
            border: "1.5px solid #FF9800",
          },
        },
        input: {
          paddingTop: "10px",
          paddingBottom: "10px",
          paddingLeft: "12px",
          paddingRight: "12px",
          fontSize: "14px",
          "&::placeholder": {
            opacity: 1,
            color: "#8A8A8A",
          },
        },
      },
    },

    MuiFormHelperText: {
      styleOverrides: {
        root: {
          marginLeft: 0,
          marginTop: 4,
          fontSize: "11px",
        },
      },
    },

    MuiAppBar: {
      styleOverrides: {
        root: {
          boxShadow: "none",
        },
      },
    },

    MuiDrawer: {
      styleOverrides: {
        paper: {
          backgroundColor: "#FF9800",
          color: "#FFFFFF",
          borderRight: "none",
        },
      },
    },

    MuiChip: {
      styleOverrides: {
        root: {
          borderRadius: 999,
          fontWeight: 700,
        },
      },
    },

    MuiTableCell: {
      styleOverrides: {
        head: {
          fontWeight: 700,
          color: "#3F3A52",
        },
      },
    },



    MuiSnackbar: {
      defaultProps: {
        anchorOrigin: {
          vertical: "top",
          horizontal: "right",
        },
      },
      styleOverrides: {
        root: {
          zIndex: 2000,
        },
      },
    },

    
    MuiAlert: {
      defaultProps: {
        variant: "filled",
      },
      styleOverrides: {
        root: {
          borderRadius: 6,
          alignItems: "flex-start",
          boxShadow: "0 8px 24px rgba(0,0,0,0.14)",
          padding: "10px 14px",
          minWidth: 360,
        },

        message: {
          padding: 0,
          width: "100%",
        },

        icon: {
          marginRight: 10,
          padding: "2px 0",
          fontSize: 22,
          opacity: 0.95,
        },

        action: {
          paddingTop: 0,
          alignItems: "flex-start",
          marginRight: -4,
        },

        filledSuccess: {
          backgroundColor: "#2EAF2E",
          color: "#FFFFFF",
        },

        filledError: {
          backgroundColor: "#F2642A",
          color: "#FFFFFF",
        },

        filledWarning: {
          backgroundColor: "#F57C00",
          color: "#FFFFFF",
        },

        filledInfo: {
          backgroundColor: "#1976D2",
          color: "#FFFFFF",
        },
      },
    },

    MuiMenu: {
      styleOverrides: {
        paper: {
          borderRadius: 1
        }
      }
    }

  },
});

export default theme;