import { useEffect, useMemo, useState } from "react";
import {
  Box,
  Button,
  Checkbox,
  Chip,
  Dialog,
  DialogContent,
  DialogTitle,
  FormControl,
  IconButton,
  InputLabel,
  MenuItem,
  Paper,
  Select,
  Stack,
  Typography,
  useMediaQuery,
} from "@mui/material";

import { useTheme } from "@mui/material/styles";

import CloseIcon from "@mui/icons-material/Close";
import DownloadIcon from "@mui/icons-material/Download";
import QrCode2RoundedIcon from "@mui/icons-material/QrCode2Rounded";
import TableRestaurantRoundedIcon from "@mui/icons-material/TableRestaurantRounded";
import CropFreeRoundedIcon from "@mui/icons-material/CropFreeRounded";

import PaginationFooter from "../../common/PaginationFooter";
import AppAlert from "../../common/AppAlert";

import { exportBranchQrCodesPdf } from "../../../services/floor/qr/branchQrCodes.service";

const TYPE_LABEL = {
  physical: "Físico",
  web: "Web",
  delivery: "Delivery",
};

const TYPE_COLORS = {
  physical: {
    bgcolor: "#EAF1FF",
    color: "#1D4ED8",
    borderColor: "#BFDBFE",
  },
  web: {
    bgcolor: "#ECFDF5",
    color: "#047857",
    borderColor: "#A7F3D0",
  },
  delivery: {
    bgcolor: "#FFF7ED",
    color: "#C2410C",
    borderColor: "#FED7AA",
  },
};

const LAYOUT_OPTIONS = [
  {
    value: "grid_6",
    title: "Normal para mesas",
    subtitle: "6 QRs por hoja · A4 horizontal",
    description:
      "Recomendado para pegar en mesas, atriles, portamenús o stickers pequeños.",
    icon: <TableRestaurantRoundedIcon />,
  },
  {
    value: "single",
    title: "Grande para pared o cristal",
    subtitle: "1 QR por hoja · A4 vertical",
    description:
      "Recomendado para entrada, mostrador, pared, caja o cristales.",
    icon: <CropFreeRoundedIcon />,
  },
];

function getTypeLabel(type) {
  return TYPE_LABEL[type] || type || "—";
}

function getStatusLabel(qr) {
  return qr?.is_active ? "Activo" : "Inactivo";
}

function getQrTableLabel(qr) {
  return qr?.table?.name || qr?.table_name || "General";
}

function getQrChannelLabel(qr) {
  return (
    qr?.sales_channel?.name ||
    qr?.salesChannel?.name ||
    qr?.channel?.name ||
    qr?.channel_name ||
    "—"
  );
}

export default function BranchQrExportModal({
  open,
  onClose,
  restaurantId,
  branchId,
  items = [],
  busy = false,
}) {
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down("sm"));

  const [loading, setLoading] = useState(false);

  const [alert, setAlert] = useState({
    open: false,
    severity: "error",
    message: "",
  });

  const [filters, setFilters] = useState({
    type: "",
    active: "",
  });

  const [selected, setSelected] = useState([]);
  const [layout, setLayout] = useState("grid_6");

  const pageSize = 5;
  const [page, setPage] = useState(1);

  useEffect(() => {
    if (!open) return;

    setSelected([]);
    setPage(1);
    setFilters({ type: "", active: "" });
    setLayout("grid_6");
    setAlert({
      open: false,
      severity: "error",
      message: "",
    });
  }, [open]);

  const showAlert = (message, severity = "error") => {
    setAlert({ open: true, message, severity });
  };

  const closeAlert = () => {
    setAlert((p) => ({ ...p, open: false }));
  };

  const handleFilterChange = (field, value) => {
    setFilters((prev) => ({
      ...prev,
      [field]: value,
    }));
    setPage(1);
  };

  const filteredItems = useMemo(() => {
    return (items || []).filter((qr) => {
      if (filters.type && qr.type !== filters.type) return false;
      if (filters.active === "active" && !qr.is_active) return false;
      if (filters.active === "inactive" && qr.is_active) return false;
      return true;
    });
  }, [items, filters]);

  const total = filteredItems.length;
  const totalPages = Math.max(1, Math.ceil(total / pageSize));
  const startItem = total === 0 ? 0 : (page - 1) * pageSize + 1;
  const endItem = Math.min(page * pageSize, total);
  const hasPrev = page > 1;
  const hasNext = page < totalPages;

  useEffect(() => {
    if (page > totalPages) {
      setPage(totalPages);
    }
  }, [page, totalPages]);

  const paginatedItems = useMemo(() => {
    const start = (page - 1) * pageSize;
    return filteredItems.slice(start, start + pageSize);
  }, [filteredItems, page]);

  const selectedVisibleCount = useMemo(() => {
    return paginatedItems.filter((qr) => selected.includes(qr.id)).length;
  }, [paginatedItems, selected]);

  const selectedLayout = useMemo(() => {
    return LAYOUT_OPTIONS.find((option) => option.value === layout);
  }, [layout]);

  const toggleSelect = (id) => {
    setSelected((prev) =>
      prev.includes(id)
        ? prev.filter((x) => x !== id)
        : [...prev, id]
    );
  };

  const selectAllVisible = () => {
    const ids = paginatedItems.map((i) => i.id);
    setSelected((prev) => Array.from(new Set([...prev, ...ids])));
  };

  const clearSelection = () => {
    setSelected([]);
  };

  const handlePrev = () => {
    setPage((prev) => Math.max(1, prev - 1));
  };

  const handleNext = () => {
    setPage((prev) => Math.min(totalPages, prev + 1));
  };

  const handleExport = async () => {
    if (selected.length === 0) {
      showAlert("Debes seleccionar al menos un QR", "error");
      return;
    }

    try {
      setLoading(true);

      const payload = {
        layout,
        selected_ids: selected,
        show_text: true,
      };

      const blob = await exportBranchQrCodesPdf(
        restaurantId,
        branchId,
        payload
      );

      const url = window.URL.createObjectURL(new Blob([blob]));
      const link = document.createElement("a");

      link.href = url;
      link.setAttribute("download", "qrs.pdf");
      document.body.appendChild(link);
      link.click();

      link.remove();
      window.URL.revokeObjectURL(url);

      onClose();
    } catch (e) {
      showAlert("Error al generar PDF", "error");
    } finally {
      setLoading(false);
    }
  };

  return (
    <>
      <Box
        sx={{
          position: "fixed",
          top: 12,
          left: 12,
          right: 12,
          zIndex: (theme) => theme.zIndex.modal + 2000,
        }}
      >
        <AppAlert
          open={alert.open}
          onClose={closeAlert}
          severity={alert.severity}
          message={alert.message}
          autoHideDuration={3000}
        />
      </Box>

      <Dialog
        open={open}
        onClose={busy || loading ? undefined : onClose}
        fullWidth
        maxWidth="md"
        fullScreen={isMobile}
        PaperProps={{
          sx: {
            borderRadius: isMobile ? 0 : 1,
            overflow: "hidden",
            bgcolor: "background.default",
          },
        }}
      >
        <DialogTitle
          sx={{
            p: 0,
            bgcolor: "#0F172A",
            color: "#fff",
          }}
        >
          <Box
            sx={{
              px: { xs: 2, sm: 3 },
              py: 2.25,
              display: "flex",
              justifyContent: "space-between",
              alignItems: "center",
              gap: 2,
              background:
                "linear-gradient(135deg, #0F172A 0%, #111827 55%, #1E293B 100%)",
            }}
          >
            <Stack direction="row" spacing={1.5} alignItems="center">
              <Box
                sx={{
                  width: 42,
                  height: 42,
                  borderRadius: 2,
                  display: "grid",
                  placeItems: "center",
                  bgcolor: "rgba(255,255,255,0.10)",
                  border: "1px solid rgba(255,255,255,0.16)",
                }}
              >
                <QrCode2RoundedIcon />
              </Box>

              <Box>
                <Typography
                  sx={{
                    fontSize: { xs: 18, sm: 20 },
                    fontWeight: 900,
                    lineHeight: 1.2,
                  }}
                >
                  Descargar QRs
                </Typography>

                <Typography
                  sx={{
                    mt: 0.35,
                    fontSize: 12.5,
                    color: "rgba(255,255,255,0.72)",
                    fontWeight: 600,
                  }}
                >
                  Selección manual · Exportación en PDF · {selected.length} seleccionado(s)
                </Typography>
              </Box>
            </Stack>

            <IconButton
              onClick={onClose}
              disabled={loading || busy}
              sx={{
                color: "#fff",
                bgcolor: "rgba(255,255,255,0.08)",
                "&:hover": {
                  bgcolor: "rgba(255,255,255,0.14)",
                },
              }}
            >
              <CloseIcon />
            </IconButton>
          </Box>
        </DialogTitle>

        <DialogContent
          sx={{
            p: { xs: 2, sm: 3 },
            bgcolor: "#F8FAFC",
          }}
        >
          <Box sx={{ maxWidth: 1120, mx: "auto" }}>
            <Paper
              sx={{
                p: { xs: 2, sm: 2.5 },
                mb: 2,
                borderRadius: 2.5,
                boxShadow: "none",
                border: "1px solid",
                borderColor: "divider",
                bgcolor: "#fff",
              }}
            >
              <Stack
                direction={{ xs: "column", md: "row" }}
                spacing={2}
                alignItems={{ xs: "stretch", md: "center" }}
                justifyContent="space-between"
              >
                <Box>
                  <Typography
                    sx={{
                      fontSize: 16,
                      fontWeight: 900,
                      color: "text.primary",
                    }}
                  >
                    Filtros
                  </Typography>

                  <Typography
                    sx={{
                      mt: 0.35,
                      fontSize: 13,
                      color: "text.secondary",
                      fontWeight: 600,
                    }}
                  >
                    Refina la lista antes de seleccionar los códigos a descargar.
                  </Typography>
                </Box>

                <Stack
                  direction={{ xs: "column", sm: "row" }}
                  spacing={1.5}
                  sx={{ minWidth: { xs: "100%", md: 440 } }}
                >
                  <FormControl fullWidth size="small">
                    <InputLabel>Tipo</InputLabel>
                    <Select
                      value={filters.type}
                      label="Tipo"
                      onChange={(e) =>
                        handleFilterChange("type", e.target.value)
                      }
                    >
                      <MenuItem value="">Todos</MenuItem>
                      <MenuItem value="physical">Físico</MenuItem>
                      <MenuItem value="web">Web</MenuItem>
                      <MenuItem value="delivery">Delivery</MenuItem>
                    </Select>
                  </FormControl>

                  <FormControl fullWidth size="small">
                    <InputLabel>Estado</InputLabel>
                    <Select
                      value={filters.active}
                      label="Estado"
                      onChange={(e) =>
                        handleFilterChange("active", e.target.value)
                      }
                    >
                      <MenuItem value="">Todos</MenuItem>
                      <MenuItem value="active">Activos</MenuItem>
                      <MenuItem value="inactive">Inactivos</MenuItem>
                    </Select>
                  </FormControl>
                </Stack>
              </Stack>
            </Paper>

            <Paper
              sx={{
                p: { xs: 2, sm: 2.5 },
                mb: 2,
                borderRadius: 2.5,
                boxShadow: "none",
                border: "1px solid",
                borderColor: "divider",
                bgcolor: "#fff",
              }}
            >
              <Stack spacing={2}>
                <Box>
                  <Typography
                    sx={{
                      fontSize: 16,
                      fontWeight: 900,
                      color: "text.primary",
                    }}
                  >
                    Tamaño de impresión
                  </Typography>

                  <Typography
                    sx={{
                      mt: 0.35,
                      fontSize: 13,
                      color: "text.secondary",
                      fontWeight: 600,
                    }}
                  >
                    {selectedLayout?.subtitle || "Selecciona el formato del PDF."}
                  </Typography>
                </Box>

                <Box
                  sx={{
                    display: "grid",
                    gridTemplateColumns: {
                      xs: "1fr",
                      md: "repeat(2, minmax(0, 1fr))",
                    },
                    gap: 1.5,
                  }}
                >
                  {LAYOUT_OPTIONS.map((option) => {
                    const active = layout === option.value;

                    return (
                      <Box
                        key={option.value}
                        onClick={() => setLayout(option.value)}
                        sx={{
                          p: 2,
                          cursor: "pointer",
                          borderRadius: 2,
                          border: "1px solid",
                          borderColor: active ? "primary.main" : "divider",
                          bgcolor: active ? "#EEF4FF" : "#fff",
                          boxShadow: active
                            ? "0 10px 24px rgba(37, 99, 235, 0.12)"
                            : "none",
                          transition: "all 160ms ease",
                          "&:hover": {
                            borderColor: active ? "primary.main" : "#CBD5E1",
                            bgcolor: active ? "#EEF4FF" : "#F8FAFC",
                          },
                        }}
                      >
                        <Stack direction="row" spacing={1.5} alignItems="flex-start">
                          <Box
                            sx={{
                              width: 42,
                              height: 42,
                              borderRadius: 2,
                              display: "grid",
                              placeItems: "center",
                              bgcolor: active ? "primary.main" : "#F1F5F9",
                              color: active ? "#fff" : "text.primary",
                              flexShrink: 0,
                            }}
                          >
                            {option.icon}
                          </Box>

                          <Box sx={{ minWidth: 0 }}>
                            <Typography
                              sx={{
                                fontSize: 15,
                                fontWeight: 900,
                                color: "text.primary",
                              }}
                            >
                              {option.title}
                            </Typography>

                            <Typography
                              sx={{
                                mt: 0.4,
                                fontSize: 12.5,
                                fontWeight: 800,
                                color: active ? "primary.main" : "text.secondary",
                              }}
                            >
                              {option.subtitle}
                            </Typography>

                            <Typography
                              sx={{
                                mt: 0.75,
                                fontSize: 12.5,
                                color: "text.secondary",
                                lineHeight: 1.45,
                              }}
                            >
                              {option.description}
                            </Typography>
                          </Box>
                        </Stack>
                      </Box>
                    );
                  })}
                </Box>

                <Stack
                  direction={{ xs: "column", sm: "row" }}
                  spacing={1.25}
                  alignItems={{ xs: "stretch", sm: "center" }}
                  justifyContent="space-between"
                  sx={{
                    p: 1.5,
                    borderRadius: 2,
                    bgcolor: "#F8FAFC",
                    border: "1px solid",
                    borderColor: "divider",
                  }}
                >
                  <Stack direction="row" spacing={1} flexWrap="wrap">
                    <Chip
                      label={`${selected.length} seleccionado(s)`}
                      sx={{
                        fontWeight: 900,
                        bgcolor: "#111827",
                        color: "#fff",
                      }}
                    />

                    <Chip
                      label={`${selectedVisibleCount} en esta página`}
                      variant="outlined"
                      sx={{
                        fontWeight: 800,
                        bgcolor: "#fff",
                      }}
                    />
                  </Stack>

                  <Stack direction="row" spacing={1} justifyContent="flex-end">
                    <Button
                      variant="outlined"
                      onClick={selectAllVisible}
                      disabled={paginatedItems.length === 0}
                      sx={{
                        fontWeight: 800,
                        borderRadius: 1.5,
                      }}
                    >
                      Seleccionar página
                    </Button>

                    <Button
                      variant="text"
                      onClick={clearSelection}
                      disabled={selected.length === 0}
                      sx={{
                        fontWeight: 800,
                        borderRadius: 1.5,
                      }}
                    >
                      Limpiar
                    </Button>
                  </Stack>
                </Stack>
              </Stack>
            </Paper>

            <Paper
              sx={{
                p: 0,
                overflow: "hidden",
                borderRadius: 2.5,
                boxShadow: "none",
                border: "1px solid",
                borderColor: "divider",
                bgcolor: "#fff",
              }}
            >
              <Box
                sx={{
                  px: { xs: 2, sm: 2.5 },
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
                <Box>
                  <Typography
                    sx={{
                      fontSize: 16,
                      fontWeight: 900,
                      color: "text.primary",
                    }}
                  >
                    QRs disponibles
                  </Typography>

                  <Typography
                    sx={{
                      mt: 0.25,
                      fontSize: 13,
                      color: "text.secondary",
                      fontWeight: 700,
                    }}
                  >
                    {total} resultado(s) · Mostrando de 5 en 5
                  </Typography>
                </Box>
              </Box>

              {total === 0 ? (
                <Box
                  sx={{
                    px: 3,
                    py: 6,
                    textAlign: "center",
                  }}
                >
                  <Box
                    sx={{
                      width: 64,
                      height: 64,
                      borderRadius: 3,
                      display: "grid",
                      placeItems: "center",
                      mx: "auto",
                      mb: 2,
                      bgcolor: "#F1F5F9",
                      color: "text.secondary",
                    }}
                  >
                    <QrCode2RoundedIcon fontSize="large" />
                  </Box>

                  <Typography
                    sx={{
                      fontSize: 20,
                      fontWeight: 900,
                      color: "text.primary",
                    }}
                  >
                    No hay QRs con estos filtros
                  </Typography>

                  <Typography
                    sx={{
                      mt: 1,
                      color: "text.secondary",
                      fontSize: 14,
                    }}
                  >
                    Cambia los filtros para visualizar otros códigos disponibles.
                  </Typography>
                </Box>
              ) : (
                <>
                  <Stack spacing={1.25} sx={{ p: { xs: 1.5, sm: 2 } }}>
                    {paginatedItems.map((qr) => {
                      const checked = selected.includes(qr.id);
                      const typeSx = TYPE_COLORS[qr.type] || {
                        bgcolor: "#F1F5F9",
                        color: "#334155",
                        borderColor: "#CBD5E1",
                      };

                      return (
                        <Box
                          key={qr.id}
                          onClick={() => toggleSelect(qr.id)}
                          sx={{
                            p: 1.5,
                            borderRadius: 2,
                            border: "1px solid",
                            borderColor: checked ? "primary.main" : "divider",
                            bgcolor: checked ? "#F8FBFF" : "#fff",
                            cursor: "pointer",
                            transition: "all 160ms ease",
                            "&:hover": {
                              borderColor: checked ? "primary.main" : "#CBD5E1",
                              bgcolor: checked ? "#F8FBFF" : "#F8FAFC",
                            },
                          }}
                        >
                          <Stack
                            direction="row"
                            spacing={1.5}
                            alignItems="center"
                          >
                            <Checkbox
                              checked={checked}
                              onChange={(e) => {
                                e.stopPropagation();
                                toggleSelect(qr.id);
                              }}
                              onClick={(e) => e.stopPropagation()}
                            />

                            <Box
                              sx={{
                                width: 58,
                                height: 58,
                                borderRadius: 2,
                                bgcolor: "#F8FAFC",
                                border: "1px solid",
                                borderColor: "divider",
                                display: "grid",
                                placeItems: "center",
                                flexShrink: 0,
                                overflow: "hidden",
                              }}
                            >
                              {qr.qr_image_url ? (
                                <Box
                                  component="img"
                                  src={qr.qr_image_url}
                                  alt={qr.name || "QR"}
                                  sx={{
                                    width: 48,
                                    height: 48,
                                    objectFit: "contain",
                                    display: "block",
                                  }}
                                />
                              ) : (
                                <QrCode2RoundedIcon
                                  sx={{
                                    color: "text.secondary",
                                  }}
                                />
                              )}
                            </Box>

                            <Box sx={{ minWidth: 0, flex: 1 }}>
                              <Typography
                                sx={{
                                  fontSize: 15,
                                  fontWeight: 900,
                                  color: "text.primary",
                                  lineHeight: 1.3,
                                  wordBreak: "break-word",
                                }}
                              >
                                {qr.name || "QR sin nombre"}
                              </Typography>

                              <Stack
                                direction="row"
                                spacing={0.75}
                                useFlexGap
                                flexWrap="wrap"
                                sx={{ mt: 0.75 }}
                              >
                                <Chip
                                  size="small"
                                  label={getTypeLabel(qr.type)}
                                  sx={{
                                    height: 24,
                                    fontSize: 11.5,
                                    fontWeight: 900,
                                    bgcolor: typeSx.bgcolor,
                                    color: typeSx.color,
                                    border: "1px solid",
                                    borderColor: typeSx.borderColor,
                                  }}
                                />

                                <Chip
                                  size="small"
                                  label={getStatusLabel(qr)}
                                  sx={{
                                    height: 24,
                                    fontSize: 11.5,
                                    fontWeight: 900,
                                    bgcolor: qr.is_active ? "#ECFDF5" : "#FEF2F2",
                                    color: qr.is_active ? "#047857" : "#B91C1C",
                                    border: "1px solid",
                                    borderColor: qr.is_active ? "#A7F3D0" : "#FECACA",
                                  }}
                                />

                                <Chip
                                  size="small"
                                  label={`Mesa: ${getQrTableLabel(qr)}`}
                                  variant="outlined"
                                  sx={{
                                    height: 24,
                                    fontSize: 11.5,
                                    fontWeight: 800,
                                    bgcolor: "#fff",
                                  }}
                                />

                                <Chip
                                  size="small"
                                  label={`Canal: ${getQrChannelLabel(qr)}`}
                                  variant="outlined"
                                  sx={{
                                    height: 24,
                                    fontSize: 11.5,
                                    fontWeight: 800,
                                    bgcolor: "#fff",
                                  }}
                                />
                              </Stack>
                            </Box>
                          </Stack>
                        </Box>
                      );
                    })}
                  </Stack>

                  <PaginationFooter
                    page={page}
                    totalPages={totalPages}
                    startItem={startItem}
                    endItem={endItem}
                    total={total}
                    hasPrev={hasPrev}
                    hasNext={hasNext}
                    onPrev={handlePrev}
                    onNext={handleNext}
                    itemLabel="QRs"
                  />
                </>
              )}
            </Paper>

            <Stack
              direction={{ xs: "column-reverse", sm: "row" }}
              justifyContent="flex-end"
              spacing={1.5}
              mt={3}
            >
              <Button
                onClick={onClose}
                variant="outlined"
                disabled={loading || busy}
                sx={{
                  height: 42,
                  px: 3,
                  borderRadius: 1.5,
                  fontWeight: 900,
                }}
              >
                Cancelar
              </Button>

              <Button
                onClick={handleExport}
                variant="contained"
                startIcon={<DownloadIcon />}
                disabled={loading || busy || selected.length === 0}
                sx={{
                  height: 42,
                  px: 3,
                  borderRadius: 1.5,
                  fontWeight: 900,
                  boxShadow: "none",
                }}
              >
                {loading ? "Generando..." : "Descargar QRs"}
              </Button>
            </Stack>
          </Box>
        </DialogContent>
      </Dialog>
    </>
  );
}