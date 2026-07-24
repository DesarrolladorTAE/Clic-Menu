import {
  Box, Button, Card, CardContent, Dialog, DialogContent, DialogTitle, IconButton, Stack, Typography, useMediaQuery,
} from "@mui/material";

import { useTheme } from "@mui/material/styles";

import CloseIcon from "@mui/icons-material/Close";
import SwapHorizOutlinedIcon from "@mui/icons-material/SwapHorizOutlined";
import StarOutlinedIcon from "@mui/icons-material/StarOutlined";

export default function MenuDefaultConfirmDialog({
  open,
  menu,
  channel,
  onClose,
  onConfirm,
}) {
  const theme = useTheme();

  const isMobile =
    useMediaQuery(
      theme.breakpoints.down(
        "sm"
      )
    );

  if (!open || !channel) {
    return null;
  }

  const channelName =
    channel
      ?.sales_channel
      ?.name ||
    "Canal de venta";

  const currentDefaultName =
    channel
      ?.default_menu
      ?.name ||
    "el menú predeterminado actual";

  return (
    <Dialog
      open={open}
      onClose={onClose}
      fullWidth
      maxWidth="sm"
      fullScreen={isMobile}
      slotProps={{
        paper: {
          sx: {
            borderRadius: {
              xs: 0,
              sm: 1,
            },
            overflow: "hidden",
            backgroundColor:
              "background.paper",
          },
        },
      }}
    >
      <DialogTitle
        sx={{
          px: {
            xs: 2,
            sm: 3,
          },
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
                fontSize: {
                  xs: 20,
                  sm: 24,
                },
                lineHeight: 1.2,
                color: "#fff",
              }}
            >
              Reemplazar menú predeterminado
            </Typography>

            <Typography
              sx={{
                mt: 0.5,
                fontSize: 13,
                color:
                  "rgba(255,255,255,0.82)",
              }}
            >
              Canal: {channelName}
            </Typography>
          </Box>

          <IconButton
            onClick={onClose}
            sx={{
              color: "#fff",
              bgcolor:
                "rgba(255,255,255,0.08)",
              "&:hover": {
                bgcolor:
                  "rgba(255,255,255,0.16)",
              },
            }}
          >
            <CloseIcon />
          </IconButton>
        </Stack>
      </DialogTitle>

      <DialogContent
        sx={{
          p: {
            xs: 2,
            sm: 3,
          },
          bgcolor:
            "background.default",
        }}
      >
        <Card
          sx={{
            borderRadius: 1,
            border: "1px solid",
            borderColor: "divider",
            boxShadow: "none",
          }}
        >
          <CardContent
            sx={{
              p: {
                xs: 2,
                sm: 3,
              },
            }}
          >
            <Stack spacing={2.5}>
              <Stack
                direction="row"
                spacing={1.5}
                alignItems="flex-start"
              >
                <Box
                  sx={{
                    width: 44,
                    height: 44,
                    borderRadius: 1,
                    display: "grid",
                    placeItems: "center",
                    bgcolor:
                      "rgba(255, 152, 0, 0.12)",
                    color: "primary.main",
                    flexShrink: 0,
                  }}
                >
                  <SwapHorizOutlinedIcon />
                </Box>

                <Box sx={{ minWidth: 0 }}>
                  <Typography
                    sx={{
                      fontSize: 18,
                      fontWeight: 800,
                      color: "text.primary",
                    }}
                  >
                    Este canal ya tiene un menú predeterminado
                  </Typography>

                  <Typography
                    sx={{
                      mt: 0.75,
                      fontSize: 14,
                      color: "text.secondary",
                      lineHeight: 1.6,
                    }}
                  >
                    Al guardar la configuración,{" "}
                    <Typography
                      component="span"
                      sx={{
                        fontSize: 14,
                        fontWeight: 800,
                        color: "text.primary",
                      }}
                    >
                      {currentDefaultName}
                    </Typography>{" "}
                    será reemplazado por{" "}
                    <Typography
                      component="span"
                      sx={{
                        fontSize: 14,
                        fontWeight: 800,
                        color: "primary.main",
                      }}
                    >
                      {menu?.name ||
                        "este menú"}
                    </Typography>
                    .
                  </Typography>
                </Box>
              </Stack>

              <Box
                sx={{
                  p: 1.5,
                  borderRadius: 1,
                  border: "1px solid",
                  borderColor: "divider",
                  bgcolor:
                    "background.default",
                }}
              >
                <Stack
                  direction="row"
                  spacing={1}
                  alignItems="center"
                >
                  <StarOutlinedIcon
                    sx={{
                      color: "primary.main",
                    }}
                  />

                  <Typography
                    sx={{
                      fontSize: 13,
                      color: "text.primary",
                      lineHeight: 1.5,
                    }}
                  >
                    Solo puede existir un menú predeterminado por canal.
                  </Typography>
                </Stack>
              </Box>

              <Stack
                direction={{
                  xs: "column-reverse",
                  sm: "row",
                }}
                justifyContent="flex-end"
                spacing={1.5}
              >
                <Button
                  type="button"
                  variant="outlined"
                  onClick={onClose}
                  sx={{
                    minWidth: {
                      xs: "100%",
                      sm: 150,
                    },
                    height: 44,
                  }}
                >
                  Cancelar
                </Button>

                <Button
                  type="button"
                  variant="contained"
                  startIcon={
                    <SwapHorizOutlinedIcon />
                  }
                  onClick={onConfirm}
                  sx={{
                    minWidth: {
                      xs: "100%",
                      sm: 190,
                    },
                    height: 44,
                    fontWeight: 800,
                  }}
                >
                  Confirmar reemplazo
                </Button>
              </Stack>
            </Stack>
          </CardContent>
        </Card>
      </DialogContent>
    </Dialog>
  );
}