import React, { useMemo } from "react";
import {
  Alert,
  Box,
  Button,
  Card,
  CardContent,
  Chip,
  Divider,
  Stack,
  TextField,
  Typography,
} from "@mui/material";
import PersonSearchRoundedIcon from "@mui/icons-material/PersonSearchRounded";
import PersonAddRoundedIcon from "@mui/icons-material/PersonAddRounded";
import LinkRoundedIcon from "@mui/icons-material/LinkRounded";
import PhoneRoundedIcon from "@mui/icons-material/PhoneRounded";
import EmailRoundedIcon from "@mui/icons-material/EmailRounded";
import DeleteOutlineRoundedIcon from "@mui/icons-material/DeleteOutlineRounded";
import SaveRoundedIcon from "@mui/icons-material/SaveRounded";
import BadgeRoundedIcon from "@mui/icons-material/BadgeRounded";

export default function CashierCustomerCard({
  summary,
  contactForm,
  onContactFormChange,
  onSaveContact,
  onRemoveContact,
  searchForm,
  onSearchFormChange,
  onSearch,
  searchResults = [],
  onAttachCustomer,
  createForm,
  onCreateFormChange,
  onCreateAndAttach,
  onDetachCustomer,
  searching = false,
  busy = false,
  disabled = false,
}) {
  const customer = summary?.customer || null;
  const contactData = summary?.contact_data || null;
  const hasFormalCustomer = Boolean(customer?.customer_id || customer?.id);
  const hasSimpleContact = Boolean(contactData?.phone || contactData?.email);

  const helperConfig = useMemo(() => {
    if (hasFormalCustomer) {
      return {
        severity: "success",
        title: "Cliente formal asociado",
        message:
          "Cliente formal asociado. Si el programa de puntos está activo, la venta podrá generar puntos automáticamente al cobrarse.",
      };
    }

    if (hasSimpleContact) {
      return {
        severity: "info",
        title: "Contacto simple guardado",
        message:
          "El contacto simple sirve para seguimiento, pero no genera puntos. Para historial y beneficios, asocia un cliente formal.",
      };
    }

    return {
      severity: "warning",
      title: "Sin cliente formal asociado",
      message:
        "Sin cliente formal asociado. La venta podrá cobrarse, pero no generará puntos.",
    };
  }, [hasFormalCustomer, hasSimpleContact]);

  return (
    <Card
      sx={{
        border: "1px solid",
        borderColor: "divider",
        borderRadius: 1,
        boxShadow: "none",
        backgroundColor: "background.paper",
      }}
    >
      <CardContent sx={{ p: { xs: 2, sm: 3 } }}>
        <Stack spacing={2.5}>
          <Box>
            <Typography
              sx={{
                fontSize: 22,
                fontWeight: 800,
                color: "text.primary",
              }}
            >
              Cliente
            </Typography>

            <Typography
              sx={{
                mt: 0.5,
                fontSize: 14,
                color: "text.secondary",
                lineHeight: 1.55,
              }}
            >
              Guarda contacto simple o asocia un cliente formal a la venta para
              aprovechar historial y beneficios futuros.
            </Typography>
          </Box>

          <Alert
            severity={helperConfig.severity}
            sx={{
              borderRadius: 1,
              alignItems: "flex-start",
              "& .MuiAlert-message": {
                width: "100%",
              },
            }}
          >
            <Typography
              sx={{
                fontSize: 14,
                fontWeight: 800,
                lineHeight: 1.2,
              }}
            >
              {helperConfig.title}
            </Typography>

            <Typography
              sx={{
                mt: 0.5,
                fontSize: 13,
                lineHeight: 1.55,
              }}
            >
              {helperConfig.message}
            </Typography>
          </Alert>

          {hasFormalCustomer ? (
            <Box
              sx={{
                border: "1px solid",
                borderColor: "divider",
                borderRadius: 1,
                backgroundColor: "#FCFCFC",
                p: 2,
              }}
            >
              <Stack spacing={1.25}>
                <Stack
                  direction={{ xs: "column", sm: "row" }}
                  spacing={1}
                  justifyContent="space-between"
                  alignItems={{ xs: "flex-start", sm: "center" }}
                >
                  <Stack direction="row" spacing={1} alignItems="center">
                    <BadgeRoundedIcon color="primary" />
                    <Typography
                      sx={{
                        fontSize: 18,
                        fontWeight: 800,
                        color: "text.primary",
                      }}
                    >
                      Cliente formal asociado
                    </Typography>
                  </Stack>

                  <Chip
                    label="Asociado"
                    size="small"
                    sx={{
                      fontWeight: 800,
                      bgcolor: "#E7F8EB",
                      color: "#0A7A2F",
                    }}
                  />
                </Stack>

                <Stack spacing={0.75}>
                  <InfoRow
                    label="Nombre"
                    value={customer?.name_alias || "Sin nombre"}
                  />
                  <InfoRow
                    label="Teléfono"
                    value={customer?.phone || "—"}
                    icon={<PhoneRoundedIcon fontSize="inherit" />}
                  />
                  <InfoRow
                    label="Correo"
                    value={customer?.email || "—"}
                    icon={<EmailRoundedIcon fontSize="inherit" />}
                  />
                </Stack>

                <Stack
                  direction={{ xs: "column", sm: "row" }}
                  spacing={1.5}
                  sx={{ pt: 0.5 }}
                >
                  <Button
                    variant="outlined"
                    color="error"
                    startIcon={<DeleteOutlineRoundedIcon />}
                    onClick={onDetachCustomer}
                    disabled={disabled || busy}
                    sx={{
                      flex: 1,
                      height: 42,
                      borderRadius: 2,
                      fontWeight: 800,
                    }}
                  >
                    Desvincular cliente
                  </Button>
                </Stack>
              </Stack>
            </Box>
          ) : null}

          <Divider />

          <Box
            sx={{
              border: "1px solid",
              borderColor: "divider",
              borderRadius: 1,
              backgroundColor: "#FCFCFC",
              p: 2,
            }}
          >
            <Stack spacing={1.75}>
              <Stack direction="row" spacing={1} alignItems="center">
                <SaveRoundedIcon color="primary" />
                <Typography
                  sx={{
                    fontSize: 18,
                    fontWeight: 800,
                    color: "text.primary",
                  }}
                >
                  Contacto simple
                </Typography>
              </Stack>

              <Typography
                sx={{
                  fontSize: 13,
                  color: "text.secondary",
                  lineHeight: 1.55,
                }}
              >
                Sirve para seguimiento y ticket digital futuro, pero no genera
                puntos ni historial formal.
              </Typography>

              <Stack direction={{ xs: "column", md: "row" }} spacing={2}>
                <FieldBlock
                  label="Teléfono"
                  input={
                    <TextField
                      fullWidth
                      value={contactForm?.phone || ""}
                      onChange={(e) =>
                        onContactFormChange?.("phone", e.target.value)
                      }
                      placeholder="Ej. 7441234567"
                      disabled={disabled || busy}
                    />
                  }
                />

                <FieldBlock
                  label="Correo"
                  input={
                    <TextField
                      fullWidth
                      value={contactForm?.email || ""}
                      onChange={(e) =>
                        onContactFormChange?.("email", e.target.value)
                      }
                      placeholder="cliente@correo.com"
                      disabled={disabled || busy}
                    />
                  }
                />
              </Stack>

              <Stack
                direction={{ xs: "column", sm: "row" }}
                spacing={1.5}
                sx={{ width: "100%" }}
              >
                <Button
                  variant="outlined"
                  startIcon={<SaveRoundedIcon />}
                  onClick={onSaveContact}
                  disabled={disabled || busy}
                  sx={{
                    flex: 1,
                    height: 42,
                    borderRadius: 2,
                    fontWeight: 800,
                  }}
                >
                  Guardar contacto
                </Button>

                <Button
                  variant="outlined"
                  color="error"
                  startIcon={<DeleteOutlineRoundedIcon />}
                  onClick={onRemoveContact}
                  disabled={disabled || busy || !hasSimpleContact}
                  sx={{
                    flex: 1,
                    height: 42,
                    borderRadius: 2,
                    fontWeight: 800,
                  }}
                >
                  Quitar contacto
                </Button>
              </Stack>
            </Stack>
          </Box>

          <Divider />

          <Box
            sx={{
              border: "1px solid",
              borderColor: "divider",
              borderRadius: 1,
              backgroundColor: "#FCFCFC",
              p: 2,
            }}
          >
            <Stack spacing={1.75}>
              <Stack direction="row" spacing={1} alignItems="center">
                <PersonSearchRoundedIcon color="primary" />
                <Typography
                  sx={{
                    fontSize: 18,
                    fontWeight: 800,
                    color: "text.primary",
                  }}
                >
                  Buscar cliente formal
                </Typography>
              </Stack>

              <Stack direction={{ xs: "column", md: "row" }} spacing={2}>
                <FieldBlock
                  label="Teléfono"
                  input={
                    <TextField
                      fullWidth
                      value={searchForm?.phone || ""}
                      onChange={(e) =>
                        onSearchFormChange?.("phone", e.target.value)
                      }
                      placeholder="Busca por teléfono"
                      disabled={disabled || busy || searching}
                    />
                  }
                />

                <FieldBlock
                  label="Correo"
                  input={
                    <TextField
                      fullWidth
                      value={searchForm?.email || ""}
                      onChange={(e) =>
                        onSearchFormChange?.("email", e.target.value)
                      }
                      placeholder="Busca por correo"
                      disabled={disabled || busy || searching}
                    />
                  }
                />
              </Stack>

              <Button
                variant="contained"
                startIcon={<PersonSearchRoundedIcon />}
                onClick={onSearch}
                disabled={disabled || busy || searching}
                sx={{
                  alignSelf: "flex-end",
                  minWidth: { xs: "100%", sm: 220 },
                  height: 42,
                  borderRadius: 2,
                  fontWeight: 800,
                }}
              >
                {searching ? "Buscando…" : "Buscar cliente"}
              </Button>

              {Array.isArray(searchResults) && searchResults.length > 0 ? (
                <Stack spacing={1.25}>
                  {searchResults.map((row) => (
                    <Box
                      key={row.id}
                      sx={{
                        border: "1px solid",
                        borderColor: "divider",
                        borderRadius: 1,
                        backgroundColor: "#fff",
                        p: 1.5,
                      }}
                    >
                      <Stack
                        direction={{ xs: "column", sm: "row" }}
                        spacing={1.5}
                        justifyContent="space-between"
                        alignItems={{ xs: "flex-start", sm: "center" }}
                      >
                        <Box sx={{ minWidth: 0 }}>
                          <Typography
                            sx={{
                              fontSize: 15,
                              fontWeight: 800,
                              color: "text.primary",
                            }}
                          >
                            {row?.name_alias || "Cliente sin nombre"}
                          </Typography>

                          <Typography
                            sx={{
                              mt: 0.35,
                              fontSize: 13,
                              color: "text.secondary",
                              lineHeight: 1.55,
                              wordBreak: "break-word",
                            }}
                          >
                            {row?.phone || "Sin teléfono"} · {row?.email || "Sin correo"}
                          </Typography>
                        </Box>

                        <Button
                          variant="outlined"
                          startIcon={<LinkRoundedIcon />}
                          onClick={() => onAttachCustomer?.(row.id)}
                          disabled={disabled || busy}
                          sx={{
                            minWidth: { xs: "100%", sm: 180 },
                            height: 40,
                            borderRadius: 2,
                            fontWeight: 800,
                          }}
                        >
                          Asociar cliente
                        </Button>
                      </Stack>
                    </Box>
                  ))}
                </Stack>
              ) : null}
            </Stack>
          </Box>

          <Divider />

          <Box
            sx={{
              border: "1px solid",
              borderColor: "divider",
              borderRadius: 1,
              backgroundColor: "#FCFCFC",
              p: 2,
            }}
          >
            <Stack spacing={1.75}>
              <Stack direction="row" spacing={1} alignItems="center">
                <PersonAddRoundedIcon color="primary" />
                <Typography
                  sx={{
                    fontSize: 18,
                    fontWeight: 800,
                    color: "text.primary",
                  }}
                >
                  Crear y asociar cliente
                </Typography>
              </Stack>

              <Typography
                sx={{
                  fontSize: 13,
                  color: "text.secondary",
                  lineHeight: 1.55,
                }}
              >
                Crea el cliente formal y vincúlalo inmediatamente a esta venta.
              </Typography>

              <Stack direction={{ xs: "column", md: "row" }} spacing={2}>
                <FieldBlock
                  label="Alias / nombre"
                  input={
                    <TextField
                      fullWidth
                      value={createForm?.name_alias || ""}
                      onChange={(e) =>
                        onCreateFormChange?.("name_alias", e.target.value)
                      }
                      placeholder="Nombre del cliente"
                      disabled={disabled || busy}
                    />
                  }
                />

                <FieldBlock
                  label="Teléfono"
                  input={
                    <TextField
                      fullWidth
                      value={createForm?.phone || ""}
                      onChange={(e) =>
                        onCreateFormChange?.("phone", e.target.value)
                      }
                      placeholder="7441234567"
                      disabled={disabled || busy}
                    />
                  }
                />
              </Stack>

              <Stack direction={{ xs: "column", md: "row" }} spacing={2}>
                <FieldBlock
                  label="Correo"
                  input={
                    <TextField
                      fullWidth
                      value={createForm?.email || ""}
                      onChange={(e) =>
                        onCreateFormChange?.("email", e.target.value)
                      }
                      placeholder="cliente@correo.com"
                      disabled={disabled || busy}
                    />
                  }
                />

                <FieldBlock
                  label="Razón social"
                  input={
                    <TextField
                      fullWidth
                      value={createForm?.razon_social || ""}
                      onChange={(e) =>
                        onCreateFormChange?.("razon_social", e.target.value)
                      }
                      placeholder="Opcional"
                      disabled={disabled || busy}
                    />
                  }
                />
              </Stack>

              <Stack direction={{ xs: "column", md: "row" }} spacing={2}>
                <FieldBlock
                  label="RFC"
                  input={
                    <TextField
                      fullWidth
                      value={createForm?.rfc || ""}
                      onChange={(e) =>
                        onCreateFormChange?.("rfc", e.target.value)
                      }
                      placeholder="Opcional"
                      disabled={disabled || busy}
                    />
                  }
                />

                <FieldBlock
                  label="Régimen"
                  input={
                    <TextField
                      fullWidth
                      value={createForm?.regimen || ""}
                      onChange={(e) =>
                        onCreateFormChange?.("regimen", e.target.value)
                      }
                      placeholder="Opcional"
                      disabled={disabled || busy}
                    />
                  }
                />
              </Stack>

              <FieldBlock
                label="Código postal"
                input={
                  <TextField
                    fullWidth
                    value={createForm?.postal_code || ""}
                    onChange={(e) =>
                      onCreateFormChange?.("postal_code", e.target.value)
                    }
                    placeholder="Opcional"
                    disabled={disabled || busy}
                  />
                }
              />

              <Button
                variant="contained"
                startIcon={<PersonAddRoundedIcon />}
                onClick={onCreateAndAttach}
                disabled={disabled || busy}
                sx={{
                  alignSelf: "flex-end",
                  minWidth: { xs: "100%", sm: 250 },
                  height: 42,
                  borderRadius: 2,
                  fontWeight: 800,
                }}
              >
                Crear y asociar
              </Button>
            </Stack>
          </Box>
        </Stack>
      </CardContent>
    </Card>
  );
}

function FieldBlock({ label, input }) {
  return (
    <Box sx={{ flex: 1, width: "100%" }}>
      <Typography sx={fieldLabelSx}>{label}</Typography>
      {input}
    </Box>
  );
}

function InfoRow({ label, value, icon = null }) {
  return (
    <Stack direction="row" justifyContent="space-between" spacing={1.5}>
      <Stack direction="row" spacing={0.75} alignItems="center">
        {icon ? (
          <Box
            sx={{
              display: "grid",
              placeItems: "center",
              color: "text.secondary",
              fontSize: 15,
            }}
          >
            {icon}
          </Box>
        ) : null}

        <Typography
          sx={{
            fontSize: 13,
            fontWeight: 700,
            color: "text.secondary",
          }}
        >
          {label}
        </Typography>
      </Stack>

      <Typography
        sx={{
          fontSize: 13,
          fontWeight: 800,
          color: "text.primary",
          textAlign: "right",
          wordBreak: "break-word",
        }}
      >
        {value || "—"}
      </Typography>
    </Stack>
  );
}

const fieldLabelSx = {
  fontSize: 14,
  fontWeight: 800,
  color: "text.primary",
  mb: 1,
};