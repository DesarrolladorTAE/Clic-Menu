import React, { useEffect, useMemo, useState } from "react";
import {
  Box,
  Button,
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
import CloseIcon from "@mui/icons-material/Close";
import SaveIcon from "@mui/icons-material/Save";

function toInt(value) {
  const n = Number(value);
  if (!Number.isFinite(n)) return 0;
  return Math.trunc(n);
}

export default function WaiterOccupyTableDialog({
  open,
  table = null,
  loading = false,
  onClose,
  onConfirm,
}) {
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down("sm"));

  const [partySize, setPartySize] = useState("");
  const [adultCount, setAdultCount] = useState("");
  const [childCount, setChildCount] = useState("");
  const [notes, setNotes] = useState("");
  const [errors, setErrors] = useState({});

  const seats = useMemo(() => Number(table?.seats || 0), [table]);

  useEffect(() => {
    if (!open) return;

    setPartySize("");
    setAdultCount("");
    setChildCount("");
    setNotes("");
    setErrors({});
  }, [open, table]);

  const validate = () => {
    const nextErrors = {};

    const party = toInt(partySize);
    const adults = toInt(adultCount);
    const children = toInt(childCount);

    if (!partySize && partySize !== 0) {
      nextErrors.party_size = "El total de personas es obligatorio.";
    } else if (party < 1) {
      nextErrors.party_size = "Debe haber al menos una persona en la mesa.";
    }

    if (adultCount === "") {
      nextErrors.adult_count = "El número de adultos es obligatorio.";
    } else if (adults < 0) {
      nextErrors.adult_count = "El número de adultos no puede ser menor a 0.";
    }

    if (childCount === "") {
      nextErrors.child_count = "El número de niños es obligatorio.";
    } else if (children < 0) {
      nextErrors.child_count = "El número de niños no puede ser menor a 0.";
    }

    if (
      !nextErrors.party_size &&
      !nextErrors.adult_count &&
      !nextErrors.child_count
    ) {
      if (adults + children !== party) {
        nextErrors.party_size =
          "La suma de adultos y niños debe coincidir con el total de personas.";
      }

      if (seats > 0 && party > seats) {
        nextErrors.party_size = `El total de personas no puede exceder la capacidad de la mesa (${seats}).`;
      }
    }

    setErrors(nextErrors);
    return Object.keys(nextErrors).length === 0;
  };

  const handleConfirm = () => {
    if (!validate()) return;

    onConfirm?.({
      party_size: toInt(partySize),
      adult_count: toInt(adultCount),
      child_count: toInt(childCount),
      notes: notes?.trim() || null,
    });
  };

  return (
    <Dialog
      open={open}
      onClose={loading ? undefined : onClose}
      fullWidth
      maxWidth="sm"
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
              Ocupar mesa
            </Typography>

            <Typography
              sx={{
                mt: 0.5,
                fontSize: 13,
                color: "rgba(255,255,255,0.82)",
              }}
            >
              {table?.name
                ? `Captura cuántas personas ocuparán la mesa ${table.name}.`
                : "Captura los datos de ocupación de la mesa."}
            </Typography>
          </Box>

          <IconButton
            onClick={onClose}
            disabled={loading}
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
        <Stack spacing={2.25}>
          <Box
            sx={{
              p: 1.75,
              borderRadius: 1,
              border: "1px solid",
              borderColor: "divider",
              backgroundColor: "background.paper",
            }}
          >
            <Stack spacing={0.75}>
              <Typography
                sx={{
                  fontSize: 14,
                  fontWeight: 800,
                  color: "text.primary",
                }}
              >
                Resumen de la mesa
              </Typography>

              <Typography sx={{ fontSize: 13, color: "text.secondary" }}>
                Mesa: <strong>{table?.name || "—"}</strong>
              </Typography>

              <Typography sx={{ fontSize: 13, color: "text.secondary" }}>
                Capacidad: <strong>{seats || 0}</strong> asiento(s)
              </Typography>
            </Stack>
          </Box>

          <Stack direction={{ xs: "column", sm: "row" }} spacing={2}>
            <TextField
              label="Total personas"
              type="number"
              fullWidth
              value={partySize}
              onChange={(e) => setPartySize(e.target.value)}
              error={!!errors.party_size}
              helperText={errors.party_size || "Debe coincidir con adultos + niños."}
              inputProps={{ min: 1, step: 1 }}
            />

            <TextField
              label="Adultos"
              type="number"
              fullWidth
              value={adultCount}
              onChange={(e) => setAdultCount(e.target.value)}
              error={!!errors.adult_count}
              helperText={errors.adult_count || "Usa 0 si no hay adultos."}
              inputProps={{ min: 0, step: 1 }}
            />
          </Stack>

          <Stack direction={{ xs: "column", sm: "row" }} spacing={2}>
            <TextField
              label="Niños"
              type="number"
              fullWidth
              value={childCount}
              onChange={(e) => setChildCount(e.target.value)}
              error={!!errors.child_count}
              helperText={errors.child_count || "Usa 0 si no hay niños."}
              inputProps={{ min: 0, step: 1 }}
            />

            <TextField
              label="Notas (opcional)"
              fullWidth
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              helperText="Puedes dejar un comentario breve si hace falta."
              inputProps={{ maxLength: 500 }}
            />
          </Stack>

          <Box
            sx={{
              px: 1.5,
              py: 1.25,
              borderRadius: 1,
              border: "1px solid",
              borderColor: "divider",
              backgroundColor: "background.paper",
            }}
          >
            <Typography
              sx={{
                fontSize: 12.5,
                color: "text.secondary",
                lineHeight: 1.5,
              }}
            >
              <strong>Nota:</strong> Si no hay adultos o niños, ingresa 0. No dejes campos vacíos.
            </Typography>
          </Box>

          <Stack
            direction={{ xs: "column-reverse", sm: "row" }}
            justifyContent="flex-end"
            spacing={1.5}
            pt={1}
          >
            <Button
              type="button"
              onClick={onClose}
              disabled={loading}
              variant="outlined"
              sx={{
                minWidth: { xs: "100%", sm: 150 },
                height: 44,
                borderRadius: 2,
              }}
            >
              Cancelar
            </Button>

            <Button
              type="button"
              onClick={handleConfirm}
              disabled={loading}
              variant="contained"
              startIcon={<SaveIcon />}
              sx={{
                minWidth: { xs: "100%", sm: 190 },
                height: 44,
                borderRadius: 2,
                fontWeight: 800,
              }}
            >
              {loading ? "Guardando…" : "Confirmar ocupación"}
            </Button>
          </Stack>
        </Stack>
      </DialogContent>
    </Dialog>
  );
}