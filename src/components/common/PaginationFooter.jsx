import React from "react";
import { Button, Stack, Typography } from "@mui/material";
import NavigateBeforeIcon from "@mui/icons-material/NavigateBefore";
import NavigateNextIcon from "@mui/icons-material/NavigateNext";

export default function PaginationFooter({
  page,
  totalPages,
  startItem,
  endItem,
  total,
  hasPrev,
  hasNext,
  onPrev,
  onNext,
  itemLabel = "registros",
}) {
  return (
    <Stack
      direction={{ xs: "column", sm: "row" }}
      justifyContent="space-between"
      alignItems={{ xs: "stretch", sm: "center" }}
      spacing={1.5}
      sx={{
        px: 2,
        py: 1.5,
        borderTop: "1px solid",
        borderColor: "divider",
        backgroundColor: "#fff",
      }}
    >
      <Typography
        sx={{
          fontSize: 13,
          color: "text.secondary",
          textAlign: { xs: "center", sm: "left" },
        }}
      >
        Mostrando {startItem} - {endItem} de {total} {itemLabel}
      </Typography>

      <Stack
        direction="row"
        spacing={1}
        justifyContent={{ xs: "center", sm: "flex-end" }}
        alignItems="center"
      >
        <Button
          variant="outlined"
          startIcon={<NavigateBeforeIcon />}
          onClick={onPrev}
          disabled={!hasPrev}
          sx={{
            minWidth: 110,
            height: 40,
            borderRadius: 2,
          }}
        >
          Anterior
        </Button>

        <Typography
          sx={{
            minWidth: 70,
            textAlign: "center",
            fontSize: 13,
            fontWeight: 700,
            color: "text.primary",
          }}
        >
          {page} / {totalPages}
        </Typography>

        <Button
          variant="outlined"
          endIcon={<NavigateNextIcon />}
          onClick={onNext}
          disabled={!hasNext}
          sx={{
            minWidth: 110,
            height: 40,
            borderRadius: 2,
          }}
        >
          Siguiente
        </Button>
      </Stack>
    </Stack>
  );
}