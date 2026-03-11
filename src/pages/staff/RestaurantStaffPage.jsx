import { useEffect, useMemo, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";

import { 
  Alert, Box, Button, Chip, CircularProgress, IconButton, Paper, Stack,
  Table, TableBody, TableCell, TableContainer, TableHead, TableRow, Tooltip,
  Typography, useMediaQuery,
} from "@mui/material";

import { useTheme } from "@mui/material/styles";
import AddIcon from "@mui/icons-material/Add";
import ArrowBackIcon from "@mui/icons-material/ArrowBack";
import EditIcon from "@mui/icons-material/Edit";
import DeleteOutlineIcon from "@mui/icons-material/DeleteOutline";
import TuneIcon from "@mui/icons-material/Tune";

import { getStaff, deleteStaff } from "../../services/staff/staff.service";

import StaffUpsertModal from "../../components/staff/StaffUpsertModal";
import StaffAssignmentsModal from "../../components/staff/StaffAssignmentsModal";

import usePagination from "../../hooks/usePagination";
import PaginationFooter from "../../components/common/PaginationFooter";

const CHIP = {
  active: { color: "success", label: "ACTIVO" },
  inactive: { color: "error", label: "INACTIVO" },
};

const PAGE_SIZE = 5;

export default function StaffPage() {
  const nav = useNavigate();
  const { restaurantId } = useParams();
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down("sm"));

  const [loading, setLoading] = useState(true);
  const [err, setErr] = useState("");
  const [items, setItems] = useState([]);

  // modales
  const [upsertOpen, setUpsertOpen] = useState(false);
  const [editing, setEditing] = useState(null);

  const [assignOpen, setAssignOpen] = useState(false);
  const [assignUser, setAssignUser] = useState(null);

  const title = useMemo(() => `Empleados`, [restaurantId]);


  const {
    page, nextPage, prevPage, total, totalPages, startItem, endItem, hasPrev,
    hasNext, paginatedItems,
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
      const list = await getStaff(restaurantId);
      setItems(list);
    } catch (e) {
      setErr(e?.response?.data?.message || "No se pudieron cargar los empleados");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    load();
    // eslint-disable-next-line
  }, [restaurantId]);


  const onCreate = () => {
    setEditing(null);
    setUpsertOpen(true);
  };

  const onEdit = (row) => {
    setEditing(row);
    setUpsertOpen(true);
  };

  const onAssignments = (row) => {
    setAssignUser(row);
    setAssignOpen(true);
  };

  const onDelete = async (row) => {
    const ok = window.confirm(`¿Eliminar a ${row?.name || "este empleado"}?`);
    if (!ok) return;

    try {
      await deleteStaff(restaurantId, row.id);
      await load();
    } catch (e) {
      alert(e?.response?.data?.message || "No se pudo eliminar");
    }
  };

  return (
    <Box
      sx={{
        px: { xs: 2, sm: 3, md: 4 },
        py: { xs: 8, md: 4 },
      }}
    >
      <Box sx={{ maxWidth: 1100, mx: "auto" }}>
        <Stack spacing={3}>
          {/* Header */}
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
                Crea cuentas de staff y administra sus asignaciones por sucursal.
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
                Crear empleado
              </Button>
            </Stack>
          </Stack>

          {/* Error */}
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

          {/* Contenido */}
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
                    Cargando empleados…
                  </Typography>
                </Stack>
              </Box>
            ) : items.length === 0 ? (
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
                  No se tienen empleados registrados
                </Typography>

                <Typography
                  sx={{
                    mt: 1,
                    color: "text.secondary",
                    fontSize: 14,
                  }}
                >
                  Crea tu primer empleado para comenzar a asignar sucursales y roles operativos.
                </Typography>

                <Button
                  onClick={onCreate}
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
                  Crear empleado
                </Button>
              </Box>
            ) : (
              <>
                {isMobile ? (
                  <Stack spacing={1.5} sx={{ p: 2 }}>
                    {paginatedItems.map((r) => {
                      const chip = CHIP[r.status] || CHIP.active;

                      return (
                        <Paper
                          key={r.id}
                          elevation={0}
                          sx={{
                            p: 2,
                            borderRadius: 1,
                            border: "1px solid",
                            borderColor: "divider",
                            backgroundColor: "#fff",
                          }}
                        >
                          <Stack spacing={1.25}>
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
                                  {[r.name, r.last_name_paternal, r.last_name_maternal]
                                    .filter(Boolean)
                                    .join(" ")}
                                </Typography>

                                <Typography
                                  sx={{
                                    mt: 0.5,
                                    fontSize: 13,
                                    color: "text.secondary",
                                    wordBreak: "break-word",
                                  }}
                                >
                                  {r.email}
                                </Typography>
                              </Box>

                              <Chip
                                label={chip.label}
                                color={chip.color}
                                size="small"
                                sx={{
                                  fontWeight: 800,
                                  flexShrink: 0,
                                }}
                              />
                            </Stack>

                            <Box>
                              <Typography sx={mobileLabelSx}>Teléfono</Typography>
                              <Typography sx={mobileValueSx}>{r.phone}</Typography>
                            </Box>

                            <Stack
                              direction="row"
                              spacing={1}
                              justifyContent="space-between"
                              alignItems="center"
                            >
                              <Button
                                onClick={() => onAssignments(r)}
                                variant="contained"
                                color="secondary"
                                startIcon={<TuneIcon />}
                                sx={{
                                  flex: 1,
                                  height: 40,
                                  borderRadius: 2,
                                  fontSize: 12,
                                  fontWeight: 800,
                                  whiteSpace: "nowrap",
                                }}
                              >
                                Asignación
                              </Button>

                              <Tooltip title="Editar">
                                <IconButton
                                  onClick={() => onEdit(r)}
                                  sx={{
                                    width: 40,
                                    height: 40,
                                    bgcolor: "#E3C24A",
                                    color: "#fff",
                                    borderRadius: 1.5,
                                    "&:hover": {
                                      bgcolor: "#C9AA39",
                                    },
                                  }}
                                >
                                  <EditIcon fontSize="small" />
                                </IconButton>
                              </Tooltip>

                              <Tooltip title="Eliminar">
                                <IconButton
                                  onClick={() => onDelete(r)}
                                  sx={{
                                    width: 40,
                                    height: 40,
                                    bgcolor: "error.main",
                                    color: "#fff",
                                    borderRadius: 1.5,
                                    "&:hover": {
                                      bgcolor: "error.dark",
                                    },
                                  }}
                                >
                                  <DeleteOutlineIcon fontSize="small" />
                                </IconButton>
                              </Tooltip>
                            </Stack>
                          </Stack>
                        </Paper>
                      );
                    })}
                  </Stack>
                ) : (
                  <TableContainer sx={{ width: "100%", overflowX: "auto" }}>
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
                          <TableCell>Nombre</TableCell>
                          <TableCell>Apellido paterno</TableCell>
                          <TableCell>Apellido materno</TableCell>
                          <TableCell>Teléfono</TableCell>
                          <TableCell>Email</TableCell>
                          <TableCell>Estado</TableCell>
                          <TableCell align="right">Acciones</TableCell>
                        </TableRow>
                      </TableHead>

                      <TableBody>
                        {paginatedItems.map((r) => {
                          const chip = CHIP[r.status] || CHIP.active;

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
                              <TableCell>{r.name}</TableCell>
                              <TableCell>{r.last_name_paternal}</TableCell>
                              <TableCell>{r.last_name_maternal || "—"}</TableCell>
                              <TableCell>{r.phone}</TableCell>
                              <TableCell>{r.email}</TableCell>

                              <TableCell>
                                <Chip
                                  label={chip.label}
                                  color={chip.color}
                                  size="small"
                                  sx={{
                                    fontWeight: 800,
                                    minWidth: 82,
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
                                  <Button
                                    onClick={() => onAssignments(r)}
                                    variant="contained"
                                    color="secondary"
                                    startIcon={<TuneIcon />}
                                    sx={{
                                      height: 36,
                                      minWidth: 150,
                                      borderRadius: 2,
                                      fontSize: 12,
                                      fontWeight: 800,
                                      whiteSpace: "nowrap",
                                    }}
                                  >
                                    Asignación
                                  </Button>

                                  <Tooltip title="Editar">
                                    <IconButton
                                      onClick={() => onEdit(r)}
                                      sx={{
                                        width: 36,
                                        height: 36,
                                        bgcolor: "#E3C24A",
                                        color: "#fff",
                                        borderRadius: 1.5,
                                        "&:hover": {
                                          bgcolor: "#C9AA39",
                                        },
                                      }}
                                    >
                                      <EditIcon fontSize="small" />
                                    </IconButton>
                                  </Tooltip>

                                  <Tooltip title="Eliminar">
                                    <IconButton
                                      onClick={() => onDelete(r)}
                                      sx={{
                                        width: 36,
                                        height: 36,
                                        bgcolor: "error.main",
                                        color: "#fff",
                                        borderRadius: 1.5,
                                        "&:hover": {
                                          bgcolor: "error.dark",
                                        },
                                      }}
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

                {/* Footer paginación */}
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
                  itemLabel="empleados"
                />
              </>
            )}
          </Paper>
        </Stack>
      </Box>

      {/* Modal crear/editar staff */}
      <StaffUpsertModal
        open={upsertOpen}
        onClose={() => setUpsertOpen(false)}
        restaurantId={restaurantId}
        editing={editing}
        onSaved={async () => {
          setUpsertOpen(false);
          await load();
        }}
      />

      {/* Modal asignaciones */}
      <StaffAssignmentsModal
        open={assignOpen}
        onClose={() => setAssignOpen(false)}
        restaurantId={restaurantId}
        user={assignUser}
      />
    </Box>
  );
}

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