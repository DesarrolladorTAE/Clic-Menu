import { useEffect, useMemo, useRef, useState } from "react";

import {
  Alert, Box, Button, Card, Chip, Dialog, DialogContent, DialogTitle, FormControlLabel, IconButton, Paper,
  Stack, Switch, Tooltip, Typography, useMediaQuery,
} from "@mui/material";

import { useTheme } from "@mui/material/styles";

import CloseIcon from "@mui/icons-material/Close";
import AddIcon from "@mui/icons-material/Add";
import TuneIcon from "@mui/icons-material/Tune";
import EditIcon from "@mui/icons-material/Edit";
import DeleteOutlineIcon from "@mui/icons-material/DeleteOutline";
import CategoryOutlinedIcon from "@mui/icons-material/CategoryOutlined";

import {
  getVariantAttributes,
  updateVariantAttribute,
  deleteVariantAttribute,
} from "../../services/products/variants/variantAttributes.service";

import usePagination from "../../hooks/usePagination";
import PaginationFooter from "../common/PaginationFooter";
import PageContainer from "../common/PageContainer";
import AppAlert from "../common/AppAlert";

import VariantAttributeUpsertModal from "./VariantAttributeUpsertModal";
import VariantAttributeValuesModal from "./VariantAttributeValuesModal";

function normalizeErr(e) {
  return (
    e?.response?.data?.message ||
    (e?.response?.data?.errors
      ? Object.values(e.response.data.errors).flat().join("\n")
      : "") ||
    "Ocurrió un error"
  );
}

const PAGE_SIZE = 4;

export default function VariantAttributesAdminModal({
  open,
  onClose,
  restaurantId,
  onDone,
}) {
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down("sm"));

  const [loading, setLoading] = useState(false);
  const [err, setErr] = useState("");

  const [attributes, setAttributes] = useState([]);
  const [selectedAttribute, setSelectedAttribute] = useState(null);

  const [upsertOpen, setUpsertOpen] = useState(false);
  const [editingAttribute, setEditingAttribute] = useState(null);

  const [valuesOpen, setValuesOpen] = useState(false);
  const [valuesTarget, setValuesTarget] = useState(null);

  const [alertState, setAlertState] = useState({
    open: false,
    severity: "success",
    title: "",
    message: "",
  });

  const reqRef = useRef(0);

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

  const loadAttributes = async ({ silent = false } = {}) => {
    const myReq = ++reqRef.current;

    if (!silent) setLoading(true);
    setErr("");

    try {
      const res = await getVariantAttributes(restaurantId, {
        only_active: false,
      });

      if (myReq !== reqRef.current) return;

      const list = Array.isArray(res?.data) ? res.data : [];
      setAttributes(list);

      if (selectedAttribute) {
        const freshSelected = list.find(
          (item) => Number(item.id) === Number(selectedAttribute.id)
        );
        setSelectedAttribute(freshSelected || null);
      }
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
    loadAttributes();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [open, restaurantId]);


  useEffect(() => {
    if (!err) return;

    const timer = setTimeout(() => {
      setErr("");
    }, 4000);

    return () => clearTimeout(timer);
  }, [err]);

  const close = async () => {
    onClose?.();
    await onDone?.();
  };

  const onCreate = () => {
    setEditingAttribute(null);
    setUpsertOpen(true);
  };

  const onEdit = (row) => {
    setEditingAttribute(row);
    setUpsertOpen(true);
  };

  const onManageValues = (row) => {
    setValuesTarget(row);
    setValuesOpen(true);
  };

  const onToggleStatus = async (row) => {
    const nextStatus = row.status === "active" ? "inactive" : "active";
    const snapshot = attributes;

    setAttributes((prev) =>
      prev.map((item) =>
        Number(item.id) === Number(row.id)
          ? { ...item, status: nextStatus }
          : item
      )
    );

    try {
      await updateVariantAttribute(restaurantId, row.id, {
        status: nextStatus,
      });

      showAlert({
        severity: "success",
        title: "Estado actualizado",
        message:
          nextStatus === "active"
            ? "El atributo quedó activo."
            : "El atributo quedó inactivo.",
      });

      await loadAttributes({ silent: true });
    } catch (e) {
      setAttributes(snapshot);
      setErr(normalizeErr(e));
    }
  };

  const onDelete = async (row) => {
    const ok = window.confirm(
      `¿Eliminar atributo?\n\n${row.name}\n\nEsto puede invalidar variantes relacionadas.`
    );
    if (!ok) return;

    const snapshot = attributes;
    setAttributes((prev) =>
      prev.filter((item) => Number(item.id) !== Number(row.id))
    );

    try {
      await deleteVariantAttribute(restaurantId, row.id);

      showAlert({
        severity: "success",
        title: "Atributo eliminado",
        message: "El atributo se eliminó correctamente.",
      });

      if (valuesTarget && Number(valuesTarget.id) === Number(row.id)) {
        setValuesOpen(false);
        setValuesTarget(null);
      }

      await loadAttributes({ silent: true });
    } catch (e) {
      setAttributes(snapshot);
      setErr(normalizeErr(e));
    }
  };

  const sortedAttributes = useMemo(() => {
    return [...attributes].sort((a, b) => {
      if (a.status !== b.status) {
        return a.status === "active" ? -1 : 1;
      }
      return String(a.name || "").localeCompare(String(b.name || ""), "es");
    });
  }, [attributes]);

  const {
    page,
    nextPage,
    prevPage,
    total,
    totalPages,
    startItem,
    endItem,
    hasPrev,
    hasNext,
    paginatedItems,
  } = usePagination({
    items: sortedAttributes,
    initialPage: 1,
    pageSize: PAGE_SIZE,
    mode: "frontend",
  });

  if (!open) return null;

  return (
    <>
      <Dialog
        open={open}
        onClose={loading ? undefined : close}
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
                Administrar atributos
              </Typography>

              <Typography
                sx={{
                  mt: 0.5,
                  fontSize: 13,
                  color: "rgba(255,255,255,0.82)",
                }}
              >
                Crea, edita, activa o elimina atributos, y administra sus valores
                desde una vista separada.
              </Typography>
            </Box>

            <IconButton
              onClick={close}
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

              <Stack
                direction={{ xs: "column", sm: "row" }}
                justifyContent="space-between"
                alignItems={{ xs: "stretch", sm: "center" }}
                spacing={1.5}
              >
                <Box>
                  <Typography
                    sx={{
                      fontSize: 18,
                      fontWeight: 800,
                      color: "text.primary",
                    }}
                  >
                    Atributos disponibles
                  </Typography>

                  <Typography
                    sx={{
                      mt: 0.5,
                      fontSize: 13,
                      color: "text.secondary",
                    }}
                  >
                    Mostrando {total} atributos registrados.
                  </Typography>
                </Box>

                <Button
                  onClick={onCreate}
                  variant="contained"
                  startIcon={<AddIcon />}
                  sx={{
                    minWidth: { xs: "100%", sm: 190 },
                    height: 44,
                    borderRadius: 2,
                    fontWeight: 800,
                  }}
                >
                  Crear atributo
                </Button>
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
                    Cargando atributos…
                  </Typography>
                </Paper>
              ) : total === 0 ? (
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
                    No hay atributos todavía
                  </Typography>

                  <Typography
                    sx={{
                      mt: 0.75,
                      fontSize: 14,
                      color: "text.secondary",
                    }}
                  >
                    Crea el primer atributo para comenzar a organizar las variantes.
                  </Typography>

                  <Button
                    onClick={onCreate}
                    variant="contained"
                    startIcon={<AddIcon />}
                    sx={{
                      mt: 2,
                      minWidth: 200,
                      height: 44,
                      borderRadius: 2,
                      fontWeight: 800,
                    }}
                  >
                    Crear atributo
                  </Button>
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
                      p: 2,
                      display: "grid",
                      gridTemplateColumns: {
                        xs: "1fr",
                        md: "repeat(2, minmax(0, 1fr))",
                      },
                      gap: 2,
                    }}
                  >
                    {paginatedItems.map((row) => {
                      const isActive = row.status === "active";

                      return (
                        <Card
                          key={row.id}
                          sx={{
                            borderRadius: 1,
                            boxShadow: "none",
                            border: "1px solid",
                            borderColor: "divider",
                            backgroundColor: "#fff",
                          }}
                        >
                          <Box sx={{ p: 2 }}>
                            <Stack spacing={1.75}>
                              <Stack
                                direction="row"
                                justifyContent="space-between"
                                alignItems="flex-start"
                                spacing={1.5}
                              >
                                <Box sx={{ minWidth: 0 }}>
                                  <Typography
                                    sx={{
                                      fontSize: 18,
                                      fontWeight: 800,
                                      color: "text.primary",
                                      lineHeight: 1.25,
                                      wordBreak: "break-word",
                                    }}
                                  >
                                    {row.name}
                                  </Typography>

                                  <Stack
                                    direction="row"
                                    spacing={1}
                                    flexWrap="wrap"
                                    useFlexGap
                                    sx={{ mt: 1 }}
                                  >
                                    <Chip
                                      size="small"
                                      label={isActive ? "Activo" : "Inactivo"}
                                      color={isActive ? "success" : "default"}
                                      sx={{ fontWeight: 800 }}
                                    />
                                  </Stack>
                                </Box>

                                <Stack direction="row" spacing={1}>
                                  <Tooltip title="Editar">
                                    <IconButton
                                      onClick={() => onEdit(row)}
                                      sx={iconEditSx}
                                    >
                                      <EditIcon fontSize="small" />
                                    </IconButton>
                                  </Tooltip>

                                  <Tooltip title="Eliminar">
                                    <IconButton
                                      onClick={() => onDelete(row)}
                                      sx={iconDeleteSx}
                                    >
                                      <DeleteOutlineIcon fontSize="small" />
                                    </IconButton>
                                  </Tooltip>
                                </Stack>
                              </Stack>

                              <Stack spacing={1}>
                                <Stack
                                  direction={{ xs: "column", sm: "row" }}
                                  spacing={{ xs: 0.5, sm: 1.25 }}
                                  alignItems={{ xs: "flex-start", sm: "center" }}
                                >
                                  <Typography sx={mobileLabelSx}>
                                    Estado
                                  </Typography>

                                  <FormControlLabel
                                    sx={{
                                      m: 0,
                                      "& .MuiFormControlLabel-label": {
                                        minWidth: 0,
                                      },
                                    }}
                                    control={
                                      <Switch
                                        checked={isActive}
                                        onChange={() => onToggleStatus(row)}
                                        color="primary"
                                      />
                                    }
                                    label={
                                      <Typography sx={switchLabelSx}>
                                        {isActive ? "Activo" : "Inactivo"}
                                      </Typography>
                                    }
                                  />
                                </Stack>
                              </Stack>

                              <Box
                                sx={{
                                  pt: 1,
                                  borderTop: "1px solid",
                                  borderColor: "divider",
                                }}
                              >
                                <Typography
                                  sx={{
                                    fontSize: 12,
                                    fontWeight: 800,
                                    color: "text.secondary",
                                    mb: 1,
                                    textTransform: "uppercase",
                                    letterSpacing: 0.35,
                                  }}
                                >
                                  Gestión relacionada
                                </Typography>

                                <Button
                                  onClick={() => onManageValues(row)}
                                  variant="outlined"
                                  startIcon={<TuneIcon />}
                                  sx={{
                                    height: 40,
                                    borderRadius: 2,
                                    fontSize: 12,
                                    fontWeight: 800,
                                    whiteSpace: "nowrap",
                                  }}
                                >
                                  Administrar valores
                                </Button>
                              </Box>
                            </Stack>
                          </Box>
                        </Card>
                      );
                    })}
                  </Box>

                  <PaginationFooter
                    page={page}
                    totalPages={totalPages}
                    startItem={startItem}
                    endItem={endItem}
                    total={total}
                    hasPrev={hasPrev}
                    hasNext={hasNext}
                    onPrev={prevPage}
                    onNext={nextPage}
                    itemLabel="atributos"
                  />
                </Paper>
              )}

              <Typography
                sx={{
                  fontSize: 12,
                  color: "text.secondary",
                  lineHeight: 1.5,
                }}
              >
                Tip: desactivar suele ser menos agresivo que eliminar. Ya sé, a veces
                borrar cosas da paz espiritual, pero luego las variantes lloran.
              </Typography>
            </Stack>
          </PageContainer>
        </DialogContent>  
      </Dialog>

      <VariantAttributeUpsertModal
        open={upsertOpen}
        onClose={() => {
          setUpsertOpen(false);
          setEditingAttribute(null);
        }}
        restaurantId={restaurantId}
        editing={editingAttribute}
        onSaved={async () => {
          setUpsertOpen(false);
          setEditingAttribute(null);
          await loadAttributes({ silent: true });

          showAlert({
            severity: "success",
            title: editingAttribute ? "Atributo actualizado" : "Atributo creado",
            message: editingAttribute
              ? "El atributo se actualizó correctamente."
              : "El atributo se creó correctamente.",
          });
        }}
      />

      <VariantAttributeValuesModal
        open={valuesOpen}
        onClose={() => {
          setValuesOpen(false);
          setValuesTarget(null);
        }}
        restaurantId={restaurantId}
        attribute={valuesTarget}
        onSaved={async () => {
          await loadAttributes({ silent: true });
        }}
      />

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

const mobileLabelSx = {
  fontSize: 11,
  fontWeight: 800,
  color: "text.secondary",
  textTransform: "uppercase",
  letterSpacing: 0.3,
};

const iconEditSx = {
  width: 40,
  height: 40,
  bgcolor: "#E3C24A",
  color: "#fff",
  borderRadius: 1.5,
  "&:hover": {
    bgcolor: "#C9AA39",
  },
};

const iconDeleteSx = {
  width: 40,
  height: 40,
  bgcolor: "error.main",
  color: "#fff",
  borderRadius: 1.5,
  "&:hover": {
    bgcolor: "error.dark",
  },
};