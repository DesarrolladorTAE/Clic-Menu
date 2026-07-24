import {
  Box, Checkbox, Chip, IconButton, Stack, TableCell, TableRow, Tooltip, Typography,
} from "@mui/material";

import ViewAgendaOutlinedIcon from "@mui/icons-material/ViewAgendaOutlined";
import CategoryOutlinedIcon from "@mui/icons-material/CategoryOutlined";
import RestaurantMenuOutlinedIcon from "@mui/icons-material/RestaurantMenuOutlined";
import KeyboardArrowUpOutlinedIcon from "@mui/icons-material/KeyboardArrowUpOutlined";
import KeyboardArrowDownOutlinedIcon from "@mui/icons-material/KeyboardArrowDownOutlined";
import KeyboardArrowRightRoundedIcon from "@mui/icons-material/KeyboardArrowRightRounded";
import KeyboardArrowDownRoundedIcon from "@mui/icons-material/KeyboardArrowDownRounded";
import AccessTimeOutlinedIcon from "@mui/icons-material/AccessTimeOutlined";
import BlockOutlinedIcon from "@mui/icons-material/BlockOutlined";

import {
  getScheduleCount,
} from "./menuContent.helpers";

export default function MenuHierarchyRow({
  node,
  type,
  level,
  readOnly,
  canExpand = false,
  expanded = false,
  onExpandToggle,
  canMoveUp,
  canMoveDown,
  onToggle,
  onMove,
  onSchedule,
}) {
  const blocked =
    node?.is_selectable === false &&
    !node?.is_selected;

  const ownSchedules =
    getScheduleCount(
      node?.schedules
    );

  const effectiveSchedules =
    getScheduleCount(
      node?.effective_schedule
    );

  const scheduleLabel =
    ownSchedules > 0
      ? ownSchedules === 1
        ? "1 horario propio"
        : `${ownSchedules} horarios propios`
      : effectiveSchedules > 0
        ? "Hereda horario"
        : "Sin horario";

  const Icon =
    type === "section"
      ? ViewAgendaOutlinedIcon
      : type === "category"
        ? CategoryOutlinedIcon
        : RestaurantMenuOutlinedIcon;

  const expandLabel =
    type === "section"
      ? expanded
        ? "Ocultar categorías"
        : "Mostrar categorías"
      : expanded
        ? "Ocultar productos"
        : "Mostrar productos";

  return (
    <TableRow
      hover
      sx={{
        "& td": {
          borderBottom: "1px solid",
          borderColor: "divider",
          verticalAlign: "middle",
        },
      }}
    >
      <TableCell
        sx={{
          pl: 2 + level * 4,
          minWidth: 330,
        }}
      >
        <Stack
          direction="row"
          spacing={0.75}
          alignItems="flex-start"
        >
          {canExpand ? (
            <Tooltip title={expandLabel}>
              <IconButton
                type="button"
                size="small"
                onClick={onExpandToggle}
                aria-expanded={expanded}
                aria-label={expandLabel}
                sx={{
                  width: 32,
                  height: 32,
                  flexShrink: 0,
                  mt: 0.35,
                  color: "text.secondary",
                }}
              >
                {expanded ? (
                  <KeyboardArrowDownRoundedIcon />
                ) : (
                  <KeyboardArrowRightRoundedIcon />
                )}
              </IconButton>
            </Tooltip>
          ) : (
            <Box
              sx={{
                width: 32,
                height: 32,
                flexShrink: 0,
              }}
            />
          )}

          <Tooltip
            title={
              blocked
                ? node?.selection_block_reason ||
                  "Este elemento no puede seleccionarse."
                : ""
            }
          >
            <span>
              <Checkbox
                checked={!!node.is_selected}
                disabled={
                  readOnly ||
                  blocked
                }
                onChange={(event) =>
                  onToggle(
                    event.target.checked
                  )
                }
                color="primary"
              />
            </span>
          </Tooltip>

          <Box
            sx={{
              width: 34,
              height: 34,
              borderRadius: 1,
              display: "grid",
              placeItems: "center",
              bgcolor: "rgba(255, 152, 0, 0.12)",
              color: "primary.main",
              flexShrink: 0,
              mt: 0.5,
            }}
          >
            <Icon fontSize="small" />
          </Box>

          <Box sx={{ minWidth: 0 }}>
            <Typography
              sx={{
                fontSize: 14,
                fontWeight:
                  type === "section"
                    ? 800
                    : 700,
                color: "text.primary",
                lineHeight: 1.4,
                wordBreak: "break-word",
              }}
            >
              {node.display_name || node.name}
            </Typography>

            {node.description ? (
              <Typography
                sx={{
                  mt: 0.35,
                  fontSize: 12,
                  color: "text.secondary",
                  lineHeight: 1.45,
                  maxWidth: 420,
                  whiteSpace: "normal",
                }}
              >
                {node.description}
              </Typography>
            ) : null}
          </Box>
        </Stack>
      </TableCell>

      <TableCell>
        {blocked ? (
          <Tooltip
            title={
              node?.selection_block_reason || ""
            }
          >
            <Chip
              icon={<BlockOutlinedIcon />}
              label="No disponible"
              size="small"
              color="warning"
              variant="outlined"
            />
          </Tooltip>
        ) : node.is_selected ? (
          <Chip
            label="Seleccionado"
            size="small"
            color="success"
          />
        ) : (
          <Chip
            label="Disponible"
            size="small"
            variant="outlined"
          />
        )}
      </TableCell>

      <TableCell align="center">
        {node.is_selected ? (
          <Stack
            direction="row"
            spacing={0.5}
            justifyContent="center"
            alignItems="center"
          >
            <Typography
              sx={{
                minWidth: 28,
                fontSize: 13,
                fontWeight: 800,
                color: "text.primary",
              }}
            >
              {Number(
                node.selected_sort_order || 0
              ) + 1}
            </Typography>

            {!readOnly ? (
              <>
                <IconButton
                  size="small"
                  disabled={!canMoveUp}
                  onClick={() =>
                    onMove("up")
                  }
                >
                  <KeyboardArrowUpOutlinedIcon />
                </IconButton>

                <IconButton
                  size="small"
                  disabled={!canMoveDown}
                  onClick={() =>
                    onMove("down")
                  }
                >
                  <KeyboardArrowDownOutlinedIcon />
                </IconButton>
              </>
            ) : null}
          </Stack>
        ) : (
          "—"
        )}
      </TableCell>

      <TableCell>
        <Typography
          sx={{
            fontSize: 13,
            color:
              node.is_selected
                ? "text.primary"
                : "text.secondary",
          }}
        >
          {node.is_selected
            ? scheduleLabel
            : "—"}
        </Typography>
      </TableCell>

      <TableCell align="right">
        {node.is_selected ? (
          <Tooltip
            title={
              readOnly
                ? "Consultar horario"
                : "Configurar horario"
            }
          >
            <IconButton
              onClick={onSchedule}
              sx={{
                border: "1px solid",
                borderColor: "divider",
              }}
            >
              <AccessTimeOutlinedIcon />
            </IconButton>
          </Tooltip>
        ) : (
          "—"
        )}
      </TableCell>
    </TableRow>
  );
}
