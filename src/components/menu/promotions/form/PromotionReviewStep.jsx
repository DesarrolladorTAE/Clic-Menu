import {
  Box,
  Chip,
  Paper,
  Stack,
  Typography,
} from "@mui/material";

import {
  formatPromotionCurrency,
  getPromotionDayLabel,
  getPromotionTargetLabel,
  getPromotionTypeLabel,
} from "./promotionForm.helpers";

export default function PromotionReviewStep({
  form,
  branch,
  channels,
}) {
  const selectedChannels = channels.filter(
    (channel) =>
      form.channel_ids.some(
        (channelId) =>
          Number(channelId) ===
          Number(
            channel.branch_sales_channel_id
          )
      )
  );

  const enabledSchedules =
    form.schedules.filter(
      (schedule) => schedule.enabled
    );

  return (
    <Paper
      sx={{
        p: { xs: 2, sm: 3 },
        borderRadius: 1,
        backgroundColor: "background.paper",
        border: "1px solid",
        borderColor: "divider",
        boxShadow: "none",
      }}
    >
      <Stack spacing={3}>
        <Box>
          <Typography
            sx={{
              fontSize: { xs: 18, sm: 20 },
              fontWeight: 800,
              color: "text.primary",
            }}
          >
            Revisión de la promoción
          </Typography>

          <Typography
            sx={{
              mt: 0.5,
              fontSize: 13,
              color: "text.secondary",
            }}
          >
            Verifica la información antes de crear la
            promoción.
          </Typography>
        </Box>

        <ReviewSection title="Información general">
          <ReviewGrid>
            <ReviewItem
              label="Nombre"
              value={form.name}
            />

            <ReviewItem
              label="Sucursal"
              value={
                branch?.name ||
                "Sin sucursal"
              }
            />

            <ReviewItem
              label="Tipo"
              value={getPromotionTypeLabel(
                form.type
              )}
            />

            <ReviewItem
              label="Estado inicial"
              value={
                form.is_active
                  ? "Activa"
                  : "Inactiva"
              }
            />

            <ReviewItem
              label="Prioridad"
              value={form.priority}
            />

            <ReviewItem
              label="Vigencia"
              value={
                form.starts_on ||
                form.ends_on
                  ? `${form.starts_on || "Sin límite inicial"} a ${form.ends_on || "Sin límite final"}`
                  : "Sin límite de fechas"
              }
            />
          </ReviewGrid>
        </ReviewSection>

        <ReviewSection title="Canales">
          <Stack
            direction="row"
            spacing={1}
            useFlexGap
            flexWrap="wrap"
          >
            {selectedChannels.map(
              (channel) => (
                <Chip
                  key={
                    channel.branch_sales_channel_id
                  }
                  label={channel.name}
                  color="primary"
                  variant="outlined"
                />
              )
            )}
          </Stack>
        </ReviewSection>

        <ReviewSection title="Horarios">
          <Stack spacing={1}>
            {enabledSchedules.map(
              (schedule) => (
                <Typography
                  key={schedule.day_of_week}
                  sx={{
                    fontSize: 13,
                    color: "text.primary",
                  }}
                >
                  <Typography
                    component="span"
                    sx={{
                      fontSize: 13,
                      fontWeight: 800,
                      color:
                        "text.primary",
                    }}
                  >
                    {getPromotionDayLabel(
                      schedule.day_of_week
                    )}
                    :
                  </Typography>{" "}
                  {schedule.start_time} a{" "}
                  {schedule.end_time}
                </Typography>
              )
            )}
          </Stack>
        </ReviewSection>

        <ReviewSection title="Productos participantes">
          <Stack
            direction="row"
            spacing={1}
            useFlexGap
            flexWrap="wrap"
          >
            {form.targets.map((target) => (
              <Chip
                key={target.target_key}
                label={getPromotionTargetLabel(
                  target
                )}
                variant="outlined"
              />
            ))}
          </Stack>
        </ReviewSection>

        <ReviewSection title="Regla configurada">
          <RuleSummary
            form={form}
            channels={selectedChannels}
          />
        </ReviewSection>
      </Stack>
    </Paper>
  );
}

function RuleSummary({ form, channels }) {
  if (form.type === "promotional_price") {
    return (
      <Stack spacing={1.5}>
        {form.targets.map((target) => (
          <Box
            key={target.target_key}
            sx={{
              p: 1.5,
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
              {getPromotionTargetLabel(target)}
            </Typography>

            <Stack
              spacing={0.5}
              sx={{ mt: 1 }}
            >
              {channels.map((channel) => (
                <Typography
                  key={
                    channel.branch_sales_channel_id
                  }
                  sx={{
                    fontSize: 13,
                    color: "text.secondary",
                  }}
                >
                  {channel.name}:{" "}
                  <Typography
                    component="span"
                    sx={{
                      fontSize: 13,
                      fontWeight: 800,
                      color:
                        "primary.main",
                    }}
                  >
                    {formatPromotionCurrency(
                      target
                        .channel_prices?.[
                        String(
                          channel.branch_sales_channel_id
                        )
                      ]
                    )}
                  </Typography>
                </Typography>
              ))}
            </Stack>
          </Box>
        ))}
      </Stack>
    );
  }

  if (form.type === "buy_x_pay_y") {
    return (
      <ReviewGrid>
        <ReviewItem
          label="Compra"
          value={
            form.buy_x_pay_y_rule
              .buy_quantity
          }
        />

        <ReviewItem
          label="Paga"
          value={
            form.buy_x_pay_y_rule
              .pay_quantity
          }
        />

        <ReviewItem
          label="Agrupación"
          value={
            form.buy_x_pay_y_rule
              .grouping_mode ===
            "same_product"
              ? "Mismo producto"
              : "Productos combinados"
          }
        />

        <ReviewItem
          label="Descuento"
          value="Producto más barato"
        />
      </ReviewGrid>
    );
  }

  const rule = form.discount_rule;

  return (
    <ReviewGrid>
      <ReviewItem
        label="Tipo de descuento"
        value={
          rule.discount_type === "percent"
            ? "Porcentaje"
            : "Monto fijo"
        }
      />

      <ReviewItem
        label="Valor"
        value={
          rule.discount_type === "percent"
            ? `${rule.discount_value}%`
            : formatPromotionCurrency(
                rule.discount_value
              )
        }
      />
    </ReviewGrid>
  );
}

function ReviewSection({
  title,
  children,
}) {
  return (
    <Box>
      <Typography
        sx={{
          fontSize: 15,
          fontWeight: 800,
          color: "primary.main",
          mb: 1.25,
        }}
      >
        {title}
      </Typography>

      {children}
    </Box>
  );
}

function ReviewGrid({ children }) {
  return (
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
      {children}
    </Box>
  );
}

function ReviewItem({ label, value }) {
  return (
    <Box
      sx={{
        p: 1.5,
        borderRadius: 1,
        border: "1px solid",
        borderColor: "divider",
        backgroundColor: "background.default",
        minHeight: 84,
      }}
    >
      <Typography
        sx={{
          fontSize: 11,
          fontWeight: 800,
          color: "text.secondary",
          textTransform: "uppercase",
          letterSpacing: 0.3,
        }}
      >
        {label}
      </Typography>

      <Typography
        sx={{
          mt: 0.75,
          fontSize: 14,
          color: "text.primary",
          lineHeight: 1.45,
          wordBreak: "break-word",
        }}
      >
        {value || "Sin datos"}
      </Typography>
    </Box>
  );
}
