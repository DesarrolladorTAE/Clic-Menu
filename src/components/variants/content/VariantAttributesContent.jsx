import { useEffect, useRef, useState } from "react";

import {
  Box, Button, Card, CircularProgress, FormControlLabel, IconButton, Paper, Stack,
  Switch, Table, TableBody, TableCell, TableContainer, TableHead, TableRow,
  Tooltip, Typography, useMediaQuery,
} from "@mui/material";

import { useTheme } from "@mui/material/styles";

import AddIcon from "@mui/icons-material/Add";
import ArrowBackIcon from "@mui/icons-material/ArrowBack";
import EditIcon from "@mui/icons-material/Edit";
import TuneIcon from "@mui/icons-material/Tune";

import {
  getVariantAttributes,
  updateVariantAttribute,
} from "../../../services/products/variants/variantAttributes.service";

import PageContainer from "../../common/PageContainer";
import AppAlert from "../../common/AppAlert";
import PaginationFooter from "../../common/PaginationFooter";
import usePagination from "../../../hooks/usePagination";
import { normalizeErr } from "../../../utils/err";

const PAGE_SIZE = 5;

export default function VariantAttributesContent({
  restaurantId,
  productId,
  productName,
  refreshKey = 0,
  onBack,
  onCreateAttribute,
  onEditAttribute,
  onOpenValues,
  onChanged,
}) {
  const theme = useTheme();
  const useCards = useMediaQuery(theme.breakpoints.down("md"));

  const [loading, setLoading] = useState(true);
  const [loadFailed, setLoadFailed] = useState(false);
  const [attributes, setAttributes] = useState([]);
  const [statusActionId, setStatusActionId] = useState(null);

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

      setAttributes(Array.isArray(response?.data) ? response.data : []);
    } catch (e) {
      if (myReq !== reqRef.current) return;

      setAttributes([]);
      setLoadFailed(true);

      showAlert({
        severity: "error",
        title: "No se pudieron cargar los atributos",
        message: normalizeErr(e, "No se pudo consultar la configuración del producto."),
      });
    } finally {
      if (myReq === reqRef.current) setLoading(false);
    }
  };

  useEffect(() => {
    load();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [restaurantId, productId, refreshKey]);

  const toggleStatus = async (attribute) => {
    if (!attribute?.id || statusActionId !== null) return;

    const attributeId = Number(attribute.id);
    const nextStatus = attribute.status === "active" ? "inactive" : "active";
    const snapshot = attributes;

    setStatusActionId(attributeId);

    setAttributes((prev) =>
      prev.map((item) =>
        Number(item.id) === attributeId
          ? { ...item, status: nextStatus }
          : item
      )
    );

    try {
      const response = await updateVariantAttribute(
        restaurantId,
        productId,
        attributeId,
        { status: nextStatus }
      );

      const updated = response?.data || { ...attribute, status: nextStatus };

      setAttributes((prev) =>
        prev.map((item) =>
          Number(item.id) === attributeId
            ? { ...item, ...updated }
            : item
        )
      );

      showAlert({
        severity: "success",
        title: "Estado actualizado",
        message: nextStatus === "active"
          ? "El atributo quedó activo."
          : "El atributo quedó inactivo.",
      });

      await onChanged?.(updated);
    } catch (e) {
      setAttributes(snapshot);

      showAlert({
        severity: "error",
        title: "No se pudo cambiar el estado",
        message: normalizeErr(e, "No se pudo actualizar el atributo."),
      });
    } finally {
      setStatusActionId(null);
    }
  };

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
    items: attributes,
    initialPage: 1,
    pageSize: PAGE_SIZE,
    mode: "frontend",
  });

  const busy = statusActionId !== null;

  return (
    <PageContainer sx={{ py: 0, px: 0 }} innerSx={{ width: "100%" }}>
      <Stack spacing={2.5}>
        <Stack
          direction={{ xs: "column", sm: "row" }}
          justifyContent="space-between"
          alignItems={{ xs: "stretch", sm: "flex-end" }}
          spacing={1.5}
        >
          <Box sx={{ minWidth: 0 }}>
            <Typography
              sx={{
                fontWeight: 800,
                fontSize: { xs: 22, sm: 26 },
                color: "text.primary",
                lineHeight: 1.2,
              }}
            >
              Administrar atributos
            </Typography>

            <Typography sx={{ mt: 0.75, fontSize: 14, color: "text.secondary", lineHeight: 1.5 }}>
              {productName
                ? `Administra los atributos disponibles para las variantes de ${productName}.`
                : "Administra los atributos disponibles para las variantes del producto."}
            </Typography>
          </Box>

          <Button
            type="button"
            variant="contained"
            startIcon={<AddIcon />}
            onClick={() => onCreateAttribute?.()}
            disabled={busy}
            sx={{
              width: { xs: "100%", sm: "auto" },
              minWidth: { sm: 170 },
              height: 44,
              fontWeight: 800,
            }}
          >
            Crear atributo
          </Button>
        </Stack>

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
                Cargando atributos…
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
              No fue posible consultar los atributos
            </Typography>

            <Typography sx={{ mt: 0.75, fontSize: 13, color: "text.secondary" }}>
              No se realizarán cambios hasta poder confirmar la configuración actual.
            </Typography>
          </Paper>
        ) : total === 0 ? (
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
            <Typography sx={{ fontSize: 18, fontWeight: 800, color: "text.primary" }}>
              Este producto todavía no tiene atributos
            </Typography>

            <Typography sx={{ mt: 0.75, fontSize: 14, color: "text.secondary", lineHeight: 1.5 }}>
              Crea el primer atributo para comenzar a organizar sus opciones.
            </Typography>

            <Button
              type="button"
              variant="contained"
              startIcon={<AddIcon />}
              onClick={() => onCreateAttribute?.()}
              sx={{ mt: 2, minWidth: 180, height: 44, fontWeight: 800 }}
            >
              Crear atributo
            </Button>
          </Paper>
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
            <Box sx={{ px: 2, py: 1.5, borderBottom: "1px solid", borderColor: "divider" }}>
              <Typography sx={{ fontSize: 17, fontWeight: 800, color: "text.primary" }}>
                Atributos del producto
              </Typography>
            </Box>

            {useCards ? (
              <Stack spacing={1.5} sx={{ p: 2 }}>
                {paginatedItems.map((attribute) => {
                  const updating = Number(statusActionId) === Number(attribute.id);

                  return (
                    <Card
                      key={attribute.id}
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
                              <span>
                                <IconButton
                                  onClick={() => onEditAttribute?.(attribute)}
                                  disabled={busy}
                                  sx={iconEditSx}
                                >
                                  <EditIcon fontSize="small" />
                                </IconButton>
                              </span>
                            </Tooltip>
                          </Stack>

                          <Box>
                            <Typography sx={fieldLabelSx}>ESTADO</Typography>

                            <FormControlLabel
                              sx={{ m: 0, mt: 0.5 }}
                              control={
                                <Switch
                                  checked={attribute.status === "active"}
                                  disabled={busy}
                                  onChange={() => toggleStatus(attribute)}
                                />
                              }
                              label={
                                <Typography sx={{ fontSize: 14, fontWeight: 700, color: "text.primary" }}>
                                  {updating
                                    ? "Guardando…"
                                    : attribute.status === "active"
                                      ? "Activo"
                                      : "Inactivo"}
                                </Typography>
                              }
                            />
                          </Box>

                          <Button
                            type="button"
                            variant="outlined"
                            startIcon={<TuneIcon />}
                            onClick={() => onOpenValues?.(attribute)}
                            disabled={busy}
                            sx={{ width: "100%", height: 42, fontWeight: 800 }}
                          >
                            Opciones
                          </Button>
                        </Stack>
                      </Box>
                    </Card>
                  );
                })}
              </Stack>
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
                    {paginatedItems.map((attribute) => {
                      const updating = Number(statusActionId) === Number(attribute.id);

                      return (
                        <TableRow key={attribute.id} hover>
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
                                  disabled={busy}
                                  onChange={() => toggleStatus(attribute)}
                                />
                              }
                              label={
                                <Typography sx={{ fontSize: 14, fontWeight: 700, color: "text.primary" }}>
                                  {updating
                                    ? "Guardando…"
                                    : attribute.status === "active"
                                      ? "Activo"
                                      : "Inactivo"}
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
                                onClick={() => onOpenValues?.(attribute)}
                                disabled={busy}
                                sx={{ height: 40, fontWeight: 800 }}
                              >
                                Opciones
                              </Button>

                              <Tooltip title="Editar">
                                <span>
                                  <IconButton
                                    onClick={() => onEditAttribute?.(attribute)}
                                    disabled={busy}
                                    sx={iconEditSx}
                                  >
                                    <EditIcon fontSize="small" />
                                  </IconButton>
                                </span>
                              </Tooltip>
                            </Stack>
                          </TableCell>
                        </TableRow>
                      );
                    })}
                  </TableBody>
                </Table>
              </TableContainer>
            )}

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

        <Stack direction="row" justifyContent="flex-end">
          <Button
            type="button"
            variant="outlined"
            startIcon={<ArrowBackIcon />}
            onClick={() => onBack?.()}
            disabled={busy}
            sx={{ minWidth: 130, height: 44, fontWeight: 800 }}
          >
            Volver
          </Button>
        </Stack>
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
  "&:hover": { bgcolor: "#C9AA39" },
  "&.Mui-disabled": {
    bgcolor: "#EFE7BF",
    color: "rgba(255,255,255,0.85)",
  },
};