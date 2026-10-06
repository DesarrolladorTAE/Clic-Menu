import React from "react";
import {
  Box, Button, Card, CardContent, Chip, Dialog, DialogContent, DialogTitle, IconButton,
  Stack, Typography, useMediaQuery,
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
    disabled: false,
  },
  {
    key: "component-variants",
    title: "Variantes de componentes",
    description: "Asigna grupos a variantes específicas de un componente.",
    icon: <AccountTreeOutlinedIcon sx={{ fontSize: 30 }} />,
    disabled: false,
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
          <Box sx={{ minWidth: 0 }}>
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
              flexShrink: 0,
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
        <Card
          sx={{
            width: "100%",
            borderRadius: 0,
            backgroundColor: "background.paper",
            boxShadow: "none",
          }}
        >
          <CardContent sx={{ p: { xs: 2, sm: 3 }, "&:last-child": { pb: { xs: 2, sm: 3 } } }}>
            <Box
              sx={{
                width: "100%",
                display: "grid",
                gridTemplateColumns: {
                  xs: "minmax(0, 1fr)",
                  sm: "repeat(2, minmax(0, 1fr))",
                },
                gap: 2,
                alignItems: "stretch",
              }}
            >
              {cards.map((item) => (
                <Card
                  key={item.key}
                  sx={{
                    width: "100%",
                    minWidth: 0,
                    height: "100%",
                    borderRadius: 1,
                    border: "1px solid",
                    borderColor: "divider",
                    boxShadow: "none",
                    backgroundColor: "background.paper",
                    display: "flex",
                  }}
                >
                  <CardContent
                    sx={{
                      width: "100%",
                      p: { xs: 2, sm: 2.5 },
                      display: "flex",
                      flexDirection: "column",
                      "&:last-child": {
                        pb: { xs: 2, sm: 2.5 },
                      },
                    }}
                  >
                    <Stack spacing={2} sx={{ width: "100%", height: "100%" }}>
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
                            sx={{ fontWeight: 800 }}
                          />
                        )}
                      </Stack>

                      <Box sx={{ minWidth: 0 }}>
                        <Typography
                          sx={{
                            fontSize: { xs: 17, sm: 18 },
                            fontWeight: 800,
                            color: "text.primary",
                            lineHeight: 1.3,
                            wordBreak: "break-word",
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
                            wordBreak: "break-word",
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
                            minHeight: 44,
                            fontWeight: 800,
                          }}
                        >
                          {item.disabled ? "Aún no disponible" : "Administrar"}
                        </Button>
                      </Box>
                    </Stack>
                  </CardContent>
                </Card>
              ))}
            </Box>
          </CardContent>
        </Card>
      </DialogContent>
    </Dialog>
  );
}