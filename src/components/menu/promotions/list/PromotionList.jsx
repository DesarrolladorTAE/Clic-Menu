import {
  Box, LinearProgress, Paper, Stack, Typography,
} from "@mui/material";
import LocalOfferOutlinedIcon from "@mui/icons-material/LocalOfferOutlined";

import PromotionCard from "./PromotionCard";
import PromotionsPaginationFooter from "./PromotionsPaginationFooter";

export default function PromotionList({
  promotions,
  loading,
  updatingIds,
  page,
  totalPages,
  startItem,
  endItem,
  total,
  onPrev,
  onNext,
  onEdit,
  onStatusChange,
  onDelete,
}) {
  return (
    <Stack spacing={2}>
      {loading ? (
        <LinearProgress
          sx={{
            borderRadius: 999,
            height: 4,
          }}
        />
      ) : null}

      {!loading && promotions.length === 0 ? (
        <EmptyPromotions />
      ) : (
        <Box
          sx={{
            display: "grid",
            gridTemplateColumns: {
              xs: "1fr",
              lg: "repeat(2, minmax(0, 1fr))",
            },
            gap: 2,
            alignItems: "stretch",
          }}
        >
          {promotions.map((promotion) => (
            <PromotionCard
              key={promotion.id}
              promotion={promotion}
              updating={updatingIds.has(
                String(promotion.id)
              )}
              onEdit={onEdit}
              onStatusChange={onStatusChange}
              onDelete={onDelete}
            />
          ))}
        </Box>
      )}

      <PromotionsPaginationFooter
        page={page}
        totalPages={totalPages}
        startItem={startItem}
        endItem={endItem}
        total={total}
        onPrev={onPrev}
        onNext={onNext}
      />
    </Stack>
  );
}

function EmptyPromotions() {
  return (
    <Paper
      sx={{
        px: 3,
        py: 6,
        textAlign: "center",
        borderRadius: 1,
        backgroundColor: "background.paper",
        border: "1px solid",
        borderColor: "divider",
        boxShadow: "none",
      }}
    >
      <Box
        sx={{
          width: 56,
          height: 56,
          borderRadius: 1,
          mx: "auto",
          mb: 2,
          display: "grid",
          placeItems: "center",
          bgcolor: "rgba(255, 152, 0, 0.12)",
          color: "primary.main",
        }}
      >
        <LocalOfferOutlinedIcon />
      </Box>

      <Typography
        sx={{
          fontSize: 20,
          fontWeight: 800,
          color: "text.primary",
        }}
      >
        No se encontraron promociones
      </Typography>

      <Typography
        sx={{
          mt: 1,
          color: "text.secondary",
          fontSize: 14,
          lineHeight: 1.55,
        }}
      >
        No hay promociones que coincidan con el tipo,
        estado o búsqueda seleccionada.
      </Typography>
    </Paper>
  );
}