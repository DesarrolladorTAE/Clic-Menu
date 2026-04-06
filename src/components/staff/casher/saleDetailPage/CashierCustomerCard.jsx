//Tarjetita de clientes
import React from "react";
import {
  Box, Button, Card, CardContent, Chip, Divider, MenuItem, Stack, TextField, Typography,
} from "@mui/material";
import PersonSearchRoundedIcon from "@mui/icons-material/PersonSearchRounded";
import PersonAddAltRoundedIcon from "@mui/icons-material/PersonAddAltRounded";
import PersonRemoveRoundedIcon from "@mui/icons-material/PersonRemoveRounded";
import ContactPhoneRoundedIcon from "@mui/icons-material/ContactPhoneRounded";
import DeleteOutlineRoundedIcon from "@mui/icons-material/DeleteOutlineRounded";
import LoyaltyRoundedIcon from "@mui/icons-material/LoyaltyRounded";

export default function CashierCustomerCard({
  summary = null,
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
  const sale = summary?.sale || null;
  const contactData = summary?.contact_data || null;
  const customer = summary?.customer || null;

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
              Cliente y contacto
            </Typography>

            <Typography
              sx={{
                mt: 0.5,
                fontSize: 14,
                color: "text.secondary",
                lineHeight: 1.5,
              }}
            >
              Guarda contacto simple para ticket digital futuro o asocia un
              cliente formal para historial y beneficios.
            </Typography>
          </Box>

          <Stack direction="row" spacing={1} flexWrap="wrap">
            <Chip label={`Venta #${sale?.id || "—"}`} size="small" />
            <Chip label={`Estado: ${sale?.status || "—"}`} size="small" />
            <Chip
              label={
                customer
                  ? "Cliente formal asociado"
                  : contactData
                  ? "Contacto simple guardado"
                  : "Sin datos"
              }
              size="small"
              sx={{
                fontWeight: 800,
                bgcolor: customer
                  ? "#E7F8EB"
                  : contactData
                  ? "#FFF4D9"
                  : "#F5F5F5",
                color: customer
                  ? "#0A7A2F"
                  : contactData
                  ? "#8A6D3B"
                  : "text.primary",
              }}
            />
          </Stack>

          {customer ? (
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
                <Stack direction="row" spacing={1} alignItems="center">
                  <LoyaltyRoundedIcon color="primary" />
                  <Typography sx={{ fontSize: 18, fontWeight: 800 }}>
                    Cliente formal asociado
                  </Typography>
                </Stack>

                <InfoRow label="Nombre" value={customer?.name_alias || "—"} />
                <InfoRow label="Teléfono" value={customer?.phone || "—"} />
                <InfoRow label="Correo" value={customer?.email || "—"} />
                <InfoRow label="RFC" value={customer?.rfc || "—"} />
                <InfoRow
                  label="Razón social"
                  value={customer?.razon_social || "—"}
                />

                <Button
                  variant="outlined"
                  color="error"
                  onClick={onDetachCustomer}
                  disabled={busy || disabled}
                  startIcon={<PersonRemoveRoundedIcon />}
                  sx={{
                    alignSelf: "flex-end",
                    minWidth: { xs: "100%", sm: 220 },
                    height: 42,
                    borderRadius: 2,
                    fontWeight: 800,
                  }}
                >
                  Desvincular cliente
                </Button>
              </Stack>
            </Box>
          ) : null}

          {contactData ? (
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
                <Stack direction="row" spacing={1} alignItems="center">
                  <ContactPhoneRoundedIcon color="primary" />
                  <Typography sx={{ fontSize: 18, fontWeight: 800 }}>
                    Contacto simple guardado
                  </Typography>
                </Stack>

                <InfoRow label="Teléfono" value={contactData?.phone || "—"} />
                <InfoRow label="Correo" value={contactData?.email || "—"} />

                <Button
                  variant="outlined"
                  color="error"
                  onClick={onRemoveContact}
                  disabled={busy || disabled}
                  startIcon={<DeleteOutlineRoundedIcon />}
                  sx={{
                    alignSelf: "flex-end",
                    minWidth: { xs: "100%", sm: 220 },
                    height: 42,
                    borderRadius: 2,
                    fontWeight: 800,
                  }}
                >
                  Quitar contacto simple
                </Button>
              </Stack>
            </Box>
          ) : null}

          <Box
            sx={{
              border: "1px solid",
              borderColor: "divider",
              borderRadius: 1,
              backgroundColor: "#FCFCFC",
              p: 2,
            }}
          >
            <Stack spacing={1.5}>
              <Typography sx={{ fontSize: 18, fontWeight: 800 }}>
                Guardar contacto simple
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
                      placeholder="7442188925"
                      disabled={busy || disabled || !!customer}
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
                      disabled={busy || disabled || !!customer}
                    />
                  }
                />
              </Stack>

              <Button
                variant="contained"
                onClick={onSaveContact}
                disabled={busy || disabled || !!customer}
                startIcon={<ContactPhoneRoundedIcon />}
                sx={{
                  alignSelf: "flex-end",
                  minWidth: { xs: "100%", sm: 220 },
                  height: 42,
                  borderRadius: 2,
                  fontWeight: 800,
                }}
              >
                Guardar contacto
              </Button>

              {customer ? (
                <HelperBox>
                  La venta ya tiene un cliente formal asociado. Quita esa
                  asociación si quieres volver a usar contacto simple.
                </HelperBox>
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
            <Stack spacing={1.5}>
              <Stack direction="row" spacing={1} alignItems="center">
                <PersonSearchRoundedIcon color="primary" />
                <Typography sx={{ fontSize: 18, fontWeight: 800 }}>
                  Buscar cliente existente
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
                      placeholder="7442188925"
                      disabled={busy || disabled}
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
                      placeholder="cliente@correo.com"
                      disabled={busy || disabled}
                    />
                  }
                />
              </Stack>

              <Button
                variant="outlined"
                onClick={onSearch}
                disabled={busy || disabled || searching}
                startIcon={<PersonSearchRoundedIcon />}
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

              {searchResults.length > 0 ? (
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
                        justifyContent="space-between"
                        spacing={1.25}
                      >
                        <Box>
                          <Typography
                            sx={{
                              fontSize: 15,
                              fontWeight: 800,
                              color: "text.primary",
                            }}
                          >
                            {row.name_alias || "Cliente sin nombre"}
                          </Typography>

                          <Typography
                            sx={{ mt: 0.35, fontSize: 13, color: "text.secondary" }}
                          >
                            Tel: {row.phone || "—"} · Correo: {row.email || "—"}
                          </Typography>

                          <Typography
                            sx={{ mt: 0.35, fontSize: 13, color: "text.secondary" }}
                          >
                            RFC: {row.rfc || "—"} · Régimen: {row.regimen || "—"}
                          </Typography>
                        </Box>

                        <Button
                          variant="contained"
                          onClick={() => onAttachCustomer?.(row.id)}
                          disabled={busy || disabled}
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
              ) : (
                <HelperBox>
                  Busca por teléfono o correo. Si no existe, puedes crearlo y
                  asociarlo abajo.
                </HelperBox>
              )}
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
            <Stack spacing={1.5}>
              <Stack direction="row" spacing={1} alignItems="center">
                <PersonAddAltRoundedIcon color="primary" />
                <Typography sx={{ fontSize: 18, fontWeight: 800 }}>
                  Crear y asociar cliente
                </Typography>
              </Stack>

              <Stack direction={{ xs: "column", md: "row" }} spacing={2}>
                <FieldBlock
                  label="Nombre / alias"
                  input={
                    <TextField
                      fullWidth
                      value={createForm?.name_alias || ""}
                      onChange={(e) =>
                        onCreateFormChange?.("name_alias", e.target.value)
                      }
                      placeholder="Juan Pérez"
                      disabled={busy || disabled}
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
                      placeholder="7442188925"
                      disabled={busy || disabled}
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
                      disabled={busy || disabled}
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
                      disabled={busy || disabled}
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
                        onCreateFormChange?.("rfc", e.target.value.toUpperCase())
                      }
                      placeholder="Opcional"
                      disabled={busy || disabled}
                    />
                  }
                />

                <FieldBlock
                  label="Régimen"
                  input={
                    <TextField
                      select
                      fullWidth
                      value={createForm?.regimen || ""}
                      onChange={(e) =>
                        onCreateFormChange?.("regimen", e.target.value)
                      }
                      disabled={busy || disabled}
                    >
                      <MenuItem value="">Selecciona</MenuItem>
                      <MenuItem value="601">601</MenuItem>
                      <MenuItem value="603">603</MenuItem>
                      <MenuItem value="605">605</MenuItem>
                      <MenuItem value="606">606</MenuItem>
                      <MenuItem value="612">612</MenuItem>
                      <MenuItem value="621">621</MenuItem>
                      <MenuItem value="626">626</MenuItem>
                    </TextField>
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
                    placeholder="39300"
                    disabled={busy || disabled}
                  />
                }
              />

              <Button
                variant="contained"
                onClick={onCreateAndAttach}
                disabled={busy || disabled}
                startIcon={<PersonAddAltRoundedIcon />}
                sx={{
                  alignSelf: "flex-end",
                  minWidth: { xs: "100%", sm: 240 },
                  height: 42,
                  borderRadius: 2,
                  fontWeight: 800,
                }}
              >
                Crear y asociar cliente
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

function InfoRow({ label, value }) {
  return (
    <Stack direction="row" justifyContent="space-between" spacing={1}>
      <Typography sx={{ fontSize: 14, color: "text.secondary", fontWeight: 700 }}>
        {label}
      </Typography>
      <Typography sx={{ fontSize: 14, color: "text.primary", fontWeight: 800 }}>
        {value}
      </Typography>
    </Stack>
  );
}

function HelperBox({ children }) {
  return (
    <Box
      sx={{
        border: "1px dashed",
        borderColor: "divider",
        borderRadius: 1,
        p: 1.5,
      }}
    >
      <Typography
        sx={{
          fontSize: 13,
          color: "text.secondary",
          lineHeight: 1.55,
        }}
      >
        {children}
      </Typography>
    </Box>
  );
}

const fieldLabelSx = {
  fontSize: 14,
  fontWeight: 800,
  color: "text.primary",
  mb: 1,
};