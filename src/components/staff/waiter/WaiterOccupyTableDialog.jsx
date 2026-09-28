import React, { useEffect, useMemo, useState } from "react";
import {
  Box,Button,Card,CardContent,Dialog,DialogContent,DialogTitle,IconButton,Stack,TextField,Typography,useMediaQuery,
} from "@mui/material";
import { useTheme } from "@mui/material/styles";

import CloseIcon from "@mui/icons-material/Close";
import SaveIcon from "@mui/icons-material/Save";

function toInt(value) {
  const n = Number(value);

  if (!Number.isFinite(n)) {
    return 0;
  }

  return Math.trunc(n);
}

function sanitizeIntegerInput(value) {
  return String(value || "").replace(/\D/g, "");
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

  const seats = useMemo(() => {
    return Number(table?.seats || 0);
  }, [table]);

  useEffect(() => {
    if (!open) {
      return;
    }

    setPartySize("");
    setAdultCount("");
    setChildCount("");
    setNotes("");
    setErrors({});
  }, [open, table]);

  const validate = () => {
    const nextErrors = {};

    /*
     * Total de personas sí es obligatorio.
     *
     * Adultos y niños pueden permanecer vacíos.
     * toInt("") los normaliza internamente a 0.
     */
    const party = toInt(partySize);
    const adults = toInt(adultCount);
    const children = toInt(childCount);

    if (partySize === "") {
      nextErrors.party_size ="El total de personas es obligatorio.";
    } else if (party < 1) {
      nextErrors.party_size = "Debe haber al menos una persona en la mesa.";
    }

    if (
      !nextErrors.party_size &&
      adults + children !== party
    ) {
      nextErrors.party_size = "La suma de adultos y niños debe coincidir con el total de personas.";
    }

    if (
      !nextErrors.party_size &&
      seats > 0 &&
      party > seats
    ) {
      nextErrors.party_size =`El total de personas no puede exceder la capacidad de la mesa (${seats}).`;
    }

    setErrors(nextErrors);

    return Object.keys(nextErrors).length === 0;
  };

  const handleConfirm = () => {
    if (!validate()) {
      return;
    }

    /*
     * Los campos Adultos y Niños pueden verse vacíos,
     * pero el backend siempre recibe un entero.
     */
    onConfirm?.({
      party_size: toInt(partySize),
      adult_count: toInt(adultCount),
      child_count: toInt(childCount),
      notes: notes?.trim() || null,
    });
  };

  if (!open) {
    return null;
  }

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
        <Card
          sx={{
            borderRadius: 0,
            backgroundColor: "background.paper",
          }}
        >
          <CardContent
            sx={{
              p: { xs: 2, sm: 3 },
              "&:last-child": {
                pb: { xs: 2, sm: 3 },
              },
            }}
          >
            <Stack spacing={2.5}>
            
              <Box
                sx={{
                  p: 1.5,
                  border: "1px solid",
                  borderColor: "divider",
                  borderRadius: 1,
                  bgcolor: "background.default",
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

                  <Typography
                    sx={{
                      fontSize: 13,
                      color: "text.secondary",
                    }}
                  >
                    Mesa:{" "}
                    <strong>
                      {table?.name || "—"}
                    </strong>
                  </Typography>

                  <Typography
                    sx={{
                      fontSize: 13,
                      color: "text.secondary",
                    }}
                  >
                    Capacidad:{" "}
                    <strong>
                      {seats || 0} asiento(s)
                    </strong>
                  </Typography>
                </Stack>
              </Box>

              <Stack spacing={2}>
                <FieldBlock
                  label="Total de personas *"
                  help={
                    errors.party_size ||
                    "Debe coincidir con la suma de adultos y niños."
                  }
                  error={!!errors.party_size}
                  input={
                    <TextField
                      fullWidth
                      type="text"
                      value={partySize}
                      onChange={(e) => {
                        setPartySize(
                          sanitizeIntegerInput(
                            e.target.value,
                          ),
                        );

                        if (errors.party_size) {
                          setErrors((previous) => ({
                            ...previous,
                            party_size: undefined,
                          }));
                        }
                      }}
                      placeholder="Ej. 4"
                      disabled={loading}
                      error={!!errors.party_size}
                      slotProps={{
                        htmlInput: {
                          inputMode: "numeric",
                          pattern: "[0-9]*",
                        },
                      }}
                    />
                  }
                />

                <Stack
                  direction={{ xs: "column", sm: "row" }}
                  spacing={2}
                >
                  <FieldBlock
                    label="Adultos"
                    help="Opcional. Si lo dejas vacío se registrará como 0."
                    input={
                      <TextField
                        fullWidth
                        type="text"
                        value={adultCount}
                        onChange={(e) => {
                          setAdultCount(
                            sanitizeIntegerInput(
                              e.target.value,
                            ),
                          );

                          if (errors.party_size) {
                            setErrors((previous) => ({
                              ...previous,
                              party_size: undefined,
                            }));
                          }
                        }}
                        placeholder="Ej. 2"
                        disabled={loading}
                        slotProps={{
                          htmlInput: {
                            inputMode: "numeric",
                            pattern: "[0-9]*",
                          },
                        }}
                      />
                    }
                  />

                  <FieldBlock
                    label="Niños"
                    help="Opcional. Si lo dejas vacío se registrará como 0."
                    input={
                      <TextField
                        fullWidth
                        type="text"
                        value={childCount}
                        onChange={(e) => {
                          setChildCount(
                            sanitizeIntegerInput(
                              e.target.value,
                            ),
                          );

                          if (errors.party_size) {
                            setErrors((previous) => ({
                              ...previous,
                              party_size: undefined,
                            }));
                          }
                        }}
                        placeholder="Ej. 0"
                        disabled={loading}
                        slotProps={{
                          htmlInput: {
                            inputMode: "numeric",
                            pattern: "[0-9]*",
                          },
                        }}
                      />
                    }
                  />
                </Stack>

                <FieldBlock
                  label="Notas"
                  help="Opcional. Puedes dejar un comentario breve si hace falta."
                  input={
                    <TextField
                      fullWidth
                      value={notes}
                      onChange={(e) =>
                        setNotes(e.target.value)
                      }
                      placeholder="Ej. Requieren silla para bebé"
                      disabled={loading}
                      slotProps={{
                        htmlInput: {
                          maxLength: 500,
                        },
                      }}
                    />
                  }
                />

              </Stack>

              <Stack
                direction={{
                  xs: "column-reverse",
                  sm: "row",
                }}
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
                    minWidth: {
                      xs: "100%",
                      sm: 150,
                    },
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
                    minWidth: {
                      xs: "100%",
                      sm: 190,
                    },
                    height: 44,
                    borderRadius: 2,
                    fontWeight: 800,
                  }}
                >
                  {loading
                    ? "Guardando…"
                    : "Confirmar ocupación"}
                </Button>
              </Stack>
            </Stack>
          </CardContent>
        </Card>
      </DialogContent>
    </Dialog>
  );
}

function FieldBlock({
  label,
  input,
  help,
  error = false,
}) {
  return (
    <Box
      sx={{
        flex: 1,
        width: "100%",
        minWidth: 0,
      }}
    >
      <Typography
        sx={{
          fontSize: 14,
          fontWeight: 800,
          color: "text.primary",
          mb: 1,
        }}
      >
        {label}
      </Typography>

      {input}

      {help ? (
        <Typography
          sx={{
            mt: 0.75,
            fontSize: 12,
            color: error
              ? "error.main"
              : "text.secondary",
            fontWeight: error
              ? 700
              : 400,
            lineHeight: 1.45,
          }}
        >
          {help}
        </Typography>
      ) : null}
    </Box>
  );
}