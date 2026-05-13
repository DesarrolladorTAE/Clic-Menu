import { Alert, Box, Typography } from "@mui/material";

export default function SalesChannelsAlerts({
  planAccessError,
  canUseAdditionalSalesChannels,
  err,
}) {
  return (
    <>
      {planAccessError && (
        <Alert
          severity="warning"
          sx={{
            borderRadius: 1,
            alignItems: "flex-start",
          }}
        >
          <Box>
            <Typography sx={{ fontWeight: 800, mb: 0.5 }}>
              Permisos del plan
            </Typography>
            <Typography variant="body2">{planAccessError}</Typography>
          </Box>
        </Alert>
      )}

      {!canUseAdditionalSalesChannels && (
        <Alert
          severity="info"
          sx={{
            borderRadius: 1,
            alignItems: "flex-start",
          }}
        >
          <Box>
            <Typography sx={{ fontWeight: 800, mb: 0.5 }}>
              Canal limitado por plan
            </Typography>
            <Typography variant="body2">
              Tu plan actual solo permite trabajar con el canal SALÓN. Los demás canales se conservan, pero quedan inactivos hasta contratar un plan compatible.
            </Typography>
          </Box>
        </Alert>
      )}

      {err && (
        <Alert
          severity="error"
          sx={{
            borderRadius: 1,
            alignItems: "flex-start",
          }}
        >
          <Box>
            <Typography sx={{ fontWeight: 800, mb: 0.5 }}>
              Error
            </Typography>
            <Typography variant="body2">{err}</Typography>
          </Box>
        </Alert>
      )}
    </>
  );
}