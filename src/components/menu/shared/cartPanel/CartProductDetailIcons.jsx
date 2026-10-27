//src/components/menu/shared/cartPanel/CartProductDetailIcons.jsx
import React, { useMemo } from "react";
import { Badge, IconButton, Stack, Tooltip } from "@mui/material";

import TuneRoundedIcon from "@mui/icons-material/TuneRounded";
import StickyNote2RoundedIcon from "@mui/icons-material/StickyNote2Rounded";

function asArray(value) {
  return Array.isArray(value) ? value : [];
}

function positiveId(value) {
  const number = Number(value);
  return Number.isSafeInteger(number) && number > 0 ? number : null;
}

function readAmount(value) {
  if (value === null || value === undefined || value === "") {
    return null;
  }

  const number = Number(value);
  return Number.isFinite(number) && number >= 0 ? number : null;
}

function readQuantity(value) {
  const number = Number(value ?? 1);
  return Number.isFinite(number) && number > 0 ? number : 1;
}

export function getCartProductNotes(item) {
  const notes = item?.notes;

  if (notes === null || notes === undefined || notes === "") {
    return "";
  }

  if (typeof notes === "string") {
    const text = notes.trim();
    return text === "{}" || text === "[]" ? "" : text;
  }

  try {
    const text = JSON.stringify(notes);
    return text === "{}" || text === "[]" ? "" : text;
  } catch {
    return String(notes);
  }
}

export function getCartProductExtras(item, option = null) {
  const savedGroups = asArray(item?.modifier_groups_display);
  const rawGroups = savedGroups.length > 0
    ? savedGroups
    : asArray(item?.modifiers);

  if (!rawGroups.length) {
    return [];
  }

  const catalogGroups = [
    ...asArray(option?.modifierGroups),
    ...asArray(option?.modifier_groups),
    ...asArray(option?.variants).flatMap((variant) =>
      asArray(variant?.modifier_groups)
    ),
  ];

  const groups = new Map();

  const addOption = (groupName, selected, catalogOption = null, groupTotal = null) => {
    const name = String(
      selected?.name ||
      selected?.name_snapshot ||
      selected?.modifier_option_name_snapshot ||
      selected?.modifier_name_snapshot ||
      catalogOption?.name ||
      "Extra seleccionado"
    ).trim();

    const quantity = readQuantity(selected?.quantity);

    const unitPrice = readAmount(
      selected?.unit_price ??
      selected?.unit_price_snapshot ??
      selected?.price_snapshot ??
      selected?.price
    );

    const totalPrice = readAmount(
      selected?.total_price ?? selected?.total_price_snapshot
    );

    if (!groups.has(groupName)) {
      groups.set(groupName, { name: groupName, total: groupTotal, options: [] });
    }

    const group = groups.get(groupName);

    if (group.total === null && groupTotal !== null) {
      group.total = groupTotal;
    }

    group.options.push({ name, quantity, unitPrice, totalPrice });
  };

  rawGroups.forEach((group) => {
    const groupId = positiveId(group?.modifier_group_id ?? group?.group_id);

    const catalogGroup = catalogGroups.find((row) =>
      positiveId(row?.id) === groupId
    );

    const groupName = String(
      group?.group_name ||
      group?.group_name_snapshot ||
      catalogGroup?.name ||
      "Extras"
    ).trim() || "Extras";

    const groupedOptions = Array.isArray(group?.options)
      ? group.options
      : Array.isArray(group?.items)
        ? group.items
        : Array.isArray(group?.modifiers)
          ? group.modifiers
          : null;

    if (groupedOptions !== null) {
      const groupTotal = readAmount(group?.group_total);

      groupedOptions.forEach((selected) => {
        const selectedId = positiveId(
          selected?.modifier_option_id ?? selected?.option_id ?? selected?.id
        );

        const catalogOption = asArray(catalogGroup?.options).find((row) =>
          positiveId(row?.id) === selectedId
        );

        addOption(groupName, selected, catalogOption, groupTotal);
      });

      return;
    }

    addOption(groupName, group);
  });

  return Array.from(groups.values()).filter((group) => group.options.length > 0);
}

export function getCartProductExtrasCount(item, option = null) {
  return getCartProductExtras(item, option).reduce(
    (total, group) => total + group.options.length, 0
  );
}

export default function CartProductDetailIcons({
  item,
  option = null,
  onShowDetails,
}) {
  const extrasCount = useMemo(
    () => getCartProductExtrasCount(item, option),
    [item, option]
  );

  const hasNotes = Boolean(getCartProductNotes(item));

  if (!item || typeof onShowDetails !== "function") {
    return null;
  }

  if (!extrasCount && !hasNotes) {
    return null;
  }

  const showDetails = (event, section) => {
    event.stopPropagation();
    onShowDetails(item, section, option);
  };

  return (
    <Stack
      direction="row"
      alignItems="center"
      spacing={0.75}
      sx={{ flexShrink: 0 }}
    >
      {extrasCount > 0 ? (
        <Tooltip title={`Consultar extras (${extrasCount})`} arrow>
          <IconButton
            type="button"
            size="small"
            aria-label={`Consultar ${extrasCount} extras del producto`}
            onClick={(event) => showDetails(event, "extras")}
            sx={{
              width: 40,
              height: 40,
              border: "1px solid #bfdbfe",
              borderRadius: 1.5,
              bgcolor: "#eff6ff",
              color: "#1d4ed8",
              "&:hover": { bgcolor: "#dbeafe" },
            }}
          >
            <Badge
              badgeContent={extrasCount}
              color="primary"
              max={99}
              sx={{
                "& .MuiBadge-badge": {
                  fontSize: 10,
                  minWidth: 18,
                  height: 18,
                  px: 0.4,
                  top: -2,
                  right: -4,
                  fontWeight: 800,
                },
              }}
            >
              <TuneRoundedIcon sx={{ fontSize: 20 }} />
            </Badge>
          </IconButton>
        </Tooltip>
      ) : null}

      {hasNotes ? (
        <Tooltip title="Consultar notas del producto" arrow>
          <IconButton
            type="button"
            size="small"
            aria-label="Consultar notas del producto"
            onClick={(event) => showDetails(event, "notes")}
            sx={{
              width: 40,
              height: 40,
              border: "1px solid #fed7aa",
              borderRadius: 1.5,
              bgcolor: "#fff7ed",
              color: "#c2410c",
              "&:hover": { bgcolor: "#ffedd5" },
            }}
          >
            <StickyNote2RoundedIcon sx={{ fontSize: 20 }} />
          </IconButton>
        </Tooltip>
      ) : null}
    </Stack>
  );
}