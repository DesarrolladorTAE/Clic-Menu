import {
  Box,
  MenuItem,
  Paper,
  Stack,
  TextField,
  Typography,
} from "@mui/material";
import KeyboardArrowDownIcon from "@mui/icons-material/KeyboardArrowDown";

import {
  formatPromotionCurrency,
  getPromotionTargetLabel,
  getPromotionTypeLabel,
} from "./promotionForm.helpers";

import {
  PromotionFieldBlock,
  PromotionSectionTitle,
} from "./PromotionFormField";

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

      {form.targets.map((target) => (
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

                  return (
                    <PromotionFieldBlock
                      key={channelId}
                      label={`Precio promocional en ${channel.name} *`}
                      help={`Precio actual: ${formatPromotionCurrency(
                        basePrice
                      )}`}
                      input={
                        <TextField
                          type="number"
                          value={
                            target
                              .channel_prices?.[
                              String(
                                channelId
                              )
                            ] ?? ""
                          }
                          onChange={(event) =>
                            onTargetPriceChange(
                              target.target_key,
                              channelId,
                              event.target
                                .value
                            )
                          }
                          placeholder="0.00"
                          inputProps={{
                            min: 0.01,
                            step: 0.01,
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
