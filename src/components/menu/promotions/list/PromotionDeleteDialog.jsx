import {
  Button,
  CircularProgress,
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
  Stack,
  Typography,
} from "@mui/material";
import DeleteOutlineOutlinedIcon from "@mui/icons-material/DeleteOutlineOutlined";

export default function PromotionDeleteDialog({
  open,
  promotion,
  deleting = false,
  onClose,
  onConfirm,
}) {
  return (
    <Dialog
      open={open}
      onClose={deleting ? undefined : onClose}
      fullWidth
      maxWidth="xs"
      PaperProps={{
        sx: {
          borderRadius: 1,
        },
      }}
    >
      <DialogTitle
        sx={{
          fontWeight: 800,
          color: "text.primary",
        }}
      >
        Eliminar promoción
      </DialogTitle>

      <DialogContent>
        <Stack spacing={1.25}>
          <Typography
            sx={{
              fontSize: 14,
              color: "text.primary",
              lineHeight: 1.55,
            }}
          >
            ¿Deseas eliminar la promoción{" "}
            <Typography
              component="span"
              sx={{
                fontSize: 14,
                fontWeight: 800,
                color: "text.primary",
              }}
            >
              {promotion?.name || "seleccionada"}
            </Typography>
            ?
          </Typography>

          <Typography
            sx={{
              fontSize: 13,
              color: "text.secondary",
              lineHeight: 1.5,
            }}
          >
            Eliminar no equivale a desactivar. La promoción
            dejará de aparecer en este listado.
          </Typography>
        </Stack>
      </DialogContent>

      <DialogActions
        sx={{
          px: 3,
          pb: 2.5,
          flexDirection: {
            xs: "column-reverse",
            sm: "row",
          },
          gap: 1,
        }}
      >
        <Button
          type="button"
          variant="outlined"
          onClick={onClose}
          disabled={deleting}
          sx={{
            width: {
              xs: "100%",
              sm: "auto",
            },
          }}
        >
          Cancelar
        </Button>

        <Button
          type="button"
          variant="contained"
          color="error"
          startIcon={
            deleting ? (
              <CircularProgress
                size={18}
                color="inherit"
              />
            ) : (
              <DeleteOutlineOutlinedIcon />
            )
          }
          onClick={onConfirm}
          disabled={deleting}
          sx={{
            width: {
              xs: "100%",
              sm: "auto",
            },
          }}
        >
          {deleting ? "Eliminando…" : "Eliminar promoción"}
        </Button>
      </DialogActions>
    </Dialog>
  );
}
