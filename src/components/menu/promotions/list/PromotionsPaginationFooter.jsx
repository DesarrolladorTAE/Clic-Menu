import {
  Button,
  Stack,
  Typography,
} from "@mui/material";
import NavigateBeforeIcon from "@mui/icons-material/NavigateBefore";
import NavigateNextIcon from "@mui/icons-material/NavigateNext";

export default function PromotionsPaginationFooter({
  page,
  totalPages,
  startItem,
  endItem,
  total,
  onPrev,
  onNext,
}) {
  if (total === 0) return null;

  return (
    <Stack
      direction={{ xs: "column", sm: "row" }}
      justifyContent="space-between"
      alignItems={{ xs: "stretch", sm: "center" }}
      spacing={1.5}
      sx={{
        p: 2,
        border: "1px solid",
        borderColor: "divider",
        borderRadius: 1,
        backgroundColor: "background.paper",
      }}
    >
      <Typography
        sx={{
          fontSize: 13,
          color: "text.secondary",
          textAlign: {
            xs: "center",
            sm: "left",
          },
        }}
      >
        Mostrando {startItem} - {endItem} de {total} promociones
      </Typography>

      <Stack
        direction="row"
        spacing={1}
        justifyContent={{
          xs: "center",
          sm: "flex-end",
        }}
        alignItems="center"
      >
        <Button
          type="button"
          variant="outlined"
          startIcon={<NavigateBeforeIcon />}
          onClick={onPrev}
          disabled={page <= 1}
        >
          Anterior
        </Button>

        <Typography
          sx={{
            minWidth: 70,
            textAlign: "center",
            fontSize: 13,
            fontWeight: 800,
            color: "text.primary",
          }}
        >
          {page} / {totalPages}
        </Typography>

        <Button
          type="button"
          variant="outlined"
          endIcon={<NavigateNextIcon />}
          onClick={onNext}
          disabled={page >= totalPages}
        >
          Siguiente
        </Button>
      </Stack>
    </Stack>
  );
}
