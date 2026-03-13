import { useEffect, useMemo, useRef, useState } from "react";

import {
  Alert,
  Box,
  Button,
  Card,
  CardContent,
  Chip,
  Dialog,
  DialogContent,
  DialogTitle,
  FormControlLabel,
  IconButton,
  Paper,
  Stack,
  Step,
  StepLabel,
  Stepper,
  Switch,
  Typography,
  useMediaQuery,
} from "@mui/material";

import { useTheme } from "@mui/material/styles";

import CloseIcon from "@mui/icons-material/Close";
import ArrowBackIcon from "@mui/icons-material/ArrowBack";
import ArrowForwardIcon from "@mui/icons-material/ArrowForward";
import SaveIcon from "@mui/icons-material/Save";
import BuildCircleOutlinedIcon from "@mui/icons-material/BuildCircleOutlined";
import CategoryOutlinedIcon from "@mui/icons-material/CategoryOutlined";
import PlaylistAddCheckCircleOutlinedIcon from "@mui/icons-material/PlaylistAddCheckCircleOutlined";
import WarningAmberRoundedIcon from "@mui/icons-material/WarningAmberRounded";

import { getVariantAttributes } from "../../services/products/variants/variantAttributes.service";
import { getVariantAttributeValues } from "../../services/products/variants/variantAttributeValues.service";
import { repairProductVariant } from "../../services/products/variants/productVariants.service";

import PageContainer from "../common/PageContainer";
import AppAlert from "../common/AppAlert";

function normalizeErr(e) {
  return (
    e?.response?.data?.message ||
    (e?.response?.data?.errors
      ? Object.values(e.response.data.errors).flat().join("\n")
      : "") ||
    "Ocurrió un error"
  );
}

function extractSelectionsFromRow(row) {
  const selections = [];
  for (const a of row?.attributes || []) {
    const aid = Number(a.attribute_id);
    const firstVal = a?.values?.[0];
    const vid = Number(firstVal?.value_id);
    if (aid > 0 && vid > 0) {
      selections.push({ attribute_id: aid, value_id: vid });
    }
  }
  return selections;
}

const VISIBLE_SCROLL_HEIGHT = 320;

export default function RepairVariantModal({
  open,
  onClose,
  restaurantId,
  productId,
  variantRow,
  onRepaired,
}) {
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down("sm"));

  const variant = variantRow?.variant;

  const [step, setStep] = useState(1);
  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);
  const [err, setErr] = useState("");

  const [attributes, setAttributes] = useState([]);
  const [selectedAttributeIds, setSelectedAttributeIds] = useState([]);
  const [valuesByAttribute, setValuesByAttribute] = useState({});
  const [selectedValueId, setSelectedValueId] = useState({});
  const [activateAfter, setActivateAfter] = useState(true);

  const [alertState, setAlertState] = useState({
    open: false,
    severity: "success",
    title: "",
    message: "",
  });

  const reqRef = useRef(0);

  const steps = ["Elegir atributos", "Elegir valores"];

  const showAlert = ({
    severity = "success",
    title = "",
    message = "",
  }) => {
    setAlertState({
      open: true,
      severity,
      title,
      message,
    });
  };

  const closeAlert = (_, reason) => {
    if (reason === "clickaway") return;
    setAlertState((prev) => ({ ...prev, open: false }));
  };

  useEffect(() => {
    if (!err) return;

    const timer = setTimeout(() => {
      setErr("");
    }, 5000);

    return () => clearTimeout(timer);
  }, [err]);

  useEffect(() => {
    if (!open) return;

    setErr("");
    setStep(1);
    setValuesByAttribute({});
    setActivateAfter(true);

    const initial = extractSelectionsFromRow(variantRow);
    const attrIds = initial.map((x) => Number(x.attribute_id));

    setSelectedAttributeIds(attrIds);

    const initialMap = {};
    initial.forEach((x) => {
      initialMap[Number(x.attribute_id)] = Number(x.value_id);
    });
    setSelectedValueId(initialMap);
  }, [open, variantRow]);

  useEffect(() => {
    if (!open) return;

    const myReq = ++reqRef.current;
    setLoading(true);
    setErr("");

    (async () => {
      try {
        const res = await getVariantAttributes(restaurantId, {
          only_active: true,
        });

        if (myReq !== reqRef.current) return;
        setAttributes(Array.isArray(res?.data) ? res.data : []);
      } catch (e) {
        if (myReq !== reqRef.current) return;
        setErr(normalizeErr(e));
      } finally {
        if (myReq !== reqRef.current) return;
        setLoading(false);
      }
    })();
  }, [open, restaurantId]);

  useEffect(() => {
    if (!open) return;
    if (!selectedAttributeIds.length) {
      setValuesByAttribute({});
      return;
    }

    const myReq = ++reqRef.current;
    setLoading(true);
    setErr("");

    (async () => {
      try {
        const ids = selectedAttributeIds.map(Number);

        const responses = await Promise.all(
          ids.map((aid) =>
            getVariantAttributeValues(restaurantId, aid, {
              only_active: true,
            })
          )
        );

        if (myReq !== reqRef.current) return;

        const map = {};
        responses.forEach((r) => {
          const attribute = r?.attribute;
          const data = Array.isArray(r?.data) ? r.data : [];
          const aid = Number(attribute?.id);

          map[aid] = {
            attribute,
            data,
          };
        });

        setValuesByAttribute(map);

        setSelectedValueId((prev) => {
          const next = { ...prev };

          for (const aid of ids) {
            const values = map[aid]?.data || [];
            const currentValueStillExists = values.some(
              (v) => Number(v.id) === Number(next[aid])
            );

            if (!currentValueStillExists) {
              const first = values[0];
              if (first?.id) {
                next[aid] = Number(first.id);
              } else {
                delete next[aid];
              }
            }
          }

          return next;
        });
      } catch (e) {
        if (myReq !== reqRef.current) return;
        setErr(normalizeErr(e));
      } finally {
        if (myReq !== reqRef.current) return;
        setLoading(false);
      }
    })();
  }, [open, restaurantId, selectedAttributeIds]);

  const selectedAttributes = useMemo(() => {
    const ids = new Set(selectedAttributeIds.map(Number));
    return attributes.filter((a) => ids.has(Number(a.id)));
  }, [attributes, selectedAttributeIds]);

  const selectionsPayload = useMemo(() => {
    const out = [];

    for (const aid of selectedAttributeIds.map(Number)) {
      const vid = Number(selectedValueId[aid] || 0);
      if (aid > 0 && vid > 0) {
        out.push({
          attribute_id: aid,
          value_id: vid,
        });
      }
    }

    return out;
  }, [selectedAttributeIds, selectedValueId]);

  const canContinueStep1 = selectedAttributeIds.length > 0;

  const canSave = useMemo(() => {
    if (!variant?.id) return false;
    if (!selectedAttributeIds.length) return false;

    for (const aid of selectedAttributeIds.map(Number)) {
      if (!selectedValueId[aid]) return false;
    }

    return true;
  }, [variant?.id, selectedAttributeIds, selectedValueId]);

  const toggleAttr = (id) => {
    const n = Number(id);
    setErr("");

    setSelectedAttributeIds((prev) => {
      const s = new Set(prev.map(Number));
      if (s.has(n)) s.delete(n);
      else s.add(n);
      return Array.from(s);
    });

    setSelectedValueId((prev) => {
      const next = { ...prev };
      delete next[n];
      return next;
    });
  };

  const changeValue = (attributeId, valueId) => {
    const aid = Number(attributeId);
    const vid = Number(valueId);
    setErr("");
    setSelectedValueId((prev) => ({
      ...prev,
      [aid]: vid,
    }));
  };

  const goNext = () => {
    if (!canContinueStep1) {
      setErr("Selecciona al menos un atributo para continuar.");
      return;
    }
    setErr("");
    setStep(2);
  };

  const goBack = () => {
    setErr("");
    setStep(1);
  };

  const doSave = async () => {
    if (!canSave) {
      setErr("Selecciona al menos un atributo con su valor correspondiente.");
      return;
    }

    setSaving(true);
    setErr("");

    try {
      const payload = {
        selections: selectionsPayload,
        activate: !!activateAfter,
      };

      const res = await repairProductVariant(
        restaurantId,
        productId,
        variant.id,
        payload
      );

      showAlert({
        severity: "success",
        title: "Variante corregida",
        message: activateAfter
          ? "La variante se corrigió y quedó activa."
          : "La variante se corrigió correctamente.",
      });

      await onRepaired?.(res);
      onClose?.();
    } catch (e) {
      setErr(normalizeErr(e));
    } finally {
      setSaving(false);
    }
  };

  if (!open) return null;

  return (
    <>
      <Dialog
        open={open}
        onClose={saving ? undefined : onClose}
        fullWidth
        maxWidth="lg"
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
                Reparar variante
              </Typography>

              <Typography
                sx={{
                  mt: 0.5,
                  fontSize: 13,
                  color: "rgba(255,255,255,0.82)",
                }}
              >
                Corrige la combinación de atributos y valores de la variante seleccionada.
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
              <CloseIcon />
            </IconButton>
          </Stack>
        </DialogTitle>

        <DialogContent
          sx={{
            p: 0,
            bgcolor: "background.default",
          }}
        >
          <PageContainer
            maxWidth={1100}
            sx={{
              py: { xs: 2, sm: 3 },
              px: { xs: 2, sm: 3 },
            }}
            innerSx={{
              width: "100%",
            }}
          >
            <Stack spacing={2.5}>
              {variant?.is_invalid ? (
                <Alert
                  severity="warning"
                  sx={{
                    borderRadius: 1,
                    alignItems: "flex-start",
                  }}
                >
                  <Box>
                    <Typography sx={{ fontWeight: 800, mb: 0.5 }}>
                      Motivo de invalidez
                    </Typography>
                    <Typography variant="body2">
                      {variant?.invalid_reason ||
                        "La variante quedó inválida. Corrígela o elimínala."}
                    </Typography>
                  </Box>
                </Alert>
              ) : null}

              {err ? (
                <Alert
                  severity="error"
                  sx={{
                    borderRadius: 1,
                    alignItems: "flex-start",
                    whiteSpace: "pre-line",
                  }}
                >
                  <Box>
                    <Typography sx={{ fontWeight: 800, mb: 0.5 }}>
                      No se pudo completar la acción
                    </Typography>
                    <Typography variant="body2">{err}</Typography>
                  </Box>
                </Alert>
              ) : null}

              <Card sx={{ borderRadius: 0 }}>
                <CardContent sx={{ p: { xs: 2, sm: 2.5 } }}>
                  <Stepper
                    activeStep={step - 1}
                    alternativeLabel={!isMobile}
                    orientation={isMobile ? "vertical" : "horizontal"}
                  >
                    {steps.map((label) => (
                      <Step key={label}>
                        <StepLabel>{label}</StepLabel>
                      </Step>
                    ))}
                  </Stepper>
                </CardContent>
              </Card>

              <Card
                sx={{
                  borderRadius: 0,
                  backgroundColor: "background.paper",
                }}
              >
                <CardContent sx={{ p: { xs: 2, sm: 3 } }}>
                  <Stack spacing={2.5}>
                    <Stack
                      direction={{ xs: "column", sm: "row" }}
                      justifyContent="space-between"
                      alignItems={{ xs: "flex-start", sm: "center" }}
                      spacing={1}
                    >
                      <Box>
                        <Typography
                          sx={{
                            fontWeight: 800,
                            fontSize: { xs: 18, sm: 20 },
                            color: "text.primary",
                          }}
                        >
                          {step === 1
                            ? "Paso 1. Elegir atributos"
                            : "Paso 2. Elegir valores"}
                        </Typography>

                        <Typography
                          sx={{
                            mt: 0.75,
                            fontSize: 13,
                            color: "text.secondary",
                            lineHeight: 1.5,
                          }}
                        >
                          {step === 1
                            ? "Selecciona los atributos que deben formar parte de la variante corregida."
                            : "Selecciona un valor por cada atributo elegido."}
                        </Typography>
                      </Box>

                      {variant?.name ? (
                        <Chip
                          icon={<BuildCircleOutlinedIcon />}
                          label={variant.name}
                          sx={{ fontWeight: 800 }}
                        />
                      ) : null}
                    </Stack>

                    {loading ? (
                      <Paper
                        sx={{
                          p: 4,
                          borderRadius: 0,
                          border: "1px solid",
                          borderColor: "divider",
                          boxShadow: "none",
                          textAlign: "center",
                        }}
                      >
                        <Typography sx={{ fontSize: 14, color: "text.secondary" }}>
                          Cargando información…
                        </Typography>
                      </Paper>
                    ) : step === 1 ? (
                      attributes.length === 0 ? (
                        <Paper
                          sx={{
                            p: 4,
                            borderRadius: 0,
                            border: "1px solid",
                            borderColor: "divider",
                            boxShadow: "none",
                            textAlign: "center",
                          }}
                        >
                          <CategoryOutlinedIcon
                            sx={{
                              fontSize: 34,
                              color: "text.secondary",
                            }}
                          />

                          <Typography
                            sx={{
                              mt: 1,
                              fontSize: 18,
                              fontWeight: 800,
                              color: "text.primary",
                            }}
                          >
                            No hay atributos activos
                          </Typography>

                          <Typography
                            sx={{
                              mt: 0.75,
                              fontSize: 14,
                              color: "text.secondary",
                            }}
                          >
                            No se encontraron atributos activos para reparar esta variante.
                          </Typography>
                        </Paper>
                      ) : (
                        <Paper
                          sx={{
                            p: 0,
                            overflow: "hidden",
                            borderRadius: 0,
                            backgroundColor: "background.paper",
                            border: "1px solid",
                            borderColor: "divider",
                          }}
                        >
                          <Box
                            sx={{
                              px: 2,
                              py: 1.5,
                              borderBottom: "1px solid",
                              borderColor: "divider",
                              backgroundColor: "#fff",
                            }}
                          >
                            <Typography
                              sx={{
                                fontSize: 14,
                                fontWeight: 800,
                                color: "text.secondary",
                              }}
                            >
                              Atributos disponibles
                            </Typography>
                          </Box>

                          <Box
                            sx={{
                              maxHeight: VISIBLE_SCROLL_HEIGHT,
                              overflowY: "auto",
                              p: 2,
                              display: "grid",
                              gap: 1.25,
                            }}
                          >
                            {attributes.map((a) => {
                              const checked = selectedAttributeIds
                                .map(Number)
                                .includes(Number(a.id));

                              return (
                                <Card
                                  key={a.id}
                                  sx={{
                                    borderRadius: 1,
                                    border: "1px solid",
                                    borderColor: checked
                                      ? "primary.main"
                                      : "divider",
                                    boxShadow: "none",
                                    backgroundColor: checked
                                      ? "#FFF8EE"
                                      : "#fff",
                                  }}
                                >
                                  <Box sx={{ px: 1.5, py: 1.25 }}>
                                    <FormControlLabel
                                      sx={{
                                        m: 0,
                                        width: "100%",
                                        alignItems: "center",
                                        "& .MuiFormControlLabel-label": {
                                          width: "100%",
                                        },
                                      }}
                                      control={
                                        <Switch
                                          checked={checked}
                                          onChange={() => toggleAttr(a.id)}
                                          color="primary"
                                        />
                                      }
                                      label={
                                        <Stack
                                          direction="row"
                                          justifyContent="space-between"
                                          alignItems="center"
                                          spacing={1}
                                          sx={{ width: "100%" }}
                                        >
                                          <Typography
                                            sx={{
                                              fontSize: 14,
                                              fontWeight: 800,
                                              color: "text.primary",
                                              wordBreak: "break-word",
                                            }}
                                          >
                                            {a.name}
                                          </Typography>

                                          <Chip
                                            size="small"
                                            label={a.status}
                                            sx={{ fontWeight: 800 }}
                                          />
                                        </Stack>
                                      }
                                    />
                                  </Box>
                                </Card>
                              );
                            })}
                          </Box>
                        </Paper>
                      )
                    ) : selectedAttributes.length === 0 ? (
                      <Alert
                        severity="warning"
                        sx={{
                          borderRadius: 1,
                          alignItems: "flex-start",
                        }}
                      >
                        <Typography variant="body2">
                          No hay atributos seleccionados. Regresa al paso anterior.
                        </Typography>
                      </Alert>
                    ) : (
                      <Stack spacing={2}>
                        {selectedAttributes.map((a) => {
                          const aid = Number(a.id);
                          const pack = valuesByAttribute[aid];
                          const values = pack?.data || [];
                          const current = Number(selectedValueId[aid] || 0);

                          return (
                            <Card
                              key={aid}
                              sx={{
                                borderRadius: 0,
                                boxShadow: "none",
                                border: "1px solid",
                                borderColor: "divider",
                                backgroundColor: "#fff",
                              }}
                            >
                              <CardContent sx={{ p: { xs: 2, sm: 2.5 } }}>
                                <Stack spacing={1.5}>
                                  <Stack
                                    direction={{ xs: "column", sm: "row" }}
                                    justifyContent="space-between"
                                    alignItems={{ xs: "flex-start", sm: "center" }}
                                    spacing={1}
                                  >
                                    <Box>
                                      <Typography
                                        sx={{
                                          fontSize: 16,
                                          fontWeight: 800,
                                          color: "text.primary",
                                        }}
                                      >
                                        {a.name}
                                      </Typography>

                                      <Typography
                                        sx={{
                                          mt: 0.5,
                                          fontSize: 12,
                                          color: "text.secondary",
                                        }}
                                      >
                                        Elige un solo valor para este atributo.
                                      </Typography>
                                    </Box>

                                    <Chip
                                      size="small"
                                      color={current ? "success" : "default"}
                                      label={current ? "Valor elegido" : "Sin elegir"}
                                      sx={{ fontWeight: 800 }}
                                    />
                                  </Stack>

                                  {values.length === 0 ? (
                                    <Alert
                                      severity="warning"
                                      sx={{
                                        borderRadius: 1,
                                        alignItems: "flex-start",
                                      }}
                                    >
                                      <Typography variant="body2">
                                        Este atributo no tiene valores activos.
                                      </Typography>
                                    </Alert>
                                  ) : (
                                    <Box
                                      sx={{
                                        maxHeight: VISIBLE_SCROLL_HEIGHT,
                                        overflowY: "auto",
                                        pr: 0.5,
                                        display: "grid",
                                        gridTemplateColumns: {
                                          xs: "1fr",
                                          sm: "repeat(2, minmax(0, 1fr))",
                                        },
                                        gap: 1.25,
                                      }}
                                    >
                                      {values.map((v) => {
                                        const selected = Number(v.id) === current;

                                        return (
                                          <Card
                                            key={v.id}
                                            sx={{
                                              borderRadius: 1,
                                              border: "1px solid",
                                              borderColor: selected
                                                ? "primary.main"
                                                : "divider",
                                              boxShadow: "none",
                                              backgroundColor: selected
                                                ? "#FFF8EE"
                                                : "#fff",
                                              cursor: "pointer",
                                            }}
                                            onClick={() => changeValue(aid, v.id)}
                                          >
                                            <Box sx={{ px: 1.5, py: 1.25 }}>
                                              <Stack
                                                direction="row"
                                                justifyContent="space-between"
                                                alignItems="center"
                                                spacing={1}
                                              >
                                                <Typography
                                                  sx={{
                                                    fontSize: 14,
                                                    fontWeight: 800,
                                                    color: "text.primary",
                                                    wordBreak: "break-word",
                                                  }}
                                                >
                                                  {v.value}
                                                </Typography>

                                                {selected ? (
                                                  <Chip
                                                    size="small"
                                                    color="success"
                                                    label="Seleccionado"
                                                    sx={{ fontWeight: 800 }}
                                                  />
                                                ) : null}
                                              </Stack>
                                            </Box>
                                          </Card>
                                        );
                                      })}
                                    </Box>
                                  )}
                                </Stack>
                              </CardContent>
                            </Card>
                          );
                        })}

                        <Paper
                          sx={{
                            p: { xs: 2, sm: 2.5 },
                            borderRadius: 0,
                            backgroundColor: "background.paper",
                            border: "1px solid",
                            borderColor: "divider",
                            boxShadow: "none",
                          }}
                        >
                          <Stack spacing={1}>
                            <Typography
                              sx={{
                                fontSize: 16,
                                fontWeight: 800,
                                color: "text.primary",
                              }}
                            >
                              Estado al finalizar
                            </Typography>

                            <Typography
                              sx={{
                                fontSize: 13,
                                color: "text.secondary",
                                lineHeight: 1.5,
                              }}
                            >
                              Decide si la variante debe quedar activa inmediatamente después de corregirse.
                            </Typography>

                            <FormControlLabel
                              sx={{ m: 0 }}
                              control={
                                <Switch
                                  checked={activateAfter}
                                  onChange={(e) => setActivateAfter(e.target.checked)}
                                  color="primary"
                                />
                              }
                              label={
                                <Typography sx={switchLabelSx}>
                                  {activateAfter
                                    ? "Activar variante"
                                    : "Dejar variante inactiva"}
                                </Typography>
                              }
                            />
                          </Stack>
                        </Paper>
                      </Stack>
                    )}

                    <Stack
                      direction={{ xs: "column-reverse", sm: "row" }}
                      justifyContent="space-between"
                      spacing={1.5}
                      pt={1}
                    >
                      <Box>
                        {step === 1 ? (
                          <Button
                            type="button"
                            onClick={onClose}
                            variant="outlined"
                            disabled={saving}
                            sx={{
                              minWidth: { xs: "100%", sm: 150 },
                              height: 44,
                              borderRadius: 2,
                            }}
                          >
                            Cancelar
                          </Button>
                        ) : (
                          <Button
                            type="button"
                            onClick={goBack}
                            variant="outlined"
                            startIcon={<ArrowBackIcon />}
                            disabled={saving}
                            sx={{
                              minWidth: { xs: "100%", sm: 150 },
                              height: 44,
                              borderRadius: 2,
                            }}
                          >
                            Atrás
                          </Button>
                        )}
                      </Box>

                      <Box>
                        {step === 1 ? (
                          <Button
                            type="button"
                            onClick={goNext}
                            variant="contained"
                            endIcon={<ArrowForwardIcon />}
                            disabled={!canContinueStep1 || saving || loading}
                            sx={{
                              minWidth: { xs: "100%", sm: 180 },
                              height: 44,
                              borderRadius: 2,
                              fontWeight: 800,
                            }}
                          >
                            Siguiente
                          </Button>
                        ) : (
                          <Button
                            type="button"
                            onClick={doSave}
                            variant="contained"
                            startIcon={<SaveIcon />}
                            disabled={!canSave || saving}
                            sx={{
                              minWidth: { xs: "100%", sm: 210 },
                              height: 44,
                              borderRadius: 2,
                              fontWeight: 800,
                            }}
                          >
                            {saving ? "Guardando…" : "Guardar corrección"}
                          </Button>
                        )}
                      </Box>
                    </Stack>
                  </Stack>
                </CardContent>
              </Card>

              <Typography
                sx={{
                  fontSize: 12,
                  color: "text.secondary",
                  lineHeight: 1.5,
                }}
              >
                Tip: corrige solo lo necesario. Si cambias demasiadas cosas, básicamente
                ya no reparaste una variante, la reencarnaste.
              </Typography>
            </Stack>
          </PageContainer>
        </DialogContent>
      </Dialog>

      <AppAlert
        open={alertState.open}
        onClose={closeAlert}
        severity={alertState.severity}
        title={alertState.title}
        message={alertState.message}
        autoHideDuration={4000}
      />
    </>
  );
}

const switchLabelSx = {
  fontSize: 14,
  fontWeight: 700,
  color: "text.primary",
};