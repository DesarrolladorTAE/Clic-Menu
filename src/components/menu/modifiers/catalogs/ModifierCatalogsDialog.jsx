import React from "react";
import {
  Box,
  Button,
  Card,
  CardContent,
  Chip,
  Dialog,
  DialogContent,
  DialogTitle,
  Grid,
  IconButton,
  Stack,
  Typography,
  useMediaQuery,
} from "@mui/material";
import { useTheme } from "@mui/material/styles";

import CloseIcon from "@mui/icons-material/Close";
import Inventory2OutlinedIcon from "@mui/icons-material/Inventory2Outlined";
import ViewInArOutlinedIcon from "@mui/icons-material/ViewInArOutlined";
import WidgetsOutlinedIcon from "@mui/icons-material/WidgetsOutlined";
import AccountTreeOutlinedIcon from "@mui/icons-material/AccountTreeOutlined";

const cards = [
  {
    key: "products",
    title: "Productos",
    description: "Asigna grupos de modificadores directamente a productos.",
    icon: <Inventory2OutlinedIcon sx={{ fontSize: 30 }} />,
    disabled: false,
  },
  {
    key: "variants",
    title: "Variantes",
    description: "Asigna grupos a variantes específicas de tus productos.",
    icon: <ViewInArOutlinedIcon sx={{ fontSize: 30 }} />,
    disabled: false,
  },
  
  {
    key: "components",
    title: "Componentes",
    description: "Asigna grupos a componentes dentro de productos compuestos.",
    icon: <WidgetsOutlinedIcon sx={{ fontSize: 30 }} />,
    disabled: true,
  },
  {
    key: "component-variants",
    title: "Variantes de componentes",
    description: "Asigna grupos a variantes específicas de un componente.",
    icon: <AccountTreeOutlinedIcon sx={{ fontSize: 30 }} />,
    disabled: true,
  },
];

export default function ModifierCatalogsDialog({
  open,
  onClose,
  onSelect,
}) {
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down("sm"));

  if (!open) return null;

  return (
    <Dialog
      open={open}
      onClose={onClose}
      fullWidth
      maxWidth="md"
      fullScreen={isMobile}
      slotProps={{
        paper: {
          sx: {
            borderRadius: { xs: 0, sm: 1 },
            overflow: "hidden",
            backgroundColor: "background.paper",
          },
        },
      }}
    >
      <DialogTitle
        sx={{
          px: { xs: 2, sm: 3 },
          py: 2,
          bgcolor: "#111111",
          color: "#fff",
        }}
      >
        <Stack
          direction="row"
          justifyContent="space-between"
          alignItems="flex-start"
          spacing={2}
        >
          <Box>
            <Typography
              sx={{
                fontWeight: 800,
                fontSize: { xs: 20, sm: 24 },
                lineHeight: 1.2,
                color: "#fff",
              }}
            >
              Administrar catálogos
            </Typography>

            <Typography
              sx={{
                mt: 0.5,
                fontSize: 13,
                color: "rgba(255,255,255,0.82)",
              }}
            >
              Elige el tipo de catálogo que quieres configurar.
            </Typography>
          </Box>

          <IconButton
            onClick={onClose}
            sx={{
              color: "#fff",
              bgcolor: "rgba(255,255,255,0.08)",
              borderRadius: 1,
              "&:hover": {
                bgcolor: "rgba(255,255,255,0.16)",
              },
            }}
          >
            <CloseIcon />
          </IconButton>
        </Stack>
      </DialogTitle>

      <DialogContent
        sx={{
          p: { xs: 2, sm: 3 },
          bgcolor: "background.default",
        }}
      >
        <Grid container spacing={2}>
          {cards.map((item) => (
            <Grid item xs={12} sm={6} key={item.key}>
              <Card
                sx={{
                  height: "100%",
                  borderRadius: 1,
                  border: "1px solid",
                  borderColor: "divider",
                  boxShadow: "none",
                  backgroundColor: "background.paper",
                }}
              >
                <CardContent sx={{ p: 2.5 }}>
                  <Stack spacing={2} sx={{ height: "100%" }}>
                    <Stack
                      direction="row"
                      justifyContent="space-between"
                      alignItems="flex-start"
                      spacing={1.5}
                    >
                      <Box
                        sx={{
                          width: 52,
                          height: 52,
                          borderRadius: 2,
                          display: "grid",
                          placeItems: "center",
                          bgcolor: "rgba(255,152,0,0.12)",
                          color: "primary.main",
                          flexShrink: 0,
                        }}
                      >
                        {item.icon}
                      </Box>

                      {item.disabled ? (
                        <Chip
                          label="Próximamente"
                          size="small"
                          sx={{
                            bgcolor: "#FFF3E0",
                            color: "#A75A00",
                            fontWeight: 800,
                          }}
                        />
                      ) : (
                        <Chip
                          label="Disponible"
                          size="small"
                          color="success"
                        />
                      )}
                    </Stack>

                    <Box>
                      <Typography
                        sx={{
                          fontSize: 18,
                          fontWeight: 800,
                          color: "text.primary",
                        }}
                      >
                        {item.title}
                      </Typography>

                      <Typography
                        sx={{
                          mt: 0.8,
                          fontSize: 14,
                          color: "text.secondary",
                          lineHeight: 1.55,
                        }}
                      >
                        {item.description}
                      </Typography>
                    </Box>

                    <Box sx={{ pt: 0.5, mt: "auto" }}>
                      <Button
                        variant={item.disabled ? "outlined" : "contained"}
                        fullWidth
                        disabled={item.disabled}
                        onClick={() => {
                          if (item.disabled) return;
                          onSelect?.(item.key);
                        }}
                        sx={{
                          height: 44,
                          borderRadius: 2,
                          fontWeight: 800,
                        }}
                      >
                        {item.disabled ? "Aún no disponible" : "Administrar"}
                      </Button>
                    </Box>
                  </Stack>
                </CardContent>
              </Card>
            </Grid>
          ))}
        </Grid>
      </DialogContent>
    </Dialog>
  );
}