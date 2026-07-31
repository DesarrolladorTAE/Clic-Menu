import { useMemo, useState } from "react";
import {
  Box, Button, Card, Chip, Dialog, DialogActions, DialogContent, DialogTitle,
  FormControlLabel, IconButton, Paper, Stack, Switch, Table, TableBody,
  TableCell, TableContainer, TableHead, TableRow, Tooltip, Typography,
  useMediaQuery,
} from "@mui/material";
import { useTheme } from "@mui/material/styles";

import AddIcon from "@mui/icons-material/Add";
import DeleteOutlineIcon from "@mui/icons-material/DeleteOutline";
import EditIcon from "@mui/icons-material/Edit";
import GroupsIcon from "@mui/icons-material/Groups";
import LockIcon from "@mui/icons-material/Lock";
import VerifiedUserIcon from "@mui/icons-material/VerifiedUser";

import PaginationFooter from "../../../common/PaginationFooter";
import usePagination from "../../../../hooks/usePagination";
import OperationalAuthorizerUpsertModal from "./OperationalAuthorizerUpsertModal";

const PAGE_SIZE = 5;

export default function OperationalAuthorizersListCard({
  selectedBranch,
  authorizers = [],
  candidates = [],
  savingAuthorizerId = null,
  deletingAuthorizerId = null,
  onCreate,
  onUpdate,
  onDelete,
  onToggleStatus,
  showToast,
}) {
  const theme = useTheme();
  const useCards = useMediaQuery(theme.breakpoints.down("md"));

  const [modalOpen, setModalOpen] = useState(false);
  const [editing, setEditing] = useState(null);
  const [deleteTarget, setDeleteTarget] = useState(null);

  const candidateByUserId = useMemo(() => {
    return candidates.reduce((map, candidate) => {
      if (candidate?.user_id) map[Number(candidate.user_id)] = candidate;
      return map;
    }, {});
  }, [candidates]);

  const availableCandidates = useMemo(
    () => candidates.filter((candidate) => !candidate?.already_authorizer),
    [candidates]
  );

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
    items: authorizers,
    initialPage: 1,
    pageSize: PAGE_SIZE,
    mode: "frontend",
  });

  const openCreate = () => {
    if (availableCandidates.length === 0) {
      showToast?.(
        "No hay candidatos disponibles para agregar como autorizadores operativos.",
        "warning"
      );
      return;
    }

    setEditing(null);
    setModalOpen(true);
  };

  const openEdit = (row) => {
    setEditing(row);
    setModalOpen(true);
  };

  const handleSaveModal = async (payload) => {
    const saved = editing?.id
      ? await onUpdate?.(editing.id, payload)
      : await onCreate?.(payload);

    if (saved?.id) {
      setModalOpen(false);
      setEditing(null);
    }

    return saved;
  };

  const confirmDelete = async () => {
    if (!deleteTarget?.id) return;

    const deleted = await onDelete?.(deleteTarget);
    if (deleted) setDeleteTarget(null);
  };

  const roleLabelFor = (row) => {
    return (
      candidateByUserId[Number(row?.user_id)]?.role?.label ||
      "Autorizador operativo"
    );
  };

  const contactFor = (row) => {
    return row?.user?.email || row?.user?.phone || "Sin contacto registrado";
  };

  return (
    <>
      <Paper
        sx={{
          p: 0,
          overflow: "hidden",
          borderRadius: 1,
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
          <Box>
            <Typography sx={{ fontSize: 18, fontWeight: 800, color: "text.primary" }}>
              Autorizadores operativos
            </Typography>

            <Typography sx={{ mt: 0.35, fontSize: 13, color: "text.secondary" }}>
              Administra quién puede aprobar operaciones sensibles en{" "}
              <Box component="span" sx={{ color: "primary.main", fontWeight: 800 }}>
                {selectedBranch?.name || "la sucursal seleccionada"}
              </Box>
              .
            </Typography>
          </Box>

          <Stack
            direction={{ xs: "column", sm: "row" }}
            spacing={1}
            sx={{ width: { xs: "100%", sm: "auto" } }}
          >
            <Chip
              icon={<GroupsIcon />}
              label={`${total} autorizador${total === 1 ? "" : "es"}`}
              sx={{
                justifyContent: "flex-start",
                fontWeight: 800,
                bgcolor: "#FFF3E0",
                color: "#A75A00",
              }}
            />

            <Button
              onClick={openCreate}
              variant="contained"
              startIcon={<AddIcon />}
              disabled={availableCandidates.length === 0}
              sx={{
                width: { xs: "100%", sm: "auto" },
                minWidth: { sm: 190 },
                height: 44,
                fontWeight: 800,
              }}
            >
              Nuevo autorizador
            </Button>
          </Stack>
        </Box>

        {authorizers.length === 0 ? (
          <Box sx={{ px: 3, py: 5, textAlign: "center" }}>
            <Typography sx={{ fontSize: 20, fontWeight: 800, color: "text.primary" }}>
              No hay autorizadores registrados
            </Typography>

            <Typography sx={{ mt: 1, color: "text.secondary", fontSize: 14 }}>
              Agrega el primer autorizador para aprobar operaciones sensibles
              de caja y cuentas.
            </Typography>

            <Button
              onClick={openCreate}
              variant="contained"
              startIcon={<AddIcon />}
              disabled={availableCandidates.length === 0}
              sx={{
                mt: 2.5,
                width: { xs: "100%", sm: "auto" },
                minWidth: { sm: 230 },
                height: 44,
                fontWeight: 800,
              }}
            >
              Nuevo autorizador
            </Button>
          </Box>
        ) : (
          <>
            {useCards ? (
              <Box
                sx={{
                  p: 2,
                  display: "grid",
                  gridTemplateColumns: {
                    xs: "1fr",
                    sm: "repeat(2, minmax(0, 1fr))",
                  },
                  gap: 1.5,
                }}
              >
                {paginatedItems.map((row) => {
                  const active = !!row?.is_active;
                  const busy =
                    savingAuthorizerId === row.id ||
                    deletingAuthorizerId === row.id;

                  return (
                    <Card
                      key={row.id}
                      sx={{
                        minWidth: 0,
                        minHeight: 250,
                        height: "100%",
                        borderRadius: 1,
                        boxShadow: "none",
                        border: "1px solid",
                        borderColor: "divider",
                        backgroundColor: "background.paper",
                      }}
                    >
                      <Box sx={{ p: 2, height: "100%" }}>
                        <Stack spacing={1.5} sx={{ height: "100%" }}>
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
                                {row?.user?.name || "Usuario no disponible"}
                              </Typography>

                              <Typography
                                sx={{
                                  mt: 0.4,
                                  fontSize: 12,
                                  color: "text.secondary",
                                  wordBreak: "break-word",
                                }}
                              >
                                {contactFor(row)}
                              </Typography>
                            </Box>

                            <Chip
                              label={roleLabelFor(row)}
                              size="small"
                              sx={{
                                maxWidth: 150,
                                fontWeight: 800,
                                bgcolor: "#FFF3E0",
                                color: "#A75A00",
                              }}
                            />
                          </Stack>

                          <Box sx={{ flex: 1 }}>
                            <Typography sx={mobileLabelSx}>Permisos</Typography>

                            <PermissionLine
                              active={active}
                              text={
                                active
                                  ? "Puede autorizar operaciones sensibles"
                                  : "No puede autorizar mientras esté inactivo"
                              }
                            />

                            <PermissionLine
                              active={row?.can_self_authorize}
                              text={
                                row?.can_self_authorize
                                  ? "Puede autoautorizar operaciones propias"
                                  : "No puede autoautorizarse"
                              }
                            />
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
                                  onChange={() => onToggleStatus?.(row)}
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
                                  disabled={busy}
                                  sx={iconEditSx}
                                >
                                  <EditIcon fontSize="small" />
                                </IconButton>
                              </Tooltip>

                              <Tooltip title="Eliminar">
                                <IconButton
                                  onClick={() => setDeleteTarget(row)}
                                  disabled={busy}
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
              </Box>
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
                      <TableCell>Usuario</TableCell>
                      <TableCell>Rol</TableCell>
                      <TableCell>Permisos</TableCell>
                      <TableCell align="center">Estado</TableCell>
                      <TableCell align="right">Acciones</TableCell>
                    </TableRow>
                  </TableHead>

                  <TableBody>
                    {paginatedItems.map((row) => {
                      const active = !!row?.is_active;
                      const busy =
                        savingAuthorizerId === row.id ||
                        deletingAuthorizerId === row.id;

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
                            },
                          }}
                        >
                          <TableCell>
                            <Typography sx={{ fontWeight: 800 }}>
                              {row?.user?.name || "Usuario no disponible"}
                            </Typography>

                            <Typography sx={{ mt: 0.3, fontSize: 12, color: "text.secondary" }}>
                              {contactFor(row)}
                            </Typography>
                          </TableCell>

                          <TableCell>
                            <Chip
                              label={roleLabelFor(row)}
                              size="small"
                              sx={{
                                fontWeight: 800,
                                bgcolor: "#FFF3E0",
                                color: "#A75A00",
                              }}
                            />
                          </TableCell>

                          <TableCell sx={{ minWidth: 320 }}>
                            <Stack spacing={0.5}>
                              <PermissionLine
                                active={active}
                                text={
                                  active
                                    ? "Autoriza operaciones sensibles"
                                    : "Sin autorización mientras esté inactivo"
                                }
                              />

                              <PermissionLine
                                active={row?.can_self_authorize}
                                text={
                                  row?.can_self_authorize
                                    ? "Puede autoautorizarse"
                                    : "Sin autoautorización"
                                }
                              />
                            </Stack>
                          </TableCell>

                          <TableCell align="center">
                            <FormControlLabel
                              sx={{ m: 0 }}
                              control={
                                <Switch
                                  checked={active}
                                  onChange={() => onToggleStatus?.(row)}
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
                              flexWrap="nowrap"
                            >
                              <Tooltip title="Editar">
                                <IconButton
                                  onClick={() => openEdit(row)}
                                  disabled={busy}
                                  sx={iconEditSx}
                                >
                                  <EditIcon fontSize="small" />
                                </IconButton>
                              </Tooltip>

                              <Tooltip title="Eliminar">
                                <IconButton
                                  onClick={() => setDeleteTarget(row)}
                                  disabled={busy}
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
              itemLabel="autorizadores"
            />
          </>
        )}
      </Paper>

      <OperationalAuthorizerUpsertModal
        open={modalOpen}
        onClose={() => {
          setModalOpen(false);
          setEditing(null);
        }}
        selectedBranch={selectedBranch}
        candidates={candidates}
        editing={editing}
        saving={
          savingAuthorizerId === "create" ||
          savingAuthorizerId === editing?.id
        }
        onSave={handleSaveModal}
        showToast={showToast}
      />

      <Dialog
        open={!!deleteTarget}
        onClose={
          deletingAuthorizerId === deleteTarget?.id
            ? undefined
            : () => setDeleteTarget(null)
        }
        fullWidth
        maxWidth="xs"
      >
        <DialogTitle sx={{ fontWeight: 800 }}>
          Eliminar autorizador
        </DialogTitle>

        <DialogContent>
          <Typography sx={{ fontSize: 14, color: "text.secondary", lineHeight: 1.6 }}>
            ¿Deseas eliminar a{" "}
            <Box component="span" sx={{ color: "text.primary", fontWeight: 800 }}>
              {deleteTarget?.user?.name || "este usuario"}
            </Box>
            ? Ya no podrá autorizar operaciones sensibles en esta sucursal.
          </Typography>
        </DialogContent>

        <DialogActions sx={{ px: 3, pb: 2.5 }}>
          <Button
            variant="outlined"
            onClick={() => setDeleteTarget(null)}
            disabled={deletingAuthorizerId === deleteTarget?.id}
          >
            Cancelar
          </Button>

          <Button
            variant="contained"
            color="error"
            onClick={confirmDelete}
            disabled={deletingAuthorizerId === deleteTarget?.id}
          >
            {deletingAuthorizerId === deleteTarget?.id
              ? "Eliminando…"
              : "Eliminar"}
          </Button>
        </DialogActions>
      </Dialog>
    </>
  );
}

function PermissionLine({ active, text }) {
  return (
    <Stack direction="row" spacing={0.75} alignItems="center" sx={{ mt: 0.5 }}>
      <Box
        sx={{
          width: 24,
          height: 24,
          borderRadius: 999,
          bgcolor: active ? "rgba(46, 125, 50, 0.10)" : "rgba(0,0,0,0.05)",
          color: active ? "success.dark" : "text.secondary",
          display: "grid",
          placeItems: "center",
          flexShrink: 0,
        }}
      >
        {active ? (
          <VerifiedUserIcon sx={{ fontSize: 15 }} />
        ) : (
          <LockIcon sx={{ fontSize: 15 }} />
        )}
      </Box>

      <Typography sx={{ fontSize: 13, color: "text.primary", lineHeight: 1.4 }}>
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
  mb: 0.5,
};

const iconEditSx = {
  width: 40,
  height: 40,
  bgcolor: "#E3C24A",
  color: "#fff",
  borderRadius: 1.5,
  "&:hover": { bgcolor: "#C9AA39" },
};

const iconDeleteSx = {
  width: 40,
  height: 40,
  bgcolor: "error.main",
  color: "#fff",
  borderRadius: 1.5,
  "&:hover": { bgcolor: "error.dark" },
};
