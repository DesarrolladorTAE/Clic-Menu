import { useState } from "react";

import {
  extractTicketFromPayResponse,
  extractTicketWarningFromPayResponse,
} from "../../../../../services/staff/casher/cashierPayment.service";

import {
  fetchCashierTicketById,
  fetchCashierSaleTicketPrintConfig,
  fetchCashierSaleTicketPrintPayload,
  openCashierTicketHtmlInNewTab,
  openCashierTicketWindow,
  printCashierTicketFromHtml,
  saveCashierTicketPdf,
  sendCashierSaleTicketWhatsapp,
  sendCashierThermalPrintPayload,
} from "../../../../../services/staff/casher/cashierTicket.service";

import { pickErr } from "./cashierOnlineOrderPayment.utils";

export default function useCashierOnlineOrderTicket({
  selectedSaleId,
  showAlert,
}) {
  const [settlement, setSettlement] = useState(null);
  const [postPaymentOpen, setPostPaymentOpen] = useState(false);
  const [postPaymentTicket, setPostPaymentTicket] = useState(null);
  const [postPaymentTicketWarning, setPostPaymentTicketWarning] = useState(false);
  const [postPaymentTicketErrorCode, setPostPaymentTicketErrorCode] = useState(null);
  const [postPaymentTicketErrorMessage, setPostPaymentTicketErrorMessage] = useState(null);
  const [postPaymentPrintConfig, setPostPaymentPrintConfig] = useState(null);
  const [postPaymentSale, setPostPaymentSale] = useState(null);
  const [postPaymentOrder, setPostPaymentOrder] = useState(null);

  const [ticketBusy, setTicketBusy] = useState({
    view: false,
    print: false,
    thermalPrint: false,
    download: false,
    whatsapp: false,
  });

  const setTicketBusyKey = (key, value) => {
    setTicketBusy((previous) => ({ ...previous, [key]: value }));
  };

  const loadPostPaymentPrintConfig = async (targetSaleId) => {
    if (!targetSaleId) {
      setPostPaymentPrintConfig(null);
      return null;
    }

    try {
      const response = await fetchCashierSaleTicketPrintConfig(targetSaleId);
      const config = response?.data || null;

      setPostPaymentPrintConfig(config);
      return config;
    } catch {
      setPostPaymentPrintConfig(null);
      return null;
    }
  };

  const ensureLatestTicket = async () => {
    const ticketId = Number(postPaymentTicket?.id || 0);
    if (!ticketId) throw new Error("No hay ticket disponible para consultar.");

    const response = await fetchCashierTicketById(ticketId);
    return response?.data || postPaymentTicket;
  };

  const handleViewTicket = async () => {
    const ticketWindow = openCashierTicketWindow("Cargando ticket…");

    if (!ticketWindow) {
      showAlert({
        severity: "error",
        message: "El navegador bloqueó la apertura de la vista del ticket.",
      });
      return;
    }

    try {
      setTicketBusyKey("view", true);

      const latestTicket = await ensureLatestTicket();
      setPostPaymentTicket(latestTicket);

      await openCashierTicketHtmlInNewTab(latestTicket.id, ticketWindow);
    } catch (error) {
      try {
        if (!ticketWindow.closed) ticketWindow.close();
      } catch {
        // La ventana ya no está disponible.
      }

      showAlert({
        severity: "error",
        message: pickErr(error, "No se pudo abrir la vista del ticket."),
      });
    } finally {
      setTicketBusyKey("view", false);
    }
  };

  const handlePrintTicket = async () => {
    const printWindow = openCashierTicketWindow("Preparando impresión…");

    if (!printWindow) {
      showAlert({
        severity: "error",
        message: "El navegador bloqueó la ventana de impresión.",
      });
      return;
    }

    try {
      setTicketBusyKey("print", true);

      const latestTicket = await ensureLatestTicket();
      setPostPaymentTicket(latestTicket);

      await printCashierTicketFromHtml(latestTicket.id, printWindow);
    } catch (error) {
      try {
        if (!printWindow.closed) printWindow.close();
      } catch {
        // La ventana ya no está disponible.
      }

      showAlert({
        severity: "error",
        message: pickErr(error, "No se pudo imprimir el ticket."),
      });
    } finally {
      setTicketBusyKey("print", false);
    }
  };

  const handleThermalPrintTicket = async () => {
    const targetSaleId = Number(
      postPaymentSale?.sale_id || postPaymentSale?.id || selectedSaleId || 0
    );

    if (!targetSaleId) {
      showAlert({
        severity: "warning",
        message: "No se encontró la venta que debe imprimirse.",
      });
      return;
    }

    try {
      setTicketBusyKey("thermalPrint", true);

      const configResponse = await fetchCashierSaleTicketPrintConfig(targetSaleId);
      const config = configResponse?.data || null;

      if (!config?.enabled || !config?.show_print_button) {
        showAlert({
          severity: "warning",
          message: config?.message || "La impresión térmica no está habilitada para esta sucursal.",
        });
        return;
      }

      setPostPaymentPrintConfig(config);

      const payloadResponse = await fetchCashierSaleTicketPrintPayload(targetSaleId);
      const payload = payloadResponse?.payload || null;

      if (!payload) throw new Error("No se recibió el payload de impresión térmica.");

      await sendCashierThermalPrintPayload(payload, config);

      showAlert({
        severity: "success",
        message: "Ticket enviado a impresión térmica correctamente.",
      });
    } catch (error) {
      showAlert({
        severity: "error",
        message: pickErr(
          error,
          "No se pudo enviar el ticket a la aplicación de impresión térmica."
        ),
      });
    } finally {
      setTicketBusyKey("thermalPrint", false);
    }
  };

  const handleDownloadTicket = async () => {
    try {
      setTicketBusyKey("download", true);

      const latestTicket = await ensureLatestTicket();
      setPostPaymentTicket(latestTicket);

      await saveCashierTicketPdf(latestTicket.id);
    } catch (error) {
      showAlert({
        severity: "error",
        message: pickErr(error, "No se pudo descargar el PDF del ticket."),
      });
    } finally {
      setTicketBusyKey("download", false);
    }
  };

  const handleSendTicketWhatsapp = async ({ phone, body, saveContact }) => {
    const targetSaleId = Number(
      postPaymentSale?.sale_id || postPaymentSale?.id || selectedSaleId || 0
    );

    if (!targetSaleId) {
      showAlert({
        severity: "warning",
        message: "No se encontró la venta asociada al ticket.",
      });
      return;
    }

    try {
      setTicketBusyKey("whatsapp", true);

      const response = await sendCashierSaleTicketWhatsapp(targetSaleId, {
        phone,
        body,
        save_contact: saveContact,
      });

      showAlert({
        severity: "success",
        message: response?.message || "Ticket enviado correctamente por WhatsApp.",
      });
    } catch (error) {
      showAlert({
        severity: "error",
        message: pickErr(error, "No se pudo enviar el ticket por WhatsApp."),
      });
    } finally {
      setTicketBusyKey("whatsapp", false);
    }
  };

  const openNormalPaymentResult = async (response) => {
    const paidSale = response?.data?.sale || null;
    const paidOrder = response?.data?.order || null;
    const paidSettlement = response?.data?.settlement || null;
    const ticket = extractTicketFromPayResponse(response);
    const ticketWarningData = extractTicketWarningFromPayResponse(response);

    setSettlement(paidSettlement);
    setPostPaymentSale(paidSale);
    setPostPaymentOrder(paidOrder);
    setPostPaymentTicket(ticket || null);
    setPostPaymentTicketWarning(ticketWarningData.ticketWarning);
    setPostPaymentTicketErrorCode(ticketWarningData.ticketErrorCode);
    setPostPaymentTicketErrorMessage(ticketWarningData.ticketErrorMessage);

    const paidSaleId = Number(paidSale?.sale_id || paidSale?.id || selectedSaleId || 0);

    if (ticket?.id) await loadPostPaymentPrintConfig(paidSaleId);
    else setPostPaymentPrintConfig(null);

    setPostPaymentOpen(true);

    return { paidSale, paidOrder, paidSettlement, ticket };
  };

  const openNetpayPaymentResult = async ({ result, sale }) => {
    const backendResponse = result?.backendResponse || null;
    const finalization = backendResponse?.finalization || null;
    const transaction = result?.transaction || backendResponse?.data || null;
    const ticket = finalization?.ticket || null;

    const paidSale = {
      ...(sale || {}),
      id: Number(finalization?.sale_id || sale?.id || sale?.sale_id || selectedSaleId || 0),
      sale_id: Number(finalization?.sale_id || sale?.sale_id || sale?.id || selectedSaleId || 0),
      status: finalization?.sale_status || sale?.status || "paid",
    };

    setSettlement(null);
    setPostPaymentSale(paidSale);
    setPostPaymentOrder(null);
    setPostPaymentTicket(ticket);
    setPostPaymentTicketWarning(Boolean(finalization?.ticket_warning));
    setPostPaymentTicketErrorCode(finalization?.ticket_error_code || null);
    setPostPaymentTicketErrorMessage(finalization?.ticket_error_message || null);

    const paidSaleId = Number(paidSale?.sale_id || paidSale?.id || selectedSaleId || 0);

    if (ticket?.id) await loadPostPaymentPrintConfig(paidSaleId);
    else setPostPaymentPrintConfig(null);

    setPostPaymentOpen(true);

    return {
      paidSale,
      transaction,
      finalization,
      ticket,
    };
  };

  const closePostPayment = () => {
    setPostPaymentOpen(false);
  };

  return {
    settlement,
    postPaymentOpen,
    postPaymentTicket,
    postPaymentTicketWarning,
    postPaymentTicketErrorCode,
    postPaymentTicketErrorMessage,
    postPaymentPrintConfig,
    postPaymentSale,
    postPaymentOrder,
    ticketBusy,

    loadPostPaymentPrintConfig,
    handleViewTicket,
    handlePrintTicket,
    handleThermalPrintTicket,
    handleDownloadTicket,
    handleSendTicketWhatsapp,
    openNormalPaymentResult,
    openNetpayPaymentResult,
    closePostPayment,
  };
}