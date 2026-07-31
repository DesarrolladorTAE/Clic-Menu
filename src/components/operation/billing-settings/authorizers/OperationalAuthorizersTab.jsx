import { CircularProgress, Paper, Stack, Typography } from "@mui/material";

import OperationalAuthorizersContextCard from "./OperationalAuthorizersContextCard";
import OperationalAuthorizersListCard from "./OperationalAuthorizersListCard";

export default function OperationalAuthorizersTab({
  selectedBranch,
  authorizers = [],
  candidates = [],
  loading = false,
  savingAuthorizerId = null,
  deletingAuthorizerId = null,
  onCreate,
  onUpdate,
  onDelete,
  onToggleStatus,
  showToast,
}) {
  if (!selectedBranch?.id) {
    return (
      <Paper sx={emptyCardSx}>
        <Typography sx={{ fontSize: 20, fontWeight: 800, color: "text.primary" }}>
          No hay sucursal seleccionada
        </Typography>

        <Typography sx={{ mt: 1, color: "text.secondary", fontSize: 14 }}>
          Selecciona una sucursal para administrar sus autorizadores operativos.
        </Typography>
      </Paper>
    );
  }

  if (loading) {
    return (
      <Paper sx={loadingCardSx}>
        <Stack spacing={2} alignItems="center">
          <CircularProgress color="primary" />

          <Typography sx={{ color: "text.secondary", fontSize: 14 }}>
            Cargando autorizadores operativos…
          </Typography>
        </Stack>
      </Paper>
    );
  }

  return (
    <Stack spacing={3}>
      <OperationalAuthorizersContextCard
        selectedBranch={selectedBranch}
        authorizers={authorizers}
        candidates={candidates}
      />

      <OperationalAuthorizersListCard
        selectedBranch={selectedBranch}
        authorizers={authorizers}
        candidates={candidates}
        savingAuthorizerId={savingAuthorizerId}
        deletingAuthorizerId={deletingAuthorizerId}
        onCreate={onCreate}
        onUpdate={onUpdate}
        onDelete={onDelete}
        onToggleStatus={onToggleStatus}
        showToast={showToast}
      />
    </Stack>
  );
}

const emptyCardSx = {
  p: { xs: 2.5, sm: 3 },
  borderRadius: 1,
  backgroundColor: "background.paper",
  border: "1px solid",
  borderColor: "divider",
  boxShadow: "none",
  textAlign: "center",
};

const loadingCardSx = {
  p: 4,
  borderRadius: 1,
  backgroundColor: "background.paper",
  border: "1px solid",
  borderColor: "divider",
  boxShadow: "none",
};
