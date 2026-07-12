import {
  Box, MenuItem, Paper, Stack, TextField, Typography,
} from "@mui/material";
import {
  useEffect,
  useState,
} from "react";

import KeyboardArrowDownIcon from "@mui/icons-material/KeyboardArrowDown";

import PaginationFooter from "../../../common/PaginationFooter";

import {
  formatPromotionCurrency,
  getPromotionTargetLabel,
  getPromotionTypeLabel,
} from "./promotionForm.helpers";

import {
  PromotionFieldBlock,
  PromotionSectionTitle,
} from "./PromotionFormField";

const ITEMS_PER_PAGE = 5;

function isValidDecimalPrice(value) {
  return /^\d*(\.\d{0,2})?$/.test(value);
}

export default function PromotionConfigurationStep({
  form,
  channels,
  getBasePrice,
  onRuleChange,
  onTargetPriceChange,
}) {
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
      <Stack spacing={2.5}>
        <Box>
          <Typography
            sx={{
              fontSize: { xs: 18, sm: 20 },
              fontWeight: 800,
              color: "text.primary",
            }}
          >
            Configuración de la promoción
          </Typography>

          <Typography
            sx={{
              mt: 0.5,
              fontSize: 13,
              color: "text.secondary",
            }}
          >
            Tipo seleccionado:{" "}
            <Typography
              component="span"
              sx={{
                fontSize: 13,
                color: "primary.main",
                fontWeight: 800,
              }}
            >
              {getPromotionTypeLabel(form.type)}
            </Typography>
          </Typography>
        </Box>

        {form.type === "promotional_price" ? (
          <PromotionalPriceConfiguration
            form={form}
            channels={channels}
            getBasePrice={getBasePrice}
            onTargetPriceChange={
              onTargetPriceChange
            }
          />
        ) : null}

        {form.type === "buy_x_pay_y" ? (
          <BuyXPayYConfiguration
            form={form}
            onRuleChange={onRuleChange}
          />
        ) : null}

        {form.type === "product_discount" ? (
          <ProductDiscountConfiguration
            form={form}
            onRuleChange={onRuleChange}
          />
        ) : null}
      </Stack>
    </Paper>
  );
}

function PromotionalPriceConfiguration({
  form,
  channels,
  getBasePrice,
  onTargetPriceChange,
}) {
  const [page, setPage] = useState(1);

  const targets = Array.isArray(form.targets)
    ? form.targets
    : [];

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

  const totalPages = Math.max(
    1,
    Math.ceil(
      targets.length / ITEMS_PER_PAGE
    )
  );

  useEffect(() => {
    setPage(1);
  }, [targets.length]);

  useEffect(() => {
    if (page > totalPages) {
      setPage(totalPages);
    }
  }, [page, totalPages]);

  const startIndex =
    (page - 1) * ITEMS_PER_PAGE;

  const paginatedTargets = targets.slice(
    startIndex,
    startIndex + ITEMS_PER_PAGE
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
    <Stack spacing={2}>
      <PromotionSectionTitle>
        Precio promocional por producto y canal
      </PromotionSectionTitle>

      <Typography
        sx={{
          fontSize: 13,
          color: "text.secondary",
          lineHeight: 1.5,
        }}
      >
        Captura un precio promocional para cada
        combinación de producto y canal.
      </Typography>

      {paginatedTargets.map((target) => (
        <Box
          key={target.target_key}
          sx={{
            p: 2,
            border: "1px solid",
            borderColor: "divider",
            borderRadius: 1,
            backgroundColor:
              "background.default",
          }}
        >
          <Stack spacing={2}>
            <Typography
              sx={{
                fontSize: 15,
                fontWeight: 800,
                color: "text.primary",
              }}
            >
              {getPromotionTargetLabel(target)}
            </Typography>

            <Box
              sx={{
                display: "grid",
                gridTemplateColumns: {
                  xs: "1fr",
                  md: "repeat(2, minmax(0, 1fr))",
                },
                gap: 2,
              }}
            >
              {selectedChannels.map(
                (channel) => {
                  const channelId =
                    channel.branch_sales_channel_id;

                  const basePrice =
                    getBasePrice(
                      target,
                      channelId
                    );

                  const currentValue =
                    target.channel_prices?.[
                      String(channelId)
                    ] ?? "";

                  return (
                    <PromotionFieldBlock
                      key={channelId}
                      label={`Precio promocional en ${channel.name} *`}
                      help={`Precio actual: ${formatPromotionCurrency(
                        basePrice
                      )}`}
                      input={
                        <TextField
                          type="text"
                          value={currentValue}
                          onChange={(event) => {
                            const value =
                              event.target.value;

                            if (
                              isValidDecimalPrice(
                                value
                              )
                            ) {
                              onTargetPriceChange(
                                target.target_key,
                                channelId,
                                value
                              );
                            }
                          }}
                          placeholder="0.00"
                          autoComplete="off"
                          inputProps={{
                            inputMode: "decimal",
                            pattern:
                              "[0-9]*\\.?[0-9]{0,2}",
                            maxLength: 12,
                          }}
                        />
                      }
                    />
                  );
                }
              )}
            </Box>
          </Stack>
        </Box>
      ))}

      <PaginationFooter
        page={page}
        totalPages={totalPages}
        startItem={startItem}
        endItem={endItem}
        total={targets.length}
        hasPrev={page > 1}
        hasNext={page < totalPages}
        onPrev={() =>
          setPage((current) =>
            Math.max(1, current - 1)
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
    </Stack>
  );
}

function BuyXPayYConfiguration({
  form,
  onRuleChange,
}) {
  const rule = form.buy_x_pay_y_rule;

  return (
    <Stack spacing={2.5}>
      <PromotionSectionTitle>
        Cantidades de la promoción
      </PromotionSectionTitle>

      <Stack
        direction={{ xs: "column", md: "row" }}
        spacing={2}
      >
        <PromotionFieldBlock
          label="Cantidad que debe comprar *"
          help="Debe ser un número entero mayor o igual a 2."
          input={
            <TextField
              type="number"
              value={rule.buy_quantity}
              onChange={(event) =>
                onRuleChange(
                  "buy_x_pay_y_rule",
                  "buy_quantity",
                  event.target.value
                )
              }
              inputProps={{
                min: 2,
                step: 1,
              }}
            />
          }
        />

        <PromotionFieldBlock
          label="Cantidad que debe pagar *"
          help="Debe ser menor que la cantidad que debe comprar."
          input={
            <TextField
              type="number"
              value={rule.pay_quantity}
              onChange={(event) =>
                onRuleChange(
                  "buy_x_pay_y_rule",
                  "pay_quantity",
                  event.target.value
                )
              }
              inputProps={{
                min: 1,
                step: 1,
              }}
            />
          }
        />
      </Stack>

      <PromotionSectionTitle>
        Forma de aplicación
      </PromotionSectionTitle>

      <PromotionFieldBlock
        label="Agrupación *"
        help="Define si las unidades deben ser del mismo producto o pueden combinarse."
        input={
          <TextField
            select
            value={rule.grouping_mode}
            onChange={(event) =>
              onRuleChange(
                "buy_x_pay_y_rule",
                "grouping_mode",
                event.target.value
              )
            }
            SelectProps={{
              IconComponent:
                KeyboardArrowDownIcon,
            }}
          >
            <MenuItem value="same_product">
              Mismo producto
            </MenuItem>

            <MenuItem value="any_participant">
              Productos participantes combinados
            </MenuItem>
          </TextField>
        }
      />

      <PromotionFieldBlock
        label="Estrategia de descuento"
        help="Si se combinan productos con precios diferentes, se descuenta el más barato."
        input={
          <TextField
            value="Descontar el producto más barato"
            disabled
          />
        }
      />
    </Stack>
  );
}

function ProductDiscountConfiguration({
  form,
  onRuleChange,
}) {
  const rule = form.discount_rule;

  return (
    <Stack spacing={2.5}>
      <PromotionSectionTitle>
        Descuento
      </PromotionSectionTitle>

      <Stack
        direction={{ xs: "column", md: "row" }}
        spacing={2}
      >
        <PromotionFieldBlock
          label="Tipo de descuento *"
          help="Selecciona si aplicarás un porcentaje o un monto fijo."
          input={
            <TextField
              select
              value={rule.discount_type}
              onChange={(event) =>
                onRuleChange(
                  "discount_rule",
                  "discount_type",
                  event.target.value
                )
              }
              SelectProps={{
                IconComponent:
                  KeyboardArrowDownIcon,
              }}
            >
              <MenuItem value="percent">
                Porcentaje
              </MenuItem>

              <MenuItem value="fixed">
                Monto fijo
              </MenuItem>
            </TextField>
          }
        />

        <PromotionFieldBlock
          label={
            rule.discount_type === "percent"
              ? "Porcentaje de descuento *"
              : "Monto de descuento *"
          }
          help={
            rule.discount_type === "percent"
              ? "Captura un porcentaje entre 0.01 y 100."
              : "Captura el monto fijo que se descontará por producto."
          }
          input={
            <TextField
              type="number"
              value={rule.discount_value}
              onChange={(event) =>
                onRuleChange(
                  "discount_rule",
                  "discount_value",
                  event.target.value
                )
              }
              inputProps={{
                min: 0.01,
                max:
                  rule.discount_type ===
                  "percent"
                    ? 100
                    : undefined,
                step: 0.01,
              }}
            />
          }
        />
      </Stack>
    </Stack>
  );
}