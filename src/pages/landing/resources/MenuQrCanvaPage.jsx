// src/pages/landing/resources/MenuQrCanvaPage.jsx
import React from "react";

import ResourceArticleLayout from "./ResourceArticleLayout";
import SEO from "../../../components/seo/SEO";

const CANVA_FAQS = [
  {
    question: "¿Puedo hacer un menú QR gratis con Canva?",
    answer: "Sí. Puedes diseñar el menú y generar un código QR que apunte al archivo o a una página pública. El límite no es el precio, es la actualización: cada cambio de precio obliga a volver a exportar y, si el QR apunta a una imagen, el comensal puede seguir viendo la versión anterior.",
  },
  {
    question: "¿Cuál es la diferencia entre un menú QR de Canva y uno de Clic Menu?",
    answer: "El de Canva es una imagen. El de Clic Menu es una base de datos: los productos, precios e imágenes se editan desde el panel y el QR muestra el cambio al instante. Además, ese mismo menú alimenta la caja, la cocina y el inventario, cosa que una imagen no puede hacer.",
  },
  {
    question: "¿Necesito comprar equipo especial para usar el menú QR?",
    answer: "No. Funciona desde computadora, tablet o celular. Si tu operación requiere imprimir tickets, se conecta con impresoras térmicas compatibles desde Windows o Android, por USB o por red.",
  },
  {
    question: "¿Funciona para un restaurante pequeño?",
    answer: "Sí. El plan Digital está pensado justo para eso: una sucursal, menú QR, ventas en salón, mesas y zonas, tickets y cajas. Se puede empezar ahí y crecer a Gestión o Total sin cambiar de sistema.",
  },
  {
    question: "¿Puedo probarlo antes de pagar?",
    answer: "Sí, hay una prueba de 7 días sin costo. Lo recomendable es cargar el menú real y probarlo en el servicio, no con datos de ejemplo.",
  },
  {
    question: "¿El menú QR permite que el comensal pida desde su celular?",
    answer: "La toma de pedidos directa desde el QR es parte del plan Total. En los planes Digital y Gestión el comensal consulta el menú desde su celular y el pedido se captura por el mesero o en la caja.",
  },
];

/*
 * Metadatos SEO originales de la guía.
 * Posteriormente serán reutilizados por el prerenderizador.
 */
export const MENU_QR_CANVA_SEO = {
  title: "Menú QR con Canva: hasta dónde alcanza | Clic Menu",

  description:
    "Qué resuelve Canva para el menú de tu restaurante, qué no, y en qué momento conviene un sistema con precios actualizables, inventario y caja.",

  keywords:
    "menú qr canva, crear menú digital con canva, menú qr restaurante, menú digital restaurante, clic menu",

  url: "https://clicmenu.com.mx/recursos/menu-qr-con-canva",

  robots: "index, follow",
  ogType: "article",

  ogTitle:
    "Menú QR con Canva: hasta dónde alcanza y cuándo ya no",

  ogDescription:
    "Canva hace un menú bonito. Lo que no hace es mantenerlo al día ni cobrarlo. Aquí está la línea donde conviene cambiar de herramienta.",

  structuredData: {
    "@context": "https://schema.org",
    "@graph": [
      {
        "@type": "Article",
        headline: "Menú QR con Canva: hasta dónde alcanza y cuándo ya no",
        description:
          "Qué resuelve Canva para el menú de un restaurante, qué no, y en qué momento conviene un sistema con precios actualizables, inventario y caja.",
        inLanguage: "es-MX",
        datePublished: "2026-10-17",
        dateModified: "2026-10-17",

        author: {
          "@type": "Organization",
          name: "Clic Menu",
        },

        publisher: {
          "@type": "Organization",
          name: "Tecnologías Administrativas ELAD",
          url: "https://clicmenu.com.mx/",
        },

        mainEntityOfPage: {
          "@type": "WebPage",
          "@id": "https://clicmenu.com.mx/recursos/menu-qr-con-canva",
        },
      },
      {
        "@type": "SoftwareApplication",
        name: "Clic Menu",
        applicationCategory: "BusinessApplication",
        operatingSystem: "Web, Windows, Android",
        url: "https://clicmenu.com.mx/",

        description:
          "Plataforma para restaurantes que integra menú digital QR, punto de venta, pedidos, caja, inventarios y reportes.",

        offers: [
          {
            "@type": "Offer",
            name: "Digital",
            price: "290",
            priceCurrency: "MXN",
            url: "https://clicmenu.com.mx/planes",
          },
          {
            "@type": "Offer",
            name: "Gestión",
            price: "590",
            priceCurrency: "MXN",
            url: "https://clicmenu.com.mx/planes",
          },
          {
            "@type": "Offer",
            name: "Total",
            price: "950",
            priceCurrency: "MXN",
            url: "https://clicmenu.com.mx/planes",
          },
        ],
      },
      {
        "@type": "FAQPage",
        mainEntity: CANVA_FAQS.map((item) => ({
          "@type": "Question",
          name: item.question,
          acceptedAnswer: {
            "@type": "Answer",
            text: item.answer,
          },
        })),
      },
    ],
  },
};

export default function MenuQrCanvaPage({ skipSeo = false }) {
  return (
    <>
      {!skipSeo && (
        <SEO
          replaceDefaultSeo
          title={MENU_QR_CANVA_SEO.title}
          description={MENU_QR_CANVA_SEO.description}
          keywords={MENU_QR_CANVA_SEO.keywords}
          url={MENU_QR_CANVA_SEO.url}
          robots={MENU_QR_CANVA_SEO.robots}
          ogType={MENU_QR_CANVA_SEO.ogType}
          ogTitle={MENU_QR_CANVA_SEO.ogTitle}
          ogDescription={MENU_QR_CANVA_SEO.ogDescription}
          structuredData={MENU_QR_CANVA_SEO.structuredData}
        />
      )}

      <ResourceArticleLayout
        label="Menú digital"
        title="Menú QR con Canva: hasta dónde alcanza y cuándo ya no"
        description="Canva resuelve el diseño del menú en una tarde y sin costo. Lo que no resuelve es lo que pasa al día siguiente, cuando sube el precio de la carne y el QR sigue mostrando el de la semana pasada."
        author="Clic Menu · Tecnologías Administrativas ELAD"
        updated="octubre de 2026"
      >
        <p>
          Si llegaste aquí buscando cómo hacer un menú QR, la respuesta corta es:
          puedes hacerlo hoy mismo con Canva. Es gratis, se ve bien y no necesitas
          instalar nada. La pregunta que casi nadie se hace antes de empezar es
          distinta: <strong>¿qué va a pasar cuando el menú tenga que cambiar?</strong>
        </p>

        <p>
          Porque un menú de restaurante no es un cartel. Cambia cuando se acaba un
          platillo, cuando sube un insumo, cuando hay precio de temporada, cuando
          abres la segunda sucursal y los precios ya no son los mismos. Ahí es
          donde la herramienta de diseño y el sistema de operación se separan.
        </p>

        <div className="cm-resource-highlight">
          <strong>La diferencia en una línea:</strong> con Canva diseñas{" "}
          <em>una imagen</em> del menú. Con un sistema, el menú es{" "}
          <em>un dato</em> que se actualiza y que además alimenta la caja, la cocina
          y el inventario.
        </div>

        <h2>Lo que Canva hace bien (y conviene aprovechar)</h2>

        <p>
          Nada de lo que sigue es una crítica a Canva: es la herramienta correcta
          para la mitad del trabajo.
        </p>

        <div className="cm-resource-grid">
          <div className="cm-resource-card cm-resource-card-positive">
            <h3>Canva sirve para</h3>

            <ul>
              <li>Diseñar la carta con tu identidad: tipografía, colores, fotos.</li>
              <li>Armar la versión impresa que va en la mesa.</li>
              <li>Probar cómo se ve el menú antes de invertir en un sistema.</li>
              <li>Hacer piezas de temporada: el menú de fin de año, el de verano.</li>
            </ul>
          </div>

          <div className="cm-resource-card cm-resource-card-negative">
            <h3>Canva no hace</h3>

            <ul>
              <li>Actualizar el precio sin volver a exportar y volver a subir el archivo.</li>
              <li>Apagar un platillo cuando se agota, para que nadie lo pida.</li>
              <li>Que el pedido llegue a cocina o a la caja.</li>
              <li>Descontar del inventario lo que se vendió.</li>
              <li>Manejar precios distintos por sucursal o por canal.</li>
            </ul>
          </div>
        </div>

        <h2>Las cinco señales de que ya te quedó chico</h2>

        <p>
          No es cuestión de tamaño del restaurante, sino de cuántas veces al día
          el menú deja de ser cierto.
        </p>

        <ol className="cm-resource-signals">
          <li>
            <b>Cambias precios más de una vez al mes.</b>
            Cada cambio es exportar, subir y volver a imprimir. Si el QR apunta
            a una imagen, el comensal que ya la tenía abierta sigue viendo el
            precio viejo.
          </li>

          <li>
            <b>Se acaban platillos durante el servicio.</b>
            Con una imagen fija, el mesero es el único que sabe qué ya no hay.
            Un menú vivo lo apaga para todos al mismo tiempo.
          </li>

          <li>
            <b>El pedido se toma dos veces.</b>
            El comensal lee, el mesero anota, la caja captura. Cada paso extra
            es una fuente de error y de tiempo muerto.
          </li>

          <li>
            <b>No sabes cuánto te cuesta un platillo.</b>
            Sin recetas y sin inventario, el precio del menú se decide a ojo.
            Es el gasto que más se esconde en un restaurante.
          </li>

          <li>
            <b>Abriste la segunda sucursal.</b>
            Ahí se acaba el archivo único: cada sucursal necesita su menú, su
            almacén y su caja, y alguien tiene que poder verlas juntas.
          </li>
        </ol>

        <h2>Qué cambia cuando el menú pasa a un sistema</h2>

        <p>
          En Clic Menu el menú deja de ser un archivo y se vuelve la base de la
          operación. Esto es lo que hace el sistema, tal como está publicado en
          la página de planes:
        </p>

        <ul>
          <li>
            <strong>Menú digital QR</strong> con productos, categorías, precios e imágenes
            que se administran desde el panel: cambias el precio y el QR ya muestra
            el nuevo.
          </li>

          <li>
            <strong>Punto de venta</strong> con cajas, mesas y emisión de tickets.
          </li>

          <li>
            <strong>Pedidos y comandas</strong>, con la orden visible en cocina
            en modo pantalla.
          </li>

          <li>
            <strong>Inventarios, ingredientes y recetas</strong> para conocer el costo
            real de cada platillo (a partir del plan Gestión).
          </li>

          <li>
            <strong>Reportes de ventas</strong> para ver qué se vende y qué no.
          </li>

          <li>
            <strong>Impresión térmica</strong> desde Windows o Android, por USB
            o por red.
          </li>

          <li>
            <strong>Sucursales</strong> con configuración por sucursal y administración
            centralizada (plan Total).
          </li>
        </ul>

        <h2>Cuánto cuesta, sin letras chiquitas</h2>

        <p>Estos son los precios publicados, en pesos mexicanos:</p>

        <div className="cm-resource-table-wrap">
          <table className="cm-resource-table">
            <thead>
              <tr>
                <th scope="col">Plan</th>
                <th scope="col">Para quién</th>
                <th scope="col">Precio</th>
              </tr>
            </thead>

            <tbody>
              <tr>
                <td><strong>Digital</strong></td>
                <td>Cafeterías, food trucks o locales de una sola sucursal</td>
                <td className="cm-resource-price">$290 MXN / mes</td>
              </tr>

              <tr>
                <td><strong>Gestión</strong></td>
                <td>Restaurantes que producen sus platillos y controlan almacén</td>
                <td className="cm-resource-price">$590 MXN / mes</td>
              </tr>

              <tr>
                <td><strong>Total</strong></td>
                <td>Cadenas o negocios en expansión, con sucursales</td>
                <td className="cm-resource-price">$950 MXN / mes</td>
              </tr>
            </tbody>
          </table>
        </div>

        <p className="cm-resource-table-note">
          Pago mensual. También hay pago semestral (pagas 5 meses y recibes 6)
          y anual (pagas 10 y recibes 12). Precios en pesos mexicanos.{" "}
          <a href="/planes">Ver el detalle de cada plan</a>.
        </p>

        <p>
          Y hay una prueba de 7 días sin costo, que es la forma sensata de decidir:
          cargas tu menú real, escaneas el QR y ves si el sistema aguanta tu
          operación antes de pagar.
        </p>

        <h2>Lo que Canva sigue siendo mejor haciendo</h2>

        <p>
          Una cosa que conviene decir con claridad: el diseño fino de la carta
          impresa y las piezas de marketing siguen siendo territorio de Canva.
          Muchos restaurantes usan las dos cosas a la vez —Canva para la carta
          de temporada que se imprime, el sistema para el menú del día a día—
          y eso está bien. La sustitución sólo tiene sentido cuando el menú
          tiene que estar vivo.
        </p>

        <h2>Preguntas frecuentes</h2>

        {CANVA_FAQS.map((item, index) => (
          <details
            key={item.question}
            className="cm-resource-faq"
            open={index === 0}
          >
            <summary>{item.question}</summary>
            <p>{item.answer}</p>
          </details>
        ))}

        <div className="cm-resource-cta">
          <h2>Si el menú ya cambia más rápido de lo que puedes rediseñarlo</h2>

          <p>
            Carga tu carta real, escanea tu QR y compruébalo en 7 días.
            Sin tarjeta y sin instalar nada.
          </p>

          <div className="cm-resource-buttons">
            <a
              className="cm-resource-button cm-resource-button-primary"
              href="/auth/register"
            >
              Probar gratis 7 días
            </a>

            <a
              className="cm-resource-button cm-resource-button-secondary"
              href="/contacto"
            >
              Hablar con el equipo
            </a>
          </div>
        </div>
      </ResourceArticleLayout>
    </>
  );
}