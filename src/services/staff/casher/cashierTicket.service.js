// src/services/staff/casher/cashierTicket.service.js
import staffApi from "../../staffApi";

const NO_CACHE_HEADERS = {
  "Cache-Control": "no-cache, no-store, must-revalidate",
  Pragma: "no-cache",
  Expires: "0",
};

const DEFAULT_VIEW_FEATURES =
  "popup=yes,width=1100,height=760,left=120,top=60,resizable=yes,scrollbars=yes";
const DEFAULT_PRINT_FEATURES =
  "popup=yes,width=420,height=640,left=160,top=80,resizable=yes,scrollbars=yes";

export async function fetchCashierTicketBySale(saleId) {
  const res = await staffApi.get(`/staff/cashier/sales/${saleId}/ticket`, {
    params: { _t: Date.now() },
    headers: NO_CACHE_HEADERS,
  });

  return res?.data;
}

export async function fetchCashierTicketById(ticketId) {
  const res = await staffApi.get(`/staff/cashier/tickets/${ticketId}`, {
    params: { _t: Date.now() },
    headers: NO_CACHE_HEADERS,
  });

  return res?.data;
}

export async function fetchCashierTicketHtml(ticketId) {
  const res = await staffApi.get(`/staff/cashier/tickets/${ticketId}/html`, {
    params: { _t: Date.now() },
    headers: NO_CACHE_HEADERS,
    responseType: "blob",
  });

  const blob = res?.data;
  if (!blob) return "";

  return await blob.text();
}

export async function downloadCashierTicketPdf(ticketId) {
  const res = await staffApi.get(`/staff/cashier/tickets/${ticketId}/download`, {
    params: { _t: Date.now() },
    headers: NO_CACHE_HEADERS,
    responseType: "blob",
  });

  const blob = res?.data;
  const contentDisposition =
    res?.headers?.["content-disposition"] ||
    res?.headers?.["Content-Disposition"] ||
    "";

  let filename = `ticket-${ticketId}.pdf`;
  const match = /filename="?([^"]+)"?/i.exec(contentDisposition);
  if (match?.[1]) {
    filename = match[1];
  }

  return {
    blob,
    filename,
  };
}

function buildLoadingHtml(title = "Cargando ticket…") {
  return `<!doctype html>
<html lang="es">
  <head>
    <meta charset="utf-8" />
    <title>${title}</title>
    <meta name="viewport" content="width=device-width, initial-scale=1" />
    <style>
      html, body {
        margin: 0;
        padding: 0;
        background: #ffffff;
        color: #1f2937;
        font-family: Arial, sans-serif;
      }
      .wrap {
        min-height: 100vh;
        display: grid;
        place-items: center;
        padding: 24px;
        box-sizing: border-box;
      }
      .box {
        text-align: center;
      }
      .spinner {
        width: 34px;
        height: 34px;
        border: 3px solid #e5e7eb;
        border-top-color: #f59e0b;
        border-radius: 50%;
        animation: spin 0.8s linear infinite;
        margin: 0 auto 14px;
      }
      .txt {
        font-size: 14px;
        color: #6b7280;
        font-weight: 600;
      }
      @keyframes spin {
        to { transform: rotate(360deg); }
      }
    </style>
  </head>
  <body>
    <div class="wrap">
      <div class="box">
        <div class="spinner"></div>
        <div class="txt">${title}</div>
      </div>
    </div>
  </body>
</html>`;
}

function createHtmlBlobUrl(html) {
  return URL.createObjectURL(
    new Blob([html], { type: "text/html;charset=utf-8" })
  );
}

function scheduleUrlRevoke(url, delay = 120_000) {
  setTimeout(() => {
    try {
      URL.revokeObjectURL(url);
    } catch (error) {
      console.error(error);
    }
  }, delay);
}

function injectPrintScript(html) {
  const printScript = `
<script>
(function () {
  function triggerPrint() {
    setTimeout(function () {
      try {
        window.focus();
        window.print();
      } catch (error) {
        console.error(error);
      }
    }, 250);
  }

  if (document.readyState === "complete") {
    triggerPrint();
  } else {
    window.addEventListener("load", triggerPrint, { once: true });
  }

  window.addEventListener("afterprint", function () {
    setTimeout(function () {
      try {
        window.close();
      } catch (error) {
        console.error(error);
      }
    }, 150);
  });
})();
</script>`;

  if (!html) return html;

  if (html.includes("</body>")) {
    return html.replace("</body>", `${printScript}</body>`);
  }

  return `${html}${printScript}`;
}

function ensurePopupWindow(win, fallbackMessage) {
  if (!win) {
    throw new Error(fallbackMessage);
  }

  return win;
}

export function openCashierTicketWindow(
  title = "Cargando ticket…",
  features = DEFAULT_VIEW_FEATURES
) {
  const placeholderUrl = createHtmlBlobUrl(buildLoadingHtml(title));
  const win = window.open(placeholderUrl, "_blank", features);

  scheduleUrlRevoke(placeholderUrl, 30_000);

  return win;
}

export async function openCashierTicketHtmlInNewTab(
  ticketId,
  existingWindow = null
) {
  const html = await fetchCashierTicketHtml(ticketId);

  if (!html) {
    throw new Error("No se pudo obtener el HTML del ticket.");
  }

  const ticketUrl = createHtmlBlobUrl(html);
  scheduleUrlRevoke(ticketUrl, 180_000);

  if (existingWindow && !existingWindow.closed) {
    try {
      existingWindow.location.replace(ticketUrl);
      existingWindow.focus();
      return existingWindow;
    } catch (error) {
      console.error(error);
    }
  }

  const win = window.open(ticketUrl, "_blank", DEFAULT_VIEW_FEATURES);
  ensurePopupWindow(win, "El navegador bloqueó la apertura de la vista del ticket.");

  try {
    win.focus();
  } catch (error) {
    console.error(error);
  }

  return win;
}

export async function printCashierTicketFromHtml(
  ticketId,
  existingWindow = null
) {
  const html = await fetchCashierTicketHtml(ticketId);

  if (!html) {
    throw new Error("No se pudo obtener el HTML del ticket para imprimir.");
  }

  const printableHtml = injectPrintScript(html);
  const printableUrl = createHtmlBlobUrl(printableHtml);
  scheduleUrlRevoke(printableUrl, 180_000);

  if (existingWindow && !existingWindow.closed) {
    try {
      existingWindow.location.replace(printableUrl);
      existingWindow.focus();
      return true;
    } catch (error) {
      console.error(error);
    }
  }

  const printWindow = window.open(
    printableUrl,
    "_blank",
    DEFAULT_PRINT_FEATURES
  );

  ensurePopupWindow(printWindow, "El navegador bloqueó la ventana de impresión.");

  try {
    printWindow.focus();
  } catch (error) {
    console.error(error);
  }

  return true;
}

export async function saveCashierTicketPdf(ticketId) {
  const { blob, filename } = await downloadCashierTicketPdf(ticketId);

  if (!blob) {
    throw new Error("No se pudo descargar el PDF del ticket.");
  }

  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = filename;
  a.click();

  setTimeout(() => {
    URL.revokeObjectURL(url);
  }, 10_000);

  return true;
}