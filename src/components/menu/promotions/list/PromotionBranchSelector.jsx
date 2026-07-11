import {
  Box, MenuItem, Paper, Stack, TextField, Typography,
} from "@mui/material";
import StorefrontOutlinedIcon from "@mui/icons-material/StorefrontOutlined";
import KeyboardArrowDownIcon from "@mui/icons-material/KeyboardArrowDown";

export default function PromotionBranchSelector({
  branches,
  value,
  onChange,
  disabled = false,
}) {
  const selectedBranch = branches.find(
    (branch) => String(branch.id) === String(value)
  );

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
      <Stack spacing={1.75}>
        <Stack
          direction="row"
          spacing={1}
          alignItems="center"
        >
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
            }}
          >
            <StorefrontOutlinedIcon fontSize="small" />
          </Box>

          <Box>
            <Typography
              sx={{
                fontSize: 15,
                fontWeight: 800,
                color: "text.primary",
              }}
            >
              Sucursal
            </Typography>

            <Typography
              sx={{
                mt: 0.25,
                fontSize: 12,
                color: "text.secondary",
              }}
            >
              Selecciona la sucursal que deseas administrar.
            </Typography>
          </Box>
        </Stack>

        <TextField
          select
          value={value || ""}
          onChange={(event) => onChange(event.target.value)}
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
              {branch.name}
            </MenuItem>
          ))}
        </TextField>

        <Typography
          sx={{
            fontSize: 13,
            color: "text.secondary",
            lineHeight: 1.5,
          }}
        >
          {selectedBranch
            ? `Estás administrando las promociones de ${selectedBranch.name}.`
            : "No hay una sucursal seleccionada."}
        </Typography>
      </Stack>
    </Paper>
  );
}
