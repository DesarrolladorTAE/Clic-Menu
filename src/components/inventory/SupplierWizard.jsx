import { useEffect, useMemo, useRef, useState } from "react";

import {
  Box,
  Button,
  Card,
  CardContent,
  CircularProgress,
  Dialog,
  DialogContent,
  DialogTitle,
  FormControlLabel,
  IconButton,
  Paper,
  Stack,
  Switch,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Tooltip,
  Typography,
  useMediaQuery,
} from "@mui/material";

import { useTheme } from "@mui/material/styles";

import CloseIcon from "@mui/icons-material/Close";
import AddIcon from "@mui/icons-material/Add";
import EditIcon from "@mui/icons-material/Edit";
import DeleteOutlineIcon from "@mui/icons-material/DeleteOutline";

import { normalizeErr } from "../../utils/err";
import AppAlert from "../../components/common/AppAlert";
import usePagination from "../../hooks/usePagination";
import PaginationFooter from "../../components/common/PaginationFooter";

import {
  getSuppliers,
  createSupplier,
  updateSupplier,
  deleteSupplier,
} from "../../services/inventory/suppliers/suppliers.service";

import SupplierUpsertModal from "./SupplierUpsertModal";

const PAGE_SIZE = 5;

export default function SupplierWizard({
  open,
  restaurantId,
  onClose,
  onChanged,
  preselectId,
}) {
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down("sm"));

  const [loading, setLoading] = useState(true);
  const [rows, setRows] = useState([]);

  const [savingMap, setSavingMap] = useState({});
  const [reqTick, setReqTick] = useState(0);

  const [upsertOpen, setUpsertOpen] = useState(false);
  const [editing, setEditing] = useState(null);

  const [alertState, setAlertState] = useState({
    open: false,
    severity: "error",
    title: "",
    message: "",
  });

  const reqRef = useRef(0);

  const showAlert = ({
    severity = "error",
    title = "Error",
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

  const setSaving = (supplierId, value) => {
    setSavingMap((prev) => ({ ...prev, [supplierId]: value }));
  };

  const isSaving = (supplierId) => !!savingMap[supplierId];

  const title = useMemo(() => "Administrar proveedores", []);

  const load = async () => {
    const myReq = ++reqRef.current;
    setLoading(true);

    try {
      const res = await getSuppliers(restaurantId, {
        only_active: false,
        q: "",
      });

      if (myReq !== reqRef.current) return;

      const data = Array.isArray(res?.data) ? res.data : [];
      setRows(data);

      if (preselectId) {
        const picked = data.find((item) => Number(item.id) === Number(preselectId));
        if (picked) {
          setEditing(picked);
        }
      }
    } catch (e) {
      if (myReq !== reqRef.current) return;

      setRows([]);
      showAlert({
        severity: "error",
        title: "Error",
        message: normalizeErr(e, "No se pudieron cargar los proveedores"),
      });
    } finally {
      if (myReq !== reqRef.current) return;
      setLoading(false);
    }
  };

  useEffect(() => {
    if (!open) return;
    setEditing(null);
    setUpsertOpen(false);
    load();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [open, restaurantId, reqTick]);

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
    items: rows,
    initialPage: 1,
    pageSize: PAGE_SIZE,
    mode: "frontend",
  });

  const openCreate = () => {
    setEditing(null);
    setUpsertOpen(true);
  };

  const openEdit = (row) => {
    setEditing(row);
    setUpsertOpen(true);
  };

  const handleToggleStatus = async (row) => {
    const supplierId = row?.id;
    if (!supplierId || isSaving(supplierId)) return;

    const snapshot = rows;
    const nextStatus = row.status === "active" ? "inactive" : "active";

    setRows((prev) =>
      prev.map((item) =>
        item.id === supplierId ? { ...item, status: nextStatus } : item
      )
    );
    setSaving(supplierId, true);

    try {
      await updateSupplier(restaurantId, supplierId, {
        name: row.name,
        contact_name: row.contact_name || null,
        phone: row.phone || null,
        email: row.email || null,
        notes: row.notes || null,
        status: nextStatus,
      });

      await onChanged?.();
    } catch (e) {
      setRows(snapshot);
      showAlert({
        severity: "error",
        title: "Error",
        message: normalizeErr(e, "No se pudo actualizar el estado"),
      });
    } finally {
      setSaving(supplierId, false);
    }
  };

  const remove = async (row) => {
    const ok = window.confirm(
      `¿Eliminar proveedor?\n\n${row.name}\n\nOjo: si está ligado a presentaciones, se quedarán con “Falta elegir proveedor”.`
    );
    if (!ok) return;

    const snapshot = rows;
    setRows((prev) => prev.filter((item) => item.id !== row.id));

    try {
      await deleteSupplier(restaurantId, row.id);

      await onChanged?.();

      showAlert({
        severity: "success",
        title: "Hecho",
        message: "Proveedor eliminado correctamente.",
      });
    } catch (e) {
      setRows(snapshot);
      showAlert({
        severity: "error",
        title: "Error",
        message: normalizeErr(e, "No se pudo eliminar proveedor"),
      });
    }
  };

  if (!open) return null;

  return (
    <>
      <Dialog
        open={open}
        onClose={onClose}
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
                Crea, edita y controla el estado de los proveedores que usarán tus ingredientes y presentaciones.
              </Typography>
            </Box>

            <IconButton
              onClick={onClose}
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
            <CardContent sx={{ p: { xs: 2, sm: 3 } }}>
              <Stack spacing={2.5}>
                <Stack
                  direction={{ xs: "column", md: "row" }}
                  justifyContent="space-between"
                  alignItems={{ xs: "flex-start", md: "center" }}
                  spacing={2}
                >
                  <Box>
                    <Typography
                      sx={{
                        fontSize: { xs: 18, sm: 20 },
                        fontWeight: 800,
                        color: "text.primary",
                      }}
                    >
                      Catálogo de proveedores
                    </Typography>

                    <Typography
                      sx={{
                        mt: 0.5,
                        fontSize: 14,
                        color: "text.secondary",
                        lineHeight: 1.5,
                      }}
                    >
                      Aquí puedes registrar proveedores y definir cuáles estarán disponibles para futuras compras.
                    </Typography>
                  </Box>

                  <Button
                    onClick={openCreate}
                    variant="contained"
                    startIcon={<AddIcon />}
                    sx={{
                      minWidth: { xs: "100%", sm: 190 },
                      height: 44,
                      borderRadius: 2,
                      fontWeight: 800,
                    }}
                  >
                    Nuevo proveedor
                  </Button>
                </Stack>

                <Paper
                  sx={{
                    p: 0,
                    overflow: "hidden",
                    borderRadius: 0,
                    backgroundColor: "background.paper",
                  }}
                >
                  {loading ? (
                    <Box
                      sx={{
                        minHeight: 240,
                        display: "grid",
                        placeItems: "center",
                        px: 2,
                      }}
                    >
                      <Stack spacing={2} alignItems="center">
                        <CircularProgress color="primary" />
                        <Typography sx={{ color: "text.secondary", fontSize: 14 }}>
                          Cargando proveedores…
                        </Typography>
                      </Stack>
                    </Box>
                  ) : rows.length === 0 ? (
                    <Box
                      sx={{
                        px: 3,
                        py: 5,
                        textAlign: "center",
                      }}
                    >
                      <Typography
                        sx={{
                          fontSize: 20,
                          fontWeight: 800,
                          color: "text.primary",
                        }}
                      >
                        No hay proveedores registrados
                      </Typography>

                      <Typography
                        sx={{
                          mt: 1,
                          color: "text.secondary",
                          fontSize: 14,
                        }}
                      >
                        Crea tu primer proveedor para comenzar a asignarlo a presentaciones.
                      </Typography>

                      <Button
                        onClick={openCreate}
                        variant="contained"
                        startIcon={<AddIcon />}
                        sx={{
                          mt: 2.5,
                          minWidth: 220,
                          height: 44,
                          borderRadius: 2,
                          fontWeight: 800,
                        }}
                      >
                        Nuevo proveedor
                      </Button>
                    </Box>
                  ) : (
                    <>
                      {isMobile ? (
                        <Stack spacing={1.5} sx={{ p: 2 }}>
                          {paginatedItems.map((r) => {
                            const active = r.status === "active";
                            const busy = isSaving(r.id);

                            return (
                              <Card
                                key={r.id}
                                sx={{
                                  borderRadius: 1,
                                  boxShadow: "none",
                                  border: "1px solid",
                                  borderColor: "divider",
                                  backgroundColor: "#fff",
                                }}
                              >
                                <Box sx={{ p: 2 }}>
                                  <Stack spacing={1.5}>
                                    <Stack
                                      direction="row"
                                      justifyContent="space-between"
                                      alignItems="flex-start"
                                      spacing={1}
                                    >
                                      <Box sx={{ minWidth: 0 }}>
                                        <Typography
                                          sx={{
                                            fontSize: 15,
                                            fontWeight: 800,
                                            color: "text.primary",
                                            lineHeight: 1.3,
                                            wordBreak: "break-word",
                                          }}
                                        >
                                          {r.name}
                                        </Typography>

                                        <Typography
                                          sx={{
                                            mt: 0.5,
                                            fontSize: 13,
                                            color: "text.secondary",
                                            wordBreak: "break-word",
                                          }}
                                        >
                                          {r.phone || "Sin teléfono"}
                                        </Typography>
                                      </Box>
                                    </Stack>

                                    <Stack spacing={1.25}>
                                      <Box
                                        sx={{
                                          display: "flex",
                                          alignItems: "center",
                                          justifyContent: "flex-start",
                                          minWidth: 0,
                                        }}
                                      >
                                        <FormControlLabel
                                          sx={{
                                            m: 0,
                                            minWidth: 0,
                                            "& .MuiFormControlLabel-label": {
                                              minWidth: 0,
                                            },
                                          }}
                                          control={
                                            <Switch
                                              checked={active}
                                              onChange={() => handleToggleStatus(r)}
                                              disabled={busy}
                                              color="primary"
                                            />
                                          }
                                          label={
                                            <Typography sx={switchLabelSx}>
                                              {active ? "Activo" : "Inactivo"}
                                            </Typography>
                                          }
                                        />
                                      </Box>

                                      <Stack
                                        direction="row"
                                        spacing={1}
                                        justifyContent="space-between"
                                      >
                                        <Tooltip title="Editar">
                                          <IconButton
                                            onClick={() => openEdit(r)}
                                            sx={iconEditSx}
                                          >
                                            <EditIcon fontSize="small" />
                                          </IconButton>
                                        </Tooltip>

                                        <Tooltip title="Eliminar">
                                          <IconButton
                                            onClick={() => remove(r)}
                                            sx={iconDeleteSx}
                                          >
                                            <DeleteOutlineIcon fontSize="small" />
                                          </IconButton>
                                        </Tooltip>
                                      </Stack>
                                    </Stack>
                                  </Stack>
                                </Box>
                              </Card>
                            );
                          })}
                        </Stack>
                      ) : (
                        <TableContainer sx={{ width: "100%", overflowX: "auto" }}>
                          <Table sx={{ minWidth: 820 }}>
                            <TableHead>
                              <TableRow
                                sx={{
                                  "& th": {
                                    backgroundColor: "primary.main",
                                    color: "#fff",
                                    fontWeight: 800,
                                    fontSize: 13,
                                    borderBottom: "none",
                                    whiteSpace: "nowrap",
                                  },
                                }}
                              >
                                <TableCell>Nombre</TableCell>
                                <TableCell>Teléfono</TableCell>
                                <TableCell align="center">Estado</TableCell>
                                <TableCell align="right">Acciones</TableCell>
                              </TableRow>
                            </TableHead>

                            <TableBody>
                              {paginatedItems.map((r) => {
                                const active = r.status === "active";
                                const busy = isSaving(r.id);

                                return (
                                  <TableRow
                                    key={r.id}
                                    hover
                                    sx={{
                                      "& td": {
                                        borderBottom: "1px solid",
                                        borderColor: "divider",
                                        fontSize: 14,
                                        color: "text.primary",
                                        whiteSpace: "nowrap",
                                      },
                                    }}
                                  >
                                    <TableCell>
                                      <Typography sx={{ fontWeight: 800 }}>
                                        {r.name}
                                      </Typography>
                                    </TableCell>

                                    <TableCell>{r.phone || "—"}</TableCell>

                                    <TableCell align="center">
                                      <FormControlLabel
                                        sx={{ m: 0 }}
                                        control={
                                          <Switch
                                            checked={active}
                                            onChange={() => handleToggleStatus(r)}
                                            disabled={busy}
                                            color="primary"
                                          />
                                        }
                                        label={
                                          <Typography sx={switchLabelSx}>
                                            {active ? "Activo" : "Inactivo"}
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
                                        flexWrap="nowrap"
                                      >
                                        <Tooltip title="Editar">
                                          <IconButton
                                            onClick={() => openEdit(r)}
                                            sx={iconEditSx}
                                          >
                                            <EditIcon fontSize="small" />
                                          </IconButton>
                                        </Tooltip>

                                        <Tooltip title="Eliminar">
                                          <IconButton
                                            onClick={() => remove(r)}
                                            sx={iconDeleteSx}
                                          >
                                            <DeleteOutlineIcon fontSize="small" />
                                          </IconButton>
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
                        itemLabel="proveedores"
                      />
                    </>
                  )}
                </Paper>
              </Stack>
            </CardContent>
          </Card>
        </DialogContent>
      </Dialog>

      <SupplierUpsertModal
        open={upsertOpen}
        onClose={() => setUpsertOpen(false)}
        restaurantId={restaurantId}
        editing={editing}
        onSaved={async () => {
          setUpsertOpen(false);
          setEditing(null);
          setReqTick((prev) => prev + 1);
          await onChanged?.();
        }}
        api={{
          createSupplier,
          updateSupplier,
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