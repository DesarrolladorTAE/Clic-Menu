import { useEffect, useRef, useState } from "react";

import {
  Box, Button, Card, CircularProgress, FormControlLabel, IconButton, Paper, Stack, Switch,
  Table, TableBody, TableCell, TableContainer, TableHead, TableRow, TextField, Tooltip,
  Typography, useMediaQuery,
} from "@mui/material";

import { useTheme } from "@mui/material/styles";

import AddIcon from "@mui/icons-material/Add";
import ArrowBackIcon from "@mui/icons-material/ArrowBack";
import EditIcon from "@mui/icons-material/Edit";
import SaveIcon from "@mui/icons-material/Save";
import TuneIcon from "@mui/icons-material/Tune";

import {
  createVariantAttribute,
  getVariantAttributes,
  updateVariantAttribute,
} from "../../../services/products/variants/variantAttributes.service";

import PageContainer from "../../common/PageContainer";
import AppAlert from "../../common/AppAlert";
import { normalizeErr } from "../../../utils/err";

export default function VariantAttributesContent({
  restaurantId,
  productId,
  productName,
  refreshKey = 0,
  onBack,
  onManageValues,
  onChanged,
}) {
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down("sm"));

  const [loading, setLoading] = useState(true);
  const [loadFailed, setLoadFailed] = useState(false);
  const [saving, setSaving] = useState(false);
  const [updatingStatus, setUpdatingStatus] = useState(false);

  const [attribute, setAttribute] = useState(null);
  const [editing, setEditing] = useState(false);

  const [form, setForm] = useState({
    name: "",
    status: "active",
  });

  const [alertState, setAlertState] = useState({
    open: false,
    severity: "error",
    title: "",
    message: "",
  });

  const reqRef = useRef(0);

  const showAlert = ({ severity = "error", title = "", message = "" }) => {
    setAlertState({ open: true, severity, title, message });
  };

  const closeAlert = (_, reason) => {
    if (reason === "clickaway") return;
    setAlertState((prev) => ({ ...prev, open: false }));
  };

  const load = async () => {
    const myReq = ++reqRef.current;
    setLoading(true);
    setLoadFailed(false);

    try {
      const response = await getVariantAttributes(
        restaurantId,
        productId,
        { only_active: false }
      );

      if (myReq !== reqRef.current) return;

      const list = Array.isArray(response?.data) ? response.data : [];
      const currentAttribute = list[0] || null;

      setAttribute(currentAttribute);
      setEditing(false);

      if (currentAttribute) {
        setForm({
          name: currentAttribute.name || "",
          status: currentAttribute.status || "active",
        });
      } else {
        setForm({
          name: "",
          status: "active",
        });
      }
    } catch (e) {
      if (myReq !== reqRef.current) return;

      setLoadFailed(true);
      setAttribute(null);

      showAlert({
        severity: "error",
        title: "No se pudo cargar el atributo",
        message: normalizeErr(e, "No se pudo consultar la configuración del producto."),
      });
    } finally {
      if (myReq !== reqRef.current) return;
      setLoading(false);
    }
  };

  useEffect(() => {
    load();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [restaurantId, productId, refreshKey]);

  const startEdit = () => {
    if (!attribute) return;

    setForm({
      name: attribute.name || "",
      status: attribute.status || "active",
    });

    setEditing(true);
  };

  const cancelEdit = () => {
    if (!attribute) return;

    setForm({
      name: attribute.name || "",
      status: attribute.status || "active",
    });

    setEditing(false);
  };

  const save = async () => {
    const name = form.name.trim().replace(/\s+/g, " ");

    if (!name) {
      showAlert({
        severity: "warning",
        title: "Falta el nombre",
        message: "Escribe el nombre del atributo.",
      });
      return;
    }

    setSaving(true);

    try {
      let response;

      if (attribute) {
        response = await updateVariantAttribute(
          restaurantId,
          productId,
          attribute.id,
          {
            name,
            status: form.status,
          }
        );
      } else {
        response = await createVariantAttribute(
          restaurantId,
          productId,
          {
            name,
            status: form.status,
          }
        );
      }

      const savedAttribute = response?.data || null;

      if (savedAttribute) {
        setAttribute(savedAttribute);
        setForm({
          name: savedAttribute.name || "",
          status: savedAttribute.status || "active",
        });
      }

      setEditing(false);

      showAlert({
        severity: "success",
        title: attribute ? "Atributo actualizado" : "Atributo creado",
        message: attribute
          ? "Los cambios se guardaron correctamente."
          : "El atributo se creó correctamente.",
      });

      await onChanged?.(savedAttribute);
    } catch (e) {
      showAlert({
        severity: "error",
        title: "No se pudo guardar",
        message: normalizeErr(e, "No se pudo guardar el atributo."),
      });
    } finally {
      setSaving(false);
    }
  };

  const toggleStatus = async () => {
    if (!attribute || updatingStatus) return;

    const previous = attribute;
    const nextStatus = attribute.status === "active" ? "inactive" : "active";

    const optimistic = {
      ...attribute,
      status: nextStatus,
    };

    setAttribute(optimistic);
    setForm((prev) => ({ ...prev, status: nextStatus }));
    setUpdatingStatus(true);

    try {
      const response = await updateVariantAttribute(
        restaurantId,
        productId,
        attribute.id,
        { status: nextStatus }
      );

      const updated = response?.data || optimistic;

      setAttribute(updated);
      setForm({
        name: updated.name || "",
        status: updated.status || nextStatus,
      });

      showAlert({
        severity: "success",
        title: "Estado actualizado",
        message: nextStatus === "active"
          ? "El atributo quedó activo."
          : "El atributo quedó inactivo.",
      });

      await onChanged?.(updated);
    } catch (e) {
      setAttribute(previous);
      setForm({
        name: previous.name || "",
        status: previous.status || "active",
      });

      showAlert({
        severity: "error",
        title: "No se pudo cambiar el estado",
        message: normalizeErr(e, "No se pudo actualizar el atributo."),
      });
    } finally {
      setUpdatingStatus(false);
    }
  };

  const renderForm = () => (
    <Paper
      sx={{
        p: { xs: 2, sm: 2.5 },
        borderRadius: 1,
        border: "1px solid",
        borderColor: "divider",
        boxShadow: "none",
        backgroundColor: "background.paper",
      }}
    >
      <Stack spacing={2}>
        <Box>
          <Typography sx={{ fontSize: 18, fontWeight: 800, color: "text.primary" }}>
            {attribute ? "Editar atributo" : "Crear atributo"}
          </Typography>

          <Typography sx={{ mt: 0.5, fontSize: 13, color: "text.secondary", lineHeight: 1.5 }}>
            Este producto puede utilizar un solo atributo para organizar sus variantes.
          </Typography>
        </Box>

        <TextField
          fullWidth
          label="Nombre del atributo"
          placeholder="Ej. Tamaño"
          value={form.name}
          onChange={(e) => setForm((prev) => ({ ...prev, name: e.target.value }))}
          disabled={saving}
          inputProps={{ maxLength: 120 }}
        />

        <Box>
          <Typography sx={fieldLabelSx}>Estado</Typography>

          <FormControlLabel
            sx={{ m: 0, mt: 0.5 }}
            control={
              <Switch
                checked={form.status === "active"}
                disabled={saving}
                onChange={(e) =>
                  setForm((prev) => ({
                    ...prev,
                    status: e.target.checked ? "active" : "inactive",
                  }))
                }
              />
            }
            label={
              <Typography sx={{ fontSize: 14, fontWeight: 700, color: "text.primary" }}>
                {form.status === "active" ? "Activo" : "Inactivo"}
              </Typography>
            }
          />
        </Box>

        <Stack
          direction={{ xs: "column-reverse", sm: "row" }}
          justifyContent="flex-end"
          spacing={1.25}
        >
          {attribute ? (
            <Button
              type="button"
              variant="outlined"
              onClick={cancelEdit}
              disabled={saving}
              sx={{ width: { xs: "100%", sm: "auto" }, minWidth: { sm: 130 }, height: 44 }}
            >
              Cancelar
            </Button>
          ) : null}

          <Button
            type="button"
            variant="contained"
            startIcon={saving ? <CircularProgress size={18} color="inherit" /> : attribute ? <SaveIcon /> : <AddIcon />}
            onClick={save}
            disabled={saving || !form.name.trim()}
            sx={{
              width: { xs: "100%", sm: "auto" },
              minWidth: { sm: 170 },
              height: 44,
              fontWeight: 800,
            }}
          >
            {saving
              ? "Guardando…"
              : attribute
                ? "Guardar cambios"
                : "Crear atributo"}
          </Button>
        </Stack>
      </Stack>
    </Paper>
  );

  return (
    <PageContainer
      sx={{ py: 0, px: 0 }}
      innerSx={{ width: "100%" }}
    >
      <Stack spacing={2.5}>
        <Box>
          <Button
            type="button"
            variant="text"
            startIcon={<ArrowBackIcon />}
            onClick={() => onBack?.()}
            disabled={saving || updatingStatus}
            sx={{ mb: 1, fontWeight: 800 }}
          >
            Volver
          </Button>

          <Typography
            sx={{
              fontWeight: 800,
              fontSize: { xs: 22, sm: 26 },
              color: "text.primary",
              lineHeight: 1.2,
            }}
          >
            Administrar atributo
          </Typography>

          <Typography
            sx={{
              mt: 0.75,
              fontSize: 14,
              color: "text.secondary",
              lineHeight: 1.5,
            }}
          >
            {productName
              ? `Configura el atributo que utilizarán las variantes de ${productName}.`
              : "Configura el atributo que utilizarán las variantes del producto."}
          </Typography>
        </Box>

        {loading ? (
          <Paper
            sx={{
              minHeight: 260,
              borderRadius: 1,
              border: "1px solid",
              borderColor: "divider",
              boxShadow: "none",
              display: "grid",
              placeItems: "center",
              backgroundColor: "background.paper",
            }}
          >
            <Stack spacing={1.5} alignItems="center">
              <CircularProgress size={30} />
              <Typography sx={{ fontSize: 13, color: "text.secondary" }}>
                Cargando atributo…
              </Typography>
            </Stack>
          </Paper>
        ) : loadFailed ? (
          <Paper
            sx={{
              p: { xs: 3, sm: 4 },
              borderRadius: 1,
              border: "1px solid",
              borderColor: "divider",
              boxShadow: "none",
              textAlign: "center",
              backgroundColor: "background.paper",
            }}
          >
            <Typography sx={{ fontSize: 16, fontWeight: 800, color: "text.primary" }}>
              No fue posible consultar el atributo
            </Typography>

            <Typography sx={{ mt: 0.75, fontSize: 13, color: "text.secondary" }}>
              No se realizarán cambios hasta poder confirmar la configuración actual.
            </Typography>
          </Paper>
        ) : !attribute || editing ? (
          renderForm()
        ) : (
          <Paper
            sx={{
              p: 0,
              overflow: "hidden",
              borderRadius: 1,
              border: "1px solid",
              borderColor: "divider",
              boxShadow: "none",
              backgroundColor: "background.paper",
            }}
          >
            <Box
              sx={{
                px: 2,
                py: 1.5,
                borderBottom: "1px solid",
                borderColor: "divider",
              }}
            >
              <Typography sx={{ fontSize: 17, fontWeight: 800, color: "text.primary" }}>
                Atributo del producto
              </Typography>
            </Box>

            {isMobile ? (
              <Box sx={{ p: 2 }}>
                <Card
                  sx={{
                    width: "100%",
                    minHeight: 190,
                    borderRadius: 1,
                    border: "1px solid",
                    borderColor: "divider",
                    boxShadow: "none",
                    backgroundColor: "background.paper",
                  }}
                >
                  <Box sx={{ p: 2 }}>
                    <Stack spacing={2}>
                      <Stack
                        direction="row"
                        justifyContent="space-between"
                        alignItems="flex-start"
                        spacing={1}
                      >
                        <Box sx={{ minWidth: 0 }}>
                          <Typography sx={fieldLabelSx}>ATRIBUTO</Typography>

                          <Typography
                            sx={{
                              mt: 0.4,
                              fontSize: 18,
                              fontWeight: 800,
                              color: "text.primary",
                              wordBreak: "break-word",
                            }}
                          >
                            {attribute.name}
                          </Typography>
                        </Box>

                        <Tooltip title="Editar">
                          <IconButton
                            onClick={startEdit}
                            disabled={updatingStatus}
                            sx={iconEditSx}
                          >
                            <EditIcon fontSize="small" />
                          </IconButton>
                        </Tooltip>
                      </Stack>

                      <Box>
                        <Typography sx={fieldLabelSx}>ESTADO</Typography>

                        <FormControlLabel
                          sx={{ m: 0, mt: 0.5 }}
                          control={
                            <Switch
                              checked={attribute.status === "active"}
                              disabled={updatingStatus}
                              onChange={toggleStatus}
                            />
                          }
                          label={
                            <Typography sx={{ fontSize: 14, fontWeight: 700, color: "text.primary" }}>
                              {attribute.status === "active" ? "Activo" : "Inactivo"}
                            </Typography>
                          }
                        />
                      </Box>

                      <Button
                        type="button"
                        variant="outlined"
                        startIcon={<TuneIcon />}
                        onClick={() => onManageValues?.(attribute)}
                        disabled={updatingStatus}
                        sx={{ width: "100%", height: 42, fontWeight: 800 }}
                      >
                        Administrar opciones
                      </Button>
                    </Stack>
                  </Box>
                </Card>
              </Box>
            ) : (
              <TableContainer sx={{ width: "100%", overflowX: "auto" }}>
                <Table sx={{ minWidth: 760 }}>
                  <TableHead>
                    <TableRow
                      sx={{
                        "& th": {
                          backgroundColor: "primary.main",
                          color: "#fff",
                          fontWeight: 800,
                          borderBottom: "none",
                          whiteSpace: "nowrap",
                        },
                      }}
                    >
                      <TableCell>Atributo</TableCell>
                      <TableCell width={220}>Estado</TableCell>
                      <TableCell align="right" width={300}>Acciones</TableCell>
                    </TableRow>
                  </TableHead>

                  <TableBody>
                    <TableRow>
                      <TableCell>
                        <Typography sx={{ fontSize: 15, fontWeight: 800, color: "text.primary" }}>
                          {attribute.name}
                        </Typography>
                      </TableCell>

                      <TableCell>
                        <FormControlLabel
                          sx={{ m: 0 }}
                          control={
                            <Switch
                              checked={attribute.status === "active"}
                              disabled={updatingStatus}
                              onChange={toggleStatus}
                            />
                          }
                          label={
                            <Typography sx={{ fontSize: 14, fontWeight: 700, color: "text.primary" }}>
                              {attribute.status === "active" ? "Activo" : "Inactivo"}
                            </Typography>
                          }
                        />
                      </TableCell>

                      <TableCell align="right">
                        <Stack
                          direction="row"
                          spacing={1}
                          justifyContent="flex-end"
                          alignItems="center"
                        >
                          <Button
                            type="button"
                            variant="outlined"
                            startIcon={<TuneIcon />}
                            onClick={() => onManageValues?.(attribute)}
                            disabled={updatingStatus}
                            sx={{ height: 40, fontWeight: 800 }}
                          >
                            Administrar opciones
                          </Button>

                          <Tooltip title="Editar">
                            <IconButton
                              onClick={startEdit}
                              disabled={updatingStatus}
                              sx={iconEditSx}
                            >
                              <EditIcon fontSize="small" />
                            </IconButton>
                          </Tooltip>
                        </Stack>
                      </TableCell>
                    </TableRow>
                  </TableBody>
                </Table>
              </TableContainer>
            )}
          </Paper>
        )}
      </Stack>

      <AppAlert
        open={alertState.open}
        onClose={closeAlert}
        severity={alertState.severity}
        title={alertState.title}
        message={alertState.message}
        autoHideDuration={3000}
      />
    </PageContainer>
  );
}

const fieldLabelSx = {
  fontSize: 11,
  fontWeight: 800,
  color: "text.secondary",
  letterSpacing: 0.35,
};

const iconEditSx = {
  width: 40,
  height: 40,
  bgcolor: "#E3C24A",
  color: "#fff",
  "&:hover": {
    bgcolor: "#C9AA39",
  },
  "&.Mui-disabled": {
    bgcolor: "#EFE7BF",
    color: "rgba(255,255,255,0.85)",
  },
};