import {
  Box, Button, Card, CardContent, Dialog, DialogContent, DialogTitle, FormControlLabel, IconButton, Stack, Switch, TextField, Typography,
  useMediaQuery,
} from "@mui/material";

import {
  useEffect,
} from "react";

import {
  Controller as FormController,
  useFieldArray,
  useForm,
} from "react-hook-form";

import { useTheme } from "@mui/material/styles";

import CloseIcon from "@mui/icons-material/Close";
import AddOutlinedIcon from "@mui/icons-material/AddOutlined";
import DeleteOutlineOutlinedIcon from "@mui/icons-material/DeleteOutlineOutlined";
import SaveOutlinedIcon from "@mui/icons-material/SaveOutlined";

const DAYS = [
  {
    value: 1,
    label: "Lunes",
  },
  {
    value: 2,
    label: "Martes",
  },
  {
    value: 3,
    label: "Miércoles",
  },
  {
    value: 4,
    label: "Jueves",
  },
  {
    value: 5,
    label: "Viernes",
  },
  {
    value: 6,
    label: "Sábado",
  },
  {
    value: 7,
    label: "Domingo",
  },
];

export default function MenuScheduleDialog({
  open,
  node,
  nodeType,
  readOnly = false,
  onClose,
  onSave,
}) {
  const theme = useTheme();

  const isMobile =
    useMediaQuery(
      theme.breakpoints.down(
        "sm"
      )
    );

  const {
    control,
    register,
    handleSubmit,
    reset,
    formState: {
      errors,
    },
  } = useForm({
    defaultValues: {
      intervals: [],
    },
  });

  const {
    fields,
    append,
    remove,
  } = useFieldArray({
    control,
    name: "intervals",
  });

  useEffect(() => {
    if (!open) return;

    reset({
      intervals:
        Array.isArray(
          node?.schedules
        )
          ? node.schedules.map(
              (schedule) => ({
                day_of_week:
                  Number(
                    schedule.day_of_week
                  ),

                start_time:
                  String(
                    schedule.start_time ||
                      ""
                  ).slice(0, 5),

                end_time:
                  String(
                    schedule.end_time ||
                      ""
                  ).slice(0, 5),

                is_active:
                  schedule.is_active !==
                  false,
              })
            )
          : [],
    });
  }, [
    open,
    node,
    reset,
  ]);

  const addInterval = (
    day
  ) => {
    append({
      day_of_week: day,
      start_time: "09:00",
      end_time: "18:00",
      is_active: true,
    });
  };

  const submit = (form) => {
    onSave(
      form.intervals.map(
        (interval) => ({
          day_of_week:
            Number(
              interval.day_of_week
            ),

          start_time:
            interval.start_time,

          end_time:
            interval.end_time,

          is_active:
            interval.is_active !==
            false,
        })
      )
    );
  };

  if (!open || !node) {
    return null;
  }

  const typeLabel =
    nodeType === "section"
      ? "sección"
      : nodeType ===
          "category"
        ? "categoría"
        : "producto";

  return (
    <Dialog
      open={open}
      onClose={onClose}
      fullWidth
      maxWidth="md"
      fullScreen={isMobile}
      slotProps={{
        paper: {
          sx: {
            borderRadius: {
              xs: 0,
              sm: 1,
            },
            overflow: "hidden",
            backgroundColor:
              "background.paper",
          },
        },
      }}
    >
      <DialogTitle
        sx={{
          px: {
            xs: 2,
            sm: 3,
          },
          py: 2,
          bgcolor: "#111111",
          color: "#fff",
        }}
      >
        <Stack
          direction="row"
          justifyContent="space-between"
          alignItems="flex-start"
          spacing={2}
        >
          <Box>
            <Typography
              sx={{
                fontWeight: 800,
                fontSize: {
                  xs: 20,
                  sm: 24,
                },
                lineHeight: 1.2,
                color: "#fff",
              }}
            >
              Horario de la{" "}
              {typeLabel}
            </Typography>

            <Typography
              sx={{
                mt: 0.5,
                fontSize: 13,
                color:
                  "rgba(255,255,255,0.82)",
              }}
            >
              {node.display_name ||
                node.name}
            </Typography>
          </Box>

          <IconButton
            onClick={onClose}
            sx={{
              color: "#fff",
              bgcolor:
                "rgba(255,255,255,0.08)",
              "&:hover": {
                bgcolor:
                  "rgba(255,255,255,0.16)",
              },
            }}
          >
            <CloseIcon />
          </IconButton>
        </Stack>
      </DialogTitle>

      <DialogContent
        sx={{
          p: {
            xs: 2,
            sm: 3,
          },
          bgcolor:
            "background.default",
        }}
      >
        <form
          onSubmit={handleSubmit(
            submit
          )}
        >
          <Card
            sx={{
              borderRadius: 1,
              backgroundColor:
                "background.paper",
              border: "1px solid",
              borderColor: "divider",
              boxShadow: "none",
            }}
          >
            <CardContent
              sx={{
                p: {
                  xs: 2,
                  sm: 3,
                },
              }}
            >
              <Stack spacing={2.5}>
                <Box>
                  <Typography
                    sx={{
                      fontSize: 18,
                      fontWeight: 800,
                      color: "text.primary",
                    }}
                  >
                    Horarios propios
                  </Typography>

                  <Typography
                    sx={{
                      mt: 0.5,
                      fontSize: 13,
                      color:
                        "text.secondary",
                      lineHeight: 1.55,
                    }}
                  >
                    Puedes agregar más de
                    un intervalo por día.
                    Cuando no existen
                    intervalos propios, el
                    elemento hereda el
                    horario superior.
                  </Typography>
                </Box>

                {DAYS.map(
                  (day) => {
                    const dayFields =
                      fields
                        .map(
                          (
                            field,
                            index
                          ) => ({
                            field,
                            index,
                          })
                        )
                        .filter(
                          ({
                            field,
                          }) =>
                            Number(
                              field.day_of_week
                            ) ===
                            day.value
                        );

                    return (
                      <Box
                        key={
                          day.value
                        }
                        sx={{
                          p: 1.5,
                          borderRadius: 1,
                          border:
                            "1px solid",
                          borderColor:
                            "divider",
                          bgcolor:
                            "background.default",
                        }}
                      >
                        <Stack spacing={1.5}>
                          <Stack
                            direction="row"
                            justifyContent="space-between"
                            alignItems="center"
                            spacing={1}
                          >
                            <Typography
                              sx={{
                                fontSize: 14,
                                fontWeight: 800,
                                color:
                                  "text.primary",
                              }}
                            >
                              {day.label}
                            </Typography>

                            {!readOnly ? (
                              <Button
                                type="button"
                                variant="outlined"
                                size="small"
                                startIcon={
                                  <AddOutlinedIcon />
                                }
                                onClick={() =>
                                  addInterval(
                                    day.value
                                  )
                                }
                              >
                                Agregar intervalo
                              </Button>
                            ) : null}
                          </Stack>

                          {dayFields.length ===
                          0 ? (
                            <Typography
                              sx={{
                                fontSize: 12,
                                color:
                                  "text.secondary",
                              }}
                            >
                              Sin horario propio.
                            </Typography>
                          ) : (
                            <Stack spacing={1}>
                              {dayFields.map(
                                ({
                                  field,
                                  index,
                                }) => (
                                  <Stack
                                    key={
                                      field.id
                                    }
                                    direction={{
                                      xs: "column",
                                      sm: "row",
                                    }}
                                    spacing={1}
                                    alignItems={{
                                      xs: "stretch",
                                      sm: "center",
                                    }}
                                  >
                                    <input
                                      type="hidden"
                                      {...register(
                                        `intervals.${index}.day_of_week`
                                      )}
                                    />

                                    <TextField
                                      type="time"
                                      fullWidth
                                      disabled={
                                        readOnly
                                      }
                                      error={
                                        !!errors
                                          ?.intervals?.[
                                          index
                                        ]
                                          ?.start_time
                                      }
                                      {...register(
                                        `intervals.${index}.start_time`,
                                        {
                                          required:
                                            "La hora inicial es obligatoria.",
                                        }
                                      )}
                                    />

                                    <TextField
                                      type="time"
                                      fullWidth
                                      disabled={
                                        readOnly
                                      }
                                      error={
                                        !!errors
                                          ?.intervals?.[
                                          index
                                        ]
                                          ?.end_time
                                      }
                                      {...register(
                                        `intervals.${index}.end_time`,
                                        {
                                          required:
                                            "La hora final es obligatoria.",
                                        }
                                      )}
                                    />

                                    <FormController
                                      control={
                                        control
                                      }
                                      name={`intervals.${index}.is_active`}
                                      render={({
                                        field:
                                          switchField,
                                      }) => (
                                        <FormControlLabel
                                          sx={{
                                            m: 0,
                                            minWidth: 100,
                                          }}
                                          control={
                                            <Switch
                                              checked={
                                                !!switchField.value
                                              }
                                              onChange={(
                                                event
                                              ) =>
                                                switchField.onChange(
                                                  event.target.checked
                                                )
                                              }
                                              disabled={
                                                readOnly
                                              }
                                            />
                                          }
                                          label={
                                            <Typography
                                              sx={{
                                                fontSize: 13,
                                                fontWeight: 700,
                                              }}
                                            >
                                              {switchField.value
                                                ? "Activo"
                                                : "Inactivo"}
                                            </Typography>
                                          }
                                        />
                                      )}
                                    />

                                    {!readOnly ? (
                                      <IconButton
                                        type="button"
                                        color="error"
                                        onClick={() =>
                                          remove(
                                            index
                                          )
                                        }
                                      >
                                        <DeleteOutlineOutlinedIcon />
                                      </IconButton>
                                    ) : null}
                                  </Stack>
                                )
                              )}
                            </Stack>
                          )}
                        </Stack>
                      </Box>
                    );
                  }
                )}

                <Stack
                  direction={{
                    xs: "column-reverse",
                    sm: "row",
                  }}
                  justifyContent="flex-end"
                  spacing={1.5}
                  pt={1}
                >
                  <Button
                    type="button"
                    variant="outlined"
                    onClick={onClose}
                    sx={{
                      minWidth: {
                        xs: "100%",
                        sm: 150,
                      },
                      height: 44,
                    }}
                  >
                    {readOnly
                      ? "Cerrar"
                      : "Cancelar"}
                  </Button>

                  {!readOnly ? (
                    <Button
                      type="submit"
                      variant="contained"
                      startIcon={
                        <SaveOutlinedIcon />
                      }
                      sx={{
                        minWidth: {
                          xs: "100%",
                          sm: 180,
                        },
                        height: 44,
                        fontWeight: 800,
                      }}
                    >
                      Guardar horario
                    </Button>
                  ) : null}
                </Stack>
              </Stack>
            </CardContent>
          </Card>
        </form>
      </DialogContent>
    </Dialog>
  );
}