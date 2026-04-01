import React, { useEffect, useState } from "react";
import {
  Box,
  Button,
  Card,
  CardContent,
  Dialog,
  DialogContent,
  DialogTitle,
  IconButton,
  Stack,
  TextField,
  Typography,
  useMediaQuery,
} from "@mui/material";
import { useTheme } from "@mui/material/styles";
import CloseRoundedIcon from "@mui/icons-material/CloseRounded";
import SaveRoundedIcon from "@mui/icons-material/SaveRounded";
import PointOfSaleRoundedIcon from "@mui/icons-material/PointOfSaleRounded";

export default function OpenCashSessionModal({
  open,
  onClose,
  register,
  onConfirm,
  saving = false,
}) {
  const theme = useTheme();
  const fullScreen = useMediaQuery(theme.breakpoints.down("sm"));

  const [openingNotes, setOpeningNotes] = useState("");

  useEffect(() => {
    if (open) {
      setOpeningNotes("");
    }
  }, [open]);

  const handleConfirm = () => {
    onConfirm?.({
      cash_register_id: register?.id,
      opening_notes: openingNotes.trim() || null,
    });
  };

  if (!register) return null;

  return (
    <Dialog
      open={open}
      onClose={saving ? undefined : onClose}
      fullWidth
      maxWidth="sm"
      fullScreen={fullScreen}
      slotProps={{
        paper: {
          sx: {
            borderRadius: { xs: 0, sm: 1 },
            overflow: "hidden",
          },
        },
      }}
    >
      <DialogTitle
        sx={{
          bgcolor: "#111111",
          color: "#fff",
          px: { xs: 2, sm: 3 },
          py: 2,
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
                fontSize: { xs: 22, sm: 26 },
                fontWeight: 800,
                color: "#fff",
                lineHeight: 1.15,
              }}
            >
              Abrir caja
            </Typography>

            <Typography
              sx={{
                mt: 0.75,
                fontSize: 13,
                color: "rgba(255,255,255,0.82)",
              }}
            >
              Confirma la caja que vas a usar para iniciar tu operación.
            </Typography>
          </Box>

          <IconButton
            onClick={onClose}
            disabled={saving}
            sx={{
              color: "#fff",
              bgcolor: "rgba(255,255,255,0.08)",
              borderRadius: 1,
              "&:hover": {
                bgcolor: "rgba(255,255,255,0.16)",
              },
            }}
          >
            <CloseRoundedIcon />
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
            borderRadius: 0,
            boxShadow: "none",
          }}
        >
          <CardContent sx={{ p: { xs: 2, sm: 3 } }}>
            <Stack spacing={2.25}>
              <Box>
                <Typography
                  sx={{
                    fontSize: 18,
                    fontWeight: 800,
                    color: "text.primary",
                  }}
                >
                  {register?.name || "Caja"}
                </Typography>

                <Typography
                  sx={{
                    mt: 0.5,
                    fontSize: 14,
                    color: "text.secondary",
                  }}
                >
                  {register?.code || "Sin código"}
                </Typography>
              </Box>

              <Box
                sx={{
                  border: "1px solid",
                  borderColor: "divider",
                  borderRadius: 1,
                  backgroundColor: "#FCFCFC",
                  p: 1.5,
                }}
              >
                <Typography
                  sx={{
                    fontSize: 12,
                    fontWeight: 800,
                    color: "text.secondary",
                    textTransform: "uppercase",
                  }}
                >
                  Nota de apertura
                </Typography>

                <TextField
                  multiline
                  minRows={4}
                  maxRows={6}
                  placeholder="Opcional. Puedes escribir una nota breve sobre el inicio de caja."
                  value={openingNotes}
                  onChange={(e) => setOpeningNotes(e.target.value)}
                  sx={{ mt: 1.25 }}
                />
              </Box>

              <Stack
                direction={{ xs: "column-reverse", sm: "row" }}
                spacing={1.5}
                justifyContent="flex-end"
              >
                <Button
                  variant="outlined"
                  color="inherit"
                  onClick={onClose}
                  disabled={saving}
                  sx={{
                    minWidth: { xs: "100%", sm: 140 },
                    height: 44,
                    borderRadius: 2,
                  }}
                >
                  Cancelar
                </Button>

                <Button
                  variant="contained"
                  onClick={handleConfirm}
                  disabled={saving}
                  startIcon={saving ? <PointOfSaleRoundedIcon /> : <SaveRoundedIcon />}
                  sx={{
                    minWidth: { xs: "100%", sm: 180 },
                    height: 44,
                    borderRadius: 2,
                    fontWeight: 800,
                  }}
                >
                  {saving ? "Abriendo…" : "Confirmar apertura"}
                </Button>
              </Stack>
            </Stack>
          </CardContent>
        </Card>
      </DialogContent>
    </Dialog>
  );
}
