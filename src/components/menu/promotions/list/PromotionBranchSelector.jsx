import {
  MenuItem,
  Paper,
  Stack,
  TextField,
  Typography,
} from "@mui/material";
import KeyboardArrowDownIcon from "@mui/icons-material/KeyboardArrowDown";

export default function PromotionBranchSelector({
  branches = [],
  value,
  onChange,
  disabled = false,
}) {
  const selectedBranch =
    branches.find(
      (branch) => String(branch.id) === String(value)
    ) || null;

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
        <Typography sx={fieldLabelSx}>
          Sucursal
        </Typography>

        <TextField
          select
          value={value || ""}
          onChange={(event) =>
            onChange(event.target.value)
          }
          fullWidth
          disabled={disabled || branches.length === 0}
          SelectProps={{
            IconComponent: KeyboardArrowDownIcon,
          }}
        >
          {branches.map((branch) => (
            <MenuItem
              key={branch.id}
              value={String(branch.id)}
            >
              {branch.name || `Sucursal ${branch.id}`}
            </MenuItem>
          ))}
        </TextField>

        <Typography
          sx={{
            fontSize: 12,
            color: "text.secondary",
          }}
        >
          Estás administrando las promociones de{" "}
          <Typography
            component="span"
            sx={{
              fontSize: 12,
              color: "primary.main",
              fontWeight: 800,
            }}
          >
            {selectedBranch?.name ||
              "la sucursal seleccionada"}
          </Typography>
          .
        </Typography>
      </Stack>
    </Paper>
  );
}

const fieldLabelSx = {
  fontSize: 14,
  fontWeight: 800,
  color: "text.primary",
  mb: 1,
};