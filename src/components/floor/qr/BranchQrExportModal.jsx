import { useEffect, useMemo, useState } from "react";
import {
  Box,
  Button,
  Checkbox,
  Dialog,
  DialogContent,
  DialogTitle,
  FormControlLabel,
  IconButton,
  Stack,
  Typography,
  useMediaQuery,
  MenuItem,
  Paper,
  FormControl,
  InputLabel,
  Select,
} from "@mui/material";

import { useTheme } from "@mui/material/styles";

import CloseIcon from "@mui/icons-material/Close";
import DownloadIcon from "@mui/icons-material/Download";

import PaginationFooter from "../../common/PaginationFooter";
import AppAlert from "../../common/AppAlert";

import { exportBranchQrCodesPdf } from "../../../services/floor/qr/branchQrCodes.service";

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
  }, [open]);

  const showAlert = (message, severity = "error") => {
    setAlert({ open: true, message, severity });
  };

  const closeAlert = () => {
    setAlert((p) => ({ ...p, open: false }));
  };

  const filteredItems = useMemo(() => {
    return (items || []).filter((qr) => {
      if (filters.type && qr.type !== filters.type) return false;
      if (filters.active === "active" && !qr.is_active) return false;
      if (filters.active === "inactive" && qr.is_active) return false;
      return true;
    });
  }, [items, filters]);

  const paginatedItems = useMemo(() => {
    const start = (page - 1) * pageSize;
    return filteredItems.slice(start, start + pageSize);
  }, [filteredItems, page]);

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

  const clearSelection = () => setSelected([]);

  const handleExport = async () => {
    if (selected.length === 0) {
      showAlert("Debes seleccionar al menos un QR", "error");
      setTimeout(() => setAlert((p) => ({ ...p, open: false })), 3000);
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
        onClose={busy ? undefined : onClose}
        fullWidth
        maxWidth="md"
        fullScreen={isMobile}
      >
        <DialogTitle
          sx={{
            bgcolor: "#111",
            color: "#fff",
            display: "flex",
            justifyContent: "space-between",
            alignItems: "center",
            px: 3,
            py: 2,
          }}
        >
          <Box>
            <Typography fontWeight={900}>Descargar QRs</Typography>
            <Typography fontSize={12} sx={{ opacity: 0.75 }}>
              Selección manual · Exportación en PDF
            </Typography>
          </Box>

          <IconButton onClick={onClose} sx={{ color: "#fff" }}>
            <CloseIcon />
          </IconButton>
        </DialogTitle>

        <DialogContent sx={{ p: 3, bgcolor: "background.default" }}>
          <Box sx={{ maxWidth: 1100, mx: "auto" }}>

            {/* FILTROS */}
            <Paper sx={{ p: 2, mb: 2 }}>
              <Typography fontWeight={900} mb={1.5}>
                Filtros
              </Typography>

              <Stack direction={{ xs: "column", sm: "row" }} spacing={2}>

                <FormControl fullWidth>
                  <InputLabel>Tipo</InputLabel>
                  <Select
                    value={filters.type}
                    label="Tipo"
                    onChange={(e) =>
                      setFilters((p) => ({ ...p, type: e.target.value }))
                    }
                  >
                    <MenuItem value="">Todos</MenuItem>
                    <MenuItem value="physical">Físico</MenuItem>
                    <MenuItem value="web">Web</MenuItem>
                    <MenuItem value="delivery">Delivery</MenuItem>
                  </Select>
                </FormControl>

                <FormControl fullWidth>
                  <InputLabel>Estado</InputLabel>
                  <Select
                    value={filters.active}
                    label="Estado"
                    onChange={(e) =>
                      setFilters((p) => ({ ...p, active: e.target.value }))
                    }
                  >
                    <MenuItem value="">Todos</MenuItem>
                    <MenuItem value="active">Activos</MenuItem>
                    <MenuItem value="inactive">Inactivos</MenuItem>
                  </Select>
                </FormControl>

              </Stack>
            </Paper>

            {/* CONFIG */}
            <Paper sx={{ p: 2, mb: 2 }}>
              <Typography fontWeight={900} mb={1.5}>
                Configuración de exportación
              </Typography>

              <Stack direction={{ xs: "column", sm: "row" }} spacing={2}>

                <FormControl fullWidth>
                  <InputLabel>QRs por hoja</InputLabel>
                  <Select
                    value={layout}
                    label="QRs por hoja"
                    onChange={(e) => setLayout(e.target.value)}
                  >
                    <MenuItem value="single">1 QR</MenuItem>
                    <MenuItem value="grid_6">6 QRs</MenuItem>
                  </Select>
                </FormControl>

                <Box sx={{
                  minWidth: 180,
                  height: 56,
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  border: "1px solid #ddd",
                  borderRadius: 1,
                }}>
                  <Typography fontWeight={900}>
                    Seleccionados: {selected.length}
                  </Typography>
                </Box>

                <Button variant="outlined" onClick={selectAllVisible}>
                  Seleccionar página
                </Button>

                <Button variant="text" onClick={clearSelection}>
                  Limpiar
                </Button>

              </Stack>
            </Paper>

            {/* LISTA */}
            <Paper sx={{ p: 2 }}>
              <Stack spacing={1}>
                {paginatedItems.map((qr) => (
                  <Box key={qr.id} sx={{ display: "flex", alignItems: "center", p: 1.5, border: "1px solid #eee" }}>
                    <FormControlLabel
                      sx={{ width: "100%" }}
                      control={
                        <Checkbox
                          checked={selected.includes(qr.id)}
                          onChange={() => toggleSelect(qr.id)}
                        />
                      }
                      label={
                        <Box>
                          <Typography fontWeight={800}>{qr.name}</Typography>
                          <Typography fontSize={12} color="text.secondary">
                            {qr.type}
                          </Typography>
                        </Box>
                      }
                    />
                  </Box>
                ))}
              </Stack>
            </Paper>

            <Stack direction="row" justifyContent="flex-end" spacing={2} mt={3}>
              <Button onClick={onClose} variant="outlined">
                Cancelar
              </Button>

              <Button
                onClick={handleExport}
                variant="contained"
                startIcon={<DownloadIcon />}
                disabled={loading}
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