import { useEffect, useMemo, useState } from "react";
import { Controller, useForm } from "react-hook-form";
import { handleFormApiError } from "../../utils/useFormApiHandler";
import { getByPath } from "../../utils/getByPath";

import { createStaff, updateStaff } from "../../services/staff/staff.service";
import { getBranchesByRestaurant } from "../../services/restaurant/branch.service";
import { getRoles } from "../../services/staff/roles.service";

import { 
  Alert, Box, Button, Card, CardContent, Checkbox, Dialog, DialogContent,
  DialogTitle, FormControl, FormControlLabel, IconButton, MenuItem, Select,
  Stack, Step, StepLabel, Stepper, TextField, Typography, useMediaQuery,
} from "@mui/material";

import { useTheme } from "@mui/material/styles";
import CloseIcon from "@mui/icons-material/Close";
import ArrowBackIcon from "@mui/icons-material/ArrowBack";
import ArrowForwardIcon from "@mui/icons-material/ArrowForward";
import SaveIcon from "@mui/icons-material/Save";
import PersonAddAlt1Icon from "@mui/icons-material/PersonAddAlt1";
import KeyboardArrowDownIcon from "@mui/icons-material/KeyboardArrowDown";

export default function StaffUpsertModal({ open, onClose, restaurantId, editing, onSaved }) {
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down("sm"));

  const isEdit = !!editing?.id;

  const [step, setStep] = useState(1);
  const [saving, setSaving] = useState(false);
  const [msg, setMsg] = useState("");
  const [stepAlert, setStepAlert] = useState("");

  const [branches, setBranches] = useState([]);
  const [rolesOp, setRolesOp] = useState([]);

  const title = useMemo(() => (isEdit ? "Editar empleado" : "Crear empleado"), [isEdit]);

  const {
    control,
    register,
    handleSubmit,
    reset,
    setError,
    watch,
    formState: { errors },
  } = useForm({
    defaultValues: {
      name: "",
      last_name_paternal: "",
      last_name_maternal: "",
      phone: "",
      email: "",
      password: "",
      status: "active",
      new_password: "",
      assignment: { branch_id: "", role_id: "", is_active: true },
    },
  });

  useEffect(() => {
    if (!open) return;

    (async () => {
      setMsg("");
      try {
        const [b, r] = await Promise.all([
          getBranchesByRestaurant(restaurantId),
          getRoles({ scope: "operational" }),
        ]);
        setBranches(Array.isArray(b) ? b : []);
        setRolesOp(Array.isArray(r) ? r : []);
      } catch (e) {
        setMsg(
          e?.response?.data?.message ||
            "No se pudieron cargar catálogos (sucursales/roles)"
        );
      }
    })();
  }, [open, restaurantId]);

  useEffect(() => {
    if (!open) return;

    setStep(1);
    setMsg("");
    setStepAlert("");

    if (isEdit) {
      reset({
        name: editing?.name ?? "",
        last_name_paternal: editing?.last_name_paternal ?? "",
        last_name_maternal: editing?.last_name_maternal ?? "",
        phone: editing?.phone ?? "",
        email: editing?.email ?? "",
        password: "",
        status: editing?.status ?? "active",
        new_password: "",
        assignment: { branch_id: "", role_id: "", is_active: true },
      });
    } else {
      reset({
        name: "",
        last_name_paternal: "",
        last_name_maternal: "",
        phone: "",
        email: "",
        password: "",
        status: "active",
        new_password: "",
        assignment: { branch_id: "", role_id: "", is_active: true },
      });
    }
  }, [open, isEdit, editing, reset]);

  if (!open) return null;

  const goNext = () => {
    setMsg("");
    setStepAlert("");
    if (!isEdit) setStep(2);
  };

  const goBack = () => {
    setMsg("");
    setStep(1);
    setStepAlert("");
  };

  const onSubmit = async (values) => {
    setMsg("");
    setStepAlert("");
    setSaving(true);

    try {
      if (isEdit) {
        const payload = {
          name: values.name,
          last_name_paternal: values.last_name_paternal,
          last_name_maternal: values.last_name_maternal || null,
          phone: values.phone,
          email: values.email,
          status: values.status,
          ...(values.new_password ? { new_password: values.new_password } : {}),
        };

        await updateStaff(restaurantId, editing.id, payload);
        onSaved?.();
        return;
      }

      const payload = {
        name: values.name,
        last_name_paternal: values.last_name_paternal,
        last_name_maternal: values.last_name_maternal || null,
        phone: values.phone,
        email: values.email,
        password: values.password,
        status: values.status,
        assignment: {
          branch_id:
            values.assignment.branch_id === ""
              ? null
              : Number(values.assignment.branch_id),
          role_id: Number(values.assignment.role_id),
          is_active: !!values.assignment.is_active,
        },
      };

      if (!payload.assignment.role_id || Number.isNaN(payload.assignment.role_id)) {
        setError("assignment.role_id", {
          type: "manual",
          message: "Selecciona un rol operativo.",
        });
        setSaving(false);
        setStep(2);
        return;
      }

      await createStaff(restaurantId, payload);
      onSaved?.();
    } catch (e) {
      const mapped = handleFormApiError(e, setError, {
        onMessage: (m) => setMsg(m),
      });

      if (!mapped) {
        setMsg(e?.response?.data?.message || "No se pudo guardar");
      }

      if (!isEdit && e?.response?.status === 422) {
        const apiErrors = e?.response?.data?.errors || {};

        const hasAssignErr =
          !!apiErrors["assignment.role_id"] ||
          !!apiErrors["assignment.branch_id"] ||
          !!apiErrors["assignment.is_active"];

        const hasStep1Err =
          !!apiErrors["name"] ||
          !!apiErrors["last_name_paternal"] ||
          !!apiErrors["last_name_maternal"] ||
          !!apiErrors["phone"] ||
          !!apiErrors["email"] ||
          !!apiErrors["password"] ||
          !!apiErrors["status"] ||
          !!apiErrors["new_password"];

        if (hasAssignErr) {
          setStep(2);
        }

        if (hasStep1Err) {
          setStepAlert("Revisa los campos de Datos del empleado antes de guardar.");
          setStep(2);
        }
      }
    } finally {
      setSaving(false);
    }
  };

  const rolePicked = watch("assignment.role_id");
  const branchPicked = watch("assignment.branch_id");
  const isActivePicked = watch("assignment.is_active");

  const err = (path) => getByPath(errors, path)?.message;

  const advisory =
    !isEdit && step === 2 && isActivePicked && rolePicked && branchPicked !== ""
      ? 'Si más adelante asignas este mismo rol como ACTIVO en "Todas", ya no podrás repetirlo por sucursal.'
      : "";

  const steps = ["Datos del empleado", "Asignación inicial"];

  return (
    <Dialog
      open={open}
      onClose={onClose}
      fullWidth
      maxWidth="md"
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
                fontSize: { xs: 20, sm: 24 },
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
              {isEdit
                ? "Actualiza la información del empleado."
                : "Crea la cuenta del empleado y define su asignación inicial."}
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
          {msg && (
            <Alert
              severity="warning"
              sx={{
                borderRadius: 2,
                alignItems: "flex-start",
              }}
            >
              <Box>
                <Typography sx={{ fontWeight: 800, mb: 0.5 }}>
                  Nota
                </Typography>
                <Typography variant="body2">{msg}</Typography>
              </Box>
            </Alert>
          )}

          {!isEdit && (
            <Card sx={{ borderRadius: 0 }}>
              <CardContent sx={{ p: { xs: 2, sm: 2.5 } }}>
                <Stepper
                  activeStep={step - 1}
                  alternativeLabel={!isMobile}
                  orientation={isMobile ? "vertical" : "horizontal"}
                >
                  {steps.map((label) => (
                    <Step key={label}>
                      <StepLabel>{label}</StepLabel>
                    </Step>
                  ))}
                </Stepper>
              </CardContent>
            </Card>
          )}

          <Card
            sx={{
              borderRadius: 0,
              backgroundColor: "background.paper",
            }}
          >
            <CardContent sx={{ p: { xs: 2, sm: 3 } }}>
              <form onSubmit={handleSubmit(onSubmit)}>
                <Stack spacing={2.5}>
                  {step === 1 && (
                    <>
                      <Typography
                        sx={{
                          fontWeight: 800,
                          fontSize: { xs: 18, sm: 20 },
                          color: "text.primary",
                        }}
                      >
                        Datos del empleado
                      </Typography>

                      <Stack spacing={2}>
                        <FieldBlock
                          label="Nombre"
                          error={err("name")}
                          input={
                            <TextField
                              {...register("name")}
                              placeholder="Ej. Juan"
                              error={!!err("name")}
                              helperText={err("name") || " "}
                            />
                          }
                        />

                        <Stack direction={{ xs: "column", md: "row" }} spacing={2}>
                          <FieldBlock
                            label="Apellido paterno"
                            error={err("last_name_paternal")}
                            input={
                              <TextField
                                {...register("last_name_paternal")}
                                placeholder="Ej. Pérez"
                                error={!!err("last_name_paternal")}
                                helperText={err("last_name_paternal") || " "}
                              />
                            }
                          />

                          <FieldBlock
                            label="Apellido materno"
                            error={err("last_name_maternal")}
                            input={
                              <TextField
                                {...register("last_name_maternal")}
                                placeholder="Ej. López"
                                error={!!err("last_name_maternal")}
                                helperText={err("last_name_maternal") || " "}
                              />
                            }
                          />
                        </Stack>

                        <Stack direction={{ xs: "column", md: "row" }} spacing={2}>
                          <FieldBlock
                            label="Teléfono"
                            error={err("phone")}
                            input={
                              <TextField
                                {...register("phone")}
                                placeholder="10 dígitos"
                                error={!!err("phone")}
                                helperText={err("phone") || " "}
                              />
                            }
                          />

                          <FieldBlock
                            label="Estatus"
                            error={err("status")}
                            input={
                              <Controller
                                name="status"
                                control={control}
                                render={({ field }) => (
                                  <FormControl fullWidth>
                                    <Select
                                      {...field}
                                      IconComponent={KeyboardArrowDownIcon}
                                      sx={selectSx}
                                    >
                                      <MenuItem value="active">Activo</MenuItem>
                                      <MenuItem value="inactive">Inactivo</MenuItem>
                                    </Select>
                                  </FormControl>
                                )}
                              />
                            }
                          />
                        </Stack>

                        <Stack direction={{ xs: "column", md: "row" }} spacing={2}>
                          <FieldBlock
                            label="Correo electrónico"
                            error={err("email")}
                            input={
                              <TextField
                                {...register("email")}
                                type="email"
                                placeholder="correo@ejemplo.com"
                                error={!!err("email")}
                                helperText={err("email") || " "}
                              />
                            }
                          />

                          {!isEdit ? (
                            <FieldBlock
                              label="Contraseña"
                              error={err("password")}
                              input={
                                <TextField
                                  {...register("password")}
                                  type="password"
                                  placeholder="Contraseña"
                                  error={!!err("password")}
                                  helperText={err("password") || " "}
                                />
                              }
                            />
                          ) : (
                            <FieldBlock
                              label="Contraseña nueva (opcional)"
                              error={err("new_password")}
                              help="Si lo dejas vacío, no se cambia."
                              input={
                                <TextField
                                  {...register("new_password")}
                                  type="password"
                                  placeholder="Nueva contraseña"
                                  error={!!err("new_password")}
                                  helperText={err("new_password") || " "}
                                />
                              }
                            />
                          )}
                        </Stack>
                      </Stack>
                    </>
                  )}

                  {!isEdit && step === 2 && (
                    <>
                      <Typography
                        sx={{
                          fontWeight: 800,
                          fontSize: { xs: 18, sm: 20 },
                          color: "text.primary",
                        }}
                      >
                        Asignación inicial
                      </Typography>

                      {stepAlert && (
                        <Alert
                          severity="warning"
                          sx={{
                            borderRadius: 2,
                            alignItems: "flex-start",
                          }}
                        >
                          <Box>
                            <Typography sx={{ fontWeight: 800, mb: 0.5 }}>
                              Revisa los datos del empleado
                            </Typography>
                            <Typography variant="body2">{stepAlert}</Typography>
                          </Box>
                        </Alert>
                      )}


                      {!rolePicked && (
                        <Box
                          sx={{
                            p: 2,
                            borderRadius: 2,
                            bgcolor: "#F6F7FF",
                            border: "1px solid #DFE3FF",
                          }}
                        >
                          <Typography
                            sx={{
                              fontWeight: 800,
                              fontSize: 14,
                              color: "text.primary",
                              mb: 0.5,
                            }}
                          >
                            Asignación inicial obligatoria
                          </Typography>

                          <Typography
                            sx={{
                              fontSize: 13,
                              color: "text.secondary",
                              lineHeight: 1.5,
                            }}
                          >
                            Evita cuentas staff sin asignación operativa inicial.
                          </Typography>
                        </Box>
                      )}

                      {advisory && (
                        <Alert
                          severity="info"
                          sx={{
                            borderRadius: 2,
                            alignItems: "flex-start",
                          }}
                        >
                          <Typography variant="body2">{advisory}</Typography>
                        </Alert>
                      )}

                      <Stack spacing={2}>
                        <Stack direction={{ xs: "column", md: "row" }} spacing={2}>
                          <FieldBlock
                            label="Sucursal"
                            error={err("assignment.branch_id")}
                            input={
                              <Controller
                                name="assignment.branch_id"
                                control={control}
                                render={({ field }) => (
                                  <FormControl fullWidth>
                                    <Select
                                      {...field}
                                      IconComponent={KeyboardArrowDownIcon}
                                      displayEmpty
                                      sx={selectSx}
                                    >
                                      <MenuItem value="">Todas (sin sucursal)</MenuItem>
                                      {branches.map((b) => (
                                        <MenuItem key={b.id} value={String(b.id)}>
                                          {b.name}
                                        </MenuItem>
                                      ))}
                                    </Select>
                                  </FormControl>
                                )}
                              />
                            }
                          />

                          <FieldBlock
                            label="Rol operativo"
                            error={err("assignment.role_id")}
                            input={
                              <Controller
                                name="assignment.role_id"
                                control={control}
                                render={({ field }) => (
                                  <FormControl fullWidth>
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
                                  </FormControl>
                                )}
                              />
                            }
                          />
                        </Stack>

                        <Controller
                          name="assignment.is_active"
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
                                <Typography
                                  sx={{
                                    fontSize: 14,
                                    fontWeight: 700,
                                    color: "text.primary",
                                  }}
                                >
                                  Asignación activa
                                </Typography>
                              }
                              sx={{ m: 0 }}
                            />
                          )}
                        />

                        {err("assignment.is_active") && (
                          <Typography sx={errTextSx}>
                            {err("assignment.is_active")}
                          </Typography>
                        )}

                        {rolePicked === "" && (
                          <Typography
                            sx={{
                              fontSize: 12,
                              color: "text.secondary",
                            }}
                          >
                            Selecciona un rol operativo para poder guardar.
                          </Typography>
                        )}
                      </Stack>
                    </>
                  )}

                  <Stack
                    direction={{ xs: "column-reverse", sm: "row" }}
                    justifyContent="space-between"
                    spacing={1.5}
                    pt={1}
                  >
                    <Box>
                      {!isEdit && step === 2 ? (
                        <Button
                          type="button"
                          onClick={goBack}
                          variant="outlined"
                          startIcon={<ArrowBackIcon />}
                          sx={{
                            minWidth: { xs: "100%", sm: 150 },
                            height: 44,
                            borderRadius: 2,
                          }}
                        >
                          Atrás
                        </Button>
                      ) : (
                        <Button
                          type="button"
                          onClick={onClose}
                          variant="outlined"
                          sx={{
                            minWidth: { xs: "100%", sm: 150 },
                            height: 44,
                            borderRadius: 2,
                          }}
                        >
                          Cancelar
                        </Button>
                      )}
                    </Box>

                    <Box>
                      {!isEdit && step === 1 ? (
                        <Button
                          type="button"
                          onClick={goNext}
                          variant="contained"
                          endIcon={<ArrowForwardIcon />}
                          sx={{
                            minWidth: { xs: "100%", sm: 170 },
                            height: 44,
                            borderRadius: 2,
                            fontWeight: 800,
                          }}
                        >
                          Siguiente
                        </Button>
                      ) : (
                        <Button
                          type="submit"
                          disabled={saving}
                          variant="contained"
                          startIcon={isEdit ? <SaveIcon /> : <PersonAddAlt1Icon />}
                          sx={{
                            minWidth: { xs: "100%", sm: 190 },
                            height: 44,
                            borderRadius: 2,
                            fontWeight: 800,
                          }}
                        >
                          {saving ? "Guardando…" : "Guardar"}
                        </Button>
                      )}
                    </Box>
                  </Stack>
                </Stack>
              </form>
            </CardContent>
          </Card>
        </Stack>
      </DialogContent>
    </Dialog>
  );
}

function FieldBlock({ label, input, error, help }) {
  return (
    <Box sx={{ flex: 1, width: "100%" }}>
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

      {input}

      {help && (
        <Typography
          sx={{
            mt: 0.75,
            fontSize: 12,
            color: "text.secondary",
            lineHeight: 1.45,
          }}
        >
          {help}
        </Typography>
      )}

      {!error && !help ? null : null}
    </Box>
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

const errTextSx = {
  mt: 0.75,
  color: "error.main",
  fontSize: 12,
  fontWeight: 700,
};