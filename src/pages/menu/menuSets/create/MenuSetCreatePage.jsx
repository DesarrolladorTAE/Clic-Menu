import { useEffect, useMemo, useRef, useState } from "react";
import { useLocation, useNavigate, useParams, useSearchParams } from "react-router-dom";

import {
  Box, Button, CircularProgress, Paper, Stack, Typography,
} from "@mui/material";

import ArrowBackOutlinedIcon from "@mui/icons-material/ArrowBackOutlined";

import PageContainer from "../../../../components/common/PageContainer";
import AppAlert from "../../../../components/common/AppAlert";
import MenuSetCreateForm from "../../../../components/menu/menuSets/create/MenuSetCreateForm";

import { getBranchesByRestaurant } from "../../../../services/restaurant/branch.service";
import { createMenuSet } from "../../../../services/menu/menuSets/menuSet.service";

const INITIAL_FORM = {
  name: "",
  billing_name: "",
  price: "",
  sort_order: "0",
  service_days: [],
  capacity_mode: "none",
  sat_product_service: "",
  sat_unit: "",
};

function getErrorMessage(error, fallback) {
  const data = error?.response?.data;
  const fieldErrors = data?.errors && typeof data.errors === "object"
    ? Object.values(data.errors).flat()
    : [];

  return fieldErrors.find((message) => typeof message === "string")
    || data?.message || error?.message || fallback;
}

function validateForm(form) {
  const errors = {};
  const name = form.name.trim();
  const billingName = form.billing_name.trim();
  const price = String(form.price).trim().replace(",", ".");
  const sortOrder = String(form.sort_order).trim();
  const satProduct = form.sat_product_service.trim();
  const satUnit = form.sat_unit.trim();

  if (!name) {
    errors.name = "Debes escribir el nombre del Conjunto.";
  } else if (name.length > 150) {
    errors.name = "El nombre no puede superar los 150 caracteres.";
  }

  if (billingName.length > 150) {
    errors.billing_name = "El nombre para cobro no puede superar los 150 caracteres.";
  }

  if (!price) {
    errors.price = "Debes indicar el precio del Conjunto.";
  } else if (!/^\d+(\.\d{1,2})?$/.test(price) || !Number.isFinite(Number(price))) {
    errors.price = "Ingresa un precio válido con un máximo de dos decimales.";
  }

  if (!/^\d+$/.test(sortOrder) || !Number.isSafeInteger(Number(sortOrder))) {
    errors.sort_order = "El orden debe ser un número entero igual o mayor que cero.";
  }

  if (satProduct.length > 20 || satUnit.length > 20) {
    errors.sat = "Las claves SAT no pueden superar los 20 caracteres.";
  } else if (Boolean(satProduct) !== Boolean(satUnit)) {
    errors.sat = "Debes completar ambas claves de facturación o dejar las dos vacías.";
  }

  return errors;
}

export default function MenuSetCreatePage() {
  const { restaurantId } = useParams();
  const location = useLocation();
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();

  const branchId = String(searchParams.get("branchId") || location.state?.branchId || "");

  const [branches, setBranches] = useState([]);
  const [loadingBranches, setLoadingBranches] = useState(true);
  const [saving, setSaving] = useState(false);
  const [form, setForm] = useState({ ...INITIAL_FORM });
  const [errors, setErrors] = useState({});
  const submittingRef = useRef(false);

  const [alertState, setAlertState] = useState({
    open: false,
    severity: "error",
    title: "",
    message: "",
  });

  const showAlert = ({ severity = "error", title = "Error", message = "" }) => {
    setAlertState({ open: true, severity, title, message });
  };

  const closeAlert = (_, reason) => {
    if (reason === "clickaway") {
      return;
    }

    setAlertState((previous) => ({ ...previous, open: false }));
  };

  useEffect(() => {
    let active = true;

    const loadBranches = async () => {
      setLoadingBranches(true);

      try {
        const result = await getBranchesByRestaurant(restaurantId);
        if (!active) {
          return;
        }

        setBranches(Array.isArray(result) ? result : []);
      } catch (error) {
        if (!active) {
          return;
        }

        setBranches([]);
        showAlert({
          message: getErrorMessage(error, "No se pudieron consultar las sucursales."),
        });
      } finally {
        if (active) {
          setLoadingBranches(false);
        }
      }
    };

    loadBranches();

    return () => {
      active = false;
    };
  }, [restaurantId]);

  const selectedBranch = useMemo(() => {
    return branches.find((branch) => String(branch.id) === branchId) || null;
  }, [branches, branchId]);

  const handleFieldChange = (field, value) => {
    setForm((previous) => ({ ...previous, [field]: value }));

    setErrors((previous) => {
      const next = { ...previous };
      delete next[field];

      if (field === "sat_product_service" || field === "sat_unit") {
        delete next.sat;
      }

      return next;
    });
  };

  const handleToggleDay = (day) => {
    setForm((previous) => {
      const selected = previous.service_days.includes(day);

      return {
        ...previous,
        service_days: selected
          ? previous.service_days.filter((value) => value !== day)
          : [...previous.service_days, day].sort((a, b) => a - b),
      };
    });

    setErrors((previous) => {
      const next = { ...previous };
      delete next.service_days;
      return next;
    });
  };

  const handleBack = () => {
    navigate("..", { relative: "path", state: { branchId } });
  };

  const handleSubmit = async () => {
    if (submittingRef.current || saving || !selectedBranch) {
      return;
    }

    const validationErrors = validateForm(form);
    setErrors(validationErrors);

    if (Object.keys(validationErrors).length > 0) {
      showAlert({
        message: "Revisa los campos señalados antes de crear el Conjunto.",
      });
      return;
    }

    const name = form.name.trim();
    const billingName = form.billing_name.trim();
    const satProduct = form.sat_product_service.trim();
    const satUnit = form.sat_unit.trim();

    const payload = {
      name,
      billing_name: billingName || null,
      price: Number(String(form.price).trim().replace(",", ".")),
      sort_order: Number(form.sort_order),
      service_days: [...form.service_days].sort((a, b) => a - b),
      capacity_mode: form.capacity_mode,
      is_active: false,
    };

    if (satProduct && satUnit) {
      payload.sat = {
        sat_product_service: satProduct,
        sat_unit: satUnit,
      };
    }

    submittingRef.current = true;
    setSaving(true);

    try {
      const response = await createMenuSet(restaurantId, branchId, payload);
      const createdSet = response?.menu_set;

      if (!createdSet?.id) {
        showAlert({
          title: "Revisa el conjunto",
          message: "No se recibió el identificador del conjunto. Verifica el listado antes de intentar crearlo nuevamente.",
        });
        return;
      }

      navigate(`../${createdSet.id}?branchId=${encodeURIComponent(branchId)}`, {
        relative: "path",
        replace: true,
        state: {
          branchId,
          createdSet,
          successMessage: response?.message || "Conjunto creado correctamente.",
        },
      });
    } catch (error) {
      const serverErrors = error?.response?.data?.errors;

      if (serverErrors && typeof serverErrors === "object") {
        const mappedErrors = {};

        Object.entries(serverErrors).forEach(([field, messages]) => {
          const key = field.startsWith("sat.") ? field.replace("sat.", "") : field;
          mappedErrors[key] = Array.isArray(messages) ? messages[0] : String(messages);
        });

        setErrors(mappedErrors);
      }

      showAlert({
        message: getErrorMessage(error, "No se pudo crear el Conjunto."),
      });
    } finally {
      submittingRef.current = false;
      setSaving(false);
    }
  };

  return (
    <PageContainer>
      <Stack spacing={3}>
        {/* Encabezado */}
        <Stack
          direction={{ xs: "column", md: "row" }}
          justifyContent="space-between"
          alignItems={{ xs: "flex-start", md: "center" }}
          spacing={2}
        >
          <Box>
            <Typography sx={{
              fontSize: { xs: 30, md: 42 },
              fontWeight: 800,
              color: "text.primary",
              lineHeight: 1.1,
            }}>
              Nuevo Conjunto
            </Typography>

            <Typography sx={{
              mt: 1,
              fontSize: { xs: 14, md: 17 },
              color: "text.secondary",
              lineHeight: 1.55,
            }}>
              Configura un nuevo conjunto de productos para{" "}
              <Box component="span" sx={{ color: "primary.main", fontWeight: 800 }}>
                {selectedBranch?.name || "la sucursal seleccionada"}
              </Box>.
            </Typography>
          </Box>

          <Button
            type="button"
            variant="outlined"
            startIcon={<ArrowBackOutlinedIcon />}
            onClick={handleBack}
            disabled={saving}
            sx={{ minWidth: { xs: "100%", sm: 190 }, height: 44, fontWeight: 800 }}
          >
            Volver a Conjuntos
          </Button>
        </Stack>

        {loadingBranches ? (
          <Box sx={{ minHeight: "45vh", display: "grid", placeItems: "center" }}>
            <Stack alignItems="center" spacing={2}>
              <CircularProgress />

              <Typography sx={{ fontSize: 14, color: "text.secondary" }}>
                Cargando información…
              </Typography>
            </Stack>
          </Box>
        ) : !selectedBranch ? (
          <Paper sx={{
            p: { xs: 2, sm: 3 },
            borderRadius: 1,
            border: "1px solid",
            borderColor: "divider",
            backgroundColor: "background.paper",
            boxShadow: "none",
          }}>
            <Typography sx={{ fontSize: 18, fontWeight: 800, color: "text.primary" }}>
              Sucursal no disponible
            </Typography>

            <Typography sx={{ mt: 1, fontSize: 14, color: "text.secondary", lineHeight: 1.55 }}>
              Regresa al listado y selecciona la sucursal donde deseas crear el Conjunto.
            </Typography>
          </Paper>
        ) : (
          <MenuSetCreateForm
            branchName={selectedBranch.name}
            form={form}
            errors={errors}
            saving={saving}
            onFieldChange={handleFieldChange}
            onToggleDay={handleToggleDay}
            onSubmit={handleSubmit}
          />
        )}
      </Stack>

      <AppAlert
        open={alertState.open}
        onClose={closeAlert}
        severity={alertState.severity}
        title={alertState.title}
        message={alertState.message}
        autoHideDuration={3000}
      />
    </PageContainer>
  );
}