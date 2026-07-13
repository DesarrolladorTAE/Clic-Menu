import {
  Box,
  Chip,
  Paper,
  Stack,
  Typography,
} from "@mui/material";
import {
  useEffect,
  useState,
} from "react";

import PaginationFooter from "../../../common/PaginationFooter";

import {
  formatPromotionCurrency,
  getPromotionDayLabel,
  getPromotionTargetLabel,
  getPromotionTypeLabel,
} from "./promotionForm.helpers";

const ITEMS_PER_PAGE = 5;

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
      <Stack spacing={2}>
        <Box>
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
                  size="small"
                  sx={{
                    backgroundColor:
                      "rgba(255, 152, 0, 0.10)",
                    borderColor:
                      "rgba(255, 152, 0, 0.55)",
                    fontWeight: 700,
                  }}
                />
              )
            )}
          </Stack>
        </ReviewSection>

        <ReviewSection title="Horarios">
          <Box
            sx={{
              display: "grid",
              gridTemplateColumns: {
                xs: "1fr",
                sm: "repeat(2, minmax(0, 1fr))",
                lg: "repeat(3, minmax(0, 1fr))",
              },
              gap: 1,
            }}
          >
            {enabledSchedules.map(
              (schedule) => (
                <Box
                  key={schedule.day_of_week}
                  sx={{
                    px: 1.25,
                    py: 1,
                    borderRadius: 1,
                    border: "1px solid",
                    borderColor:
                      "rgba(255, 152, 0, 0.30)",
                    backgroundColor:
                      "rgba(255, 152, 0, 0.07)",
                  }}
                >
                  <Typography
                    sx={{
                      fontSize: 13,
                      color: "text.secondary",
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
                </Box>
              )
            )}
          </Box>
        </ReviewSection>

        <ReviewSection title="Productos participantes">
          <ParticipantsSummary
            targets={form.targets}
          />
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

function ParticipantsSummary({
  targets,
}) {
  const [page, setPage] =
    useState(1);

  const safeTargets = Array.isArray(
    targets
  )
    ? targets
    : [];

  const totalPages = Math.max(
    1,
    Math.ceil(
      safeTargets.length /
        ITEMS_PER_PAGE
    )
  );

  useEffect(() => {
    setPage(1);
  }, [safeTargets.length]);

  useEffect(() => {
    if (page > totalPages) {
      setPage(totalPages);
    }
  }, [page, totalPages]);

  const startIndex =
    (page - 1) * ITEMS_PER_PAGE;

  const paginatedTargets =
    safeTargets.slice(
      startIndex,
      startIndex + ITEMS_PER_PAGE
    );

  const startItem =
    safeTargets.length === 0
      ? 0
      : startIndex + 1;

  const endItem = Math.min(
    startIndex + ITEMS_PER_PAGE,
    safeTargets.length
  );

  return (
    <Stack spacing={1.5}>
      <Box
        sx={{
          display: "grid",
          gridTemplateColumns: {
            xs: "1fr",
            sm: "repeat(2, minmax(0, 1fr))",
            lg: "repeat(3, minmax(0, 1fr))",
          },
          gap: 1,
        }}
      >
        {paginatedTargets.map(
          (target) => (
            <Box
              key={target.target_key}
              sx={{
                px: 1.25,
                py: 0.9,
                borderRadius: 1,
                border: "1px solid",
                borderColor:
                  "rgba(255, 152, 0, 0.30)",
                backgroundColor:
                  "rgba(255, 152, 0, 0.07)",
                minWidth: 0,
              }}
            >
              <Typography
                sx={{
                  fontSize: 12.5,
                  fontWeight: 700,
                  color: "text.primary",
                  lineHeight: 1.4,
                  wordBreak: "break-word",
                }}
              >
                {getPromotionTargetLabel(
                  target
                )}
              </Typography>
            </Box>
          )
        )}
      </Box>

      {safeTargets.length >
      ITEMS_PER_PAGE ? (
        <PaginationFooter
          page={page}
          totalPages={totalPages}
          startItem={startItem}
          endItem={endItem}
          total={safeTargets.length}
          hasPrev={page > 1}
          hasNext={page < totalPages}
          onPrev={() =>
            setPage((current) =>
              Math.max(
                1,
                current - 1
              )
            )
          }
          onNext={() =>
            setPage((current) =>
              Math.min(
                totalPages,
                current + 1
              )
            )
          }
          itemLabel="participantes"
        />
      ) : null}
    </Stack>
  );
}

function RuleSummary({
  form,
  channels,
}) {
  const [page, setPage] =
    useState(1);

  const targets = Array.isArray(
    form.targets
  )
    ? form.targets
    : [];

  const totalPages = Math.max(
    1,
    Math.ceil(
      targets.length /
        ITEMS_PER_PAGE
    )
  );

  useEffect(() => {
    setPage(1);
  }, [
    form.type,
    targets.length,
  ]);

  useEffect(() => {
    if (page > totalPages) {
      setPage(totalPages);
    }
  }, [page, totalPages]);

  if (
    form.type ===
    "promotional_price"
  ) {
    const startIndex =
      (page - 1) * ITEMS_PER_PAGE;

    const paginatedTargets =
      targets.slice(
        startIndex,
        startIndex +
          ITEMS_PER_PAGE
      );

    const startItem =
      targets.length === 0
        ? 0
        : startIndex + 1;

    const endItem = Math.min(
      startIndex + ITEMS_PER_PAGE,
      targets.length
    );

    return (
      <Stack spacing={1.5}>
        {paginatedTargets.map(
          (target) => (
            <Box
              key={target.target_key}
              sx={{
                p: 1.5,
                borderRadius: 1,
                border: "1px solid",
                borderColor:
                  "rgba(255, 152, 0, 0.30)",
                backgroundColor:
                  "rgba(255, 152, 0, 0.07)",
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
                {getPromotionTargetLabel(
                  target
                )}
              </Typography>

              <Stack
                direction="row"
                spacing={2}
                useFlexGap
                flexWrap="wrap"
                sx={{ mt: 1 }}
              >
                {channels.map(
                  (channel) => (
                    <Typography
                      key={
                        channel.branch_sales_channel_id
                      }
                      sx={{
                        fontSize: 13,
                        color:
                          "text.secondary",
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
                  )
                )}
              </Stack>
            </Box>
          )
        )}

        {targets.length >
        ITEMS_PER_PAGE ? (
          <PaginationFooter
            page={page}
            totalPages={totalPages}
            startItem={startItem}
            endItem={endItem}
            total={targets.length}
            hasPrev={page > 1}
            hasNext={
              page < totalPages
            }
            onPrev={() =>
              setPage((current) =>
                Math.max(
                  1,
                  current - 1
                )
              )
            }
            onNext={() =>
              setPage((current) =>
                Math.min(
                  totalPages,
                  current + 1
                )
              )
            }
            itemLabel="participantes"
          />
        ) : null}
      </Stack>
    );
  }

  if (
    form.type ===
    "buy_x_pay_y"
  ) {
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

  const rule =
    form.discount_rule;

  return (
    <ReviewGrid>
      <ReviewItem
        label="Tipo de descuento"
        value={
          rule.discount_type ===
          "percent"
            ? "Porcentaje"
            : "Monto fijo"
        }
      />

      <ReviewItem
        label="Valor"
        value={
          rule.discount_type ===
          "percent"
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
    <Box
      sx={{
        overflow: "hidden",
        borderRadius: 2,
        border: "1px solid",
        borderColor:
          "rgba(255, 152, 0, 0.38)",
        backgroundColor:
          "background.paper",
        boxShadow:
          "0 6px 20px rgba(91, 58, 29, 0.09)",
      }}
    >
      <Box
        sx={{
          px: {
            xs: 1.75,
            sm: 2.25,
          },
          py: 1.5,
          display: "flex",
          alignItems: "center",
          gap: 1.25,
          backgroundColor:
            "rgba(255, 152, 0, 0.10)",
          borderBottom: "1px solid",
          borderBottomColor:
            "rgba(255, 152, 0, 0.28)",
        }}
      >
        <Box
          sx={{
            width: 4,
            height: 22,
            flexShrink: 0,
            borderRadius: 4,
            backgroundColor:
              "primary.main",
          }}
        />

        <Typography
          sx={{
            fontSize: 15,
            fontWeight: 800,
            color: "text.primary",
          }}
        >
          {title}
        </Typography>
      </Box>

      <Box
        sx={{
          p: {
            xs: 1.75,
            sm: 2.25,
          },
          backgroundColor:
            "background.paper",
        }}
      >
        {children}
      </Box>
    </Box>
  );
}

function ReviewGrid({
  children,
}) {
  return (
    <Box
      sx={{
        display: "grid",
        gridTemplateColumns: {
          xs: "1fr",
          sm: "repeat(2, minmax(0, 1fr))",
          lg: "repeat(3, minmax(0, 1fr))",
        },
        gap: 1.25,
      }}
    >
      {children}
    </Box>
  );
}

function ReviewItem({
  label,
  value,
}) {
  return (
    <Box
      sx={{
        p: 1.5,
        borderRadius: 1.25,
        border: "1px solid",
        borderColor:
          "rgba(255, 152, 0, 0.28)",
        backgroundColor:
          "rgba(255, 152, 0, 0.065)",
        minHeight: 84,
      }}
    >
      <Typography
        sx={{
          fontSize: 11,
          fontWeight: 800,
          color: "text.secondary",
          textTransform:
            "uppercase",
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