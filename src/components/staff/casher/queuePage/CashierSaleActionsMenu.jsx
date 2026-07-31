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

export default function CashierSaleActionsMenu({
  sale,
  disabled = false,
  onSplit,
  onMerge,
  onRelease,
}) {
  const [anchorEl, setAnchorEl] = useState(null);

  const permissions = sale?.permissions || {};

  const canSplit = permissions.can_split === true;
  const canMerge =
    permissions.can_merge_checks === true ||
    permissions.can_merge_tables === true;
  const canRelease = permissions.can_release === true;

  const hasActions = canSplit || canMerge || canRelease;

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
        {canSplit ? (
          <MenuItem onClick={() => runAction(onSplit)}>
            <ListItemIcon>
              <CallSplitRoundedIcon fontSize="small" />
            </ListItemIcon>
            <ListItemText primary="Dividir" />
          </MenuItem>
        ) : null}

        {canMerge ? (
          <MenuItem onClick={() => runAction(onMerge)}>
            <ListItemIcon>
              <MergeRoundedIcon fontSize="small" />
            </ListItemIcon>
            <ListItemText primary="Juntar" />
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
