// src/pages/staff/casher/saleDetail/useCashierSaleCustomer.js

import {
  searchCashierCustomers,
  createCashierCustomer,
  saveCashierSaleContactData,
  removeCashierSaleContactData,
  attachCashierSaleCustomer,
  detachCashierSaleCustomer,
} from "../../../../services/staff/casher/cashierCustomer.service";

import { toArray } from "./cashierSaleDetail.utils";

export default function useCashierSaleCustomer({
  selectedSaleId,
  canManageCustomer,
  contactForm,
  setContactForm,
  searchCustomerForm,
  setSearchCustomerForm,
  customerSearchResults,
  setCustomerSearchResults,
  createCustomerForm,
  setCreateCustomerForm,
  customerSummary,
  setCustomerSummary,
  customerBusy,
  setCustomerBusy,
  searchingCustomers,
  setSearchingCustomers,
  syncCustomerFormsFromSummary,
  showAlert,
  pickErr,
  pickCode,
  pickData,
}) {
  const handleContactFormChange = (field, value) => {
    setContactForm((prev) => ({ ...prev, [field]: value }));
  };

  const handleSearchCustomerFormChange = (field, value) => {
    setSearchCustomerForm((prev) => ({ ...prev, [field]: value }));
  };

  const handleCreateCustomerFormChange = (field, value) => {
    setCreateCustomerForm((prev) => ({ ...prev, [field]: value }));
  };

  const handleSaveContact = async () => {
    if (!canManageCustomer) {
      showAlert({
        severity: "warning",
        message: "La cuenta debe pertenecer a tu caja para operar datos de cliente.",
      });
      return;
    }

    try {
      setCustomerBusy(true);

      const res = await saveCashierSaleContactData(selectedSaleId, {
        phone: contactForm.phone?.trim() || null,
        email: contactForm.email?.trim() || null,
      });

      setCustomerSummary(res?.data || null);
      syncCustomerFormsFromSummary(res?.data || null);

      showAlert({
        severity: "success",
        message: res?.message || "Contacto simple guardado correctamente.",
      });
    } catch (e) {
      showAlert({
        severity: "error",
        message: pickErr(e, "No se pudo guardar el contacto simple."),
      });
    } finally {
      setCustomerBusy(false);
    }
  };

  const handleRemoveContact = async () => {
    try {
      setCustomerBusy(true);
      const res = await removeCashierSaleContactData(selectedSaleId);

      setCustomerSummary(res?.data || null);
      syncCustomerFormsFromSummary(res?.data || null);

      showAlert({
        severity: "success",
        message: res?.message || "Contacto simple eliminado correctamente.",
      });
    } catch (e) {
      showAlert({
        severity: "error",
        message: pickErr(e, "No se pudo eliminar el contacto simple."),
      });
    } finally {
      setCustomerBusy(false);
    }
  };

  const handleSearchCustomers = async () => {
    const phone = searchCustomerForm?.phone?.trim() || "";
    const email = searchCustomerForm?.email?.trim() || "";

    if (!phone && !email) {
      showAlert({
        severity: "warning",
        message: "Debes escribir al menos teléfono o correo para buscar.",
      });
      return;
    }

    try {
      setSearchingCustomers(true);

      const res = await searchCashierCustomers({
        phone: phone || undefined,
        email: email || undefined,
      });

      const rows = toArray(res?.data);
      setCustomerSearchResults(rows);

      showAlert({
        severity: rows.length ? "success" : "info",
        message: rows.length
          ? "Búsqueda de clientes completada."
          : "No se encontraron clientes con esos datos.",
      });
    } catch (e) {
      showAlert({
        severity: "error",
        message: pickErr(e, "No se pudo buscar el cliente."),
      });
    } finally {
      setSearchingCustomers(false);
    }
  };

  const handleAttachCustomer = async (customerId) => {
    try {
      setCustomerBusy(true);

      const res = await attachCashierSaleCustomer(selectedSaleId, {
        customer_id: Number(customerId),
      });

      setCustomerSummary(res?.data || null);
      syncCustomerFormsFromSummary(res?.data || null);
      setCustomerSearchResults([]);

      showAlert({
        severity: "success",
        message: res?.message || "Cliente asociado correctamente a la cuenta.",
      });
    } catch (e) {
      showAlert({
        severity: "error",
        message: pickErr(e, "No se pudo asociar el cliente a la cuenta."),
      });
    } finally {
      setCustomerBusy(false);
    }
  };

  const handleDetachCustomer = async () => {
    try {
      setCustomerBusy(true);

      const res = await detachCashierSaleCustomer(selectedSaleId);

      setCustomerSummary(res?.data || null);
      syncCustomerFormsFromSummary(res?.data || null);

      showAlert({
        severity: "success",
        message: res?.message || "Cliente desvinculado correctamente.",
      });
    } catch (e) {
      showAlert({
        severity: "error",
        message: pickErr(e, "No se pudo desvincular el cliente."),
      });
    } finally {
      setCustomerBusy(false);
    }
  };

  const handleCreateAndAttachCustomer = async () => {
    try {
      setCustomerBusy(true);

      const createPayload = {
        name_alias: createCustomerForm?.name_alias?.trim() || null,
        phone: createCustomerForm?.phone?.trim() || null,
        email: createCustomerForm?.email?.trim() || null,
        razon_social: createCustomerForm?.razon_social?.trim() || null,
        rfc: createCustomerForm?.rfc?.trim() || null,
        regimen: createCustomerForm?.regimen || null,
        postal_code: createCustomerForm?.postal_code?.trim() || null,
      };

      const created = await createCashierCustomer(createPayload);
      const createdCustomerId = Number(created?.data?.id || 0);

      if (!createdCustomerId) {
        throw new Error("No se obtuvo el id del cliente creado.");
      }

      const attached = await attachCashierSaleCustomer(selectedSaleId, {
        customer_id: createdCustomerId,
      });

      setCustomerSummary(attached?.data || null);
      syncCustomerFormsFromSummary(attached?.data || null);
      setCustomerSearchResults([]);

      showAlert({
        severity: "success",
        message: "Cliente creado y asociado correctamente a la cuenta.",
      });
    } catch (e) {
      const code = pickCode(e);
      const data = pickData(e);

      if (code === "CUSTOMER_ALREADY_EXISTS" && Number(data?.customer_id || 0)) {
        try {
          const attached = await attachCashierSaleCustomer(selectedSaleId, {
            customer_id: Number(data.customer_id),
          });

          setCustomerSummary(attached?.data || null);
          syncCustomerFormsFromSummary(attached?.data || null);
          setCustomerSearchResults([]);

          showAlert({
            severity: "success",
            message: "El cliente ya existía y se asoció correctamente a la cuenta.",
          });

          return;
        } catch (attachError) {
          showAlert({
            severity: "error",
            message: pickErr(
              attachError,
              "El cliente ya existía, pero no se pudo asociar a la cuenta."
            ),
          });
          return;
        }
      }

      showAlert({
        severity: "error",
        message: pickErr(e, "No se pudo crear y asociar el cliente."),
      });
    } finally {
      setCustomerBusy(false);
    }
  };

  return {
    contactForm,
    searchCustomerForm,
    customerSearchResults,
    createCustomerForm,
    customerSummary,
    customerBusy,
    searchingCustomers,
    handleContactFormChange,
    handleSearchCustomerFormChange,
    handleCreateCustomerFormChange,
    handleSaveContact,
    handleRemoveContact,
    handleSearchCustomers,
    handleAttachCustomer,
    handleDetachCustomer,
    handleCreateAndAttachCustomer,
  };
}