import {
  Button,
  Dialog,
  DialogContent,
  DialogTitle,
  FormControl,
  IconButton,
  MenuItem,
  Select,
  Stack,
  Typography,
} from "@mui/material";
import CloseIcon from "@mui/icons-material/Close";
import KeyboardArrowDownIcon from "@mui/icons-material/KeyboardArrowDown";

export default function AssignZoneWaiterModal({
  open,
  zone,
  waiters = [],
  loading = false,
  saving = false,
  selectedWaiterId = "",
  onChangeWaiter,
  onClose,
  onSave,
  formatWaiterLabel,
}) {
  return (
    <Dialog
      open={open}
      onClose={saving ? undefined : onClose}
      fullWidth
      maxWidth="sm"
      slotProps={{
        paper: {
          sx: {
            borderRadius: { xs: 0, sm: 1 },
            overflow: "hidden",
            backgroundColor: "background.paper",
          },
        },
      }}
    >
      <DialogTitle
        sx={{
          px: { xs: 2, sm: 3 },
          py: 2,
          bgcolor: "#111111",
          color: "#fff",
        }}
      >
        <Stack
          direction="row"
          justifyContent="space-between"
          alignItems="flex-start"
          spacing={2}
        >
          <div>
            <Typography
              sx={{
                fontWeight: 800,
                fontSize: { xs: 20, sm: 24 },
                lineHeight: 1.2,
                color: "#fff",
              }}
            >
              Asignar mesero a zona
            </Typography>

            <Typography
              sx={{
                mt: 0.5,
                fontSize: 13,
                color: "rgba(255,255,255,0.82)",
              }}
            >
              Zona: {zone?.name || "Sin zona seleccionada"}
            </Typography>
          </div>

          <IconButton
            onClick={onClose}
            disabled={saving}
            sx={{
              color: "#fff",
              bgcolor: "rgba(255,255,255,0.08)",
              borderRadius: 1,
              "&:hover": {
                bgcolor: "rgba(255,255,255,0.16)",
              },
            }}
          >
            <CloseIcon />
          </IconButton>
        </Stack>
      </DialogTitle>

      <DialogContent
        sx={{
          p: { xs: 2, sm: 3 },
          bgcolor: "background.default",
        }}
      >
        <Stack spacing={2.5}>
          <div>
            <Typography
              sx={{
                fontSize: 14,
                fontWeight: 800,
                color: "text.primary",
                mb: 1,
              }}
            >
              Mesero
            </Typography>

            <FormControl fullWidth>
              <Select
                value={selectedWaiterId}
                onChange={(e) => onChangeWaiter(e.target.value)}
                disabled={loading || saving}
                displayEmpty
                IconComponent={KeyboardArrowDownIcon}
                sx={selectSx}
              >
                <MenuItem value="">Selecciona un mesero…</MenuItem>

                {waiters.map((waiter) => (
                  <MenuItem key={waiter.id} value={String(waiter.id)}>
                    {formatWaiterLabel(waiter)}
                  </MenuItem>
                ))}
              </Select>
            </FormControl>

            <Typography
              sx={{
                mt: 0.75,
                fontSize: 12,
                color: "text.secondary",
                lineHeight: 1.45,
              }}
            >
              Esta acción también asigna el mesero automáticamente a las mesas
              de esta zona.
            </Typography>
          </div>

          <Stack
            direction={{ xs: "column-reverse", sm: "row" }}
            justifyContent="flex-end"
            spacing={1.5}
            pt={1}
          >
            <Button
              type="button"
              onClick={onClose}
              disabled={saving}
              variant="outlined"
              sx={{
                minWidth: { xs: "100%", sm: 150 },
                height: 44,
                borderRadius: 2,
              }}
            >
              Cancelar
            </Button>

            <Button
              type="button"
              onClick={onSave}
              disabled={saving || loading}
              variant="contained"
              sx={{
                minWidth: { xs: "100%", sm: 180 },
                height: 44,
                borderRadius: 2,
                fontWeight: 800,
              }}
            >
              {saving ? "Guardando…" : "Guardar"}
            </Button>
          </Stack>
        </Stack>
      </DialogContent>
    </Dialog>
  );
}

const selectSx = {
  bgcolor: "#F4F4F4",
  borderRadius: 0,
  minHeight: 44,
  "& .MuiOutlinedInput-notchedOutline": {
    border: "none",
  },
  "&:hover .MuiOutlinedInput-notchedOutline": {
    border: "none",
  },
  "&.Mui-focused .MuiOutlinedInput-notchedOutline": {
    border: "1.5px solid #FF9800",
  },
  "& .MuiSelect-select": {
    py: 1.25,
    px: 1.5,
    fontSize: 14,
    color: "text.primary",
  },
};
