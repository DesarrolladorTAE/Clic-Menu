import { useState } from "react";

import {
  fetchCashierPrebillPrintPayload,
  sendCashierPrebillWhatsapp,
} from "../../../../services/staff/casher/cashierPrebill.service";

import {
  sendCashierThermalPrintPayload,
} from "../../../../services/staff/casher/cashierTicket.service";

/*
 * Flujo operativo de PRECUENTA.
 *
 * Usa:
 * - cashierPrebill.service.js, para obtener impresión y enviar WhatsApp.
 * - cashierTicket.service.js, únicamente para reutilizar la infraestructura
 *   térmica existente de Windows, Android y PAX.
 *
 * Lo usa:
 * - CashierSaleDetailPage.jsx.
 */

export default function useCashierSalePrebill({
  selectedCheckId,
  taxOptionCode,
  canUsePrebill = false,
  operationBlocked = false,
  showAlert,
  pickErr,
}) {
  const [prebillOpen, setPrebillOpen] = useState(false);
  const [prebillPrinting, setPrebillPrinting] = useState(false);
  const [prebillWhatsappSending, setPrebillWhatsappSending] = useState(false);

  const prebillBusy = prebillPrinting || prebillWhatsappSending;

  const validateAvailable = () => {
    if (!canUsePrebill) {
      showAlert?.({
        severity: "warning",
        title: "PRECUENTA",
        message: "La PRECUENTA solo está disponible para cuentas de mesa pendientes de pago.",
      });
      return false;
    }

    if (!selectedCheckId) {
      showAlert?.({
        severity: "warning",
        title: "PRECUENTA",
        message: "No se encontró la cuenta que debe generar la PRECUENTA.",
      });
      return false;
    }

    if (operationBlocked) {
      showAlert?.({
        severity: "warning",
        title: "PRECUENTA",
        message: "La cuenta tiene una operación en proceso o pendiente de resolución. Finalízala antes de generar la PRECUENTA.",
      });
      return false;
    }

    return true;
  };

  const handleOpenPrebill = () => {
    if (!validateAvailable()) return;
    setPrebillOpen(true);
  };

  const handleClosePrebill = () => {
    if (prebillBusy) return;
    setPrebillOpen(false);
  };

  const handleThermalPrintPrebill = async () => {
    if (!validateAvailable() || prebillPrinting) return;

    try {
      setPrebillPrinting(true);

      const res = await fetchCashierPrebillPrintPayload(
        selectedCheckId,
        taxOptionCode
      );

      const payload = res?.data || null;

      if (!payload) throw new Error("No se recibió el payload de impresión de la PRECUENTA.");

      const printConfig = {
        enabled: true,
        show_print_button: true,
        transport: payload?.transport || null,
        app_type: payload?.meta?.app_type || null,
      };

      await sendCashierThermalPrintPayload(payload, printConfig);

      showAlert?.({
        severity: "success",
        title: "PRECUENTA",
        message: "PRECUENTA enviada a impresión térmica correctamente.",
      });
    } catch (e) {
      showAlert?.({
        severity: "error",
        title: "PRECUENTA",
        message: pickErr?.(
          e,
          "No se pudo imprimir la PRECUENTA."
        ) || "No se pudo imprimir la PRECUENTA.",
      });
    } finally {
      setPrebillPrinting(false);
    }
  };

  const handleSendPrebillWhatsapp = async ({
    phone,
    save_contact = false,
  } = {}) => {
    if (!validateAvailable() || prebillWhatsappSending) return false;

    const cleanPhone = String(phone || "").replace(/\D/g, "");

    if (cleanPhone.length < 10) {
      showAlert?.({
        severity: "warning",
        title: "PRECUENTA",
        message: "Ingresa un número de WhatsApp válido.",
      });
      return false;
    }

    try {
      setPrebillWhatsappSending(true);

      const res = await sendCashierPrebillWhatsapp(
        selectedCheckId,
        {
          phone,
          save_contact,
          tax_option_code: taxOptionCode || null,
          body: null,
        }
      );

      showAlert?.({
        severity: "success",
        title: "PRECUENTA",
        message:
          res?.message ||
          "PRECUENTA enviada correctamente por WhatsApp.",
      });

      return true;
    } catch (e) {
      showAlert?.({
        severity: "error",
        title: "PRECUENTA",
        message: pickErr?.(
          e,
          "No se pudo enviar la PRECUENTA por WhatsApp."
        ) || "No se pudo enviar la PRECUENTA por WhatsApp.",
      });

      return false;
    } finally {
      setPrebillWhatsappSending(false);
    }
  };

  return {
    prebillOpen,
    prebillBusy,
    prebillPrinting,
    prebillWhatsappSending,
    handleOpenPrebill,
    handleClosePrebill,
    handleThermalPrintPrebill,
    handleSendPrebillWhatsapp,
  };
}