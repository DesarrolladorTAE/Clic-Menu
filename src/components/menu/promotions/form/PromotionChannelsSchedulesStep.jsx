import {
  Box,
  Button,
  Checkbox,
  CircularProgress,
  FormControlLabel,
  Paper,
  Stack,
  Switch,
  TextField,
  Typography,
} from "@mui/material";

import {
  PROMOTION_DAYS,
  getPromotionDayLabel,
} from "./promotionForm.helpers";

import { PromotionSectionTitle } from "./PromotionFormField";

export default function PromotionChannelsSchedulesStep({
  channels,
  selectedChannelIds,
  schedules,
  loading = false,
  onToggleChannel,
  onScheduleChange,
  onSetAllSchedules,
}) {
  return (
    <Paper
      sx={{
        p: { xs: 2, sm: 3 },
        borderRadius: 1,
        backgroundColor:
          "background.paper",
        border: "1px solid",
        borderColor: "divider",
        boxShadow: "none",
      }}
    >
      <Stack spacing={2.5}>
        <Typography
          sx={{
            fontSize: {
              xs: 18,
              sm: 20,
            },
            fontWeight: 800,
            color: "text.primary",
          }}
        >
          Canales y horarios
        </Typography>

        <PromotionSectionTitle>
          Canales donde aplica
        </PromotionSectionTitle>

        <Typography
          sx={{
            fontSize: 13,
            color: "text.secondary",
            lineHeight: 1.5,
          }}
        >
          Selecciona al menos un canal activo de la
          sucursal.
        </Typography>

        {loading ? (
          <Stack
            spacing={1.5}
            alignItems="center"
            sx={{ py: 3 }}
          >
            <CircularProgress size={28} />

            <Typography
              sx={{
                fontSize: 13,
                color:
                  "text.secondary",
              }}
            >
              Cargando canales disponibles…
            </Typography>
          </Stack>
        ) : channels.length === 0 ? (
          <Box
            sx={{
              p: 2,
              borderRadius: 1,
              border: "1px solid",
              borderColor: "divider",
              backgroundColor:
                "background.default",
            }}
          >
            <Typography
              sx={{
                fontSize: 14,
                fontWeight: 800,
                color: "text.primary",
              }}
            >
              No hay canales disponibles
            </Typography>

            <Typography
              sx={{
                mt: 0.5,
                fontSize: 13,
                color:
                  "text.secondary",
              }}
            >
              Activa al menos un canal de venta para
              esta sucursal.
            </Typography>
          </Box>
        ) : (
          <Box
            sx={{
              display: "grid",
              gridTemplateColumns: {
                xs: "1fr",
                sm: "repeat(2, minmax(0, 1fr))",
                lg: "repeat(3, minmax(0, 1fr))",
              },
              gap: 1.5,
            }}
          >
            {channels.map((channel) => {
              const checked =
                selectedChannelIds.some(
                  (channelId) =>
                    Number(channelId) ===
                    Number(
                      channel.branch_sales_channel_id
                    )
                );

              return (
                <Box
                  key={
                    channel.branch_sales_channel_id
                  }
                  sx={{
                    border:
                      "1px solid",
                    borderColor: checked
                      ? "primary.main"
                      : "divider",
                    borderRadius: 1,
                    p: 1.5,
                    backgroundColor:
                      checked
                        ? "rgba(255, 152, 0, 0.07)"
                        : "background.default",
                    minHeight: 82,
                  }}
                >
                  <FormControlLabel
                    sx={{
                      m: 0,
                      width: "100%",
                      alignItems:
                        "flex-start",
                    }}
                    control={
                      <Checkbox
                        checked={checked}
                        onChange={(
                          event
                        ) =>
                          onToggleChannel(
                            channel,
                            event.target
                              .checked
                          )
                        }
                        color="primary"
                      />
                    }
                    label={
                      <Box
                        sx={{
                          pt: 0.75,
                        }}
                      >
                        <Typography
                          sx={{
                            fontSize: 14,
                            fontWeight: 800,
                            color:
                              "text.primary",
                          }}
                        >
                          {channel.name}
                        </Typography>

                        <Typography
                          sx={{
                            mt: 0.25,
                            fontSize: 12,
                            color:
                              "text.secondary",
                          }}
                        >
                          Canal activo de la sucursal
                        </Typography>
                      </Box>
                    }
                  />
                </Box>
              );
            })}
          </Box>
        )}

        <PromotionSectionTitle>
          Días y horarios
        </PromotionSectionTitle>

        <Stack
          direction={{
            xs: "column",
            sm: "row",
          }}
          justifyContent="flex-end"
          spacing={1}
        >
          <Button
            type="button"
            variant="outlined"
            color="secondary"
            onClick={() =>
              onSetAllSchedules(false)
            }
          >
            Desactivar todos
          </Button>

          <Button
            type="button"
            variant="outlined"
            color="secondary"
            onClick={() =>
              onSetAllSchedules(true)
            }
          >
            Activar todos
          </Button>
        </Stack>

        <Stack spacing={1.5}>
          {PROMOTION_DAYS.map((day) => {
            const schedule =
              schedules.find(
                (item) =>
                  Number(
                    item.day_of_week
                  ) ===
                  Number(day.value)
              ) || {
                day_of_week:
                  day.value,
                enabled: false,
                start_time: "00:00",
                end_time: "23:59",
              };

            return (
              <Box
                key={day.value}
                sx={{
                  p: 1.75,
                  border:
                    "1px solid",
                  borderColor:
                    schedule.enabled
                      ? "secondary.main"
                      : "divider",
                  borderRadius: 1,
                  backgroundColor:
                    schedule.enabled
                      ? "#FFFFFF"
                      : "background.default",
                  transition:
                    "border-color 0.18s ease, background-color 0.18s ease",
                }}
              >
                <Stack spacing={1.5}>
                  <Stack
                    direction={{
                      xs: "column",
                      sm: "row",
                    }}
                    justifyContent="space-between"
                    alignItems={{
                      xs: "flex-start",
                      sm: "center",
                    }}
                    spacing={1}
                  >
                    <FormControlLabel
                      sx={{ m: 0 }}
                      control={
                        <Switch
                          checked={
                            !!schedule.enabled
                          }
                          onChange={(
                            event
                          ) =>
                            onScheduleChange(
                              day.value,
                              "enabled",
                              event.target
                                .checked
                            )
                          }
                          color="secondary"
                        />
                      }
                      label={
                        <Typography
                          sx={{
                            fontSize: 14,
                            fontWeight: 800,
                            color:
                              "text.primary",
                          }}
                        >
                          {getPromotionDayLabel(
                            day.value
                          )}
                        </Typography>
                      }
                    />

                    <Button
                      type="button"
                      variant="outlined"
                      color="secondary"
                      disabled={
                        !schedule.enabled
                      }
                      onClick={() => {
                        onScheduleChange(
                          day.value,
                          "start_time",
                          "00:00"
                        );

                        onScheduleChange(
                          day.value,
                          "end_time",
                          "23:59"
                        );
                      }}
                    >
                      Todo el día
                    </Button>
                  </Stack>

                  <Stack
                    direction={{
                      xs: "column",
                      sm: "row",
                    }}
                    spacing={2}
                  >
                    <Box
                      sx={{
                        flex: 1,
                        width: "100%",
                      }}
                    >
                      <Typography
                        sx={{
                          fontSize: 13,
                          fontWeight: 800,
                          color:
                            "text.primary",
                          mb: 0.75,
                        }}
                      >
                        Hora inicial
                      </Typography>

                      <TextField
                        type="time"
                        value={
                          schedule.start_time
                        }
                        onChange={(
                          event
                        ) =>
                          onScheduleChange(
                            day.value,
                            "start_time",
                            event.target
                              .value
                          )
                        }
                        disabled={
                          !schedule.enabled
                        }
                        inputProps={{
                          step: 60,
                        }}
                        sx={{
                          "& .MuiOutlinedInput-root":
                            {
                              backgroundColor:
                                schedule.enabled
                                  ? "background.default"
                                  : undefined,
                              "&.Mui-focused .MuiOutlinedInput-notchedOutline":
                                {
                                  border:
                                    "1.5px solid",
                                  borderColor:
                                    "secondary.main",
                                },
                            },
                        }}
                      />
                    </Box>

                    <Box
                      sx={{
                        flex: 1,
                        width: "100%",
                      }}
                    >
                      <Typography
                        sx={{
                          fontSize: 13,
                          fontWeight: 800,
                          color:
                            "text.primary",
                          mb: 0.75,
                        }}
                      >
                        Hora final
                      </Typography>

                      <TextField
                        type="time"
                        value={
                          schedule.end_time
                        }
                        onChange={(
                          event
                        ) =>
                          onScheduleChange(
                            day.value,
                            "end_time",
                            event.target
                              .value
                          )
                        }
                        disabled={
                          !schedule.enabled
                        }
                        inputProps={{
                          step: 60,
                        }}
                        sx={{
                          "& .MuiOutlinedInput-root":
                            {
                              backgroundColor:
                                schedule.enabled
                                  ? "background.default"
                                  : undefined,
                              "&.Mui-focused .MuiOutlinedInput-notchedOutline":
                                {
                                  border:
                                    "1.5px solid",
                                  borderColor:
                                    "secondary.main",
                                },
                            },
                        }}
                      />
                    </Box>
                  </Stack>
                </Stack>
              </Box>
            );
          })}
        </Stack>
      </Stack>
    </Paper>
  );
}