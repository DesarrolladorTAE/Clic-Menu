import { useEffect, useMemo, useState } from "react";
import { useParams } from "react-router-dom";
import {
  Box, Button, Card, Chip, FormControlLabel, IconButton, Paper,  Stack, Switch, Table, TableBody, TableCell, TableContainer,
  TableHead,TableRow, Tooltip, Typography, useMediaQuery, CircularProgress,
} from "@mui/material";
import { useTheme } from "@mui/material/styles";

import AddIcon from "@mui/icons-material/Add";
import EditIcon from "@mui/icons-material/Edit";
import DeleteOutlineIcon from "@mui/icons-material/DeleteOutline";
import PointOfSaleIcon from "@mui/icons-material/PointOfSale";

import PageContainer from "../../components/common/PageContainer";
import AppAlert from "../../components/common/AppAlert";
import PaginationFooter from "../../components/common/PaginationFooter";
import usePagination from "../../hooks/usePagination";

import CashRegisterUpsertModal from "../../components/staff/CashRegisterUpsertModal";

import { getBranchesByRestaurant } from "../../services/restaurant/branch.service";
import {
  getCashRegisters,
  createCashRegister,
  updateCashRegister,
  deleteCashRegister,
} from "../../services/staff/cashRegisters.service";

const PAGE_SIZE = 5;

export default function CashRegistersPage() {
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down("sm"));
  const { restaurantId } = useParams();

  const [loading, setLoading] = useState(true);
  const [branches, setBranches] = useState([]);
  const [cashRegisters, setCashRegisters] = useState([]);

  const [savingMap, setSavingMap] = useState({});
  const [modalOpen, setModalOpen] = useState(false);
  const [editing, setEditing] = useState(null);

  const [alertState, setAlertState] = useState({
    open: false,
    severity: "error",
    title: "",
    message: "",
  });

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

  const setSaving = (cashRegisterId, value) => {
    setSavingMap((prev) => ({ ...prev, [cashRegisterId]: value }));
  };

  const isSaving = (cashRegisterId) => !!savingMap[cashRegisterId];

  const branchNameById = useMemo(() => {
    const map = {};
    branches.forEach((branch) => {
      map[branch.id] = branch.name;
    });
    return map;
  }, [branches]);

  const sortedRegisters = useMemo(() => {
    return [...cashRegisters].sort((a, b) => {
      const aBranch = branchNameById[a.branch_id] || a?.branch?.name || "";
      const bBranch = branchNameById[b.branch_id] || b?.branch?.name || "";

      const byBranch = aBranch.localeCompare(bBranch, "es", {
        sensitivity: "base",
      });
      if (byBranch !== 0) return byBranch;

      return (a.name || "").localeCompare(b.name || "", "es", {
        sensitivity: "base",
      });
    });
  }, [cashRegisters, branchNameById]);

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
    items: sortedRegisters,
    initialPage: 1,
    pageSize: PAGE_SIZE,
    mode: "frontend",
  });

  const loadAll = async () => {
    setLoading(true);

    try {
      const [branchRows, registerRows] = await Promise.all([
        getBranchesByRestaurant(restaurantId),
        getCashRegisters(restaurantId),
      ]);

      setBranches(Array.isArray(branchRows) ? branchRows : []);
      setCashRegisters(Array.isArray(registerRows) ? registerRows : []);
    } catch (e) {
      showAlert({
        severity: "error",
        title: "Error",
        message:
          e?.response?.data?.message ||
          "No se pudo cargar la información de cajas",
      });
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadAll();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [restaurantId]);

  const openCreate = () => {
    setEditing(null);
    setModalOpen(true);
  };

  const openEdit = (row) => {
    setEditing(row);
    setModalOpen(true);
  };

  const handleSaved = async (savedItem, mode) => {
    setModalOpen(false);
    setEditing(null);

    if (!savedItem?.id) {
      await loadAll();
      return;
    }

    setCashRegisters((prev) => {
      if (mode === "create") {
        return [...prev, savedItem];
      }

      return prev.map((row) =>
        Number(row.id) === Number(savedItem.id) ? { ...row, ...savedItem } : row
      );
    });

    showAlert({
      severity: "success",
      title: "Hecho",
      message:
        mode === "create"
          ? "Caja creada correctamente."
          : "Caja actualizada correctamente.",
    });
  };

  const onToggleStatus = async (row) => {
    const cashRegisterId = row?.id;
    if (!cashRegisterId || isSaving(cashRegisterId)) return;

    const nextStatus = row.status === "active" ? "inactive" : "active";

    setSaving(cashRegisterId, true);

    const previousRows = cashRegisters;

    setCashRegisters((prev) =>
      prev.map((item) =>
        Number(item.id) === Number(cashRegisterId)
          ? { ...item, status: nextStatus }
          : item
      )
    );

    try {
      const updated = await updateCashRegister(restaurantId, cashRegisterId, {
        name: row.name,
        code: row.code || null,
        status: nextStatus,
      });

      setCashRegisters((prev) =>
        prev.map((item) =>
          Number(item.id) === Number(cashRegisterId)
            ? { ...item, ...updated }
            : item
        )
      );

      showAlert({
        severity: "success",
        title: "Hecho",
        message:
          nextStatus === "active"
            ? "Caja activada correctamente."
            : "Caja desactivada correctamente.",
      });
    } catch (e) {
      setCashRegisters(previousRows);

      const errors = e?.response?.data?.errors;
      const firstError =
        errors && typeof errors === "object"
          ? Object.values(errors)?.flat()?.[0]
          : null;

      showAlert({
        severity: "error",
        title: "Error",
        message:
          firstError ||
          e?.response?.data?.message ||
          "No se pudo actualizar el estado de la caja",
      });
    } finally {
      setSaving(cashRegisterId, false);
    }
  };

  const onDelete = async (row) => {
    const ok = window.confirm("¿Eliminar esta caja?");
    if (!ok) return;

    try {
      await deleteCashRegister(restaurantId, row.id);

      setCashRegisters((prev) =>
        prev.filter((item) => Number(item.id) !== Number(row.id))
      );

      showAlert({
        severity: "success",
        title: "Hecho",
        message: "Caja eliminada correctamente.",
      });
    } catch (e) {
      showAlert({
        severity: "error",
        title: "Error",
        message:
          e?.response?.data?.message || "No se pudo eliminar la caja",
      });
    }
  };

  if (loading) {
    return (
      <PageContainer>
        <Box
          sx={{
            minHeight: "60vh",
            display: "grid",
            placeItems: "center",
          }}
        >
          <Stack spacing={2} alignItems="center">
            <CircularProgress color="primary" />
            <Typography sx={{ color: "text.secondary", fontSize: 14 }}>
              Cargando cajas…
            </Typography>
          </Stack>
        </Box>
      </PageContainer>
    );
  }

  return (
    <PageContainer>
      <Stack spacing={3}>
        <Stack
          direction={{ xs: "column", md: "row" }}
          justifyContent="space-between"
          alignItems={{ xs: "flex-start", md: "center" }}
          spacing={2}
        >
          <Box>
            <Typography
              sx={{
                fontSize: { xs: 30, md: 42 },
                fontWeight: 800,
                color: "text.primary",
                lineHeight: 1.1,
              }}
            >
              Cajas del restaurante
            </Typography>

            <Typography
              sx={{
                mt: 1,
                color: "text.secondary",
                fontSize: { xs: 14, md: 17 },
              }}
            >
              Administra las cajas disponibles para el proceso de cobro por
              sucursal.
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
            Nueva caja
          </Button>
        </Stack>

        <Paper
          sx={{
            p: { xs: 2, sm: 2.5 },
            borderRadius: 1,
            backgroundColor: "background.paper",
            border: "1px solid",
            borderColor: "divider",
            boxShadow: "none",
          }}
        >
          <Stack spacing={1.25}>
            <Typography
              sx={{
                fontSize: 16,
                fontWeight: 800,
                color: "text.primary",
              }}
            >
              Antes de comenzar
            </Typography>

            <InstructionRow
              step="1"
              text="Crea una caja por cada punto de cobro que necesites manejar dentro de tus sucursales."
            />

            <InstructionRow
              step="2"
              text="Activa o desactiva cajas desde esta misma pantalla sin salir ni recargar manualmente."
            />

            <InstructionRow
              step="3"
              text="Si una caja tiene sesión abierta, no se puede eliminar para proteger el flujo de cobro."
            />
          </Stack>
        </Paper>

        <Paper
          sx={{
            p: 0,
            overflow: "hidden",
            borderRadius: 0,
            backgroundColor: "background.paper",
            border: "1px solid",
            borderColor: "divider",
            boxShadow: "none",
          }}
        >
          <Box
            sx={{
              px: 2,
              py: 1.75,
              borderBottom: "1px solid",
              borderColor: "divider",
              display: "flex",
              justifyContent: "space-between",
              alignItems: "center",
              gap: 2,
              flexWrap: "wrap",
            }}
          >
            <Typography
              sx={{
                fontSize: 18,
                fontWeight: 800,
                color: "text.primary",
              }}
            >
              Lista de cajas
            </Typography>

            <Chip
              icon={<PointOfSaleIcon />}
              label={`${total} caja${total === 1 ? "" : "s"}`}
              sx={{
                fontWeight: 800,
                bgcolor: "#FFF3E0",
                color: "#A75A00",
              }}
            />
          </Box>

          {sortedRegisters.length === 0 ? (
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
                No hay cajas registradas
              </Typography>

              <Typography
                sx={{
                  mt: 1,
                  color: "text.secondary",
                  fontSize: 14,
                }}
              >
                Crea tu primera caja para comenzar a organizar el proceso de
                cobro.
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
                Nueva caja
              </Button>
            </Box>
          ) : (
            <>
              {isMobile ? (
                <Stack spacing={1.5} sx={{ p: 2 }}>
                  {paginatedItems.map((row) => {
                    const active = row.status === "active";
                    const busy = isSaving(row.id);
                    const branchLabel =
                      branchNameById[row.branch_id] ||
                      row?.branch?.name ||
                      "Sucursal no disponible";

                    const activeSession = row?.active_session || row?.activeSession || null;
                    const activeUser =
                      activeSession?.user
                        ? [
                            activeSession.user.name,
                            activeSession.user.last_name_paternal,
                            activeSession.user.last_name_maternal,
                          ]
                            .filter(Boolean)
                            .join(" ")
                        : null;

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
                                  {row.name}
                                </Typography>

                                <Typography
                                  sx={{
                                    mt: 0.5,
                                    fontSize: 13,
                                    color: "text.secondary",
                                    wordBreak: "break-word",
                                  }}
                                >
                                  {row.code || "Sin código"}
                                </Typography>
                              </Box>

                              <Chip
                                label={branchLabel}
                                size="small"
                                sx={{
                                  fontWeight: 800,
                                  bgcolor: "#FFF3E0",
                                  color: "#A75A00",
                                }}
                              />
                            </Stack>

                            <Box>
                              <Typography sx={mobileLabelSx}>
                                Sesión actual
                              </Typography>
                              <Typography sx={mobileValueSx}>
                                {activeSession
                                  ? `Abierta por ${activeUser || "usuario no disponible"}`
                                  : "Sin sesión abierta"}
                              </Typography>
                            </Box>

                            <Box
                              sx={{
                                display: "flex",
                                alignItems: "center",
                                justifyContent: "space-between",
                                gap: 1,
                                flexWrap: "wrap",
                              }}
                            >
                              <FormControlLabel
                                sx={{ m: 0 }}
                                control={
                                  <Switch
                                    checked={active}
                                    onChange={() => onToggleStatus(row)}
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

                              <Stack direction="row" spacing={1}>
                                <Tooltip title="Editar">
                                  <IconButton
                                    onClick={() => openEdit(row)}
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
                            </Box>
                          </Stack>
                        </Box>
                      </Card>
                    );
                  })}
                </Stack>
              ) : (
                <TableContainer sx={{ width: "100%", overflowX: "auto" }}>
                  <Table sx={{ minWidth: 1100 }}>
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
                        <TableCell>Código</TableCell>
                        <TableCell>Sucursal</TableCell>
                        <TableCell>Sesión actual</TableCell>
                        <TableCell align="center">Estado</TableCell>
                        <TableCell align="right">Acciones</TableCell>
                      </TableRow>
                    </TableHead>

                    <TableBody>
                      {paginatedItems.map((row) => {
                        const active = row.status === "active";
                        const busy = isSaving(row.id);
                        const branchLabel =
                          branchNameById[row.branch_id] ||
                          row?.branch?.name ||
                          "Sucursal no disponible";

                        const activeSession = row?.active_session || row?.activeSession || null;
                        const activeUser =
                          activeSession?.user
                            ? [
                                activeSession.user.name,
                                activeSession.user.last_name_paternal,
                                activeSession.user.last_name_maternal,
                              ]
                                .filter(Boolean)
                                .join(" ")
                            : null;

                        return (
                          <TableRow
                            key={row.id}
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
                                {row.name}
                              </Typography>
                            </TableCell>

                            <TableCell>{row.code || "—"}</TableCell>

                            <TableCell>{branchLabel}</TableCell>

                            <TableCell
                              sx={{
                                whiteSpace: "normal !important",
                                minWidth: 260,
                              }}
                            >
                              {activeSession ? (
                                <Typography sx={{ fontWeight: 700 }}>
                                  {`Abierta por ${activeUser || "usuario no disponible"}`}
                                </Typography>
                              ) : (
                                "Sin sesión abierta"
                              )}
                            </TableCell>

                            <TableCell align="center">
                              <FormControlLabel
                                sx={{ m: 0 }}
                                control={
                                  <Switch
                                    checked={active}
                                    onChange={() => onToggleStatus(row)}
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
                                    onClick={() => openEdit(row)}
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
                itemLabel="cajas"
              />
            </>
          )}
        </Paper>
      </Stack>

      <CashRegisterUpsertModal
        open={modalOpen}
        onClose={() => setModalOpen(false)}
        restaurantId={restaurantId}
        branches={branches}
        editing={editing}
        onSaved={handleSaved}
        api={{
          createCashRegister,
          updateCashRegister,
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
    </PageContainer>
  );
}

function InstructionRow({ step, text }) {
  return (
    <Stack direction="row" spacing={1.25} alignItems="flex-start">
      <Box
        sx={{
          minWidth: 28,
          height: 28,
          borderRadius: 999,
          bgcolor: "primary.main",
          color: "#fff",
          display: "grid",
          placeItems: "center",
          fontSize: 13,
          fontWeight: 800,
        }}
      >
        {step}
      </Box>

      <Typography
        sx={{
          fontSize: 14,
          color: "text.primary",
          lineHeight: 1.6,
        }}
      >
        {text}
      </Typography>
    </Stack>
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

const mobileValueSx = {
  mt: 0.25,
  fontSize: 14,
  color: "text.primary",
  wordBreak: "break-word",
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