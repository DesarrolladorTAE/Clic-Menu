import React, { useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import {
  Box,
  CircularProgress,
  Stack,
  Typography,
} from "@mui/material";

import PageContainer from "../../../../components/common/PageContainer";
import AppAlert from "../../../../components/common/AppAlert";

import {
  searchCashierCustomersDirectory,
  fetchCashierCustomerPointsBalance,
  fetchCashierCustomerPointsLedger,
  fetchCashierCustomerSalesHistory,
} from "../../../../services/staff/casher/cashierCustomerPoints.service";

import CashierCustomersHeroCard from "../../../../components/staff/casher/customer/CashierCustomersHeroCard";
import CashierCustomerLookupCard from "../../../../components/staff/casher/customer/CashierCustomerLookupCard";
import CashierCustomerBalanceCard from "../../../../components/staff/casher/customer/CashierCustomerBalanceCard";
import CashierCustomerLedgerCard from "../../../../components/staff/casher/customer/CashierCustomerLedgerCard";
import CashierCustomerSalesHistoryCard from "../../../../components/staff/casher/customer/CashierCustomerSalesHistoryCard";

export default function CashierCustomersPage() {
  const nav = useNavigate();

  const [searching, setSearching] = useState(false);
  const [loadingDetail, setLoadingDetail] = useState(false);

  const [filters, setFilters] = useState({
    phone: "",
    email: "",
  });

  const [results, setResults] = useState([]);
  const [selectedCustomer, setSelectedCustomer] = useState(null);

  const [balanceData, setBalanceData] = useState(null);
  const [ledgerRows, setLedgerRows] = useState([]);
  const [salesRows, setSalesRows] = useState([]);

  const [alertState, setAlertState] = useState({
    open: false,
    severity: "info",
    title: "",
    message: "",
  });

  const showAlert = ({ severity = "info", title, message }) => {
    if (!message) return;

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

  const pickErr = (e, fallback) =>
    e?.response?.data?.message || e?.message || fallback;

  const selectedCustomerId = useMemo(() => {
    return Number(selectedCustomer?.id || 0);
  }, [selectedCustomer]);

  const handleFilterChange = (field, value) => {
    setFilters((prev) => ({
      ...prev,
      [field]: value,
    }));
  };

  const handleClearSearch = () => {
    setFilters({
      phone: "",
      email: "",
    });
    setResults([]);
    setSelectedCustomer(null);
    setBalanceData(null);
    setLedgerRows([]);
    setSalesRows([]);
  };

  const handleSearch = async () => {
    const phone = String(filters?.phone || "").trim();
    const email = String(filters?.email || "").trim();

    if (!phone && !email) {
      showAlert({
        severity: "warning",
        message: "Debes escribir al menos teléfono o correo para buscar.",
      });
      return;
    }

    try {
      setSearching(true);

      const res = await searchCashierCustomersDirectory({
        phone: phone || undefined,
        email: email || undefined,
      });

      const rows = Array.isArray(res?.data) ? res.data : [];
      setResults(rows);

      if (!rows.length) {
        setSelectedCustomer(null);
        setBalanceData(null);
        setLedgerRows([]);
        setSalesRows([]);

        showAlert({
          severity: "info",
          message: "No se encontraron clientes con esos datos.",
        });
        return;
      }

      showAlert({
        severity: "success",
        message: "Búsqueda de clientes completada.",
      });
    } catch (e) {
      showAlert({
        severity: "error",
        message: pickErr(e, "No se pudo buscar el cliente."),
      });
    } finally {
      setSearching(false);
    }
  };

  const handleSelectCustomer = async (customerRow) => {
    const customerId = Number(customerRow?.id || 0);
    if (!customerId) return;

    try {
      setLoadingDetail(true);
      setSelectedCustomer(customerRow);

      const [balanceRes, ledgerRes, historyRes] = await Promise.all([
        fetchCashierCustomerPointsBalance(customerId),
        fetchCashierCustomerPointsLedger(customerId),
        fetchCashierCustomerSalesHistory(customerId),
      ]);

      setBalanceData(balanceRes?.data || null);
      setLedgerRows(Array.isArray(ledgerRes?.data?.rows) ? ledgerRes.data.rows : []);
      setSalesRows(
        Array.isArray(historyRes?.data?.rows) ? historyRes.data.rows : []
      );
    } catch (e) {
      showAlert({
        severity: "error",
        message: pickErr(e, "No se pudo cargar la información del cliente."),
      });
    } finally {
      setLoadingDetail(false);
    }
  };

  return (
    <PageContainer>
      <Stack spacing={3}>
        <CashierCustomersHeroCard
          syncing={searching || loadingDetail}
          selectedCustomer={selectedCustomer}
          ledgerCount={ledgerRows.length}
          salesCount={salesRows.length}
          onBack={() => nav("/staff/cashier/queue")}
        />

        <CashierCustomerLookupCard
          filters={filters}
          onChange={handleFilterChange}
          onSearch={handleSearch}
          onClearSearch={handleClearSearch}
          searching={searching}
          results={results}
          selectedCustomerId={selectedCustomerId}
          onSelectCustomer={handleSelectCustomer}
        />

        {loadingDetail ? (
          <Box
            sx={{
              minHeight: 260,
              display: "grid",
              placeItems: "center",
            }}
          >
            <Box sx={{ textAlign: "center" }}>
              <CircularProgress />
              <Typography sx={{ mt: 2, color: "text.secondary", fontSize: 14 }}>
                Cargando información del cliente…
              </Typography>
            </Box>
          </Box>
        ) : selectedCustomer ? (
          <Box
            sx={{
              display: "grid",
              gap: 3,
              gridTemplateColumns: {
                xs: "1fr",
                xl: "0.9fr 1.1fr",
              },
              alignItems: "start",
            }}
          >
            <Stack spacing={3}>
              <CashierCustomerBalanceCard balanceData={balanceData} />
              <CashierCustomerLedgerCard rows={ledgerRows} />
            </Stack>

            <Stack spacing={3}>
              <CashierCustomerSalesHistoryCard rows={salesRows} />
            </Stack>
          </Box>
        ) : (
          <Box
            sx={{
              border: "1px dashed",
              borderColor: "divider",
              borderRadius: 1,
              p: 3,
              backgroundColor: "background.paper",
            }}
          >
            <Typography
              sx={{
                fontSize: 18,
                fontWeight: 800,
                color: "text.primary",
              }}
            >
              Selecciona un cliente
            </Typography>

            <Typography
              sx={{
                mt: 0.75,
                fontSize: 14,
                color: "text.secondary",
                lineHeight: 1.6,
              }}
            >
              Busca un cliente formal por teléfono o correo y luego selecciónalo
              para ver su saldo, movimientos y compras asociadas.
            </Typography>
          </Box>
        )}
      </Stack>

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