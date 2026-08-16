import { useEffect, useMemo, useState } from "react";
import {
  Box, Button, Dialog, DialogContent, DialogTitle, FormControlLabel, IconButton,
  MenuItem, Paper, Stack, Switch, TextField, Typography, useMediaQuery,
} from "@mui/material";
import { useTheme } from "@mui/material/styles";

import AddOutlinedIcon from "@mui/icons-material/AddOutlined";
import CloseIcon from "@mui/icons-material/Close";
import DeleteOutlineIcon from "@mui/icons-material/DeleteOutline";
import EditOutlinedIcon from "@mui/icons-material/EditOutlined";
import KeyboardArrowDownIcon from "@mui/icons-material/KeyboardArrowDown";
import SaveOutlinedIcon from "@mui/icons-material/SaveOutlined";

import PaginationFooter from "../../../common/PaginationFooter";

import {
  createOnlineOrderDeliveryConcept,
  deleteOnlineOrderDeliveryConcept,
  getOnlineOrderDeliveryConcepts,
  updateOnlineOrderDeliveryConcept,
} from "../../../../services/operation/online-orders/onlineOrders.service";

const ITEMS_PER_PAGE = 5;

const EMPTY_FORM = {
  name: "",
  type: "",
  postal_code: "",
  description: "",
  delivery_fee: "",
  is_active: true,
  sort_order: "",
};

function cleanMoney(value) {
  let result = String(value || "").replace(",", ".").replace(/[^\d.]/g, "");
  const firstDot = result.indexOf(".");

  if (firstDot >= 0) {
    result =
      result.slice(0, firstDot + 1) +
      result.slice(firstDot + 1).replace(/\./g, "");

    const [whole, decimal = ""] = result.split(".");
    result = `${whole}.${decimal.slice(0, 2)}`;
  }

  return result;
}

function cleanInteger(value) {
  return String(value || "").replace(/\D/g, "");
}

export default function DeliveryConceptsCard({
  restaurantId,
  branchId,
  homeDelivery,
  internalLocation,
  onAlert,
}) {
  const [homeConcepts, setHomeConcepts] = useState([]);
  const [internalConcepts, setInternalConcepts] = useState([]);
  const [loading, setLoading] = useState(false);

  const [homePage, setHomePage] = useState(1);
  const [internalPage, setInternalPage] = useState(1);

  const [modal, setModal] = useState({
    open: false,
    fulfillment: null,
    mode: "create",
    concept: null,
  });

  const loadConcepts = async () => {
    if (!restaurantId || !branchId) return;

    setLoading(true);

    try {
      const [homeRows, internalRows] = await Promise.all([
        homeDelivery?.id
          ? getOnlineOrderDeliveryConcepts(restaurantId, branchId, homeDelivery.id)
          : Promise.resolve([]),
        internalLocation?.id
          ? getOnlineOrderDeliveryConcepts(restaurantId, branchId, internalLocation.id)
          : Promise.resolve([]),
      ]);

      setHomeConcepts(homeRows);
      setInternalConcepts(internalRows);
      setHomePage(1);
      setInternalPage(1);
    } catch (error) {
      onAlert?.({
        severity: "error",
        title: "Error",
        message:
          error?.response?.data?.message ||
          error?.message ||
          "No se pudieron cargar las zonas y ubicaciones.",
      });
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadConcepts();
  }, [restaurantId, branchId, homeDelivery?.id, internalLocation?.id]);

  const openCreate = (fulfillment, concepts) => {
    const nextOrder =
      concepts.length === 0
        ? 1
        : Math.max(...concepts.map((item) => Number(item.sort_order) || 0)) + 1;

    setModal({
      open: true,
      fulfillment,
      mode: "create",
      concept: {
        ...EMPTY_FORM,
        type:
          fulfillment?.fulfillment_type === "internal_location"
            ? "internal_area"
            : "zone_name",
        sort_order: String(nextOrder),
      },
    });
  };

  const openEdit = (fulfillment, concept) => {
    setModal({
      open: true,
      fulfillment,
      mode: "edit",
      concept,
    });
  };

  const closeModal = () => {
    setModal({
      open: false,
      fulfillment: null,
      mode: "create",
      concept: null,
    });
  };

  const handleSaved = (saved, mode) => {
    const setter =
      modal.fulfillment?.fulfillment_type === "home_delivery"
        ? setHomeConcepts
        : setInternalConcepts;

    setter((current) => {
      if (mode === "create") return [...current, saved].sort(sortByOrder);

      return current
        .map((item) => (Number(item.id) === Number(saved.id) ? saved : item))
        .sort(sortByOrder);
    });

    closeModal();
  };

  const removeConcept = async (fulfillment, concept) => {
    if (!window.confirm(`¿Deseas eliminar "${concept.name}"?`)) return;

    try {
      const response = await deleteOnlineOrderDeliveryConcept(
        restaurantId,
        branchId,
        fulfillment.id,
        concept.id
      );

      const setter =
        fulfillment.fulfillment_type === "home_delivery"
          ? setHomeConcepts
          : setInternalConcepts;

      setter((current) =>
        current.filter((item) => Number(item.id) !== Number(concept.id))
      );

      onAlert?.({
        severity: "success",
        title: "Hecho",
        message: response?.message || "La configuración se eliminó correctamente.",
      });
    } catch (error) {
      const firstError = Object.values(error?.response?.data?.errors || {}).flat()?.[0];

      onAlert?.({
        severity: "error",
        title: "Error",
        message:
          firstError ||
          error?.response?.data?.message ||
          error?.message ||
          "No se pudo eliminar la configuración.",
      });
    }
  };

  return (
    <>
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
        <Stack spacing={2.5}>
          <Box>
            <Typography sx={{ fontSize: 18, fontWeight: 800, color: "text.primary" }}>
              Zonas y ubicaciones
            </Typography>

            <Typography sx={{ mt: 0.6, fontSize: 13, color: "text.secondary", lineHeight: 1.55 }}>
              Define dónde puede entregarse un pedido y el costo correspondiente.
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
              alignItems: "start",
            }}
          >
            <ConceptSection
              title="Envío a domicilio"
              description="Configura zonas o códigos postales disponibles."
              fulfillment={homeDelivery}
              concepts={homeConcepts}
              page={homePage}
              setPage={setHomePage}
              loading={loading}
              onCreate={() => openCreate(homeDelivery, homeConcepts)}
              onEdit={(concept) => openEdit(homeDelivery, concept)}
              onDelete={(concept) => removeConcept(homeDelivery, concept)}
            />

            <ConceptSection
              title="Ubicaciones internas"
              description="Configura áreas internas donde puede entregarse el pedido."
              fulfillment={internalLocation}
              concepts={internalConcepts}
              page={internalPage}
              setPage={setInternalPage}
              loading={loading}
              onCreate={() => openCreate(internalLocation, internalConcepts)}
              onEdit={(concept) => openEdit(internalLocation, concept)}
              onDelete={(concept) => removeConcept(internalLocation, concept)}
            />
          </Box>
        </Stack>
      </Paper>

      <ConceptModal
        open={modal.open}
        mode={modal.mode}
        concept={modal.concept}
        fulfillment={modal.fulfillment}
        restaurantId={restaurantId}
        branchId={branchId}
        onClose={closeModal}
        onSaved={handleSaved}
        onAlert={onAlert}
      />
    </>
  );
}

function ConceptSection({
  title,
  description,
  fulfillment,
  concepts,
  page,
  setPage,
  loading,
  onCreate,
  onEdit,
  onDelete,
}) {
  const totalPages = Math.max(1, Math.ceil(concepts.length / ITEMS_PER_PAGE));
  const safePage = Math.min(page, totalPages);
  const start = (safePage - 1) * ITEMS_PER_PAGE;
  const visible = concepts.slice(start, start + ITEMS_PER_PAGE);
  const startItem = concepts.length === 0 ? 0 : start + 1;
  const endItem = Math.min(start + ITEMS_PER_PAGE, concepts.length);

  return (
    <Box
      sx={{
        border: "1px solid",
        borderColor: "divider",
        borderRadius: 1,
        backgroundColor: "background.default",
        overflow: "hidden",
      }}
    >
      <Stack spacing={2} sx={{ p: 2 }}>
        <Stack
          direction={{ xs: "column", sm: "row" }}
          justifyContent="space-between"
          alignItems={{ xs: "stretch", sm: "flex-start" }}
          spacing={1.5}
        >
          <Box>
            <Typography sx={{ fontSize: 15, fontWeight: 800, color: "text.primary" }}>
              {title}
            </Typography>

            <Typography sx={{ mt: 0.4, fontSize: 12.5, color: "text.secondary", lineHeight: 1.45 }}>
              {description}
            </Typography>
          </Box>

          <Button
            type="button"
            variant="contained"
            startIcon={<AddOutlinedIcon />}
            onClick={onCreate}
            disabled={!fulfillment?.id || loading}
            sx={{ minWidth: { xs: "100%", sm: 120 } }}
          >
            Agregar
          </Button>
        </Stack>

        {!fulfillment?.id ? (
          <Typography sx={{ fontSize: 12.5, color: "text.secondary", lineHeight: 1.5 }}>
            Guarda primero esta forma de entrega para comenzar a configurarla.
          </Typography>
        ) : visible.length === 0 ? (
          <Typography sx={{ fontSize: 13, color: "text.secondary", py: 2 }}>
            Aún no hay configuraciones registradas.
          </Typography>
        ) : (
          <Stack spacing={1}>
            {visible.map((concept) => (
              <Box
                key={concept.id}
                sx={{
                  p: 1.5,
                  border: "1px solid",
                  borderColor: "divider",
                  borderRadius: 1,
                  backgroundColor: "background.paper",
                }}
              >
                <Stack
                  direction={{ xs: "column", sm: "row" }}
                  justifyContent="space-between"
                  spacing={1.5}
                >
                  <Box sx={{ minWidth: 0 }}>
                    <Typography sx={{ fontSize: 14, fontWeight: 800, color: "text.primary" }}>
                      {concept.name}
                    </Typography>

                    <Typography sx={{ mt: 0.35, fontSize: 12.5, color: "text.secondary" }}>
                      {concept.type === "postal_code"
                        ? `Código postal: ${concept.postal_code || "Sin definir"}`
                        : concept.type === "internal_area"
                          ? "Área interna"
                          : "Zona de entrega"}
                      {" · "}
                      Costo: ${Number(concept.delivery_fee || 0).toFixed(2)}
                    </Typography>
                  </Box>

                  <Stack direction="row" spacing={0.75}>
                    <IconButton onClick={() => onEdit(concept)} size="small">
                      <EditOutlinedIcon fontSize="small" />
                    </IconButton>

                    <IconButton onClick={() => onDelete(concept)} size="small" color="error">
                      <DeleteOutlineIcon fontSize="small" />
                    </IconButton>
                  </Stack>
                </Stack>
              </Box>
            ))}
          </Stack>
        )}
      </Stack>

      {concepts.length > ITEMS_PER_PAGE ? (
        <PaginationFooter
          page={safePage}
          totalPages={totalPages}
          startItem={startItem}
          endItem={endItem}
          total={concepts.length}
          hasPrev={safePage > 1}
          hasNext={safePage < totalPages}
          onPrev={() => setPage(Math.max(1, safePage - 1))}
          onNext={() => setPage(Math.min(totalPages, safePage + 1))}
          itemLabel="registros"
        />
      ) : null}
    </Box>
  );
}

function ConceptModal({
  open,
  mode,
  concept,
  fulfillment,
  restaurantId,
  branchId,
  onClose,
  onSaved,
  onAlert,
}) {
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down("sm"));

  const [form, setForm] = useState(EMPTY_FORM);
  const [saving, setSaving] = useState(false);

  const internalLocation = fulfillment?.fulfillment_type === "internal_location";

  useEffect(() => {
    if (!open) return;

    setForm({
      name: concept?.name || "",
      type: internalLocation ? "internal_area" : concept?.type || "zone_name",
      postal_code: concept?.postal_code || "",
      description: concept?.description || "",
      delivery_fee:
        concept?.delivery_fee === null || concept?.delivery_fee === undefined
          ? ""
          : String(concept.delivery_fee),
      is_active: concept?.is_active !== false,
      sort_order: concept?.sort_order ? String(concept.sort_order) : "",
    });
  }, [open, concept, internalLocation]);

  const canSave = useMemo(() => {
    if (!form.name.trim()) return false;
    if (!form.type) return false;
    if (form.type === "postal_code" && !form.postal_code.trim()) return false;
    if (form.delivery_fee === "" || !/^\d+(\.\d{1,2})?$/.test(form.delivery_fee)) return false;
    if (!/^\d+$/.test(form.sort_order) || Number(form.sort_order) < 1) return false;
    return true;
  }, [form]);

  const save = async () => {
    if (!canSave || !fulfillment?.id) return;

    setSaving(true);

    try {
      const payload = {
        name: form.name.trim(),
        type: form.type,
        postal_code:
          form.type === "postal_code" ? form.postal_code.trim() : null,
        description: form.description.trim() || null,
        delivery_fee: Number(form.delivery_fee),
        is_active: !!form.is_active,
        sort_order: Number(form.sort_order),
      };

      const response =
        mode === "edit"
          ? await updateOnlineOrderDeliveryConcept(
              restaurantId,
              branchId,
              fulfillment.id,
              concept.id,
              payload
            )
          : await createOnlineOrderDeliveryConcept(
              restaurantId,
              branchId,
              fulfillment.id,
              payload
            );

      onSaved?.(response?.data, mode);

      onAlert?.({
        severity: "success",
        title: "Hecho",
        message:
          response?.message ||
          (mode === "edit"
            ? "La configuración se actualizó correctamente."
            : "La configuración se creó correctamente."),
      });
    } catch (error) {
      const firstError = Object.values(error?.response?.data?.errors || {}).flat()?.[0];

      onAlert?.({
        severity: "error",
        title: "Error",
        message:
          firstError ||
          error?.response?.data?.message ||
          error?.message ||
          "No se pudo guardar la configuración.",
      });
    } finally {
      setSaving(false);
    }
  };

  return (
    <Dialog
      open={open}
      onClose={saving ? undefined : onClose}
      fullWidth
      maxWidth="sm"
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
        <Stack direction="row" justifyContent="space-between" spacing={2}>
          <Box>
            <Typography sx={{ fontWeight: 800, fontSize: { xs: 20, sm: 24 }, color: "#fff" }}>
              {mode === "edit" ? "Editar configuración" : "Nueva configuración"}
            </Typography>

            <Typography sx={{ mt: 0.5, fontSize: 13, color: "rgba(255,255,255,0.82)" }}>
              {internalLocation ? "Configura un área interna." : "Configura una zona o código postal."}
            </Typography>
          </Box>

          <IconButton onClick={onClose} disabled={saving} sx={{ color: "#fff" }}>
            <CloseIcon />
          </IconButton>
        </Stack>
      </DialogTitle>

      <DialogContent sx={{ p: { xs: 2, sm: 3 }, bgcolor: "background.default" }}>
        <Paper
          sx={{
            p: { xs: 2, sm: 2.5 },
            borderRadius: 1,
            border: "1px solid",
            borderColor: "divider",
            boxShadow: "none",
          }}
        >
          <Stack spacing={2}>
            {!internalLocation ? (
              <FieldBlock
                label="Tipo *"
                input={
                  <TextField
                    select
                    value={form.type}
                    onChange={(event) =>
                      setForm((current) => ({
                        ...current,
                        type: event.target.value,
                        postal_code:
                          event.target.value === "postal_code"
                            ? current.postal_code
                            : "",
                      }))
                    }
                    SelectProps={{ IconComponent: KeyboardArrowDownIcon }}
                  >
                    <MenuItem value="zone_name">Zona</MenuItem>
                    <MenuItem value="postal_code">Código postal</MenuItem>
                  </TextField>
                }
              />
            ) : null}

            <FieldBlock
              label="Nombre *"
              input={
                <TextField
                  value={form.name}
                  onChange={(event) =>
                    setForm((current) => ({ ...current, name: event.target.value }))
                  }
                  placeholder={internalLocation ? "Ej. Torre A" : "Ej. Zona Diamante"}
                />
              }
            />

            {form.type === "postal_code" ? (
              <FieldBlock
                label="Código postal *"
                input={
                  <TextField
                    value={form.postal_code}
                    onChange={(event) =>
                      setForm((current) => ({
                        ...current,
                        postal_code: event.target.value,
                      }))
                    }
                    placeholder="Ej. 39890"
                  />
                }
              />
            ) : null}

            <FieldBlock
              label="Descripción"
              input={
                <TextField
                  multiline
                  minRows={2}
                  value={form.description}
                  onChange={(event) =>
                    setForm((current) => ({
                      ...current,
                      description: event.target.value,
                    }))
                  }
                />
              }
            />

            <Stack direction={{ xs: "column", sm: "row" }} spacing={2}>
              <FieldBlock
                label="Costo de entrega *"
                input={
                  <TextField
                    type="text"
                    value={form.delivery_fee}
                    onChange={(event) =>
                      setForm((current) => ({
                        ...current,
                        delivery_fee: cleanMoney(event.target.value),
                      }))
                    }
                    placeholder="Ej. 50.00"
                    inputProps={{ inputMode: "decimal" }}
                  />
                }
              />

              <FieldBlock
                label="Orden *"
                input={
                  <TextField
                    type="text"
                    value={form.sort_order}
                    onChange={(event) =>
                      setForm((current) => ({
                        ...current,
                        sort_order: cleanInteger(event.target.value),
                      }))
                    }
                    inputProps={{ inputMode: "numeric", pattern: "[0-9]*" }}
                  />
                }
              />
            </Stack>

            <Box>
              <Typography sx={{ fontSize: 14, fontWeight: 800, color: "text.primary", mb: 1 }}>
                Estado *
              </Typography>

              <FormControlLabel
                sx={{ m: 0 }}
                control={
                  <Switch
                    checked={!!form.is_active}
                    onChange={(event) =>
                      setForm((current) => ({
                        ...current,
                        is_active: event.target.checked,
                      }))
                    }
                    color="primary"
                  />
                }
                label={
                  <Typography sx={{ fontSize: 14, fontWeight: 700, color: "text.primary" }}>
                    {form.is_active ? "Activo" : "Inactivo"}
                  </Typography>
                }
              />
            </Box>

            <Stack direction={{ xs: "column-reverse", sm: "row" }} justifyContent="flex-end" spacing={1.5}>
              <Button
                type="button"
                variant="outlined"
                onClick={onClose}
                disabled={saving}
                sx={{ minWidth: { xs: "100%", sm: 150 }, height: 44 }}
              >
                Cancelar
              </Button>

              <Button
                type="button"
                variant="contained"
                startIcon={<SaveOutlinedIcon />}
                onClick={save}
                disabled={!canSave || saving}
                sx={{ minWidth: { xs: "100%", sm: 180 }, height: 44 }}
              >
                {saving ? "Guardando…" : "Guardar"}
              </Button>
            </Stack>
          </Stack>
        </Paper>
      </DialogContent>
    </Dialog>
  );
}

function FieldBlock({ label, input }) {
  return (
    <Box sx={{ flex: 1, width: "100%" }}>
      <Typography sx={{ fontSize: 14, fontWeight: 800, color: "text.primary", mb: 1 }}>
        {label}
      </Typography>
      {input}
    </Box>
  );
}

function sortByOrder(a, b) {
  return Number(a?.sort_order || 0) - Number(b?.sort_order || 0);
}