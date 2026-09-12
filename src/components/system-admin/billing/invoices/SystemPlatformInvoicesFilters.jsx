import { Box, MenuItem, Paper, TextField, Typography } from "@mui/material";

export default function SystemPlatformInvoicesFilters({
  filters,
  owners = [],
  onChange,
}) {
  const update = (changes) => {
    onChange?.({ ...filters, ...changes });
  };

  const changeReceiverType = (value) => {
    update({
      receiver_type: value,
      ...(value === "public_general" ? { owner_id: "" } : {}),
    });
  };

  const changeOwner = (value) => {
    update({
      owner_id: value,
      ...(value ? { receiver_type: "owner" } : {}),
    });
  };

  return (
    <Paper
      sx={{
        p: { xs: 2, sm: 2.5 },
        border: "1px solid",
        borderColor: "divider",
        borderRadius: 1,
        boxShadow: "none",
        bgcolor: "background.paper",
      }}
    >
      <Typography sx={{ mb: 2, fontSize: 18, fontWeight: 800, color: "text.primary" }}>
        Filtros
      </Typography>

      <Box
        sx={{
          display: "grid",
          gridTemplateColumns: {
            xs: "1fr",
            sm: "repeat(2, minmax(0, 1fr))",
            lg: "repeat(4, minmax(0, 1fr))",
          },
          gap: 2,
        }}
      >
        <FieldBlock label="Estado">
          <TextField
            select
            fullWidth
            value={filters.status}
            onChange={(e) => update({ status: e.target.value })}
          >
            <MenuItem value="">Todos</MenuItem>
            <MenuItem value="stamped">Timbradas</MenuItem>
            <MenuItem value="processing">En proceso</MenuItem>
            <MenuItem value="failed">Fallidas</MenuItem>
            <MenuItem value="review_required">Requieren revisión</MenuItem>
          </TextField>
        </FieldBlock>

        <FieldBlock label="Receptor">
          <TextField
            select
            fullWidth
            value={filters.receiver_type}
            onChange={(e) => changeReceiverType(e.target.value)}
          >
            <MenuItem value="">Todos</MenuItem>
            <MenuItem value="owner">Propietario</MenuItem>
            <MenuItem value="public_general">Público General</MenuItem>
          </TextField>
        </FieldBlock>

        <FieldBlock label="Origen">
          <TextField
            select
            fullWidth
            value={filters.issuance_source}
            onChange={(e) => update({ issuance_source: e.target.value })}
          >
            <MenuItem value="">Todos</MenuItem>
            <MenuItem value="owner">Propietario</MenuItem>
            <MenuItem value="system_admin">Administrador</MenuItem>
          </TextField>
        </FieldBlock>

        <FieldBlock label="Propietario">
          <TextField
            select
            fullWidth
            value={filters.owner_id}
            disabled={filters.receiver_type === "public_general"}
            onChange={(e) => changeOwner(e.target.value)}
          >
            <MenuItem value="">Todos los propietarios</MenuItem>

            {owners.map((owner) => (
              <MenuItem key={owner.id} value={String(owner.id)}>
                {owner.full_name || owner.name || `Propietario ${owner.id}`}
              </MenuItem>
            ))}
          </TextField>
        </FieldBlock>
      </Box>
    </Paper>
  );
}

function FieldBlock({ label, children }) {
  return (
    <Box sx={{ minWidth: 0 }}>
      <Typography sx={fieldLabelSx}>{label}</Typography>
      {children}
    </Box>
  );
}

const fieldLabelSx = {
  mb: 1,
  fontSize: 14,
  fontWeight: 800,
  color: "text.primary",
};