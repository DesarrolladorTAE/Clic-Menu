import { useEffect, useMemo, useRef, useState } from "react";

import {
  Alert, Box, Button, Card, CardContent, Checkbox, Chip, Dialog, DialogContent, DialogTitle, FormControlLabel,
  IconButton, Stack, Step, StepLabel, Stepper, Typography, useMediaQuery,
} from "@mui/material";

import { useTheme } from "@mui/material/styles";

import CloseIcon from "@mui/icons-material/Close";
import ArrowBackIcon from "@mui/icons-material/ArrowBack";
import ArrowForwardIcon from "@mui/icons-material/ArrowForward";
import AutoAwesomeIcon from "@mui/icons-material/AutoAwesome";
import TuneIcon from "@mui/icons-material/Tune";
import CategoryOutlinedIcon from "@mui/icons-material/CategoryOutlined";
import CheckCircleOutlineIcon from "@mui/icons-material/CheckCircleOutline";
import PlaylistAddCheckCircleOutlinedIcon from "@mui/icons-material/PlaylistAddCheckCircleOutlined";
import RestartAltIcon from "@mui/icons-material/RestartAlt";
import InfoOutlinedIcon from "@mui/icons-material/InfoOutlined";

import { getVariantAttributes } from "../../services/products/variants/variantAttributes.service";
import { getVariantAttributeValues } from "../../services/products/variants/variantAttributeValues.service";
import { generateProductVariants } from "../../services/products/variants/productVariantGenerator.service";

import VariantAttributesAdminModal from "./VariantAttributesAdminModal";

function normalizeErr(e) {
  return (
    e?.response?.data?.message ||
    (e?.response?.data?.errors
      ? Object.values(e.response.data.errors).flat().join("\n")
      : "") ||
    "Ocurrió un error"
  );
}

function buildSelections(selectedAttributeIds, selectedValueIds) {
  return selectedAttributeIds
    .map((aid) => ({
      attribute_id: Number(aid),
      value_ids: (selectedValueIds[Number(aid)] || []).map(Number),
    }))
    .filter((x) => x.attribute_id > 0 && x.value_ids.length > 0);
}

function cartesianPreview(
  attributesInOrder,
  valuesByAttribute,
  selectedValueIds,
  maxPreview = 20
) {
  let combos = [[]];

  for (const attr of attributesInOrder) {
    const aid = Number(attr.id);
    const pack = valuesByAttribute[aid];
    const selected = new Set((selectedValueIds[aid] || []).map(Number));
    const values = (pack?.data || []).filter((v) => selected.has(Number(v.id)));

    const newCombos = [];
    for (const base of combos) {
      for (const v of values) {
        newCombos.push([
          ...base,
          {
            attribute_id: aid,
            attribute_name: attr.name,
            value_id: Number(v.id),
            value_name: v.value,
          },
        ]);
        if (newCombos.length >= maxPreview) break;
      }
      if (newCombos.length >= maxPreview) break;
    }

    combos = newCombos;
    if (combos.length >= maxPreview) break;
  }

  return combos;
}

function getCreatedCount(res) {
  const raw =
    res?.data?.created_count ??
    res?.created_count ??
    0;

  const n = Number(raw);
  return Number.isFinite(n) ? n : 0;
}


export default function VariantWizardModal({
  open,
  onClose,
  restaurantId,
  productId,
  productName,
  disabledByPrecondition = false,
  onGenerated,
}) {
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down("sm"));

  const [step, setStep] = useState(1); // 1, 2, 3
  const [loading, setLoading] = useState(false);
  const [err, setErr] = useState("");

  const [attributes, setAttributes] = useState([]);
  const [selectedAttributeIds, setSelectedAttributeIds] = useState([]);

  const [valuesByAttribute, setValuesByAttribute] = useState({});
  const [selectedValueIds, setSelectedValueIds] = useState({});

  const [replace, setReplace] = useState(false);
  const [generating, setGenerating] = useState(false);
  const [result, setResult] = useState(null);

  const [adminOpen, setAdminOpen] = useState(false);

  const reqRef = useRef(0);

  const selectedAttributes = useMemo(() => {
    const ids = new Set(selectedAttributeIds.map(Number));
    return attributes.filter((a) => ids.has(Number(a.id)));
  }, [attributes, selectedAttributeIds]);

  const canContinueStep1 = selectedAttributeIds.length >= 1;

  const canContinueStep2 = useMemo(() => {
    if (selectedAttributeIds.length < 1) return false;

    for (const aid of selectedAttributeIds) {
      const list = selectedValueIds[Number(aid)] || [];
      if (!list.length) return false;
    }

    return true;
  }, [selectedAttributeIds, selectedValueIds]);

  const selections = useMemo(() => {
    return buildSelections(selectedAttributeIds, selectedValueIds);
  }, [selectedAttributeIds, selectedValueIds]);

  const previewCombos = useMemo(() => {
    if (step !== 3) return [];
    return cartesianPreview(
      selectedAttributes,
      valuesByAttribute,
      selectedValueIds,
      30
    );
  }, [step, selectedAttributes, valuesByAttribute, selectedValueIds]);

  const previewCount = useMemo(() => {
    if (!canContinueStep2) return 0;

    let count = 1;
    for (const aid of selectedAttributeIds.map(Number)) {
      const n = (selectedValueIds[aid] || []).length;
      count *= n;
    }
    return count;
  }, [canContinueStep2, selectedAttributeIds, selectedValueIds]);

  const title = `Crear variantes${productName ? ` — ${productName}` : ""}`;
  const steps = [
    "Selecciona los atributos",
    "Selecciona valores por atributo",
    "Generación automática",
  ];

  const resetAll = () => {
    setStep(1);
    setErr("");
    setLoading(false);
    setAttributes([]);
    setSelectedAttributeIds([]);
    setValuesByAttribute({});
    setSelectedValueIds({});
    setReplace(false);
    setGenerating(false);
    setResult(null);
    setAdminOpen(false);
  };

  const reloadAttributes = async () => {
    const myReq = ++reqRef.current;
    setLoading(true);
    setErr("");

    try {
      const res = await getVariantAttributes(restaurantId, {
        only_active: true,
      });

      if (myReq !== reqRef.current) return;

      const list = res?.data || [];
      setAttributes(list);

      setSelectedAttributeIds((prev) => {
        const activeIds = new Set(list.map((x) => Number(x.id)));
        return prev.map(Number).filter((id) => activeIds.has(id));
      });
    } catch (e) {
      if (myReq !== reqRef.current) return;
      setErr(normalizeErr(e));
    } finally {
      if (myReq !== reqRef.current) return;
      setLoading(false);
    }
  };

  useEffect(() => {
    if (!open) return;
    if (disabledByPrecondition) return;
    reloadAttributes();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [open, restaurantId, disabledByPrecondition]);

  useEffect(() => {
    if (!open) resetAll();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [open]);

  useEffect(() => {
    if (!err) return;

    const timer = setTimeout(() => {
      setErr("");
    }, 5000);

    return () => clearTimeout(timer);
  }, [err]);

  const toggleAttr = (id) => {
    setErr("");
    setResult(null);

    const n = Number(id);

    setSelectedAttributeIds((prev) => {
      const s = new Set(prev.map(Number));
      if (s.has(n)) s.delete(n);
      else s.add(n);
      return Array.from(s);
    });
  };

  const goStep2 = async () => {
    if (!canContinueStep1) {
      setErr("Selecciona al menos 1 atributo.");
      return;
    }

    setErr("");
    setResult(null);
    setLoading(true);

    const myReq = ++reqRef.current;

    try {
      const ids = selectedAttributeIds.map(Number);

      const responses = await Promise.all(
        ids.map((aid) =>
          getVariantAttributeValues(restaurantId, aid, { only_active: true })
        )
      );

      if (myReq !== reqRef.current) return;

      const map = {};
      const sel = {};

      responses.forEach((r) => {
        const attribute = r?.attribute;
        const data = r?.data || [];
        const aid = Number(attribute?.id);

        map[aid] = { attribute, data };
        sel[aid] = [];
      });

      setValuesByAttribute(map);
      setSelectedValueIds(sel);
      setStep(2);
    } catch (e) {
      if (myReq !== reqRef.current) return;
      setErr(normalizeErr(e));
    } finally {
      if (myReq !== reqRef.current) return;
      setLoading(false);
    }
  };

  const toggleValue = (attributeId, valueId) => {
    setErr("");
    setResult(null);

    const aid = Number(attributeId);
    const vid = Number(valueId);

    setSelectedValueIds((prev) => {
      const cur = new Set((prev[aid] || []).map(Number));
      if (cur.has(vid)) cur.delete(vid);
      else cur.add(vid);
      return { ...prev, [aid]: Array.from(cur) };
    });
  };

  const goStep3 = () => {
    if (!canContinueStep2) {
      setErr("Selecciona al menos 1 valor por cada atributo.");
      return;
    }

    setErr("");
    setResult(null);
    setStep(3);
  };

  const doGenerate = async () => {
    if (!canContinueStep2) {
      setErr("Selección inválida.");
      return;
    }

    if (!selections.length) {
      setErr("Debes seleccionar al menos 1 atributo con valores.");
      return;
    }

    setErr("");
    setResult(null);
    setGenerating(true);

    try {
      const payload = {
        replace: !!replace,
        selections,
      };

      const res = await generateProductVariants(restaurantId, productId, payload);

      const createdCount = getCreatedCount(res);

      if (createdCount === 0) {
        setResult({
          ...res,
          uiSeverity: "warning",
          uiTitle: "Variantes ya existentes",
          uiMessage:
            "Las combinaciones seleccionadas ya existen. No se creó ninguna variante nueva.",
        });
      } else if (createdCount < previewCount) {
        setResult({
          ...res,
          uiSeverity: "warning",
          uiTitle: "Generación parcial",
          uiMessage: `Se crearon ${createdCount} variante(s), pero algunas combinaciones ya existían y no se duplicaron.`,
        });
      } else {
        setResult({
          ...res,
          uiSeverity: "success",
          uiTitle: "Resultado",
          uiMessage:
            res?.message ||
            `Variantes generadas correctamente. Creadas: ${createdCount}`,
        });
      }

      await onGenerated?.(res);
    } catch (e) {
      setErr(normalizeErr(e));
    } finally {
      setGenerating(false);
    }
  };



  if (!open) return null;
  return (
    <>
      <Dialog
        open={open}
        onClose={generating ? undefined : onClose}
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
                {title}
              </Typography>

              <Typography
                sx={{
                  mt: 0.5,
                  fontSize: 13,
                  color: "rgba(255,255,255,0.82)",
                }}
              >
                Define atributos, selecciona valores y genera variantes de forma automática.
              </Typography>
            </Box>

            <IconButton
              onClick={onClose}
              disabled={generating}
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
          <Stack spacing={2.5}>
            {disabledByPrecondition ? (
              <Alert
                severity="warning"
                sx={{
                  borderRadius: 1,
                  alignItems: "flex-start",
                }}
              >
                <Box>
                  <Typography sx={{ fontWeight: 800, mb: 0.5 }}>
                    No puedes crear variantes todavía
                  </Typography>
                  <Typography variant="body2">
                    Primero configura al menos un precio habilitado por canal en el
                    producto (<code>product_channel</code>).
                  </Typography>
                </Box>
              </Alert>
            ) : (
              <>
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
                      {loading ? (
                        <Box
                          sx={{
                            minHeight: 220,
                            display: "grid",
                            placeItems: "center",
                          }}
                        >
                          <Stack spacing={2} alignItems="center">
                            <Chip
                              label="Cargando..."
                              sx={{ fontWeight: 800 }}
                            />
                            <Typography
                              sx={{ fontSize: 14, color: "text.secondary" }}
                            >
                              Espera un momento mientras se prepara la información.
                            </Typography>
                          </Stack>
                        </Box>
                      ) : step === 1 ? (
                        <>
                          <Stack
                            direction={{ xs: "column", sm: "row" }}
                            justifyContent="space-between"
                            alignItems={{ xs: "stretch", sm: "center" }}
                            spacing={1.5}
                          >
                            <Box>
                              <Typography
                                sx={{
                                  fontWeight: 800,
                                  fontSize: { xs: 18, sm: 20 },
                                  color: "text.primary",
                                }}
                              >
                                Paso 1. Selecciona los atributos
                              </Typography>

                              <Typography
                                sx={{
                                  mt: 0.75,
                                  fontSize: 13,
                                  color: "text.secondary",
                                  lineHeight: 1.5,
                                }}
                              >
                                Elige los atributos que formarán parte de las variantes.
                                Puedes usar uno o varios.
                              </Typography>
                            </Box>

                            <Button
                              type="button"
                              onClick={() => setAdminOpen(true)}
                              variant="outlined"
                              startIcon={<TuneIcon />}
                              sx={{
                                minWidth: { xs: "100%", sm: 210 },
                                height: 44,
                                borderRadius: 2,
                                fontWeight: 800,
                              }}
                            >
                              Administrar atributos
                            </Button>
                          </Stack>

                          {attributes.length === 0 ? (
                            <Box
                              sx={{
                                p: 3,
                                border: "1px dashed",
                                borderColor: "divider",
                                borderRadius: 1,
                                textAlign: "center",
                                bgcolor: "#fff",
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
                                  fontSize: 14,
                                  color: "text.secondary",
                                }}
                              >
                                No hay atributos activos disponibles para este restaurante.
                              </Typography>
                            </Box>
                          ) : (
                            <Box
                              sx={{
                                border: "1px solid",
                                borderColor: "divider",
                                borderRadius: 1,
                                overflow: "hidden",
                                backgroundColor: "#fff",
                              }}
                            >
                              <Box
                                sx={{
                                  px: 2,
                                  py: 1.25,
                                  borderBottom: "1px solid",
                                  borderColor: "divider",
                                  bgcolor: "#fff",
                                }}
                              >
                                <Typography
                                  sx={{
                                    fontSize: 13,
                                    fontWeight: 800,
                                    color: "text.secondary",
                                  }}
                                >
                                  Atributos disponibles
                                </Typography>
                              </Box>

                              <Box
                                sx={{
                                  maxHeight: 320,
                                  overflowY: "auto",
                                  p: 1.5,
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
                                            <Checkbox
                                              checked={checked}
                                              onChange={() => toggleAttr(a.id)}
                                              sx={{
                                                color: "primary.main",
                                                "&.Mui-checked": {
                                                  color: "primary.main",
                                                },
                                              }}
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
                            </Box>
                          )}
                        </>
                      ) : step === 2 ? (
                        <>
                          <Box>
                            <Typography
                              sx={{
                                fontWeight: 800,
                                fontSize: { xs: 18, sm: 20 },
                                color: "text.primary",
                              }}
                            >
                              Paso 2. Selecciona valores por atributo
                            </Typography>

                            <Typography
                              sx={{
                                mt: 0.75,
                                fontSize: 13,
                                color: "text.secondary",
                                lineHeight: 1.5,
                              }}
                            >
                              Elige al menos un valor por cada atributo seleccionado.
                            </Typography>
                          </Box>

                          {selectedAttributes.length === 0 ? (
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
                                const selected = new Set(
                                  (selectedValueIds[aid] || []).map(Number)
                                );

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
                                              Selecciona mínimo 1 valor.
                                            </Typography>
                                          </Box>

                                          <Chip
                                            size="small"
                                            color={
                                              (selectedValueIds[aid] || []).length > 0
                                                ? "success"
                                                : "default"
                                            }
                                            label={`${(selectedValueIds[aid] || []).length} seleccionados`}
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
                                              maxHeight: 300,
                                              overflowY: "auto",
                                              pr: 0.5,
                                              display: "grid",
                                              gridTemplateColumns: {
                                                xs: "1fr",
                                                sm: "repeat(2, minmax(0, 1fr))",
                                                md: "repeat(3, minmax(0, 1fr))",
                                              },
                                              gap: 1.25,
                                            }}
                                          >
                                            {values.map((v) => {
                                              const checked = selected.has(Number(v.id));

                                              return (
                                                <Card
                                                  key={v.id}
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
                                                  <Box sx={{ px: 1.25, py: 1 }}>
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
                                                        <Checkbox
                                                          checked={checked}
                                                          onChange={() =>
                                                            toggleValue(aid, v.id)
                                                          }
                                                          sx={{
                                                            color: "primary.main",
                                                            "&.Mui-checked": {
                                                              color: "primary.main",
                                                            },
                                                          }}
                                                        />
                                                      }
                                                      label={
                                                        <Typography
                                                          sx={{
                                                            fontSize: 14,
                                                            fontWeight: 700,
                                                            color: "text.primary",
                                                            wordBreak: "break-word",
                                                          }}
                                                        >
                                                          {v.value}
                                                        </Typography>
                                                      }
                                                    />
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
                            </Stack>
                          )}
                        </>
                      ) : (
                        <>
                          <Box>
                            <Typography
                              sx={{
                                fontWeight: 800,
                                fontSize: { xs: 18, sm: 20 },
                                color: "text.primary",
                              }}
                            >
                              Paso 3. Generación automática
                            </Typography>

                            <Typography
                              sx={{
                                mt: 0.75,
                                fontSize: 13,
                                color: "text.secondary",
                                lineHeight: 1.5,
                              }}
                            >
                              Revisa el resumen antes de generar las combinaciones en automático.
                            </Typography>
                          </Box>

                          <Card
                            sx={{
                              borderRadius: 0,
                              boxShadow: "none",
                              border: "1px solid",
                              borderColor: "divider",
                              backgroundColor: "#fff",
                            }}
                          >
                            <CardContent sx={{ p: { xs: 2, sm: 2.5 } }}>
                              <Stack spacing={2}>
                                <Box>
                                  <Typography
                                    sx={{
                                      fontSize: 16,
                                      fontWeight: 800,
                                      color: "text.primary",
                                    }}
                                  >
                                    Resumen
                                  </Typography>

                                  <Typography
                                    sx={{
                                      mt: 0.75,
                                      fontSize: 14,
                                      color: "text.primary",
                                    }}
                                  >
                                    Combinaciones totales:{" "}
                                    <strong>{previewCount}</strong>
                                  </Typography>

                                  {previewCount > 500 ? (
                                    <Typography
                                      sx={{
                                        mt: 0.75,
                                        fontSize: 12,
                                        color: "error.main",
                                        fontWeight: 800,
                                      }}
                                    >
                                      Reduce combinaciones. El backend bloqueará si exceden 500.
                                    </Typography>
                                  ) : null}
                                </Box>

                                <Box
                                  sx={{
                                    p: 1.5,
                                    border: "1px solid",
                                    borderColor: "divider",
                                    borderRadius: 1,
                                    backgroundColor: "#FAFAFA",
                                  }}
                                >
                                  <FormControlLabel
                                    sx={{ m: 0 }}
                                    control={
                                      <Checkbox
                                        checked={replace}
                                        onChange={(e) =>
                                          setReplace(e.target.checked)
                                        }
                                        disabled={generating}
                                        sx={{
                                          color: "primary.main",
                                          "&.Mui-checked": {
                                            color: "primary.main",
                                          },
                                        }}
                                      />
                                    }
                                    label={
                                      <Box>
                                        <Typography
                                          sx={{
                                            fontSize: 14,
                                            fontWeight: 800,
                                            color: "text.primary",
                                          }}
                                        >
                                          Reemplazar variantes existentes
                                        </Typography>

                                        <Typography
                                          sx={{
                                            mt: 0.35,
                                            fontSize: 12,
                                            color: "text.secondary",
                                            lineHeight: 1.45,
                                          }}
                                        >
                                          Si está activo, se borrarán las variantes actuales del
                                          producto antes de generar las nuevas.
                                        </Typography>
                                      </Box>
                                    }
                                  />
                                </Box>
                              </Stack>
                            </CardContent>
                          </Card>

                          <Card
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
                                <Typography
                                  sx={{
                                    fontSize: 16,
                                    fontWeight: 800,
                                    color: "text.primary",
                                  }}
                                >
                                  Preview de combinaciones
                                </Typography>

                                <Typography
                                  sx={{
                                    fontSize: 12,
                                    color: "text.secondary",
                                  }}
                                >
                                  Se muestran máximo 30 combinaciones para vista previa.
                                </Typography>

                                {previewCombos.length === 0 ? (
                                  <Box
                                    sx={{
                                      p: 3,
                                      border: "1px dashed",
                                      borderColor: "divider",
                                      borderRadius: 1,
                                      textAlign: "center",
                                      bgcolor: "#fff",
                                    }}
                                  >
                                    <InfoOutlinedIcon
                                      sx={{
                                        fontSize: 34,
                                        color: "text.secondary",
                                      }}
                                    />
                                    <Typography
                                      sx={{
                                        mt: 1,
                                        fontSize: 14,
                                        color: "text.secondary",
                                      }}
                                    >
                                      No hay combinaciones para mostrar.
                                    </Typography>
                                  </Box>
                                ) : (
                                  <Box
                                    sx={{
                                      maxHeight: 220,
                                      overflowY: "auto",
                                      display: "grid",
                                      gap: 1.25,
                                      pr: 0.5,
                                    }}
                                  >
                                    {previewCombos.map((combo, idx) => (
                                      <Card
                                        key={idx}
                                        sx={{
                                          borderRadius: 1,
                                          border: "1px solid",
                                          borderColor: "divider",
                                          boxShadow: "none",
                                          backgroundColor: "#fff",
                                        }}
                                      >
                                        <Box sx={{ p: 1.5 }}>
                                          <Stack spacing={0.75}>
                                            <Typography
                                              sx={{
                                                fontSize: 14,
                                                fontWeight: 800,
                                                color: "text.primary",
                                                wordBreak: "break-word",
                                              }}
                                            >
                                              {(productName || "Producto") +
                                                " " +
                                                combo.map((x) => x.value_name).join(" ")}
                                            </Typography>

                                            <Typography
                                              sx={{
                                                fontSize: 12,
                                                color: "text.secondary",
                                                lineHeight: 1.5,
                                              }}
                                            >
                                              {combo
                                                .map(
                                                  (x) =>
                                                    `${x.attribute_name}: ${x.value_name}`
                                                )
                                                .join(" | ")}
                                            </Typography>
                                          </Stack>
                                        </Box>
                                      </Card>
                                    ))}
                                  </Box>
                                )}
                              </Stack>
                            </CardContent>
                          </Card>

                          {result ? (
                            <Alert
                              severity={result?.uiSeverity || "success"}
                              sx={{
                                borderRadius: 1,
                                alignItems: "flex-start",
                              }}
                            >
                              <Box>
                                <Typography sx={{ fontWeight: 800, mb: 0.5 }}>
                                  {result?.uiTitle || "Resultado"}
                                </Typography>
                                <Typography variant="body2">
                                  {result?.uiMessage ||
                                    `${result?.message || "Variantes generadas"} · Creadas: ${
                                      result?.data?.created_count ?? "?"
                                    }`}
                                </Typography>
                              </Box>
                            </Alert>
                          ) : null}
                        </>
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
                              disabled={generating}
                              variant="outlined"
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
                              onClick={() => setStep((prev) => prev - 1)}
                              disabled={generating}
                              variant="outlined"
                              startIcon={<ArrowBackIcon />}
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
                              onClick={goStep2}
                              disabled={
                                disabledByPrecondition ||
                                !canContinueStep1 ||
                                loading ||
                                generating
                              }
                              variant="contained"
                              endIcon={<ArrowForwardIcon />}
                              sx={{
                                minWidth: { xs: "100%", sm: 200 },
                                height: 44,
                                borderRadius: 2,
                                fontWeight: 800,
                              }}
                            >
                              Siguiente
                            </Button>
                          ) : step === 2 ? (
                            <Button
                              type="button"
                              onClick={goStep3}
                              disabled={
                                disabledByPrecondition ||
                                !canContinueStep2 ||
                                loading ||
                                generating
                              }
                              variant="contained"
                              endIcon={<ArrowForwardIcon />}
                              sx={{
                                minWidth: { xs: "100%", sm: 220 },
                                height: 44,
                                borderRadius: 2,
                                fontWeight: 800,
                              }}
                            >
                              Ver generación
                            </Button>
                          ) : (
                            <Button
                              type="button"
                              onClick={doGenerate}
                              disabled={
                                disabledByPrecondition ||
                                generating ||
                                previewCount === 0 ||
                                previewCount > 500
                              }
                              variant="contained"
                              startIcon={<AutoAwesomeIcon />}
                              sx={{
                                minWidth: { xs: "100%", sm: 220 },
                                height: 44,
                                borderRadius: 2,
                                fontWeight: 800,
                              }}
                            >
                              {generating ? "Generando…" : "Confirmar y crear"}
                            </Button>
                          )}
                        </Box>
                      </Stack>
                    </Stack>
                  </CardContent>
                </Card>
              </>
            )}
          </Stack>
        </DialogContent>
      </Dialog>

      <VariantAttributesAdminModal
        open={adminOpen}
        onClose={() => setAdminOpen(false)}
        restaurantId={restaurantId}
        onDone={async () => {
          await reloadAttributes();
        }}
      />
    </>
  );
}