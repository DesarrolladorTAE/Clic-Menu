import { MenuItem, Paper, Stack, TextField, Typography } from "@mui/material";
import KeyboardArrowDownIcon from "@mui/icons-material/KeyboardArrowDown";

export default function CatalogBranchSelectorCard({
  branches,
  branchId,
  onChangeBranch,
  selectedBranch,
}) {
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
          onChange={(e) => onChangeBranch(e.target.value)}
          fullWidth
          SelectProps={{
            IconComponent: KeyboardArrowDownIcon,
          }}
        >
          <MenuItem value="">Selecciona una sucursal</MenuItem>

          {branches.map((branch) => (
            <MenuItem key={branch.id} value={String(branch.id)}>
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
          Estás visualizando el catálogo de{" "}
          <Typography
            component="span"
            sx={{ fontSize: 12, color: "primary.main", fontWeight: 800 }}
          >
            {selectedBranch?.name || "la sucursal seleccionada"}
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
