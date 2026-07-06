import { useMemo, useState } from "react";
import {
  Box,
  Button,
  Card,
  Chip,
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

import AddIcon from "@mui/icons-material/Add";
import DeleteOutlineIcon from "@mui/icons-material/DeleteOutline";
import EditIcon from "@mui/icons-material/Edit";
import GroupsIcon from "@mui/icons-material/Groups";
import LockIcon from "@mui/icons-material/Lock";
import VerifiedUserIcon from "@mui/icons-material/VerifiedUser";

import PaginationFooter from "../../../common/PaginationFooter";
import usePagination from "../../../../hooks/usePagination";

import DiscountAuthorizerUpsertModal from "./DiscountAuthorizerUpsertModal";

const PAGE_SIZE = 5;

export default function DiscountAuthorizersListCard({
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
  const isMobile = useMediaQuery(theme.breakpoints.down("sm"));

  const [modalOpen, setModalOpen] = useState(false);
  const [editing, setEditing] = useState(null);

  const candidateByUserId = useMemo(() => {
    const map = {};

    candidates.forEach((candidate) => {
      if (candidate?.user_id) {
        map[Number(candidate.user_id)] = candidate;
      }
    });

    return map;
  }, [candidates]);

  const availableCandidates = useMemo(() => {
    return candidates.filter((candidate) => !candidate?.already_authorizer);
  }, [candidates]);

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
        "No hay candidatos disponibles para agregar como autorizadores.",
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

  const roleLabelFor = (row) => {
    const candidate = candidateByUserId[Number(row?.user_id)];
    return candidate?.role?.label || "Autorizador";
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
            <Typography
              sx={{
                fontSize: 18,
                fontWeight: 800,
                color: "text.primary",
              }}
            >
              Autorizadores de descuentos
            </Typography>

            <Typography
              sx={{
                mt: 0.35,
                fontSize: 13,
                color: "text.secondary",
              }}
            >
              Administra quién puede aprobar descuentos excedidos en{" "}
              <Box
                component="span"
                sx={{ color: "primary.main", fontWeight: 800 }}
              >
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
                minWidth: { xs: "100%", sm: 190 },
                height: 44,
                borderRadius: 2,
                fontWeight: 800,
              }}
            >
              Nuevo autorizador
            </Button>
          </Stack>
        </Box>

        {authorizers.length === 0 ? (
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
              No hay autorizadores registrados
            </Typography>

            <Typography
              sx={{
                mt: 1,
                color: "text.secondary",
                fontSize: 14,
              }}
            >
              Agrega el primer autorizador para que caja pueda solicitar permiso
              cuando un descuento exceda los límites.
            </Typography>

            <Button
              onClick={openCreate}
              variant="contained"
              startIcon={<AddIcon />}
              disabled={availableCandidates.length === 0}
              sx={{
                mt: 2.5,
                minWidth: { xs: "100%", sm: 230 },
                height: 44,
                borderRadius: 2,
                fontWeight: 800,
              }}
            >
              Nuevo autorizador
            </Button>
          </Box>
        ) : (
          <>
            {isMobile ? (
              <Stack spacing={1.5} sx={{ p: 2 }}>
                {paginatedItems.map((row) => {
                  const active = !!row?.is_active;
                  const busy =
                    savingAuthorizerId === row.id ||
                    deletingAuthorizerId === row.id;

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
                                {row?.user?.name || "Usuario no disponible"}
                              </Typography>
                            </Box>

                            <Chip
                              label={roleLabelFor(row)}
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
                              Permisos
                            </Typography>

                            <Typography sx={mobileValueSx}>
                              {row?.can_authorize_exceeded_discount
                                ? "Puede autorizar descuentos excedidos"
                                : "Sin permiso para autorizar excedidos"}
                            </Typography>

                            <Typography sx={mobileValueSx}>
                              {row?.can_self_authorize
                                ? "Puede autoautorizarse"
                                : "No puede autoautorizarse"}
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
                                  onClick={() => onDelete?.(row)}
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
              </Stack>
            ) : (
              <TableContainer sx={{ width: "100%", overflowX: "auto" }}>
                <Table sx={{ minWidth: 860 }}>
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
                              whiteSpace: "nowrap",
                            },
                          }}
                        >
                          <TableCell>
                            <Typography sx={{ fontWeight: 800 }}>
                              {row?.user?.name || "Usuario no disponible"}
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

                          <TableCell
                            sx={{
                              whiteSpace: "normal !important",
                              minWidth: 320,
                            }}
                          >
                            <Stack spacing={0.5}>
                              <PermissionLine
                                active={row?.can_authorize_exceeded_discount}
                                text={
                                  row?.can_authorize_exceeded_discount
                                    ? "Autoriza descuentos excedidos"
                                    : "No autoriza descuentos excedidos"
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
                              alignItems="center"
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
                                  onClick={() => onDelete?.(row)}
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

      <DiscountAuthorizerUpsertModal
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
    </>
  );
}

function PermissionLine({ active, text }) {
  return (
    <Stack direction="row" spacing={0.75} alignItems="center">
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

      <Typography
        sx={{
          fontSize: 13,
          color: "text.primary",
          lineHeight: 1.4,
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