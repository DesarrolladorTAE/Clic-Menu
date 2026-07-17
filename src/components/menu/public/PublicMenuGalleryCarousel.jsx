// src/components/menu/public/PublicMenuGalleryCarousel.jsx
// Card 3: Carrusel de imágenes
import React, {
  useEffect,
  useMemo,
  useRef,
  useState,
} from "react";

import ChevronLeftRoundedIcon from "@mui/icons-material/ChevronLeftRounded";
import ChevronRightRoundedIcon from "@mui/icons-material/ChevronRightRounded";

function isValidColor(color) {
  return /^#[0-9A-Fa-f]{6}$/.test(
    String(color || "")
  );
}

export default function PublicMenuGalleryCarousel({
  publicMenu,
}) {
  const themeColor = isValidColor(
    publicMenu?.theme_color
  )
    ? publicMenu.theme_color
    : "#FF7A00";

  /*
   * Lista original recibida desde el backend.
   */
  const sourceImages = useMemo(() => {
    return (
      Array.isArray(publicMenu?.gallery)
        ? publicMenu.gallery
        : []
    )
      .filter(
        (image) =>
          image?.is_active !== false
      )
      .map((image) => ({
        id: image?.id,

        /*
         * image_url es el contrato público principal.
         *
         * Desde el backend contiene:
         * WebP optimizado → imagen original.
         *
         * Los demás campos son fallbacks para mantener
         * compatibilidad con respuestas anteriores.
         */
        url:
          image?.image_url ||
          image?.best_public_url ||
          image?.optimized_public_url ||
          image?.public_url ||
          image?.url ||
          "",

        name:
          image?.original_name ||
          "Imagen",
      }))
      .filter(
        (image) => Boolean(image.url)
      );
  }, [publicMenu]);

  /*
   * Permite detectar si el backend entregó
   * un conjunto diferente de imágenes.
   */
  const imageSignature = useMemo(() => {
    return sourceImages
      .map(
        (image) =>
          `${image.id ?? "sin-id"}:${image.url}`
      )
      .join("|");
  }, [sourceImages]);

  /*
   * Referencia directa a la imagen actual.
   *
   * Permite detectar cuando Chrome ya resolvió
   * la imagen desde memory cache o disk cache.
   */
  const currentImageRef = useRef(null);

  const [active, setActive] = useState(0);
  const [notice, setNotice] = useState("");

  /*
   * URLs que fallaron durante esta sesión.
   *
   * Se excluyen del carrusel para evitar
   * que vuelvan a generar errores en cada vuelta.
   */
  const [failedUrls, setFailedUrls] =
    useState([]);

  /*
   * URLs que ya terminaron de cargar.
   *
   * Al volver a una imagen descargada no se muestra
   * nuevamente el placeholder innecesariamente.
   */
  const [loadedUrls, setLoadedUrls] =
    useState([]);

  /*
   * Galería utilizable después de excluir
   * las imágenes que fallaron.
   */
  const images = useMemo(() => {
    return sourceImages.filter(
      (image) =>
        !failedUrls.includes(image.url)
    );
  }, [
    sourceImages,
    failedUrls,
  ]);

  /*
   * Reinicia la navegación cuando cambia
   * realmente el conjunto de imágenes.
   *
   * No vaciamos loadedUrls porque una imagen puede
   * haber terminado de cargar desde caché antes de
   * que este efecto se ejecute.
   */
  useEffect(() => {
    setActive(0);
    setNotice("");
    setFailedUrls([]);
  }, [imageSignature]);

  /*
   * Mantiene el índice dentro del rango válido
   * cuando se elimina una imagen que falló.
   */
  useEffect(() => {
    if (!images.length) {
      setActive(0);
      return;
    }

    setActive((currentActive) =>
      Math.min(
        currentActive,
        images.length - 1
      )
    );
  }, [images.length]);

  const currentIndex = images.length
    ? Math.min(
        active,
        images.length - 1
      )
    : 0;

  const current =
    images[currentIndex] || null;

  const imageLoading =
    Boolean(current?.url) &&
    !loadedUrls.includes(current.url);

  /*
   * Comprueba el estado real del elemento <img>
   * cada vez que cambia la imagen actual.
   *
   * Esto cubre imágenes entregadas inmediatamente
   * desde memory cache o disk cache.
   */
  useEffect(() => {
    const currentUrl = current?.url;
    const image = currentImageRef.current;

    if (
      !currentUrl ||
      !image ||
      !image.complete
    ) {
      return;
    }

    /*
     * La solicitud ya terminó y la imagen es válida.
     */
    if (image.naturalWidth > 0) {
      setLoadedUrls((previous) =>
        previous.includes(currentUrl)
          ? previous
          : [...previous, currentUrl]
      );

      setFailedUrls((previous) =>
        previous.filter(
          (url) => url !== currentUrl
        )
      );

      return;
    }

    /*
     * La solicitud terminó, pero la imagen está rota.
     */
    setLoadedUrls((previous) =>
      previous.filter(
        (url) => url !== currentUrl
      )
    );

    setFailedUrls((previous) =>
      previous.includes(currentUrl)
        ? previous
        : [...previous, currentUrl]
    );

    setNotice(
      images.length > 1
        ? "Una imagen no pudo cargarse. Se mostrará la siguiente."
        : "No se pudieron cargar las imágenes."
    );
  }, [
    current?.url,
    images.length,
  ]);

  /*
   * Rotación automática.
   *
   * El tiempo comienza únicamente cuando
   * la imagen actual terminó de cargar.
   */
  useEffect(() => {
    if (
      images.length <= 1 ||
      !current?.url ||
      imageLoading
    ) {
      return;
    }

    const timer = setTimeout(() => {
      setActive((previous) =>
        previous >= images.length - 1
          ? 0
          : previous + 1
      );
    }, 6000);

    return () => clearTimeout(timer);
  }, [
    current?.url,
    imageLoading,
    images.length,
  ]);

  /*
   * Oculta los avisos temporales.
   */
  useEffect(() => {
    if (!notice) {
      return;
    }

    const timer = setTimeout(
      () => setNotice(""),
      2200
    );

    return () => clearTimeout(timer);
  }, [notice]);

  /*
   * Si la sucursal no tiene imágenes configuradas,
   * no se muestra el componente.
   */
  if (!sourceImages.length) {
    return null;
  }

  const handlePrev = () => {
    if (images.length <= 1) {
      setNotice(
        "No hay más imágenes por mostrar."
      );

      return;
    }

    setActive((previous) =>
      previous <= 0
        ? images.length - 1
        : previous - 1
    );
  };

  const handleNext = () => {
    if (images.length <= 1) {
      setNotice(
        "No hay más imágenes por mostrar."
      );

      return;
    }

    setActive((previous) =>
      previous >= images.length - 1
        ? 0
        : previous + 1
    );
  };

  const handleImageError = (
    failedUrl
  ) => {
    if (!failedUrl) {
      return;
    }

    /*
     * Registra la URL como fallida para evitar
     * que vuelva a mostrarse en el carrusel.
     */
    setFailedUrls((previous) =>
      previous.includes(failedUrl)
        ? previous
        : [...previous, failedUrl]
    );

    /*
     * Se elimina también de las imágenes
     * consideradas como cargadas.
     */
    setLoadedUrls((previous) =>
      previous.filter(
        (url) => url !== failedUrl
      )
    );

    setNotice(
      images.length > 1
        ? "Una imagen no pudo cargarse. Se mostrará la siguiente."
        : "No se pudieron cargar las imágenes."
    );
  };

  return (
    <section
      className="cm-gallery-carousel"
      style={{
        width: "100%",
        background: "#FFFFFF",
        overflow: "hidden",
        position: "relative",
        boxShadow:
          "0 14px 34px rgba(47,42,61,0.07)",
      }}
    >
      <div
        className="cm-gallery-frame"
        aria-busy={
          Boolean(current) &&
          imageLoading
        }
        style={{
          width: "100%",
          aspectRatio: "16 / 7",
          minHeight: 210,
          maxHeight: 420,
          overflow: "hidden",
          background: "#F6F3EF",
          position: "relative",
        }}
      >
        {current ? (
          <>
            {imageLoading ? (
              <div
                aria-hidden="true"
                className="cm-gallery-placeholder"
              />
            ) : null}

            <img
              ref={currentImageRef}
              key={current.url}
              src={current.url}
              alt={current.name}
              loading="lazy"
              decoding="async"
              onLoad={() => {
                const loadedUrl =
                  current.url;

                setLoadedUrls(
                  (previous) =>
                    previous.includes(
                      loadedUrl
                    )
                      ? previous
                      : [
                          ...previous,
                          loadedUrl,
                        ]
                );

                /*
                 * Recupera la imagen si había sido
                 * registrada previamente como fallida.
                 */
                setFailedUrls(
                  (previous) =>
                    previous.filter(
                      (url) =>
                        url !== loadedUrl
                    )
                );
              }}
              onError={() => {
                handleImageError(
                  current.url
                );
              }}
              style={{
                position: "relative",
                zIndex: 1,
                width: "100%",
                height: "100%",
                objectFit: "cover",
                objectPosition: "center",
                display: "block",

                opacity: imageLoading
                  ? 0
                  : 1,

                transform: imageLoading
                  ? "scale(1.015)"
                  : "scale(1)",

                transition:
                  "opacity 360ms ease, transform 440ms ease",
              }}
            />

            <div
              aria-hidden="true"
              style={{
                position: "absolute",
                inset: 0,
                zIndex: 2,

                background:
                  "linear-gradient(90deg, rgba(17,24,39,0.12), rgba(17,24,39,0.02), rgba(17,24,39,0.12))",

                pointerEvents: "none",
              }}
            />

            <button
              type="button"
              onClick={handlePrev}
              className="cm-gallery-arrow cm-gallery-arrow-left"
              style={{
                background: themeColor,
              }}
              title="Anterior"
              aria-label="Imagen anterior"
            >
              <ChevronLeftRoundedIcon className="cm-gallery-arrow-icon" />
            </button>

            <button
              type="button"
              onClick={handleNext}
              className="cm-gallery-arrow cm-gallery-arrow-right"
              style={{
                background: themeColor,
              }}
              title="Siguiente"
              aria-label="Imagen siguiente"
            >
              <ChevronRightRoundedIcon className="cm-gallery-arrow-icon" />
            </button>

            <div
              style={{
                position: "absolute",
                left: "50%",
                bottom: 16,
                transform:
                  "translateX(-50%)",
                display: "flex",
                gap: 8,
                alignItems: "center",
                justifyContent: "center",
                zIndex: 3,
              }}
            >
              {images.map(
                (image, index) => {
                  const selected =
                    index === currentIndex;

                  return (
                    <button
                      key={`${
                        image.id ||
                        image.url
                      }-${index}`}
                      type="button"
                      onClick={() =>
                        setActive(index)
                      }
                      title={`Ver imagen ${
                        index + 1
                      }`}
                      aria-label={`Ver imagen ${
                        index + 1
                      }`}
                      aria-current={
                        selected
                          ? "true"
                          : undefined
                      }
                      style={{
                        width: selected
                          ? 24
                          : 9,

                        height: 9,
                        borderRadius: 999,
                        border: "none",
                        padding: 0,
                        cursor: "pointer",

                        background: selected
                          ? themeColor
                          : "rgba(255,255,255,0.82)",

                        boxShadow:
                          "0 4px 12px rgba(17,24,39,0.22)",

                        transition:
                          "all 220ms ease",
                      }}
                    />
                  );
                }
              )}
            </div>
          </>
        ) : (
          /*
           * Este estado solo aparece cuando había imágenes
           * configuradas, pero todas fallaron al descargarse.
           */
          <div
            role="status"
            style={{
              width: "100%",
              height: "100%",
              minHeight: 210,
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              padding: 24,
              textAlign: "center",
              background:
                "linear-gradient(135deg, #F6F3EF, #EEE9E2)",
              color: "#4B5563",
              fontSize: 14,
              fontWeight: 750,
            }}
          >
            Las imágenes de la galería no
            están disponibles.
          </div>
        )}

        {notice ? (
          <div
            role="status"
            aria-live="polite"
            style={{
              position: "absolute",
              left: "50%",
              bottom: current ? 42 : 20,

              transform:
                "translateX(-50%)",

              background:
                "rgba(17,24,39,0.82)",

              color: "#FFFFFF",
              padding: "8px 12px",
              borderRadius: 999,
              fontSize: 12,
              fontWeight: 850,
              whiteSpace: "nowrap",
              maxWidth:
                "calc(100% - 32px)",
              overflow: "hidden",
              textOverflow: "ellipsis",
              backdropFilter: "blur(8px)",
              zIndex: 4,
            }}
          >
            {notice}
          </div>
        ) : null}
      </div>

      <style>
        {`
          @keyframes cmGallerySkeleton {
            0% {
              background-position: 200% 0;
            }

            100% {
              background-position: -200% 0;
            }
          }

          .cm-gallery-placeholder {
            position: absolute;
            inset: 0;
            z-index: 0;
            background:
              linear-gradient(
                110deg,
                #E5E1DB 8%,
                #F7F4F0 18%,
                #E5E1DB 33%
              );
            background-size: 200% 100%;
            animation:
              cmGallerySkeleton
              1.4s
              ease-in-out
              infinite;
          }

          .cm-gallery-arrow {
            position: absolute;
            top: 50%;
            width: 58px;
            height: 58px;
            border-radius: 999px;
            border: none;
            color: #FFFFFF;
            cursor: pointer;
            display: flex;
            align-items: center;
            justify-content: center;
            padding: 0;
            box-shadow:
              0 14px 28px
              rgba(17,24,39,0.24);
            transition:
              transform 180ms ease,
              filter 180ms ease,
              opacity 180ms ease;
            z-index: 3;
          }

          .cm-gallery-arrow-icon {
            font-size: 42px;
            line-height: 1;
          }

          .cm-gallery-arrow-left {
            left: 24px;
            transform: translateY(-50%);
          }

          .cm-gallery-arrow-right {
            right: 24px;
            transform: translateY(-50%);
          }

          .cm-gallery-arrow:hover {
            filter: brightness(1.04);
          }

          .cm-gallery-arrow-left:hover {
            transform:
              translateY(-50%)
              scale(1.04);
          }

          .cm-gallery-arrow-right:hover {
            transform:
              translateY(-50%)
              scale(1.04);
          }

          .cm-gallery-arrow:active {
            opacity: 0.86;
          }

          @media (max-width: 640px) {
            .cm-gallery-frame {
              aspect-ratio:
                16 / 9 !important;
              min-height:
                190px !important;
            }

            .cm-gallery-arrow {
              width: 44px;
              height: 44px;
            }

            .cm-gallery-arrow-icon {
              font-size: 34px;
            }

            .cm-gallery-arrow-left {
              left: 12px;
            }

            .cm-gallery-arrow-right {
              right: 12px;
            }
          }

          @media (
            prefers-reduced-motion:
            reduce
          ) {
            .cm-gallery-placeholder {
              animation: none;
            }

            .cm-gallery-arrow {
              transition: none;
            }
          }
        `}
      </style>
    </section>
  );
}