import { Button, Container, Paper, Typography, Stack } from "@mui/material";

export default function TestMui() {
  return (
    <Container sx={{ py: 5 }}>
      <Paper sx={{ p: 4 }}>
        <Stack spacing={2}>
          <Typography variant="h4">
            Material UI funcionando
          </Typography>

          <Typography variant="body1">
            Este bloque ya debería usar el theme global.
          </Typography>

          <Button variant="contained">
            Botón principal
          </Button>

          <Button variant="contained" color="secondary">
            Botón secundario
          </Button>

          <Button variant="outlined">
            Botón outlined
          </Button>
        </Stack>
      </Paper>
    </Container>
  );
}