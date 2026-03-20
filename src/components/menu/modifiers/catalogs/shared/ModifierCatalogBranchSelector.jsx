import { MenuItem, Paper, Stack, TextField, Typography } from "@mui/material";
import KeyboardArrowDownIcon from "@mui/icons-material/KeyboardArrowDown";
import { fieldLabelSx } from "./catalogShared";

export default function ModifierCatalogBranchSelector({
  visible,
  branches = [],
  branchId,
  onChange,
  helpText = "",
}) {
  if (!visible) return null;

  return (
    <Paper
      sx={{
        p: { xs: 2, sm: 2.5 },
        borderRadius: 1,
        backgroundColor: "background.paper",
        border: "1px solid",
        borderColor: "divider",
        boxShadow: "none",
      }}
    >
      <Stack spacing={1.25}>
        <Typography sx={fieldLabelSx}>Sucursal</Typography>

        <TextField
          select
          value={branchId}
          onChange={(e) => onChange(e.target.value)}
          SelectProps={{
            IconComponent: KeyboardArrowDownIcon,
          }}
        >
          {branches.map((b) => (
            <MenuItem key={b.id} value={String(b.id)}>
              {b.name || `Sucursal ${b.id}`}
            </MenuItem>
          ))}
        </TextField>

        <Typography
          sx={{
            fontSize: 12,
            color: "text.secondary",
          }}
        >
          {helpText}
        </Typography>
      </Stack>
    </Paper>
  );
}
