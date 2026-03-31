import React, { useEffect, useMemo, useRef, useState } from "react";
import { useNavigate } from "react-router-dom";
import {
  Box,
  CircularProgress,
  Stack,
  Typography,
} from "@mui/material";

import PageContainer from "../../../components/common/PageContainer";
import AppAlert from "../../../components/common/AppAlert";
import PaginationFooter from "../../../components/common/PaginationFooter";
import usePagination from "../../../hooks/usePagination";

import { useStaffAuth } from "../../../context/StaffAuthContext";

import {
  fetchCashierCurrentSession,
  fetchCashierRegisters,
  openCashierSession,
  closeCashierSession,
} from "../../../services/staff/casher/cashierSession.service";

import CashierSessionHeroCard from "../../../components/staff/casher/CashierSessionHeroCard";
import CashRegisterCard from "../../../components/staff/casher/CashRegisterCard";
import OpenCashSessionModal from "../../../components/staff/casher/OpenCashSessionModal";

const PAGE_SIZE = 5;

export default function CashierHomePage() {
  const nav = useNavigate();
  const { contexts, logout, clearStaff } = useStaffAuth() || {};

  const [loading, setLoading] = useState(true);
  const [currentSession, setCurrentSession] = useState(null);
  const [registers, setRegisters] = useState([]);

  const [selectedRegister, setSelectedRegister] = useState(null);
  const [openModal, setOpenModal] = useState(false);

  const [opening, setOpening] = useState(false);
  const [closing, setClosing] = useState(false);
  const [leaving, setLeaving] = useState(false);

  const [alertState, setAlertState] = useState({
    open: false,
    severity: "info",
    title: "",
    message: "",
  });

  const pollRef = useRef(null);

  const contextsCount = Array.isArray(contexts) ? contexts.length : 0;
  const hasMultipleContexts = contextsCount > 1;
  const exitLabel = hasMultipleContexts ? "Regresar" : "Cerrar sesión";

  const showAlert = ({ severity = "info", title, message }) => {
    const resolvedTitle =
      title ||
      (severity === "success"
        ? "Listo"
        : severity === "warning"
        ? "Ojo"
        : severity === "error"
        ? "Error"
        : "Aviso");

    setAlertState({
      open: true,
      severity,
      title: resolvedTitle,
      message,
    });
  };

  const closeAlert = (_, reason) => {
    if (reason === "clickaway") return;
    setAlertState((prev) => ({ ...prev, open: false }));
  };

  const load = async ({ silent = false } = {}) => {
    try {
      if (!silent) setLoading(true);

      const [sessionRes, registersRes] = await Promise.all([
        fetchCashierCurrentSession(),
        fetchCashierRegisters(),
      ]);

      setCurrentSession(sessionRes?.data || null);
      setRegisters(Array.isArray(registersRes?.data) ? registersRes.data : []);
    } catch (e) {
      const status = e?.response?.status;

      if (status === 409) {
        showAlert({
          severity: "warning",
          message:
            e?.response?.data?.message ||
            "Debes seleccionar tu contexto antes de operar caja.",
        });
        return;
      }

      showAlert({
        severity: "error",
        message:
          e?.response?.data?.message ||
          "No se pudo cargar la información de caja.",
      });
    } finally {
      if (!silent) setLoading(false);
    }
  };

  useEffect(() => {
    load();

    pollRef.current = setInterval(() => {
      if (document.visibilityState === "visible") {
        load({ silent: true });
      }
    }, 10000);

    return () => {
      if (pollRef.current) clearInterval(pollRef.current);
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const sortedRegisters = useMemo(() => {
    return [...registers].sort((a, b) =>
      String(a?.name || "").localeCompare(String(b?.name || ""), "es", {
        sensitivity: "base",
      })
    );
  }, [registers]);

  const {
    page,
    total,
    totalPages,
    startItem,
    endItem,
    hasPrev,
    hasNext,
    nextPage,
    prevPage,
    paginatedItems,
  } = usePagination({
    items: sortedRegisters,
    initialPage: 1,
    pageSize: PAGE_SIZE,
    mode: "frontend",
  });

  const handleOpenModal = (register) => {
    setSelectedRegister(register);
    setOpenModal(true);
  };

  const handleConfirmOpen = async (payload) => {
    setOpening(true);

    try {
      const res = await openCashierSession(payload);
      setCurrentSession(res?.data || null);
      setOpenModal(false);
      setSelectedRegister(null);

      showAlert({
        severity: "success",
        message: res?.message || "Caja abierta correctamente.",
      });

      nav("/staff/cashier/queue", { replace: true });
    } catch (e) {
      showAlert({
        severity: "error",
        message:
          e?.response?.data?.message || "No se pudo abrir la caja.",
      });
    } finally {
      setOpening(false);
    }
  };

  const handleCloseSession = async () => {
    setClosing(true);

    try {
      const res = await closeCashierSession({});
      setCurrentSession(null);

      await load({ silent: true });

      showAlert({
        severity: "success",
        message: res?.message || "Caja cerrada correctamente.",
      });
    } catch (e) {
      showAlert({
        severity: "warning",
        message:
          e?.response?.data?.message ||
          "No se pudo cerrar la caja.",
      });
    } finally {
      setClosing(false);
    }
  };

  const handleGoQueue = () => {
    nav("/staff/cashier/queue");
  };

  const handleExit = async () => {
    if (leaving) return;

    if (hasMultipleContexts) {
      nav("/staff/select-context", {
        replace: true,
        state: {
          from: "/staff/cashier",
          forceSelection: true,
        },
      });
      return;
    }

    setLeaving(true);

    try {
      await logout?.();
    } catch {
      clearStaff?.();
    } finally {
      nav("/staff/login", { replace: true });
      setLeaving(false);
    }
  };

  if (loading) {
    return (
      <PageContainer>
        <Box
          sx={{
            minHeight: "70vh",
            display: "grid",
            placeItems: "center",
          }}
        >
          <Box sx={{ textAlign: "center" }}>
            <CircularProgress />
            <Typography sx={{ mt: 2, color: "text.secondary", fontSize: 14 }}>
              Cargando caja…
            </Typography>
          </Box>
        </Box>
      </PageContainer>
    );
  }

  return (
    <PageContainer>
      <Stack spacing={3}>
        <CashierSessionHeroCard
          currentSession={currentSession}
          onCloseSession={handleCloseSession}
          onGoQueue={handleGoQueue}
          onExit={handleExit}
          exitLabel={exitLabel}
          closing={closing}
        />

        {!currentSession ? (
          <Box
            sx={{
              border: "1px solid",
              borderColor: "divider",
              borderRadius: 1,
              backgroundColor: "background.paper",
              overflow: "hidden",
            }}
          >
            <Box
              sx={{
                px: 2,
                py: 1.75,
                borderBottom: "1px solid",
                borderColor: "divider",
              }}
            >
              <Typography
                sx={{
                  fontSize: 20,
                  fontWeight: 800,
                  color: "text.primary",
                }}
              >
                Cajas disponibles
              </Typography>

              <Typography
                sx={{
                  mt: 0.5,
                  fontSize: 14,
                  color: "text.secondary",
                }}
              >
                Elige una caja activa para comenzar a operar.
              </Typography>
            </Box>

            {sortedRegisters.length === 0 ? (
              <Box sx={{ px: 3, py: 6, textAlign: "center" }}>
                <Typography
                  sx={{
                    fontSize: 22,
                    fontWeight: 800,
                    color: "text.primary",
                  }}
                >
                  No hay cajas disponibles
                </Typography>

                <Typography
                  sx={{
                    mt: 1,
                    fontSize: 14,
                    color: "text.secondary",
                  }}
                >
                  Revisa que existan cajas activas en tu sucursal.
                </Typography>
              </Box>
            ) : (
              <>
                <Box
                  sx={{
                    p: 2,
                    display: "grid",
                    gap: 2,
                    gridTemplateColumns: {
                      xs: "repeat(1, minmax(0, 1fr))",
                      sm: "repeat(2, minmax(0, 1fr))",
                      lg: "repeat(3, minmax(0, 1fr))",
                    },
                  }}
                >
                  {paginatedItems.map((register) => (
                    <CashRegisterCard
                      key={register.id}
                      register={register}
                      onOpen={handleOpenModal}
                      disabled={opening}
                    />
                  ))}
                </Box>

                <PaginationFooter
                  page={page}
                  totalPages={totalPages}
                  startItem={startItem}
                  endItem={endItem}
                  total={total}
                  hasPrev={hasPrev}
                  hasNext={hasNext}
                  onPrev={prevPage}
                  onNext={nextPage}
                  itemLabel="cajas"
                />
              </>
            )}
          </Box>
        ) : (
          <Box
            sx={{
              border: "1px solid",
              borderColor: "divider",
              borderRadius: 1,
              backgroundColor: "background.paper",
              px: { xs: 2, sm: 3 },
              py: { xs: 2.5, sm: 3 },
            }}
          >
            <Typography
              sx={{
                fontSize: 22,
                fontWeight: 800,
                color: "text.primary",
              }}
            >
              Todo listo para cobrar
            </Typography>

            <Typography
              sx={{
                mt: 1,
                fontSize: 14,
                color: "text.secondary",
                lineHeight: 1.6,
              }}
            >
              Ya tienes una caja abierta en este contexto. El siguiente paso es
              pasar al tablero de cobro para tomar ventas disponibles o continuar
              con las que ya tomaste.
            </Typography>
          </Box>
        )}
      </Stack>

      <OpenCashSessionModal
        open={openModal}
        onClose={() => {
          if (opening) return;
          setOpenModal(false);
          setSelectedRegister(null);
        }}
        register={selectedRegister}
        onConfirm={handleConfirmOpen}
        saving={opening}
      />

      <AppAlert
        open={alertState.open}
        onClose={closeAlert}
        severity={alertState.severity}
        title={alertState.title}
        message={alertState.message}
        autoHideDuration={4200}
      />
    </PageContainer>
  );
}