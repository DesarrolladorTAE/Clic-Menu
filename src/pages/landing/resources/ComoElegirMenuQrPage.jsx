// src/pages/landing/resources/ComoElegirMenuQrPage.jsx
import React from "react";

import ResourceArticleLayout from "./ResourceArticleLayout";
import SEO from "../../../components/seo/SEO";

const COMO_ELEGIR_FAQS = [
  {
    question: "¿Un menú QR necesita que el cliente descargue una app?",
    answer: "No. Se abre en el navegador del celular al escanear el código. Si un proveedor pide instalar algo para ver la carta, está agregando un paso que el comensal no va a dar.",
  },
  {
    question: "¿El menú QR puede cobrar comisión por venta?",
    answer: "Depende del proveedor: algunos cobran un porcentaje de la cuenta y otros una renta fija. Es la pregunta que más cambia el costo a un año, y conviene pedir las dos cifras por escrito.",
  },
  {
    question: "¿Puedo cambiar precios y fotos yo mismo?",
    answer: "Es lo que debe permitir un menú digital. Si cada cambio pasa por el proveedor, el menú vuelve a ser un archivo estático con otro nombre.",
  },
  {
    question: "¿Funciona con la impresora térmica que ya tengo?",
    answer: "Hay que verificarlo con el modelo concreto. Clic Menú imprime desde Windows o Android, por USB o por red; la compatibilidad depende de la impresora y del sistema donde esté instalada.",
  },
  {
    question: "¿Cuánto tarda en quedar listo un menú QR?",
    answer: "Depende de cuántos platillos tengas y de si las fotos ya existen. Cargar un menú completo con categorías, extras y variantes es trabajo de una tarde; el código QR se imprime en minutos.",
  },
];

/*
 * Información SEO original.
 */
export const COMO_ELEGIR_MENU_QR_SEO = {
  title: "Cómo elegir un menú QR para tu restaurante | Clic Menu",

  description:
    "Siete preguntas que conviene hacer antes de contratar un menú QR: precios que se actualizan, pedidos desde la mesa, comandas, impresión y comisiones.",

  keywords:
    "cómo elegir menú qr, mejor menú qr restaurante, comparar menú digital, sistema menú qr, menú qr méxico",

  url: "https://clicmenu.com.mx/recursos/como-elegir-menu-qr",

  robots: "index, follow",
  ogType: "article",

  ogTitle:
    "Cómo elegir un menú QR para tu restaurante",

  ogDescription:
    "Lo que separa un menú QR que sirve de uno que estorba no se ve en la pantalla del comensal: se ve el día que cambias un precio.",

  structuredData: {
    "@context": "https://schema.org",
    "@graph": [
      {
        "@type": "Article",
        headline: "Cómo elegir un menú QR para tu restaurante",

        description:
          "Siete preguntas que conviene hacer antes de contratar un menú QR: precios que se actualizan, pedidos desde la mesa, comandas, impresión y comisiones.",

        inLanguage: "es-MX",
        datePublished: "2026-10-19",
        dateModified: "2026-10-19",

        mainEntityOfPage:
          "https://clicmenu.com.mx/recursos/como-elegir-menu-qr",

        author: {
          "@type": "Organization",
          name: "Tecnologías Administrativas ELAD",
        },

        publisher: {
          "@type": "Organization",
          name: "Tecnologías Administrativas ELAD",
          url: "https://tecnologiasadministrativas.com/",
        },
      },
      {
        "@type": "FAQPage",
        mainEntity: COMO_ELEGIR_FAQS.map((item) => ({
          "@type": "Question",
          name: item.question,
          acceptedAnswer: {
            "@type": "Answer",
            text: item.answer,
          },
        })),
      },
      {
        "@type": "SoftwareApplication",
        name: "Clic Menu",
        applicationCategory: "BusinessApplication",
        operatingSystem: "Web",

        description:
          "Plataforma para restaurantes que reúne menú digital QR, punto de venta, inventarios y reportes en vivo.",

        url: "https://clicmenu.com.mx/",

        provider: {
          "@type": "Organization",
          name: "Tecnologías Administrativas ELAD",
          url: "https://tecnologiasadministrativas.com/",
        },
      },
    ],
  },
};

export default function ComoElegirMenuQrPage({ skipSeo = false }) {
  return (
    <>
      {!skipSeo && (
        <SEO
          replaceDefaultSeo
          title={COMO_ELEGIR_MENU_QR_SEO.title}
          description={COMO_ELEGIR_MENU_QR_SEO.description}
          keywords={COMO_ELEGIR_MENU_QR_SEO.keywords}
          url={COMO_ELEGIR_MENU_QR_SEO.url}
          robots={COMO_ELEGIR_MENU_QR_SEO.robots}
          ogType={COMO_ELEGIR_MENU_QR_SEO.ogType}
          ogTitle={COMO_ELEGIR_MENU_QR_SEO.ogTitle}
          ogDescription={COMO_ELEGIR_MENU_QR_SEO.ogDescription}
          structuredData={COMO_ELEGIR_MENU_QR_SEO.structuredData}
        />
      )}

      <ResourceArticleLayout
        label="Guía práctica"
        title="Cómo elegir un menú QR para tu restaurante"
        description="Casi todos los menús QR se ven iguales en la pantalla del comensal. La diferencia aparece el día que cambias un precio, se cruza una mesa o se cae el internet."
        author="Tecnologías Administrativas ELAD"
        updated="octubre de 2026"
        readingTime="6 minutos"
      >
        <p>
          Un menú QR dejó de ser una novedad: hoy es la carta que el comensal
          abre en su celular. Por eso la pregunta ya no es si conviene tener uno,
          sino cuál. Y ahí es donde se comete el error caro: se elige mirando la
          pantalla del cliente, que es la parte que todos resuelven bien, y se
          deja sin revisar la parte que se usa todos los días, que es la de adentro.
        </p>

        <p>
          Esta guía no compara logotipos. Ordena las siete preguntas que conviene
          hacer antes de firmar, con la razón de cada una, y explica en qué momento
          un menú QR deja de alcanzar y hace falta algo más.
        </p>

        <h2>Lo que un menú QR tiene que resolver</h2>

        <p>
          Un menú QR es una página web que se abre al escanear un código. Eso es
          todo lo que hay de tecnología en la superficie. Lo que cambia de un
          servicio a otro es qué pasa detrás: si el menú se puede editar sin
          volver a diseñar, si el pedido del comensal llega a algún lado, y si
          lo que se cobra coincide con lo que se preparó.
        </p>

        <p>
          Hay tres cosas que un menú QR debe hacer bien, y no son negociables:
        </p>

        <ul>
          <li>
            <strong>Abrir rápido en cualquier celular.</strong> Sin app, sin
            registro, sin esperar. Si el comensal tiene que instalar algo, ya
            perdió la mesa.
          </li>

          <li>
            <strong>Estar al día.</strong> El precio del menú impreso cambia
            cuando cambia el costo del insumo. El digital, el mismo día.
          </li>

          <li>
            <strong>Decir la verdad.</strong> Si un platillo se agotó, el menú
            no puede seguir ofreciéndolo. Un mesero que se disculpa tres veces
            por lo mismo es un menú desactualizado.
          </li>
        </ul>

        <h2>Siete preguntas antes de firmar</h2>

        <p>
          Ninguna de estas preguntas aparece en la página de precios de ningún
          proveedor. Todas se contestan en una demostración, y todas cambian
          el resultado.
        </p>

        <div className="cm-resource-table-wrap">
          <table className="cm-resource-table">
            <thead>
              <tr>
                <th scope="col">Pregunta</th>
                <th scope="col">Por qué importa</th>
              </tr>
            </thead>

            <tbody>
              <tr>
                <td>¿Puedo cambiar un precio sin reimprimir?</td>
                <td>
                  Es la razón por la que existe el menú digital. Si el cambio
                  tarda un día, se perdió la ventaja.
                </td>
              </tr>

              <tr>
                <td>¿El comensal solo lee, o también pide?</td>
                <td>
                  Determina si el mesero sigue siendo el único que captura,
                  o si el pedido nace donde se decide.
                </td>
              </tr>

              <tr>
                <td>¿La comanda llega a cocina sola?</td>
                <td>
                  Si hay que pasarla a mano, el menú QR agregó un paso en
                  lugar de quitar uno.
                </td>
              </tr>

              <tr>
                <td>¿Qué pasa si se cae el internet?</td>
                <td>
                  Un menú que solo vive en la nube deja la mesa sin carta.
                  Conviene saber qué alternativa hay.
                </td>
              </tr>

              <tr>
                <td>¿Cobra comisión por venta?</td>
                <td>
                  Un porcentaje sobre la cuenta crece con el negocio;
                  una renta fija, no.
                </td>
              </tr>

              <tr>
                <td>¿Con qué impresoras funciona?</td>
                <td>
                  La comanda y el ticket tienen que salir en la térmica
                  que ya tienes, no en la que te quieran vender.
                </td>
              </tr>

              <tr>
                <td>¿Puedo llevarme mi menú si me voy?</td>
                <td>
                  Exportar platillos, precios y fotos evita volver a capturar
                  todo si cambias de proveedor.
                </td>
              </tr>
            </tbody>
          </table>
        </div>

        <p className="cm-resource-table-note">
          Las siete se contestan en una demostración de veinte minutos.
          Si alguna no tiene respuesta clara, es la respuesta.
        </p>

        <h3>Las dos que más pesan</h3>

        <p>
          De las siete, dos definen el resto. La primera es si el comensal puede
          pedir desde su celular. Un menú que solo se lee es un catálogo: útil,
          pero el pedido sigue pasando por el mesero y por la caja, con las mismas
          tres capturas de siempre. Un menú que permite pedir cambia el flujo
          completo, y solo funciona si la segunda pregunta —si la comanda llega
          sola a cocina— está resuelta.
        </p>

        <p>
          La segunda es la comisión. Un porcentaje por venta parece inofensivo
          porque no se paga por adelantado, pero escala con el negocio: el mismo
          sistema cuesta más el mes que vendiste más. Una renta fija hace lo
          contrario, y por eso conviene poner las dos cifras en la misma hoja
          antes de decidir.
        </p>

        <h2>Cuándo un menú QR solo no alcanza</h2>

        <p>
          Hay señales concretas de que el problema ya no es la carta, sino la
          operación:
        </p>

        <ol className="cm-resource-signals">
          <li>
            <b>El mismo pedido se captura dos veces.</b>
            Una en el celular del comensal y otra en la caja, porque no se hablan.
          </li>

          <li>
            <b>Las mesas se cruzan.</b>
            El platillo sale a la mesa equivocada porque la comanda se anotó
            en papel y se transcribió mal.
          </li>

          <li>
            <b>El inventario se lleva de memoria.</b>
            Nadie sabe cuánto queda de un insumo hasta que se acaba a media tarde.
          </li>

          <li>
            <b>El corte del día no cuadra.</b>
            Las ventas del menú digital y las de la caja no coinciden,
            y hay que conciliar a mano.
          </li>
        </ol>

        <p>
          Cuando aparece una de estas cuatro, contratar «un menú QR más bonito»
          no resuelve nada: lo que falta es que el menú, el pedido, la cocina
          y la caja sean el mismo sistema.
        </p>

        <h2>Dónde encaja Clic Menú</h2>

        <p>
          Clic Menú se presenta como una plataforma para restaurantes que une
          menú digital QR, punto de venta, inventarios y reportes. Dicho en corto:
          el menú no es un archivo aparte, es la misma base que usan la caja
          y la cocina.
        </p>

        <div className="cm-resource-grid">
          <div className="cm-resource-card cm-resource-card-positive">
            <h3>Lo que hace</h3>

            <ul>
              <li>Menú digital QR: el comensal consulta platillos, extras y variantes desde su celular.</li>
              <li>Punto de venta: cajas, mesas y emisión de tickets.</li>
              <li>Inventarios: control de insumos y costo real de cada platillo.</li>
              <li>Reportes en vivo de ventas y rendimiento.</li>
              <li>Impresión térmica desde Windows o Android, por USB o por red (TCP/IP).</li>
              <li>Prueba gratuita de 7 días, sin tarjeta.</li>
            </ul>
          </div>

          <div className="cm-resource-card cm-resource-card-negative">
            <h3>Lo que conviene preguntar antes</h3>

            <ul>
              <li>
                Si tu operación es solo consulta y no quieres caja ni inventario,
                un menú QR sencillo puede bastarte.
              </li>

              <li>
                Si necesitas facturación con impresión fiscal, revisa cómo
                se integra antes de contratar.
              </li>

              <li>
                Si tienes varias sucursales con inventario compartido,
                confirma cómo se consolida.
              </li>
            </ul>
          </div>
        </div>

        <h2>Quién más juega en esta categoría</h2>

        <p>
          Sin orden de preferencia, y describiendo cada uno como se describe a
          sí mismo: <strong>tumenudigital.mx</strong> se presenta como «punto de
          venta y menú digital para restaurantes en México»;{" "}
          <strong>carte.com.mx</strong>, como «tu menú digital por QR»; y{" "}
          <strong>myqrmenu.app</strong> ofrece un menú QR enfocado en la reputación
          del restaurante. Son tres enfoques distintos del mismo problema, y por
          eso las siete preguntas de arriba aplican igual a los tres.
        </p>

        <p>
          Si ya tienes un menú QR hecho a mano y quieres saber hasta dónde
          alcanza, lo tratamos en{" "}
          <a href="/recursos/menu-qr-con-canva">
            Menú QR con Canva: hasta dónde alcanza
          </a>.
        </p>

        <h2>Preguntas frecuentes</h2>

        {COMO_ELEGIR_FAQS.map((item) => (
          <details key={item.question} className="cm-resource-faq">
            <summary>{item.question}</summary>
            <p>{item.answer}</p>
          </details>
        ))}

        <div className="cm-resource-cta">
          <h2>Probar es más rápido que comparar</h2>

          <p>
            La prueba de Clic Menú es de 7 días y no pide tarjeta: cargas tu menú,
            imprimes el QR y lo pones en una mesa. Si las siete preguntas no quedan
            contestadas con eso, ya sabes qué pedir en la demostración.
          </p>

          <div className="cm-resource-buttons">
            <a
              className="cm-resource-button cm-resource-button-primary"
              href="/auth/register"
            >
              Crear cuenta gratis
            </a>

            <a
              className="cm-resource-button cm-resource-button-secondary"
              href="/planes"
            >
              Ver planes
            </a>
          </div>
        </div>
      </ResourceArticleLayout>
    </>
  );
}