import { useEffect, useMemo, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";

import { Alert,Box, Button, Card, CardContent, CircularProgress, Divider, FormControl,
  MenuItem, Select, Stack, Typography, } from "@mui/material";
import KeyboardArrowDownIcon from "@mui/icons-material/KeyboardArrowDown";
import RuleIcon from "@mui/icons-material/Rule";
import GroupsIcon from "@mui/icons-material/Groups";
import StorefrontIcon from "@mui/icons-material/Storefront";

import {
  getRestaurantSettings,
  upsertRestaurantSettings,
} from "../../services/restaurant/restaurantSettings.service";

const MODES = [
  { value: "global", label: "Global (compartido)" },
  { value: "branch", label: "Por sucursal" },
];

export default function RestaurantSettings() {
  const nav = useNavigate();
  const { restaurantId } = useParams();

  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  const [err, setErr] = useState("");
  const [warn, setWarn] = useState("");
  const [successMsg, setSuccessMsg] = useState("");

  const [form, setForm] = useState({
    inventory_mode: "branch",
    products_mode: "global",
    recipe_mode: "global",
  });

  const title = useMemo(() => `Configuración del restaurante`, [restaurantId]);

  const productsIsBranch = form.products_mode === "branch";

  const load = async () => {
    setErr("");
    setWarn("");
    setSuccessMsg("");
    setLoading(true);
    try {
      const st = await getRestaurantSettings(restaurantId);
      if (st) {
        const next = {
          inventory_mode: st.inventory_mode ?? "branch",
          products_mode: st.products_mode ?? "global",
          recipe_mode: st.recipe_mode ?? "global",
        };

        if (next.products_mode === "branch" && next.recipe_mode !== "branch") {
          next.recipe_mode = "branch";
        }

        setForm(next);
      }
    } catch (e) {
      setErr(e?.response?.data?.message || "No se pudieron cargar los settings");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    load();
    // eslint-disable-next-line
  }, [restaurantId]);
  
  useEffect(() => {
    if (!successMsg) return;

    const t = setTimeout(() => {
      setSuccessMsg("");
    }, 3000);

    return () => clearTimeout(t);
  }, [successMsg]);
  

  const onChange = (key, value) => {
    setErr("");
    setWarn("");
    setSuccessMsg("");

    setForm((prev) => {
      const next = { ...prev, [key]: value };

      if (key === "products_mode") {
        if (value === "branch") {
          if (next.recipe_mode !== "branch") {
            next.recipe_mode = "branch";
            setWarn("Se fijó “Modo de recetas” en “Por sucursal” porque elegiste “Productos por sucursal”.");
          } else {
            setWarn("Con productos por sucursal, las recetas también deben ser por sucursal.");
          }
        }
      }

      if (key === "recipe_mode" && next.products_mode === "branch" && value !== "branch") {
        next.recipe_mode = "branch";
        setWarn("Los productos por sucursal no pueden tener recetas globales.");
      }

      return next;
    });
  };

  const onSave = async () => {
    setErr("");
    setWarn("");
    setSuccessMsg("");
    setSaving(true);

    const payload = {
      ...form,
      recipe_mode: form.products_mode === "branch" ? "branch" : form.recipe_mode,
    };

    try {
      const res = await upsertRestaurantSettings(restaurantId, payload);

      if (res?.recipe_mode_forced) {
        setWarn(
          res?.message ||
            "Ajuste automático: recipe_mode fue fijado en “Por sucursal” porque products_mode=branch."
        );
      }

      setSuccessMsg("La configuración se guardó correctamente.");

    } catch (e) {
      setErr(e?.response?.data?.message || "No se pudo guardar la configuración");
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
            Cargando configuración…
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
      <Box sx={{ maxWidth: 980, mx: "auto" }}>
        <Stack spacing={3}>
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
              Define cómo se comportará tu restaurante
            </Typography>
          </Box>

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

          {warn && (
            <Alert
              severity="warning"
              sx={{
                borderRadius: 1,
                alignItems: "flex-start",
              }}
            >
              <Box>
                <Typography sx={{ fontWeight: 800, mb: 0.5 }}>
                  Nota
                </Typography>
                <Typography variant="body2">{warn}</Typography>
              </Box>
            </Alert>
          )}

          {successMsg && (
            <Alert
              severity="success"
              sx={{
                borderRadius: 1,
                alignItems: "flex-start",
              }}
            >
              <Box>
                <Typography sx={{ fontWeight: 800, mb: 0.5 }}>
                  Listo
                </Typography>
                <Typography variant="body2">{successMsg}</Typography>
              </Box>
            </Alert>
          )}

          <Card
            sx={{
              borderRadius: 1,
              backgroundColor: "background.paper",
            }}
          >
            <CardContent sx={{ p: { xs: 2.5, sm: 3.5, md: 4 } }}>
              <Stack spacing={3}>
                <FieldSelect
                  label="Modo de inventario"
                  value={form.inventory_mode}
                  onChange={(v) => onChange("inventory_mode", v)}
                  options={MODES}
                  help="Global: un solo almacén. Por sucursal: cada sucursal tiene su almacén."
                />

                <FieldSelect
                  label="Modo de productos"
                  value={form.products_mode}
                  onChange={(v) => onChange("products_mode", v)}
                  options={MODES}
                  help="Global: catálogo base compartido. Por sucursal: cada sucursal administra su catálogo."
                />

                <FieldSelect
                  label="Modo de recetas"
                  value={form.recipe_mode}
                  onChange={(v) => onChange("recipe_mode", v)}
                  options={MODES}
                  help="Global: receta base compartida. Por sucursal: receta puede variar por sucursal."
                  disabledValues={productsIsBranch ? ["global"] : []}
                  tooltipByValue={
                    productsIsBranch
                      ? {
                          global: "Los productos por sucursal no pueden tener recetas globales",
                        }
                      : {}
                  }
                  lockMessage={
                    productsIsBranch
                      ? "Bloqueado: con productos por sucursal, las recetas deben ser por sucursal."
                      : ""
                  }
                />

                {productsIsBranch && (
                  <Box
                    sx={{
                      p: 2,
                      borderRadius: 1,
                      bgcolor: "#F6F7FF",
                      border: "1px solid #DFE3FF",
                    }}
                  >
                    <Stack direction="row" spacing={1.2} alignItems="flex-start">
                      <RuleIcon sx={{ color: "#5C5F7A", mt: "2px" }} />
                      <Box>
                        <Typography
                          sx={{
                            fontWeight: 800,
                            color: "text.primary",
                            fontSize: 14,
                            mb: 0.5,
                          }}
                        >
                          Regla aplicada
                        </Typography>

                        <Typography
                          sx={{
                            color: "text.secondary",
                            fontSize: 13,
                            lineHeight: 1.6,
                          }}
                        >
                          “Modo de recetas” queda en <strong>Por sucursal</strong> porque elegiste{" "}
                          <strong>Productos por sucursal</strong>.
                        </Typography>

                        <Typography
                          sx={{
                            mt: 0.75,
                            color: "text.secondary",
                            fontSize: 13,
                          }}
                        >
                          Los productos por sucursal no pueden tener recetas globales.
                        </Typography>
                      </Box>
                    </Stack>
                  </Box>
                )}

                <Divider />

                <ActionRow
                  icon={<StorefrontIcon sx={{ color: "primary.main" }} />}
                  title="Canales de venta"
                  description="Define los canales a nivel restaurante (sin sucursales, sin productos)."
                  buttonText="Canales de venta"
                  onClick={() => nav(`/owner/restaurants/${restaurantId}/sales-channels`)}
                />

              </Stack>
            </CardContent>
          </Card>

          <Stack
            direction={{ xs: "column-reverse", sm: "row" }}
            justifyContent="flex-end"
            spacing={1.5}
          >
        
            <Button
              onClick={onSave}
              disabled={saving}
              variant="contained"
              sx={{
                minWidth: { xs: "100%", sm: 220 },
                height: 44,
                borderRadius: 2,
                fontWeight: 800,
              }}
            >
              {saving ? "Guardando…" : "Guardar configuración"}
            </Button>
          </Stack>
        </Stack>
      </Box>
    </Box>
  );
}

function FieldSelect({
  label,
  value,
  onChange,
  options,
  help,
  disabledValues = [],
  tooltipByValue = {},
  lockMessage = "",
}) {
  const isLocked = disabledValues.length > 0 && disabledValues.includes(value);

  return (
    <Box>
      <Typography
        sx={{
          fontSize: 15,
          fontWeight: 800,
          color: "text.primary",
          mb: 0.75,
        }}
      >
        {label}
      </Typography>

      {help && (
        <Typography
          sx={{
            mb: 1.25,
            color: "text.secondary",
            fontSize: 13,
            lineHeight: 1.5,
          }}
        >
          {help}
        </Typography>
      )}

      {lockMessage && (
        <Typography
          sx={{
            mb: 1.25,
            fontSize: 12,
            color: "#5C5F7A",
            fontWeight: 600,
          }}
        >
          {lockMessage}
        </Typography>
      )}

      <FormControl fullWidth>
        <Select
          value={value}
          onChange={(e) => onChange(e.target.value)}
          IconComponent={KeyboardArrowDownIcon}
          displayEmpty
          sx={{
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
          }}
        >
          {options.map((op) => {
            const disabled = disabledValues.includes(op.value);
            const tooltip = tooltipByValue?.[op.value];

            return (
              <MenuItem
                key={op.value}
                value={op.value}
                disabled={disabled}
                title={tooltip || ""}
                sx={{
                  fontSize: 14,
                }}
              >
                {op.label}
                {disabled ? " (no disponible)" : ""}
              </MenuItem>
            );
          })}
        </Select>
      </FormControl>

      {isLocked && (
        <Typography
          sx={{
            mt: 1,
            fontSize: 12,
            color: "error.main",
            fontWeight: 700,
          }}
        >
          Este valor ya no es permitido con la configuración actual.
        </Typography>
      )}
    </Box>
  );
}

function ActionRow({ icon, title, description, buttonText, onClick }) {
  return (
    <Stack
      direction={{ xs: "column", md: "row" }}
      justifyContent="space-between"
      alignItems={{ xs: "flex-start", md: "center" }}
      spacing={2}
    >
      <Stack direction="row" spacing={1.25} alignItems="flex-start">
        <Box sx={{ mt: "2px" }}>{icon}</Box>

        <Box>
          <Typography
            sx={{
              fontWeight: 800,
              color: "text.primary",
              fontSize: 15,
            }}
          >
            {title}
          </Typography>

          <Typography
            sx={{
              mt: 0.5,
              color: "text.secondary",
              fontSize: 13,
              lineHeight: 1.5,
            }}
          >
            {description}
          </Typography>
        </Box>
      </Stack>

      <Button
        onClick={onClick}
        variant="contained"
        color="secondary"
        sx={{
          minWidth: { xs: "100%", sm: 190 },
          height: 42,
          borderRadius: 2,
          fontWeight: 800,
          alignSelf: { xs: "stretch", md: "center" },
        }}
      >
        {buttonText}
      </Button>
    </Stack>
  );
}