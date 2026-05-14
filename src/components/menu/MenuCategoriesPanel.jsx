import { Fragment, useMemo, useState } from "react";

import {
  Box, Button, Card, Chip, FormControlLabel, IconButton, Paper, Stack, Switch, Table, TableBody, TableCell,
  TableContainer, TableHead, TableRow, Tooltip, Typography, useMediaQuery,
} from "@mui/material";

import { useTheme } from "@mui/material/styles";

import AddIcon from "@mui/icons-material/Add";
import EditIcon from "@mui/icons-material/Edit";
import DeleteOutlineIcon from "@mui/icons-material/DeleteOutline";

import {
  createCategory,
  updateCategory,
  deleteCategory,
} from "../../services/menu/categories.service";

import AppAlert from "../../components/common/AppAlert";
import usePagination from "../../hooks/usePagination";
import PaginationFooter from "../../components/common/PaginationFooter";
import MenuCategoryUpsertModal from "./MenuCategoryUpsertModal";

const PAGE_SIZE = 5;

export default function MenuCategoriesPanel({
  restaurantId,
  requiresBranch,
  effectiveBranchId,
  categories,
  sections,
  getSectionLabel,
  onReload,
  onReloadAll,
}) {
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down("sm"));

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

  const getBackendMessage = (e, fallback) => {
    return (
      e?.response?.data?.message ||
      e?.response?.data?.errors?.branch_id?.[0] ||
      e?.response?.data?.errors?.section_id?.[0] ||
      fallback
    );
  };

  const reloadCatalog = async () => {
    if (typeof onReloadAll === "function") {
      return await onReloadAll();
    }

    return await onReload();
  };

  const setSaving = (categoryId, value) => {
    setSavingMap((prev) => ({ ...prev, [categoryId]: value }));
  };

  const isSaving = (categoryId) => !!savingMap[categoryId];

  const sortedCategories = useMemo(() => {
    const sectionOrderMap = {};
    const sectionNameMap = {};

    sections.forEach((section) => {
      sectionOrderMap[section.id] = Number(section.sort_order ?? 0);
      sectionNameMap[section.id] = section.name || "";
    });

    return [...categories].sort((a, b) => {
      const aSectionOrder = a.section_id
        ? Number(sectionOrderMap[a.section_id] ?? 999999)
        : 999999;
      const bSectionOrder = b.section_id
        ? Number(sectionOrderMap[b.section_id] ?? 999999)
        : 999999;

      if (aSectionOrder !== bSectionOrder) {
        return aSectionOrder - bSectionOrder;
      }

      const aSectionName = a.section_id
        ? sectionNameMap[a.section_id] || ""
        : "Sin sección";
      const bSectionName = b.section_id
        ? sectionNameMap[b.section_id] || ""
        : "Sin sección";

      const bySectionName = aSectionName.localeCompare(bSectionName, "es", {
        sensitivity: "base",
      });
      if (bySectionName !== 0) {
        return bySectionName;
      }

      const aCategoryOrder = Number(a.sort_order ?? 0);
      const bCategoryOrder = Number(b.sort_order ?? 0);

      if (aCategoryOrder !== bCategoryOrder) {
        return aCategoryOrder - bCategoryOrder;
      }

      return (a.name || "").localeCompare(b.name || "", "es", {
        sensitivity: "base",
      });
    });
  }, [categories, sections]);

  const activeCategoriesCount = useMemo(() => {
    return sortedCategories.filter((c) => c.status === "active").length;
  }, [sortedCategories]);

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
    items: sortedCategories,
    initialPage: 1,
    pageSize: PAGE_SIZE,
    mode: "frontend",
  });

  const openCreate = () => {
    setEditing(null);
    setModalOpen(true);
  };

  const openEdit = (row) => {
    setEditing(row);
    setModalOpen(true);
  };

  const onToggleStatus = async (row) => {
    const categoryId = row?.id;
    if (!categoryId || isSaving(categoryId)) return;

    const nextStatus = row.status === "active" ? "inactive" : "active";

    if (row.status === "active" && activeCategoriesCount <= 1) {
      showAlert({
        severity: "warning",
        title: "No disponible",
        message: "Debe existir al menos una categoría activa en este contexto.",
      });
      return;
    }

    setSaving(categoryId, true);

    try {
      await updateCategory(restaurantId, categoryId, {
        branch_id: requiresBranch ? effectiveBranchId : null,
        section_id: row.section_id ? Number(row.section_id) : null,
        name: row.name,
        description: row.description || null,
        sort_order: Number(row.sort_order || 0),
        status: nextStatus,
      });

      await reloadCatalog();

      showAlert({
        severity: "success",
        title: "Hecho",
        message:
          nextStatus === "active"
            ? "Categoría activada correctamente."
            : "Categoría desactivada correctamente.",
      });
    } catch (e) {
      showAlert({
        severity: "error",
        title: "Error",
        message: getBackendMessage(e, "No se pudo actualizar la categoría"),
      });

      await reloadCatalog();
    } finally {
      setSaving(categoryId, false);
    }
  };

  const onDelete = async (row) => {
    const categoryId = row?.id;
    if (!categoryId) return;

    if (row.status === "active" && activeCategoriesCount <= 1) {
      showAlert({
        severity: "warning",
        title: "No disponible",
        message: "Debe existir al menos una categoría activa en este contexto.",
      });
      return;
    }

    const ok = window.confirm("¿Eliminar esta categoría?");
    if (!ok) return;

    setSaving(categoryId, true);

    try {
      await deleteCategory(restaurantId, categoryId);
      await reloadCatalog();

      showAlert({
        severity: "success",
        title: "Hecho",
        message: "Categoría eliminada correctamente.",
      });
    } catch (e) {
      showAlert({
        severity: "error",
        title: "Error",
        message: getBackendMessage(e, "No se pudo eliminar la categoría"),
      });

      await reloadCatalog();
    } finally {
      setSaving(categoryId, false);
    }
  };

  return (
    <>
      <Paper
        sx={{
          p: 0,
          overflow: "hidden",
          borderRadius: 0,
          backgroundColor: "background.paper",
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
              Lista de categorías
            </Typography>

            <Typography
              sx={{
                mt: 0.5,
                fontSize: 12,
                color: "text.secondary",
              }}
            >
              Debe existir al menos una categoría activa para poder clasificar productos.
            </Typography>
          </Box>

          <Button
            onClick={openCreate}
            variant="contained"
            startIcon={<AddIcon />}
            sx={{
              minWidth: { xs: "100%", sm: 180 },
              height: 42,
              borderRadius: 2,
              fontWeight: 800,
            }}
          >
            Nueva categoría
          </Button>
        </Box>

        {sortedCategories.length === 0 ? (
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
              No hay categorías registradas
            </Typography>

            <Typography
              sx={{
                mt: 1,
                color: "text.secondary",
                fontSize: 14,
              }}
            >
              Crea tu primera categoría para seguir organizando tu menú.
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
              Nueva categoría
            </Button>
          </Box>
        ) : (
          <>
            {isMobile ? (
              <Stack spacing={1.5} sx={{ p: 2 }}>
                {paginatedItems.map((c, index) => {
                  const active = c.status === "active";
                  const busy = isSaving(c.id);
                  const isLastActive = active && activeCategoriesCount <= 1;
                  const prev = paginatedItems[index - 1];
                  const sectionChanged =
                    !prev || prev.section_id !== c.section_id;

                  return (
                    <Fragment key={c.id}>
                      {sectionChanged && (
                        <Box
                          sx={{
                            px: 0.5,
                            pt: index === 0 ? 0 : 1,
                            pb: 0.25,
                          }}
                        >
                          <Typography
                            sx={{
                              fontSize: 13,
                              fontWeight: 800,
                              color: "primary.main",
                              textTransform: "uppercase",
                              letterSpacing: 0.4,
                            }}
                          >
                            {getSectionLabel(c.section_id)}
                          </Typography>
                        </Box>
                      )}

                      <Card
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
                                  {c.name}
                                </Typography>

                                {c.description ? (
                                  <Typography
                                    sx={{
                                      mt: 0.5,
                                      fontSize: 13,
                                      color: "text.secondary",
                                      wordBreak: "break-word",
                                    }}
                                  >
                                    {c.description}
                                  </Typography>
                                ) : null}

                                {isLastActive ? (
                                  <Typography
                                    sx={{
                                      mt: 0.75,
                                      fontSize: 12,
                                      color: "warning.dark",
                                      fontWeight: 700,
                                    }}
                                  >
                                    Esta es la única categoría activa.
                                  </Typography>
                                ) : null}
                              </Box>

                              <Chip
                                label={`Orden ${c.sort_order ?? 0}`}
                                size="small"
                                sx={{
                                  fontWeight: 800,
                                  bgcolor: "#FFF3E0",
                                  color: "#A75A00",
                                }}
                              />
                            </Stack>

                            <Box>
                              <Typography sx={mobileLabelSx}>Sección</Typography>
                              <Typography sx={mobileValueSx}>
                                {getSectionLabel(c.section_id)}
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
                              <Tooltip
                                title={
                                  isLastActive
                                    ? "Debe existir al menos una categoría activa."
                                    : ""
                                }
                              >
                                <span>
                                  <FormControlLabel
                                    sx={{ m: 0 }}
                                    control={
                                      <Switch
                                        checked={active}
                                        onChange={() => onToggleStatus(c)}
                                        disabled={busy || isLastActive}
                                        color="primary"
                                      />
                                    }
                                    label={
                                      <Typography sx={switchLabelSx}>
                                        {active ? "Activo" : "Inactivo"}
                                      </Typography>
                                    }
                                  />
                                </span>
                              </Tooltip>

                              <Stack direction="row" spacing={1}>
                                <Tooltip title="Editar">
                                  <IconButton
                                    onClick={() => openEdit(c)}
                                    sx={iconEditSx}
                                    disabled={busy}
                                  >
                                    <EditIcon fontSize="small" />
                                  </IconButton>
                                </Tooltip>

                                <Tooltip
                                  title={
                                    isLastActive
                                      ? "Debe existir al menos una categoría activa."
                                      : "Eliminar"
                                  }
                                >
                                  <span>
                                    <IconButton
                                      onClick={() => onDelete(c)}
                                      sx={iconDeleteSx}
                                      disabled={busy || isLastActive}
                                    >
                                      <DeleteOutlineIcon fontSize="small" />
                                    </IconButton>
                                  </span>
                                </Tooltip>
                              </Stack>
                            </Box>
                          </Stack>
                        </Box>
                      </Card>
                    </Fragment>
                  );
                })}
              </Stack>
            ) : (
              <TableContainer sx={{ width: "100%", overflowX: "auto" }}>
                <Table sx={{ minWidth: 980 }}>
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
                      <TableCell>Descripción</TableCell>
                      <TableCell>Sección</TableCell>
                      <TableCell>Orden</TableCell>
                      <TableCell align="center">Estado</TableCell>
                      <TableCell align="right">Acciones</TableCell>
                    </TableRow>
                  </TableHead>

                  <TableBody>
                    {paginatedItems.map((c, index) => {
                      const active = c.status === "active";
                      const busy = isSaving(c.id);
                      const isLastActive = active && activeCategoriesCount <= 1;
                      const prev = paginatedItems[index - 1];
                      const sectionChanged =
                        !prev || prev.section_id !== c.section_id;

                      return (
                        <Fragment key={c.id}>
                          {sectionChanged && (
                            <TableRow>
                              <TableCell
                                colSpan={6}
                                sx={{
                                  bgcolor: "#FFF7ED",
                                  color: "primary.main",
                                  fontWeight: 800,
                                  fontSize: 13,
                                  borderBottom: "1px solid",
                                  borderColor: "divider",
                                  textTransform: "uppercase",
                                  letterSpacing: 0.4,
                                }}
                              >
                                {getSectionLabel(c.section_id)}
                              </TableCell>
                            </TableRow>
                          )}

                          <TableRow
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
                              <Stack spacing={0.5}>
                                <Typography sx={{ fontWeight: 800 }}>
                                  {c.name}
                                </Typography>

                                {isLastActive ? (
                                  <Typography
                                    sx={{
                                      fontSize: 12,
                                      color: "warning.dark",
                                      fontWeight: 700,
                                    }}
                                  >
                                    Única categoría activa
                                  </Typography>
                                ) : null}
                              </Stack>
                            </TableCell>

                            <TableCell
                              sx={{
                                whiteSpace: "normal !important",
                                minWidth: 260,
                              }}
                            >
                              {c.description || "—"}
                            </TableCell>

                            <TableCell>{getSectionLabel(c.section_id)}</TableCell>

                            <TableCell>{c.sort_order ?? 0}</TableCell>

                            <TableCell align="center">
                              <Tooltip
                                title={
                                  isLastActive
                                    ? "Debe existir al menos una categoría activa."
                                    : ""
                                }
                              >
                                <span>
                                  <FormControlLabel
                                    sx={{ m: 0 }}
                                    control={
                                      <Switch
                                        checked={active}
                                        onChange={() => onToggleStatus(c)}
                                        disabled={busy || isLastActive}
                                        color="primary"
                                      />
                                    }
                                    label={
                                      <Typography sx={switchLabelSx}>
                                        {active ? "Activo" : "Inactivo"}
                                      </Typography>
                                    }
                                  />
                                </span>
                              </Tooltip>
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
                                    onClick={() => openEdit(c)}
                                    sx={iconEditSx}
                                    disabled={busy}
                                  >
                                    <EditIcon fontSize="small" />
                                  </IconButton>
                                </Tooltip>

                                <Tooltip
                                  title={
                                    isLastActive
                                      ? "Debe existir al menos una categoría activa."
                                      : "Eliminar"
                                  }
                                >
                                  <span>
                                    <IconButton
                                      onClick={() => onDelete(c)}
                                      sx={iconDeleteSx}
                                      disabled={busy || isLastActive}
                                    >
                                      <DeleteOutlineIcon fontSize="small" />
                                    </IconButton>
                                  </span>
                                </Tooltip>
                              </Stack>
                            </TableCell>
                          </TableRow>
                        </Fragment>
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
              itemLabel="categorías"
            />
          </>
        )}
      </Paper>

      <MenuCategoryUpsertModal
        open={modalOpen}
        onClose={() => setModalOpen(false)}
        restaurantId={restaurantId}
        requiresBranch={requiresBranch}
        effectiveBranchId={effectiveBranchId}
        sections={sections}
        editing={editing}
        onSaved={async () => {
          setModalOpen(false);
          setEditing(null);
          await reloadCatalog();
        }}
        api={{
          createCategory,
          updateCategory,
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
  "&.Mui-disabled": {
    bgcolor: "#E0E0E0",
    color: "#9E9E9E",
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
  "&.Mui-disabled": {
    bgcolor: "#E0E0E0",
    color: "#9E9E9E",
  },
};