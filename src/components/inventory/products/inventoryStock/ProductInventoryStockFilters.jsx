import {
  FormControlLabel, MenuItem, Paper, Select, Stack, Switch, TextField, Typography,
} from "@mui/material";
import KeyboardArrowDownIcon from "@mui/icons-material/KeyboardArrowDown";

export default function ProductInventoryStockFilters({
  q,
  onChangeQ,
  onlyPositive,
  onChangeOnlyPositive,
  categoryId,
  onChangeCategoryId,
  categories = [],
  status,
  onChangeStatus,
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
            label="Buscar producto"
            helper="Busca por nombre."
            sx={{ flex: 1 }}
          >
            <TextField
              value={q}
              onChange={(e) => onChangeQ(e.target.value)}
              placeholder="Buscar por nombre…"
              fullWidth
            />
          </BoxField>

          <BoxField
            label="Categoría"
            helper="Filtra por categoría."
            sx={{ width: { xs: "100%", md: 240 } }}
          >
            <Select
              value={categoryId}
              onChange={(e) => onChangeCategoryId(e.target.value)}
              fullWidth
              displayEmpty
              IconComponent={KeyboardArrowDownIcon}
            >
              <MenuItem value="">Todas</MenuItem>
              {categories.map((cat) => (
                <MenuItem key={cat.id} value={String(cat.id)}>
                  {cat.name}
                </MenuItem>
              ))}
            </Select>
          </BoxField>

          <BoxField
            label="Estado"
            helper="Filtra por estado."
            sx={{ width: { xs: "100%", md: 220 } }}
          >
            <Select
              value={status}
              onChange={(e) => onChangeStatus(e.target.value)}
              fullWidth
              IconComponent={KeyboardArrowDownIcon}
            >
              <MenuItem value="">Todos</MenuItem>
              <MenuItem value="active">Activos</MenuItem>
              <MenuItem value="inactive">Inactivos</MenuItem>
            </Select>
          </BoxField>
        </Stack>

        <Stack
          direction={{ xs: "column", md: "row" }}
          spacing={1.5}
          justifyContent="space-between"
          alignItems={{ xs: "flex-start", md: "center" }}
        >
          <FormControlLabel
            control={
              <Switch
                checked={onlyPositive}
                onChange={(e) => onChangeOnlyPositive(e.target.checked)}
                color="primary"
              />
            }
            label={
              <Typography sx={switchLabelSx}>
                Solo con existencia positiva
              </Typography>
            }
            sx={{ m: 0 }}
          />

          <Typography
            sx={{
              fontSize: 13,
              color: "text.secondary",
              fontWeight: 700,
            }}
          >
            Mostrando {total} registros
          </Typography>
        </Stack>
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

const switchLabelSx = {
  fontSize: 14,
  fontWeight: 700,
  color: "text.primary",
};
