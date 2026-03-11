import { useEffect, useMemo, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import {
  Alert, Box, Button, Card, Chip, CircularProgress, IconButton, Paper, Stack, Table,
  TableBody, TableCell, TableContainer, TableHead, TableRow, Tooltip, Typography, useMediaQuery,
} from "@mui/material";
import { useTheme } from "@mui/material/styles";

import ArrowBackIcon from "@mui/icons-material/ArrowBack";
import AddIcon from "@mui/icons-material/Add";
import EditIcon from "@mui/icons-material/Edit";
import DeleteOutlineIcon from "@mui/icons-material/DeleteOutline";
import PowerSettingsNewIcon from "@mui/icons-material/PowerSettingsNew";
import LockOutlineIcon from "@mui/icons-material/LockOutline";

import {
  createSalesChannel,
  deleteSalesChannel,
  getSalesChannels,
  updateSalesChannel,
} from "../../services/products/sales_channels/sales_channels.service";

import usePagination from "../../hooks/usePagination";
import PaginationFooter from "../../components/common/PaginationFooter";
import SalesChannelUpsertModal from "../../components/sales_channels/SalesChannelUpsertModal";

const STATUS_OPTIONS = [
  { value: "active", label: "Activo" },
  { value: "inactive", label: "Inactivo" },
];

const PAGE_SIZE = 5;
const SALON_CODE = "SALON";

function normalizeCode(v) {
  return (v || "")
    .toString()
    .trim()
    .toUpperCase()
    .replace(/\s+/g, "_")
    .replace(/[^A-Z0-9_]/g, "");
}

function isSalonChannel(it) {
  const code = normalizeCode(it?.code);
  return code === SALON_CODE;
}

export default function SalesChannelsPage() {
  const nav = useNavigate();
  const { restaurantId } = useParams();
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down("sm"));

  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [err, setErr] = useState("");
  const [modalErr, setModalErr] = useState("");

  const [items, setItems] = useState([]);

  const [open, setOpen] = useState(false);
  const [editing, setEditing] = useState(null);

  const [form, setForm] = useState({
    code: "",
    name: "",
    status: "active",
  });

  const title = useMemo(() => "Canales de venta del restaurante", []);

  const {
    page,
    setPage,
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
    items,
    initialPage: 1,
    pageSize: PAGE_SIZE,
    mode: "frontend",
  });

  const load = async () => {
    setErr("");
    setLoading(true);
    try {
      const res = await getSalesChannels(restaurantId);
      const list = Array.isArray(res) ? res : res?.data ?? [];
      setItems(list);
      setPage(1);
    } catch (e) {
      setErr(e?.response?.data?.message || "No se pudieron cargar los canales");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    load();
  }, [restaurantId]);

  const openCreate = () => {
    setErr("");
    setModalErr("");
    setEditing(null);
    setForm({ code: "", name: "", status: "active" });
    setOpen(true);
  };

  const openEdit = (it) => {
    if (isSalonChannel(it)) {
      setErr('El canal "Salón" es fijo y no puede editarse.');
      return;
    }

    setErr("");
    setModalErr("");
    setEditing(it);
    setForm({
      code: it.code ?? "",
      name: it.name ?? "",
      status: it.status ?? "active",
    });
    setOpen(true);
  };

  const closeModal = () => {
    if (saving) return;
    setOpen(false);
    setEditing(null);
    setModalErr("");
  };

  const onChange = (key, value) => {
    setModalErr("");
    setForm((prev) => ({ ...prev, [key]: value }));
  };

  const onSubmit = async () => {
    setModalErr("");

    if (editing?.id && isSalonChannel(editing)) {
      setModalErr('El canal "Salón" es fijo y no puede modificarse.');
      return;
    }

    const payload = {
      code: normalizeCode(form.code),
      name: (form.name || "").trim(),
      status: form.status,
    };

    if (!payload.code) {
      setModalErr("El code es obligatorio. Ej: COMEDOR, DELIVERY, PICKUP");
      return;
    }

    if (!payload.name) {
      setModalErr("El nombre es obligatorio. Ej: Comedor, Delivery");
      return;
    }

    if (!editing?.id && payload.code === SALON_CODE) {
      setModalErr('El code "SALON" está reservado y se crea automáticamente.');
      return;
    }

    setSaving(true);
    try {
      if (editing?.id) {
        await updateSalesChannel(restaurantId, editing.id, payload);
      } else {
        await createSalesChannel(restaurantId, payload);
      }

      setOpen(false);
      setEditing(null);
      setModalErr("");
      await load();
    } catch (e) {
      setModalErr(e?.response?.data?.message || "No se pudo guardar el canal");
    } finally {
      setSaving(false);
    }
  };

  const onToggleStatus = async (it) => {
    if (isSalonChannel(it)) {
      setErr('El canal "Salón" es fijo y no puede desactivarse.');
      return;
    }

    setErr("");
    setSaving(true);
    try {
      const next = it.status === "active" ? "inactive" : "active";
      await updateSalesChannel(restaurantId, it.id, { status: next });
      await load();
    } catch (e) {
      setErr(e?.response?.data?.message || "No se pudo cambiar el estado");
    } finally {
      setSaving(false);
    }
  };

  const onDelete = async (it) => {
    if (isSalonChannel(it)) {
      setErr('El canal "Salón" es fijo y no puede eliminarse.');
      return;
    }

    const ok = window.confirm(`¿Eliminar canal "${it.name}"?`);
    if (!ok) return;

    setErr("");
    setSaving(true);
    try {
      await deleteSalesChannel(restaurantId, it.id);
      await load();
    } catch (e) {
      setErr(e?.response?.data?.message || "No se pudo eliminar el canal");
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <Box
        sx={{
          minHeight: "60vh",
          display: "grid",
          placeItems: "center",
          px: { xs: 2, sm: 3, md: 4 },
        }}
      >
        <Stack spacing={2} alignItems="center">
          <CircularProgress color="primary" />
          <Typography sx={{ color: "text.secondary", fontSize: 14 }}>
            Cargando canales…
          </Typography>
        </Stack>
      </Box>
    );
  }

  return (
    <Box
      sx={{
        px: { xs: 2, sm: 3, md: 4 },
        py: { xs: 8, md: 4 },
      }}
    >
      <Box sx={{ maxWidth: 1100, mx: "auto" }}>
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
                {title}
              </Typography>

              <Typography
                sx={{
                  mt: 1,
                  color: "text.secondary",
                  fontSize: { xs: 15, md: 18 },
                }}
              >
                Aquí defines los canales posibles del restaurante, sin sucursales ni productos.
              </Typography>
            </Box>

            <Stack
              direction={{ xs: "column-reverse", sm: "row" }}
              spacing={1.5}
              width={{ xs: "100%", md: "auto" }}
            >
              <Button
                onClick={() => nav(`/owner/restaurants/${restaurantId}/settings`)}
                variant="outlined"
                startIcon={<ArrowBackIcon />}
                sx={{
                  minWidth: { xs: "100%", sm: 150 },
                  height: 44,
                  borderRadius: 2,
                }}
              >
                Volver
              </Button>

              <Button
                onClick={openCreate}
                variant="contained"
                startIcon={<AddIcon />}
                sx={{
                  minWidth: { xs: "100%", sm: 180 },
                  height: 44,
                  borderRadius: 2,
                  fontWeight: 800,
                }}
              >
                Crear canal
              </Button>
            </Stack>
          </Stack>

          {err && (
            <Alert
              severity="error"
              sx={{
                borderRadius: 1,
                alignItems: "flex-start",
              }}
            >
              <Box>
                <Typography sx={{ fontWeight: 800, mb: 0.5 }}>
                  Error
                </Typography>
                <Typography variant="body2">{err}</Typography>
              </Box>
            </Alert>
          )}

          <Paper
            sx={{
              p: 0,
              overflow: "hidden",
              borderRadius: 0,
              backgroundColor: "background.paper",
            }}
          >
            {items.length === 0 ? (
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
                  No hay canales registrados
                </Typography>

                <Typography
                  sx={{
                    mt: 1,
                    color: "text.secondary",
                    fontSize: 14,
                  }}
                >
                  Crea el primero. Por ejemplo: COMEDOR, DELIVERY o PICKUP.
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
                  Crear canal
                </Button>
              </Box>
            ) : (
              <>
                {isMobile ? (
                  <Stack spacing={1.5} sx={{ p: 2 }}>
                    {paginatedItems.map((it) => {
                      const active = it.status === "active";
                      const locked = isSalonChannel(it);

                      return (
                        <Card
                          key={it.id}
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
                                    {it.name}
                                  </Typography>

                                  <Typography
                                    sx={{
                                      mt: 0.5,
                                      fontSize: 13,
                                      color: "text.secondary",
                                      fontFamily: "monospace",
                                      wordBreak: "break-word",
                                    }}
                                  >
                                    {it.code}
                                  </Typography>
                                </Box>

                                <Stack spacing={0.75} alignItems="flex-end">
                                  <Chip
                                    label={active ? "ACTIVO" : "INACTIVO"}
                                    color={active ? "success" : "default"}
                                    size="small"
                                    sx={{ fontWeight: 800 }}
                                  />

                                  {locked && (
                                    <Chip
                                      label="FIJO"
                                      size="small"
                                      icon={<LockOutlineIcon />}
                                      sx={{
                                        fontWeight: 800,
                                        bgcolor: "#EEF2FF",
                                        color: "#3F3A52",
                                      }}
                                    />
                                  )}
                                </Stack>
                              </Stack>

                              <Stack
                                direction="row"
                                spacing={1}
                                justifyContent="flex-end"
                                alignItems="center"
                              >
                                <Tooltip
                                  title={
                                    locked
                                      ? 'El canal "Salón" no se puede desactivar'
                                      : active
                                      ? "Desactivar"
                                      : "Activar"
                                  }
                                >
                                  <span>
                                    <IconButton
                                      onClick={() => onToggleStatus(it)}
                                      disabled={saving || locked}
                                      sx={{
                                        width: 40,
                                        height: 40,
                                        bgcolor: active ? "#D67A3A" : "success.main",
                                        color: "#fff",
                                        borderRadius: 1.5,
                                        "&:hover": {
                                          bgcolor: active ? "#B96328" : "success.dark",
                                        },
                                      }}
                                    >
                                      <PowerSettingsNewIcon fontSize="small" />
                                    </IconButton>
                                  </span>
                                </Tooltip>

                                <Tooltip
                                  title={
                                    locked
                                      ? 'El canal "Salón" no se puede editar'
                                      : "Editar"
                                  }
                                >
                                  <span>
                                    <IconButton
                                      onClick={() => openEdit(it)}
                                      disabled={saving || locked}
                                      sx={iconEditSx}
                                    >
                                      <EditIcon fontSize="small" />
                                    </IconButton>
                                  </span>
                                </Tooltip>

                                <Tooltip
                                  title={
                                    locked
                                      ? 'El canal "Salón" no se puede eliminar'
                                      : "Eliminar"
                                  }
                                >
                                  <span>
                                    <IconButton
                                      onClick={() => onDelete(it)}
                                      disabled={saving || locked}
                                      sx={iconDeleteSx}
                                    >
                                      <DeleteOutlineIcon fontSize="small" />
                                    </IconButton>
                                  </span>
                                </Tooltip>
                              </Stack>
                            </Stack>
                          </Box>
                        </Card>
                      );
                    })}
                  </Stack>
                ) : (
                  <TableContainer sx={{ width: "100%", overflowX: "auto", borderRadius: 0 }}>
                    <Table sx={{ minWidth: 900 }}>
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
                          <TableCell>Code</TableCell>
                          <TableCell>Nombre</TableCell>
                          <TableCell>Estado</TableCell>
                          <TableCell align="right">Acciones</TableCell>
                        </TableRow>
                      </TableHead>

                      <TableBody>
                        {paginatedItems.map((it) => {
                          const active = it.status === "active";
                          const locked = isSalonChannel(it);

                          return (
                            <TableRow
                              key={it.id}
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
                              <TableCell
                                sx={{
                                  fontFamily: "monospace",
                                  fontWeight: 800,
                                }}
                              >
                                {it.code}
                              </TableCell>

                              <TableCell>
                                <Stack direction="row" spacing={1} alignItems="center">
                                  <Typography sx={{ fontWeight: 700 }}>
                                    {it.name}
                                  </Typography>

                                  {locked && (
                                    <Chip
                                      label="FIJO"
                                      size="small"
                                      icon={<LockOutlineIcon />}
                                      sx={{
                                        fontWeight: 800,
                                        bgcolor: "#EEF2FF",
                                        color: "#3F3A52",
                                      }}
                                    />
                                  )}
                                </Stack>
                              </TableCell>

                              <TableCell>
                                <Chip
                                  label={active ? "ACTIVO" : "INACTIVO"}
                                  color={active ? "success" : "default"}
                                  size="small"
                                  sx={{
                                    fontWeight: 800,
                                    minWidth: 90,
                                  }}
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
                                  <Tooltip
                                    title={
                                      locked
                                        ? 'El canal "Salón" no se puede desactivar'
                                        : active
                                        ? "Desactivar"
                                        : "Activar"
                                    }
                                  >
                                    <span>
                                      <IconButton
                                        onClick={() => onToggleStatus(it)}
                                        disabled={saving || locked}
                                        sx={{
                                          width: 36,
                                          height: 36,
                                          bgcolor: active ? "#D67A3A" : "success.main",
                                          color: "#fff",
                                          borderRadius: 1.5,
                                          "&:hover": {
                                            bgcolor: active ? "#B96328" : "success.dark",
                                          },
                                        }}
                                      >
                                        <PowerSettingsNewIcon fontSize="small" />
                                      </IconButton>
                                    </span>
                                  </Tooltip>

                                  <Tooltip
                                    title={
                                      locked
                                        ? 'El canal "Salón" no se puede editar'
                                        : "Editar"
                                    }
                                  >
                                    <span>
                                      <IconButton
                                        onClick={() => openEdit(it)}
                                        disabled={saving || locked}
                                        sx={iconEditSx}
                                      >
                                        <EditIcon fontSize="small" />
                                      </IconButton>
                                    </span>
                                  </Tooltip>

                                  <Tooltip
                                    title={
                                      locked
                                        ? 'El canal "Salón" no se puede eliminar'
                                        : "Eliminar"
                                    }
                                  >
                                    <span>
                                      <IconButton
                                        onClick={() => onDelete(it)}
                                        disabled={saving || locked}
                                        sx={iconDeleteSx}
                                      >
                                        <DeleteOutlineIcon fontSize="small" />
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
                  itemLabel="canales"
                />
              </>
            )}
          </Paper>
        </Stack>
      </Box>

      <SalesChannelUpsertModal
        open={open}
        onClose={closeModal}
        onSubmit={onSubmit}
        onChange={onChange}
        form={form}
        saving={saving}
        editing={editing}
        statusOptions={STATUS_OPTIONS}
        errorMessage={modalErr}
      />
    </Box>
  );
}

const iconEditSx = {
  width: 36,
  height: 36,
  bgcolor: "#E3C24A",
  color: "#fff",
  borderRadius: 1.5,
  "&:hover": {
    bgcolor: "#C9AA39",
  },
};

const iconDeleteSx = {
  width: 36,
  height: 36,
  bgcolor: "error.main",
  color: "#fff",
  borderRadius: 1.5,
  "&:hover": {
    bgcolor: "error.dark",
  },
};