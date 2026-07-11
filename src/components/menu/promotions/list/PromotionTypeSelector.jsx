import {
  Box, ButtonBase, Chip, Stack, Typography,
} from "@mui/material";
import LocalOfferOutlinedIcon from "@mui/icons-material/LocalOfferOutlined";
import RedeemOutlinedIcon from "@mui/icons-material/RedeemOutlined";
import PercentOutlinedIcon from "@mui/icons-material/PercentOutlined";

import { PROMOTION_TYPES } from "./promotionList.helpers";

const TYPE_ICONS = {
  promotional_price: LocalOfferOutlinedIcon,
  buy_x_pay_y: RedeemOutlinedIcon,
  product_discount: PercentOutlinedIcon,
};

export default function PromotionTypeSelector({
  value,
  onChange,
  counters,
}) {
  return (
    <Box
      sx={{
        display: "grid",
        gridTemplateColumns: {
          xs: "1fr",
          md: "repeat(3, minmax(0, 1fr))",
        },
        gap: 2,
      }}
    >
      {PROMOTION_TYPES.map((type) => {
        const Icon = TYPE_ICONS[type.value];
        const selected = value === type.value;
        const total = counters?.[type.value]?.total || 0;
        const active = counters?.[type.value]?.active || 0;

        return (
          <ButtonBase
            key={type.value}
            onClick={() => onChange(type.value)}
            sx={{
              width: "100%",
              height: "100%",
              minHeight: 142,
              p: 2,
              borderRadius: 1,
              border: "1px solid",
              borderColor: selected
                ? "primary.main"
                : "divider",
              backgroundColor: selected
                ? "rgba(255, 152, 0, 0.08)"
                : "background.paper",
              textAlign: "left",
              alignItems: "stretch",
              justifyContent: "stretch",
              transition:
                "border-color 0.18s ease, background-color 0.18s ease, transform 0.12s ease",
              "&:hover": {
                borderColor: "primary.main",
                backgroundColor: "rgba(255, 152, 0, 0.06)",
              },
              "&:active": {
                transform: "scale(0.99)",
              },
              "&.Mui-focusVisible": {
                outline: "2px solid",
                outlineColor: "primary.main",
                outlineOffset: 2,
              },
            }}
          >
            <Stack
              spacing={1.25}
              sx={{
                width: "100%",
                height: "100%",
              }}
            >
              <Stack
                direction="row"
                justifyContent="space-between"
                alignItems="flex-start"
                spacing={1}
              >
                <Box
                  sx={{
                    width: 40,
                    height: 40,
                    borderRadius: 1,
                    display: "grid",
                    placeItems: "center",
                    bgcolor: selected
                      ? "primary.main"
                      : "rgba(255, 152, 0, 0.12)",
                    color: selected
                      ? "primary.contrastText"
                      : "primary.main",
                    flexShrink: 0,
                  }}
                >
                  <Icon />
                </Box>

                <Chip
                  label={
                    total === 1
                      ? "1 promoción"
                      : `${total} promociones`
                  }
                  size="small"
                  color={selected ? "primary" : "default"}
                  variant={selected ? "filled" : "outlined"}
                />
              </Stack>

              <Box sx={{ flex: 1 }}>
                <Typography
                  sx={{
                    fontSize: 16,
                    fontWeight: 800,
                    color: selected
                      ? "primary.main"
                      : "text.primary",
                  }}
                >
                  {type.label}
                </Typography>

                <Typography
                  sx={{
                    mt: 0.5,
                    fontSize: 12,
                    color: "text.secondary",
                    lineHeight: 1.45,
                  }}
                >
                  {type.description}
                </Typography>
              </Box>

              <Typography
                sx={{
                  fontSize: 12,
                  fontWeight: 700,
                  color:
                    active > 0
                      ? "success.main"
                      : "text.secondary",
                }}
              >
                {active === 1
                  ? "1 activa"
                  : `${active} activas`}
              </Typography>
            </Stack>
          </ButtonBase>
        );
      })}
    </Box>
  );
}
