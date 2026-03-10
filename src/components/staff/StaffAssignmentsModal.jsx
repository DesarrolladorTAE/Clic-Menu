import { useEffect, useMemo, useState } from "react";
import { Controller, useForm } from "react-hook-form";
import { handleFormApiError } from "../../utils/useFormApiHandler";

import {
  getAssignments,
  createAssignment,
  updateAssignment,
  deleteAssignment,
} from "../../services/staff/staffAssignments.service";

import { getBranchesByRestaurant } from "../../services/restaurant/branch.service";
import { getRoles } from "../../services/staff/roles.service";

import {
  Alert, Box, Button, Card, CardContent, Checkbox, Chip, CircularProgress, Dialog, DialogContent,
  DialogTitle, Divider, FormControl, FormControlLabel, IconButton, MenuItem, Paper, Select,
  Stack, Table, TableBody, TableCell, TableContainer, TableHead, TableRow, Tooltip, Typography,
  useMediaQuery,
} from "@mui/material";
import { useTheme } from "@mui/material/styles";

import CloseIcon from "@mui/icons-material/Close";
import EditIcon from "@mui/icons-material/Edit";
import DeleteOutlineIcon from "@mui/icons-material/DeleteOutline";
import AddIcon from "@mui/icons-material/Add";
import KeyboardArrowDownIcon from "@mui/icons-material/KeyboardArrowDown";

import usePagination from "../../hooks/usePagination";
import PaginationFooter from "../../components/common/PaginationFooter";

const PAGE_SIZE = 5;

export default function StaffAssignmentsModal({ open, onClose, restaurantId, user }) {
  const userId = user?.id;
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down("sm"));

  const title = useMemo(() => `Asignaciones - ${user?.name || ""}`, [user?.name]);

  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  // msg SOLO para API / errores reales
  const [msg, setMsg] = useState("");

  const [items, setItems] = useState([]);
  const [branches, setBranches] = useState([]);
  const [rolesOp, setRolesOp] = useState([]);

  const [editing, setEditing] = useState(null);

  const {
    control,
    register,
    handleSubmit,
    reset,
    setError,
    clearErrors,
    watch,
    formState: { errors },
  } = useForm({
    defaultValues: {
      branch_id: "",
      role_id: "",
      is_active: true,
    },
  });

  const wRoleId = watch("role_id");
  const wBranchId = watch("branch_id");
  const wIsActive = watch("is_active");

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
    items,
    initialPage: 1,
    pageSize: PAGE_SIZE,
    mode: "frontend",
  });

  const allActiveRoleIds = useMemo(() => {
    const set = new Set();
    for (const it of items) {
      if (it?.is_active && it?.branch_id == null && it?.role_id) {
        set.add(String(it.role_id));
      }
    }

    if (editing?.id && editing?.branch_id == null && editing?.role_id != null) {
      set.delete(String(editing.role_id));
    }

    return set;
  }, [items, editing]);

  const conflictsAllVsBranch = useMemo(() => {
    const roleIsAllActive = allActiveRoleIds.has(String(wRoleId || ""));
    const choosingSpecificBranch = wBranchId !== "";
    const wantsActive = !!wIsActive;
    return roleIsAllActive && choosingSpecificBranch && wantsActive;
  }, [allActiveRoleIds, wRoleId, wBranchId, wIsActive]);

  const conflictText = useMemo(() => {
    if (!conflictsAllVsBranch) return "";
    const role = rolesOp.find((r) => String(r.id) === String(wRoleId));
    const roleLabel = role?.description || role?.name || "este rol";
    return `No puedes asignar ${roleLabel} por sucursal porque ya existe una asignación ACTIVA en "Todas" para el mismo rol.`;
  }, [conflictsAllVsBranch, rolesOp, wRoleId]);

  const load = async () => {
    if (!open || !restaurantId || !userId) return;

    setMsg("");
    setLoading(true);

    try {
      const [a, b, r] = await Promise.all([
        getAssignments(restaurantId, userId),
        getBranchesByRestaurant(restaurantId),
        getRoles({ scope: "operational" }),
      ]);

      setItems(Array.isArray(a) ? a : []);
      setBranches(Array.isArray(b) ? b : []);
      setRolesOp(Array.isArray(r) ? r : []);
    } catch (e) {
      setMsg(e?.response?.data?.message || "No se pudieron cargar las asignaciones");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (!open) return;
    setEditing(null);
    setMsg("");
    reset({ branch_id: "", role_id: "", is_active: true });
    load();
    // eslint-disable-next-line
  }, [open, restaurantId, userId]);

  useEffect(() => {
    if (!open) return;

    if (!conflictsAllVsBranch) {
      clearErrors("branch_id");
    }
    // eslint-disable-next-line
  }, [conflictsAllVsBranch, open]);

  if (!open) return null;

  const onEdit = (row) => {
    setMsg("");
    setEditing(row);
    reset({
      branch_id: row?.branch_id == null ? "" : String(row.branch_id),
      role_id: row?.role_id == null ? "" : String(row.role_id),
      is_active: !!row?.is_active,
    });
  };

  const onCancelEdit = () => {
    setEditing(null);
    setMsg("");
    reset({ branch_id: "", role_id: "", is_active: true });
  };

  const onDelete = async (row) => {
    if (!window.confirm("¿Eliminar esta asignación?")) return;

    try {
      await deleteAssignment(restaurantId, userId, row.id);
      await load();
    } catch (e) {
      alert(e?.response?.data?.message || "No se pudo eliminar");
    }
  };

  const onSubmit = async (values) => {
    setMsg("");
    setSaving(true);

    try {
      const payload = {
        branch_id: values.branch_id === "" ? null : Number(values.branch_id),
        role_id: Number(values.role_id),
        is_active: !!values.is_active,
      };

      if (!payload.role_id || Number.isNaN(payload.role_id)) {
        setError("role_id", { type: "manual", message: "Selecciona un rol." });
        setSaving(false);
        return;
      }

      if (conflictsAllVsBranch) {
        setError("branch_id", { type: "manual", message: conflictText });
        setSaving(false);
        return;
      }

      if (editing?.id) {
        await updateAssignment(restaurantId, userId, editing.id, payload);
      } else {
        await createAssignment(restaurantId, userId, payload);
      }

      onCancelEdit();
      await load();
    } catch (e) {
      handleFormApiError(e, setError, { onMessage: (m) => setMsg(m) });
    } finally {
      setSaving(false);
    }
  };

  const disableSpecificBranches =
    allActiveRoleIds.has(String(wRoleId || "")) && !!wIsActive;

  const bannerText = conflictText || msg;

  return (
    <Dialog
      open={open}
      onClose={onClose}
      fullWidth
      maxWidth="lg"
      fullScreen={isMobile}
      PaperProps={{
        sx: {
          borderRadius: { xs: 0, sm: 3 },
          overflow: "hidden",
          backgroundColor: "background.paper",
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
        <Stack direction="row" justifyContent="space-between" alignItems="flex-start" spacing={2}>
          <Box>
            <Typography
              sx={{
                fontWeight: 800,
                fontSize: { xs: 18, sm: 22 },
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
              Crea, edita o elimina asignaciones por sucursal y rol.
            </Typography>
          </Box>

          <IconButton
            onClick={onClose}
            sx={{
              color: "#fff",
              bgcolor: "rgba(255,255,255,0.08)",
              borderRadius: 2,
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
          {bannerText && (
            <Alert
              severity={conflictText ? "warning" : "error"}
              sx={{
                borderRadius: 2,
                alignItems: "flex-start",
              }}
            >
              <Box>
                <Typography sx={{ fontWeight: 800, mb: 0.5 }}>
                  {conflictText ? "Nota" : "Error"}
                </Typography>
                <Typography variant="body2">{bannerText}</Typography>
              </Box>
            </Alert>
          )}

          {/* Formulario */}
          <Card
            sx={{
              borderRadius: 0,
              backgroundColor: "background.paper",
            }}
          >
            <CardContent sx={{ p: { xs: 2, sm: 3 } }}>
              <Stack spacing={2.5}>
                <Typography
                  sx={{
                    fontWeight: 800,
                    fontSize: { xs: 18, sm: 20 },
                    color: "text.primary",
                  }}
                >
                  {editing ? "Editar asignación" : "Nueva asignación"}
                </Typography>

                <form onSubmit={handleSubmit(onSubmit)}>
                  <Stack spacing={2.25}>
                    <Stack
                      direction={{ xs: "column", md: "row" }}
                      spacing={2}
                      alignItems="flex-start"
                    >
                      <Box sx={{ flex: 1, width: "100%" }}>
                        <FieldLabel label="Sucursal" />
                        <FormControl fullWidth>
                          <Controller
                            name="branch_id"
                            control={control}
                            render={({ field }) => (
                              <Select
                                {...field}
                                IconComponent={KeyboardArrowDownIcon}
                                displayEmpty
                                sx={selectSx}
                              >
                                <MenuItem value="">Todas (sin sucursal)</MenuItem>
                                {branches.map((b) => (
                                  <MenuItem
                                    key={b.id}
                                    value={String(b.id)}
                                    disabled={disableSpecificBranches}
                                  >
                                    {b.name}
                                  </MenuItem>
                                ))}
                              </Select>
                            )}
                          />
                        </FormControl>

                        {disableSpecificBranches && (
                          <Typography sx={helpSx}>
                            Este rol ya está ACTIVO en "Todas". No se permiten sucursales
                            específicas para el mismo rol.
                          </Typography>
                        )}

                        {errors?.branch_id?.message && (
                          <Typography sx={errTextSx}>
                            {errors.branch_id.message}
                          </Typography>
                        )}
                      </Box>

                      <Box sx={{ flex: 1, width: "100%" }}>
                        <FieldLabel label="Rol operativo" />
                        <FormControl fullWidth>
                          <Controller
                            name="role_id"
                            control={control}
                            render={({ field }) => (
                              <Select
                                {...field}
                                IconComponent={KeyboardArrowDownIcon}
                                displayEmpty
                                sx={selectSx}
                              >
                                <MenuItem value="">Selecciona</MenuItem>
                                {rolesOp.map((r) => (
                                  <MenuItem key={r.id} value={String(r.id)}>
                                    {r.description || r.name}
                                  </MenuItem>
                                ))}
                              </Select>
                            )}
                          />
                        </FormControl>

                        {errors?.role_id?.message && (
                          <Typography sx={errTextSx}>
                            {errors.role_id.message}
                          </Typography>
                        )}
                      </Box>

                      <Box
                        sx={{
                          width: { xs: "100%", md: 170 },
                          pt: { xs: 0, md: 3.5 },
                        }}
                      >
                        <Controller
                          name="is_active"
                          control={control}
                          render={({ field }) => (
                            <FormControlLabel
                              control={
                                <Checkbox
                                  checked={!!field.value}
                                  onChange={(e) => field.onChange(e.target.checked)}
                                  sx={{
                                    color: "primary.main",
                                    "&.Mui-checked": {
                                      color: "primary.main",
                                    },
                                  }}
                                />
                              }
                              label={
                                <Typography sx={{ fontSize: 14, fontWeight: 700, color: "text.primary" }}>
                                  Activo
                                </Typography>
                              }
                              sx={{ m: 0 }}
                            />
                          )}
                        />

                        {errors?.is_active?.message && (
                          <Typography sx={errTextSx}>
                            {errors.is_active.message}
                          </Typography>
                        )}
                      </Box>
                    </Stack>

                    <Stack
                      direction={{ xs: "column-reverse", sm: "row" }}
                      justifyContent="flex-end"
                      spacing={1.5}
                    >
                      {editing && (
                        <Button
                          type="button"
                          onClick={onCancelEdit}
                          variant="outlined"
                          sx={{
                            minWidth: { xs: "100%", sm: 160 },
                            height: 44,
                            borderRadius: 2,
                          }}
                        >
                          Cancelar edición
                        </Button>
                      )}

                      <Button
                        type="submit"
                        disabled={saving}
                        variant="contained"
                        startIcon={!editing ? <AddIcon /> : null}
                        sx={{
                          minWidth: { xs: "100%", sm: 180 },
                          height: 44,
                          borderRadius: 2,
                          fontWeight: 800,
                        }}
                      >
                        {saving ? "Guardando…" : editing ? "Guardar cambios" : "Agregar"}
                      </Button>
                    </Stack>
                  </Stack>
                </form>
              </Stack>
            </CardContent>
          </Card>

          {/* Lista / tabla */}
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
                  minHeight: 220,
                  display: "grid",
                  placeItems: "center",
                  px: 2,
                }}
              >
                <Stack spacing={2} alignItems="center">
                  <CircularProgress color="primary" />
                  <Typography sx={{ color: "text.secondary", fontSize: 14 }}>
                    Cargando asignaciones…
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
                    fontSize: 19,
                    fontWeight: 800,
                    color: "text.primary",
                  }}
                >
                  Este empleado no tiene asignaciones registradas
                </Typography>

                <Typography
                  sx={{
                    mt: 1,
                    color: "text.secondary",
                    fontSize: 14,
                  }}
                >
                  Agrega una asignación para definir su rol operativo y su sucursal.
                </Typography>
              </Box>
            ) : (
              <>
                {isMobile ? (
                  <Stack spacing={1.5} sx={{ p: 2 }}>
                    {paginatedItems.map((a) => (
                      <Paper
                        key={a.id}
                        elevation={0}
                        sx={{
                          p: 2,
                          borderRadius: 2,
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
                                {a.role?.description || a.role?.name || `#${a.role_id}`}
                              </Typography>

                              <Typography
                                sx={{
                                  mt: 0.5,
                                  fontSize: 13,
                                  color: "text.secondary",
                                  wordBreak: "break-word",
                                }}
                              >
                                {a.branch_id ? (a.branch?.name || `#${a.branch_id}`) : "Todas"}
                              </Typography>
                            </Box>

                            <Chip
                              label={a.is_active ? "ACTIVO" : "INACTIVO"}
                              color={a.is_active ? "success" : "default"}
                              size="small"
                              sx={{
                                fontWeight: 800,
                                flexShrink: 0,
                              }}
                            />
                          </Stack>

                          <Stack
                            direction="row"
                            spacing={1}
                            justifyContent="flex-end"
                            alignItems="center"
                          >
                            <Tooltip title="Editar">
                              <IconButton
                                onClick={() => onEdit(a)}
                                sx={iconEditSx}
                              >
                                <EditIcon fontSize="small" />
                              </IconButton>
                            </Tooltip>

                            <Tooltip title="Eliminar">
                              <IconButton
                                onClick={() => onDelete(a)}
                                sx={iconDeleteSx}
                              >
                                <DeleteOutlineIcon fontSize="small" />
                              </IconButton>
                            </Tooltip>
                          </Stack>
                        </Stack>
                      </Paper>
                    ))}
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
                              fontSize: 13,
                              borderBottom: "none",
                              whiteSpace: "nowrap",
                            },
                          }}
                        >
                          <TableCell>Sucursal</TableCell>
                          <TableCell>Rol</TableCell>
                          <TableCell>Activo</TableCell>
                          <TableCell align="right">Acciones</TableCell>
                        </TableRow>
                      </TableHead>

                      <TableBody>
                        {paginatedItems.map((a) => (
                          <TableRow
                            key={a.id}
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
                              {a.branch_id ? (a.branch?.name || `#${a.branch_id}`) : "Todas"}
                            </TableCell>

                            <TableCell>
                              {a.role?.description || a.role?.name || `#${a.role_id}`}
                            </TableCell>

                            <TableCell>
                              <Chip
                                label={a.is_active ? "ACTIVO" : "INACTIVO"}
                                color={a.is_active ? "success" : "default"}
                                size="small"
                                sx={{
                                  fontWeight: 800,
                                  minWidth: 88,
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
                                <Tooltip title="Editar">
                                  <IconButton
                                    onClick={() => onEdit(a)}
                                    sx={iconEditSx}
                                  >
                                    <EditIcon fontSize="small" />
                                  </IconButton>
                                </Tooltip>

                                <Tooltip title="Eliminar">
                                  <IconButton
                                    onClick={() => onDelete(a)}
                                    sx={iconDeleteSx}
                                  >
                                    <DeleteOutlineIcon fontSize="small" />
                                  </IconButton>
                                </Tooltip>
                              </Stack>
                            </TableCell>
                          </TableRow>
                        ))}
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
                  itemLabel="asignaciones"
                />
              </>
            )}
          </Paper>

          <Typography
            sx={{
              fontSize: 12,
              color: "text.secondary",
              lineHeight: 1.5,
            }}
          >
            Tip: Si un rol está ACTIVO en “Todas”, no se permite repetirlo por sucursal.
          </Typography>
        </Stack>
      </DialogContent>
    </Dialog>
  );
}

function FieldLabel({ label }) {
  return (
    <Typography
      sx={{
        fontSize: 14,
        fontWeight: 800,
        color: "text.primary",
        mb: 1,
      }}
    >
      {label}
    </Typography>
  );
}

const selectSx = {
  bgcolor: "#F4F4F4",
  borderRadius: 0,
  minHeight: 44,
  "& .MuiOutlinedInput-notchedOutline": {
    border: "none",
  },
  "&:hover .MuiOutlinedInput-notchedOutline": {
    border: "none",
  },
  "&.Mui-focused .MuiOutlinedInput-notchedOutline": {
    border: "1.5px solid #FF9800",
  },
  "& .MuiSelect-select": {
    py: 1.25,
    px: 1.5,
    fontSize: 14,
    color: "text.primary",
  },
};

const helpSx = {
  mt: 0.75,
  fontSize: 12,
  color: "text.secondary",
  lineHeight: 1.45,
};

const errTextSx = {
  mt: 0.75,
  color: "error.main",
  fontSize: 12,
  fontWeight: 700,
};

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