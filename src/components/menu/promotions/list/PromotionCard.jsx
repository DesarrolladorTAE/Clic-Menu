import {
  Box, Button, Chip, FormControlLabel, Paper, Stack, Switch, Typography,
} from "@mui/material";
import DeleteOutlineOutlinedIcon from "@mui/icons-material/DeleteOutlineOutlined";
import Inventory2OutlinedIcon from "@mui/icons-material/Inventory2Outlined";
import AccessTimeOutlinedIcon from "@mui/icons-material/AccessTimeOutlined";
import RouteOutlinedIcon from "@mui/icons-material/RouteOutlined";
import PriorityHighOutlinedIcon from "@mui/icons-material/PriorityHighOutlined";

import {
  formatPromotionValidity,
  getPromotionChannels,
  getPromotionDateState,
  getPromotionRuleSummary,
  getPromotionSchedules,
  getPromotionTargets,
} from "./promotionList.helpers";

export default function PromotionCard({
  promotion,
  updating = false,
  onStatusChange,
  onDelete,
}) {
  const isActive = promotion?.status === "active";
  const dateState = getPromotionDateState(promotion);
  const channels = getPromotionChannels(promotion);
  const targets = getPromotionTargets(promotion);
  const schedules = getPromotionSchedules(promotion);
  const rule = getPromotionRuleSummary(promotion);

  return (
    <Paper
      sx={{
        p: 0,
        overflow: "hidden",
        borderRadius: 1,
        backgroundColor: "background.paper",
        border: "1px solid",
        borderColor: "divider",
        boxShadow: "none",
        height: "100%",
        minHeight: 390,
        display: "flex",
        flexDirection: "column",
      }}
    >
      <Box
        sx={{
          px: 2,
          py: 1.75,
          borderBottom: "1px solid",
          borderColor: "divider",
        }}
      >
        <Stack spacing={1}>
          <Stack
            direction="row"
            justifyContent="space-between"
            alignItems="flex-start"
            spacing={1.5}
          >
            <Box sx={{ minWidth: 0 }}>
              <Typography
                sx={{
                  fontSize: 17,
                  fontWeight: 800,
                  color: "text.primary",
                  lineHeight: 1.35,
                  wordBreak: "break-word",
                }}
              >
                {promotion?.name || "Promoción sin nombre"}
              </Typography>

              <Typography
                sx={{
                  mt: 0.5,
                  fontSize: 12,
                  color: "text.secondary",
                  lineHeight: 1.45,
                  display: "-webkit-box",
                  WebkitLineClamp: 2,
                  WebkitBoxOrient: "vertical",
                  overflow: "hidden",
                  minHeight: 34,
                }}
              >
                {promotion?.description ||
                  "Sin descripción registrada."}
              </Typography>
            </Box>

            <Chip
              label={dateState.label}
              size="small"
              color={dateState.color}
              variant={
                dateState.color === "default"
                  ? "outlined"
                  : "filled"
              }
              sx={{ flexShrink: 0 }}
            />
          </Stack>

          <FormControlLabel
            sx={{
              m: 0,
              width: "fit-content",
            }}
            control={
              <Switch
                checked={isActive}
                disabled={updating}
                onChange={(event) =>
                  onStatusChange(
                    promotion,
                    event.target.checked
                  )
                }
                color="primary"
              />
            }
            label={
              <Typography
                sx={{
                  fontSize: 13,
                  fontWeight: 800,
                  color: isActive
                    ? "success.main"
                    : "text.secondary",
                }}
              >
                {isActive ? "Activa" : "Inactiva"}
              </Typography>
            }
          />
        </Stack>
      </Box>

      <Box
        sx={{
          p: 2,
          flex: 1,
          display: "flex",
          flexDirection: "column",
        }}
      >
        <Stack spacing={1.75} sx={{ height: "100%" }}>
          <InfoRow
            icon={<AccessTimeOutlinedIcon fontSize="small" />}
            label="Vigencia"
            value={formatPromotionValidity(promotion)}
          />

          <InfoRow
            icon={<RouteOutlinedIcon fontSize="small" />}
            label="Canales"
            value={
              channels.length > 0
                ? channels.join(", ")
                : "Sin canales"
            }
          />

          <InfoRow
            icon={<Inventory2OutlinedIcon fontSize="small" />}
            label="Participantes"
            value={
              targets.length === 1
                ? "1 producto o variante"
                : `${targets.length} productos o variantes`
            }
          />

          <InfoRow
            icon={<PriorityHighOutlinedIcon fontSize="small" />}
            label="Prioridad"
            value={String(promotion?.priority ?? "Sin datos")}
          />

          <Box
            sx={{
              p: 1.5,
              borderRadius: 1,
              border: "1px solid",
              borderColor: "divider",
              backgroundColor: "background.default",
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
              {rule.label}
            </Typography>

            <Typography
              sx={{
                mt: 0.5,
                fontSize: 15,
                fontWeight: 800,
                color: "primary.main",
                lineHeight: 1.35,
              }}
            >
              {rule.value}
            </Typography>

            {rule.helper ? (
              <Typography
                sx={{
                  mt: 0.35,
                  fontSize: 12,
                  color: "text.secondary",
                }}
              >
                {rule.helper}
              </Typography>
            ) : null}
          </Box>

          <Typography
            sx={{
              fontSize: 12,
              color: "text.secondary",
            }}
          >
            {schedules.length === 1
              ? "1 horario configurado"
              : `${schedules.length} horarios configurados`}
          </Typography>

          <Stack
            direction={{ xs: "column", sm: "row" }}
            justifyContent="flex-end"
            spacing={1}
            sx={{ mt: "auto", pt: 0.5 }}
          >
            <Button
              type="button"
              variant="outlined"
              color="error"
              startIcon={<DeleteOutlineOutlinedIcon />}
              disabled={updating}
              onClick={() => onDelete(promotion)}
              sx={{
                width: {
                  xs: "100%",
                  sm: "auto",
                },
              }}
            >
              Eliminar
            </Button>
          </Stack>
        </Stack>
      </Box>
    </Paper>
  );
}

function InfoRow({ icon, label, value }) {
  return (
    <Stack
      direction="row"
      spacing={1.25}
      alignItems="flex-start"
    >
      <Box
        sx={{
          width: 32,
          height: 32,
          borderRadius: 1,
          display: "grid",
          placeItems: "center",
          bgcolor: "rgba(255, 152, 0, 0.12)",
          color: "primary.main",
          flexShrink: 0,
        }}
      >
        {icon}
      </Box>

      <Box sx={{ minWidth: 0 }}>
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
            mt: 0.25,
            fontSize: 13,
            color: "text.primary",
            lineHeight: 1.45,
            wordBreak: "break-word",
          }}
        >
          {value}
        </Typography>
      </Box>
    </Stack>
  );
}
