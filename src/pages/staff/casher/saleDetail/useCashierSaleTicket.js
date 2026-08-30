// src/pages/staff/casher/saleDetail/useCashierSaleTicket.js

import {
  fetchCashierTicketById,
  openCashierTicketHtmlInNewTab,
  printCashierTicketFromHtml,
  saveCashierTicketPdf,
  openCashierTicketWindow,
  sendCashierSaleTicketWhatsapp,
  fetchCashierSaleTicketPrintConfig,
  fetchCashierSaleTicketPrintPayload,
  sendCashierThermalPrintPayload,
} from "../../../../services/staff/casher/cashierTicket.service";

import {
  executeCashierNetpayVoucherReprint,
  getCashierNetpayVoucherReprintError,
} from "../../../../services/staff/casher/cashierNetpayVoucherReprint.service";

export default function useCashierSaleTicket({
  selectedSaleId,
  postPaymentSale,
  postPaymentTicket,
  setPostPaymentTicket,
  setPostPaymentPrintConfig,
  ticketBusy,
  setTicketBusy,
  showAlert,
  pickErr,
}) {
  const setTicketBusyKey = (key, value) => {
    setTicketBusy((prev) => ({ ...prev, [key]: value }));
  };

  const postPaymentSaleId = Number(
    postPaymentSale?.sale_id ||
    postPaymentSale?.id ||
    selectedSaleId ||
    0
  );

  const postPaymentNetpayTransactionId = Number(
    postPaymentSale?.netpay_transaction_id || 0
  );

  const netpayVoucherAvailable =
    Number.isInteger(postPaymentSaleId) &&
    postPaymentSaleId > 0 &&
    Number.isInteger(postPaymentNetpayTransactionId) &&
    postPaymentNetpayTransactionId > 0;

  const loadPostPaymentPrintConfig = async (targetSaleId) => {
    if (!targetSaleId) {
      setPostPaymentPrintConfig(null);
      return null;
    }

    try {
      const res = await fetchCashierSaleTicketPrintConfig(targetSaleId);
      const config = res?.data || null;
      setPostPaymentPrintConfig(config);
      return config;
    } catch {
      setPostPaymentPrintConfig(null);
      return null;
    }
  };

  const ensureLatestTicket = async () => {
    const currentTicketId = Number(postPaymentTicket?.id || 0);

    if (!currentTicketId) {
      throw new Error("No hay ticket disponible para consultar.");
    }

    const res = await fetchCashierTicketById(currentTicketId);
    return res?.data || postPaymentTicket;
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
    } catch (e) {
      try {
        if (!ticketWindow.closed) ticketWindow.close();
      } catch (error) {
        console.error(error);
      }

      showAlert({
        severity: "error",
        message: pickErr(e, "No se pudo abrir la vista del ticket."),
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
    } catch (e) {
      try {
        if (!printWindow.closed) printWindow.close();
      } catch (error) {
        console.error(error);
      }

      showAlert({
        severity: "error",
        message: pickErr(e, "No se pudo imprimir el ticket."),
      });
    } finally {
      setTicketBusyKey("print", false);
    }
  };

  const handleThermalPrintTicket = async () => {
    const currentSaleId = Number(
      postPaymentSale?.sale_id ||
      postPaymentSale?.id ||
      selectedSaleId ||
      0
    );

    if (!currentSaleId) {
      showAlert({
        severity: "warning",
        message: "No hay una cuenta válida para imprimir.",
      });
      return;
    }

    try {
      setTicketBusyKey("thermalPrint", true);

      const configRes = await fetchCashierSaleTicketPrintConfig(currentSaleId);
      const config = configRes?.data || null;

      if (!config?.enabled || !config?.show_print_button) {
        showAlert({
          severity: "warning",
          message:
            config?.message ||
            "La impresión térmica no está habilitada para esta sucursal.",
        });
        return;
      }

      setPostPaymentPrintConfig(config);

      const payloadRes = await fetchCashierSaleTicketPrintPayload(currentSaleId);
      const payload = payloadRes?.payload || null;

      if (!payload) {
        throw new Error("No se recibió el payload de impresión térmica.");
      }

      await sendCashierThermalPrintPayload(payload, config);

      showAlert({
        severity: "success",
        message: "Ticket enviado a impresión térmica correctamente.",
      });
    } catch (e) {
      showAlert({
        severity: "error",
        message: pickErr(
          e,
          "No se pudo enviar el ticket a la aplicación de impresión térmica."
        ),
      });
    } finally {
      setTicketBusyKey("thermalPrint", false);
    }
  };

  const handleReprintNetpayVoucher = async () => {
    const currentSaleId = Number(
      postPaymentSale?.sale_id ||
      postPaymentSale?.id ||
      selectedSaleId ||
      0
    );

    const netpayTransactionId = Number(
      postPaymentSale?.netpay_transaction_id || 0
    );

    if (
      !Number.isInteger(currentSaleId) ||
      currentSaleId <= 0 ||
      !Number.isInteger(netpayTransactionId) ||
      netpayTransactionId <= 0
    ) {
      showAlert({
        severity: "warning",
        title: "Voucher NetPay",
        message: "Esta venta no tiene una operación NetPay disponible para reimprimir su voucher.",
      });
      return;
    }

    try {
      setTicketBusyKey("voucherReprint", true);

      const result = await executeCashierNetpayVoucherReprint({
        saleId: currentSaleId,
        netpayTransactionId,
      });

      if (result?.reprintSuccess === true || result?.outcome === "reprinted") {
        showAlert({
          severity: "success",
          title: "Voucher NetPay",
          message:
            result?.backendResponse?.message ||
            "El voucher NetPay fue reimpreso correctamente.",
        });
        return;
      }

      const outcomeMessages = {
        communication_error:
          "No fue posible confirmar la reimpresión del voucher por un problema de comunicación.",
        not_sent:
          "La solicitud de reimpresión no llegó a ejecutarse en Smart PinPad.",
        invalid_response:
          "NetPay devolvió una respuesta que no permite confirmar correctamente la reimpresión del voucher.",
        voucher_in_progress:
          "La reimpresión del voucher NetPay continúa en proceso.",
        not_reprinted:
          "NetPay procesó la solicitud, pero no confirmó una reimpresión exitosa del voucher.",
      };

      showAlert({
        severity: "warning",
        title: "Voucher NetPay",
        message:
          result?.backendResponse?.message ||
          outcomeMessages[result?.outcome] ||
          "La reimpresión del voucher NetPay no pudo confirmarse.",
      });
    } catch (e) {
      const netpayError = getCashierNetpayVoucherReprintError(e);

      showAlert({
        severity: "error",
        title: "Voucher NetPay",
        message: netpayError.message,
      });
    } finally {
      setTicketBusyKey("voucherReprint", false);
    }
  };

  const handleDownloadTicket = async () => {
    try {
      setTicketBusyKey("download", true);
      const latestTicket = await ensureLatestTicket();
      setPostPaymentTicket(latestTicket);
      await saveCashierTicketPdf(latestTicket.id);
    } catch (e) {
      showAlert({
        severity: "error",
        message: pickErr(e, "No se pudo descargar el PDF del ticket."),
      });
    } finally {
      setTicketBusyKey("download", false);
    }
  };

  const handleSendTicketWhatsapp = async ({ phone, body, saveContact }) => {
    const targetSaleId = Number(
      postPaymentSale?.sale_id ||
      postPaymentSale?.id ||
      selectedSaleId ||
      0
    );

    try {
      setTicketBusyKey("whatsapp", true);

      await sendCashierSaleTicketWhatsapp(targetSaleId, {
        phone,
        body,
        save_contact: saveContact,
      });

      showAlert({
        severity: "success",
        message: "Ticket enviado correctamente por WhatsApp.",
      });
    } catch (e) {
      showAlert({
        severity: "error",
        message: pickErr(e, "No se pudo enviar el ticket por WhatsApp."),
      });
    } finally {
      setTicketBusyKey("whatsapp", false);
    }
  };

  return {
    ticketBusy,
    netpayVoucherAvailable,
    loadPostPaymentPrintConfig,
    handleViewTicket,
    handlePrintTicket,
    handleThermalPrintTicket,
    handleReprintNetpayVoucher,
    handleDownloadTicket,
    handleSendTicketWhatsapp,
  };
}