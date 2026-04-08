import {
  FormControl,
  MenuItem,
  Paper,
  Select,
  Stack,
  Typography,
} from "@mui/material";
import KeyboardArrowDownIcon from "@mui/icons-material/KeyboardArrowDown";

export default function PurchaseFiltersCard({
  status,
  onChangeStatus,
  branchId,
  onChangeBranchId,
  supplierId,
  onChangeSupplierId,
  branches = [],
  suppliers = [],
  total = 0,
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
      <Stack spacing={2}>
        <Stack
          direction={{ xs: "column", md: "row" }}
          spacing={2}
          alignItems={{ xs: "stretch", md: "flex-end" }}
        >
          <BoxField
            label="Estado"
            helper="Filtra por estatus de compra."
            sx={{ width: { xs: "100%", md: 220 } }}
          >
            <FormControl fullWidth>
              <Select
                value={status}
                onChange={(e) => onChangeStatus(e.target.value)}
                IconComponent={KeyboardArrowDownIcon}
              >
                <MenuItem value="">Todos</MenuItem>
                <MenuItem value="draft">Draft</MenuItem>
                <MenuItem value="completed">Completadas</MenuItem>
              </Select>
            </FormControl>
          </BoxField>

          <BoxField
            label="Sucursal"
            helper="Filtra por sucursal."
            sx={{ flex: 1 }}
          >
            <FormControl fullWidth>
              <Select
                value={branchId}
                onChange={(e) => onChangeBranchId(e.target.value)}
                displayEmpty
                IconComponent={KeyboardArrowDownIcon}
              >
                <MenuItem value="">Todas las sucursales</MenuItem>
                {branches.map((branch) => (
                  <MenuItem key={branch.id} value={String(branch.id)}>
                    {branch.name}
                  </MenuItem>
                ))}
              </Select>
            </FormControl>
          </BoxField>

          <BoxField
            label="Proveedor"
            helper="Filtra por proveedor."
            sx={{ flex: 1 }}
          >
            <FormControl fullWidth>
              <Select
                value={supplierId}
                onChange={(e) => onChangeSupplierId(e.target.value)}
                displayEmpty
                IconComponent={KeyboardArrowDownIcon}
              >
                <MenuItem value="">Todos los proveedores</MenuItem>
                {suppliers.map((supplier) => (
                  <MenuItem key={supplier.id} value={String(supplier.id)}>
                    {supplier.name}
                  </MenuItem>
                ))}
              </Select>
            </FormControl>
          </BoxField>
        </Stack>

        <Typography
          sx={{
            fontSize: 13,
            color: "text.secondary",
            fontWeight: 700,
          }}
        >
          Mostrando {total} compras
        </Typography>
      </Stack>
    </Paper>
  );
}

function BoxField({ label, helper, children, sx }) {
  return (
    <Stack spacing={1} sx={sx}>
      <Typography sx={fieldLabelSx}>{label}</Typography>
      {children}
      {helper ? (
        <Typography
          sx={{
            fontSize: 12,
            color: "text.secondary",
          }}
        >
          {helper}
        </Typography>
      ) : null}
    </Stack>
  );
}

const fieldLabelSx = {
  fontSize: 14,
  fontWeight: 800,
  color: "text.primary",
};
