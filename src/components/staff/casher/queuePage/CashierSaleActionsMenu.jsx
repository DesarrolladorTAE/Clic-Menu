// src/components/staff/casher/queuePage/CashierSaleActionsMenu.jsx
import React, { useState } from "react";
import {
  IconButton,
  ListItemIcon,
  ListItemText,
  Menu,
  MenuItem,
  Tooltip,
} from "@mui/material";

import MoreVertRoundedIcon from "@mui/icons-material/MoreVertRounded";
import CallSplitRoundedIcon from "@mui/icons-material/CallSplitRounded";
import MergeRoundedIcon from "@mui/icons-material/MergeRounded";
import AssignmentReturnRoundedIcon from "@mui/icons-material/AssignmentReturnRounded";
import UndoRoundedIcon from "@mui/icons-material/UndoRounded";
import BuildRoundedIcon from "@mui/icons-material/BuildRounded";

export default function CashierSaleActionsMenu({
  sale,
  disabled = false,
  onSplit,
  onMerge,
  onRelease,
}) {
  const [anchorEl, setAnchorEl] = useState(null);

  const permissions = sale?.permissions || {};
  const splitMode = resolveSplitMode(sale);

  const canSplitProducts =
    permissions.can_split_products === true;

  const canSplitEqualParts =
    permissions.can_split_equal_parts === true;

  const canManageProductSplit =
    permissions.can_manage_product_split === true;

  const canMergeChecks =
    permissions.can_merge_checks === true;

  const canMergeTables =
    permissions.can_merge_tables === true;

  const canUndoEqualParts =
    permissions.can_undo_equal_parts === true;

  const canRelease =
    permissions.can_release === true;

  const showNormalSplit =
    splitMode === "normal" &&
    (canSplitProducts || canSplitEqualParts);

  const showProductManagement =
    splitMode === "products" &&
    canManageProductSplit;

  const showEqualPartsUndo =
    splitMode === "equal_parts" &&
    canUndoEqualParts;

  const showRepair =
    splitMode === "inconsistent" &&
    canMergeChecks;

  const showMerge =
    splitMode !== "equal_parts" &&
    splitMode !== "inconsistent" &&
    (canMergeChecks || canMergeTables);

  const hasActions =
    showNormalSplit ||
    showProductManagement ||
    showEqualPartsUndo ||
    showRepair ||
    showMerge ||
    canRelease;

  if (!hasActions) return null;

  const closeMenu = () => setAnchorEl(null);

  const runAction = (callback) => {
    closeMenu();
    callback?.(sale);
  };

  return (
    <>
      <Tooltip title="Acciones de la venta">
        <span>
          <IconButton
            size="small"
            disabled={disabled}
            onClick={(event) => setAnchorEl(event.currentTarget)}
            aria-label="Abrir acciones de la venta"
            sx={{
              border: "1px solid",
              borderColor: "divider",
              borderRadius: 1,
            }}
          >
            <MoreVertRoundedIcon />
          </IconButton>
        </span>
      </Tooltip>

      <Menu
        anchorEl={anchorEl}
        open={Boolean(anchorEl)}
        onClose={closeMenu}
      >
        {showNormalSplit ? (
          <MenuItem onClick={() => runAction(onSplit)}>
            <ListItemIcon>
              <CallSplitRoundedIcon fontSize="small" />
            </ListItemIcon>

            <ListItemText primary="Dividir" />
          </MenuItem>
        ) : null}

        {showProductManagement ? (
          <MenuItem onClick={() => runAction(onSplit)}>
            <ListItemIcon>
              <CallSplitRoundedIcon fontSize="small" />
            </ListItemIcon>

            <ListItemText primary="Administrar división por productos" />
          </MenuItem>
        ) : null}

        {showEqualPartsUndo ? (
          <MenuItem onClick={() => runAction(onSplit)}>
            <ListItemIcon>
              <UndoRoundedIcon fontSize="small" />
            </ListItemIcon>

            <ListItemText primary="Deshacer división en partes iguales" />
          </MenuItem>
        ) : null}

        {showRepair ? (
          <MenuItem onClick={() => runAction(onMerge)}>
            <ListItemIcon>
              <BuildRoundedIcon fontSize="small" />
            </ListItemIcon>

            <ListItemText primary="Reparar cuentas" />
          </MenuItem>
        ) : null}

        {showMerge ? (
          <MenuItem onClick={() => runAction(onMerge)}>
            <ListItemIcon>
              <MergeRoundedIcon fontSize="small" />
            </ListItemIcon>

            <ListItemText
              primary={
                splitMode === "products"
                  ? "Juntar cuentas"
                  : "Juntar"
              }
            />
          </MenuItem>
        ) : null}

        {canRelease ? (
          <MenuItem onClick={() => runAction(onRelease)}>
            <ListItemIcon>
              <AssignmentReturnRoundedIcon fontSize="small" />
            </ListItemIcon>

            <ListItemText primary="Liberar venta" />
          </MenuItem>
        ) : null}
      </Menu>
    </>
  );
}

function resolveSplitMode(sale) {
  const mode = String(sale?.split_mode || "").toLowerCase();

  if (
    ["normal", "products", "equal_parts", "inconsistent"].includes(
      mode
    )
  ) {
    return mode;
  }

  if (
    sale?.has_inconsistent_structure === true ||
    sale?.has_empty_checks === true
  ) {
    return "inconsistent";
  }

  return "normal";
}