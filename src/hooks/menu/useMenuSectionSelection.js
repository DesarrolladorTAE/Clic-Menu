import { useCallback, useEffect, useMemo, useState } from "react";

/**
 * Determina si una sección tiene un identificador válido.
 *
 * No modifica, ordena ni completa la información recibida del backend.
 */
function hasValidSectionId(section) {
  return (
    section &&
    section.id !== null &&
    section.id !== undefined &&
    section.id !== ""
  );
}

/**
 * Compara identificadores tolerando que uno llegue como número
 * y otro como texto.
 *
 * Ejemplo:
 * 1 === "1"
 *
 * El valor expuesto por el hook conserva el tipo original
 * recibido desde el backend.
 */
function isSameSectionId(firstId, secondId) {
  if (
    firstId === null ||
    firstId === undefined ||
    secondId === null ||
    secondId === undefined
  ) {
    return false;
  }

  return String(firstId) === String(secondId);
}

/**
 * Controla exclusivamente la sección activa de un menú.
 *
 * Responsabilidades:
 * - Conserva el orden de las secciones recibido desde el backend.
 * - Selecciona automáticamente la primera sección disponible.
 * - Conserva la selección cuando la sección sigue existiendo.
 * - Selecciona la primera sección si la selección anterior desaparece.
 * - Deja la selección en null cuando no existen secciones.
 * - Indica si debe mostrarse el selector de secciones.
 *
 * No realiza:
 * - Filtros de horarios.
 * - Filtros de categorías o productos.
 * - Ordenamientos.
 * - Peticiones HTTP.
 * - Cambios en el carrito.
 * - Creación de una opción "Todas".
 *
 * @param {Array} sections Secciones autoritativas recibidas del backend.
 *
 * @returns {{
 *   selectedSectionId: string|number|null,
 *   selectedSection: Object|null,
 *   selectSection: function,
 *   showSectionSelector: boolean
 * }}
 */
export default function useMenuSectionSelection(sections = []) {
  /**
   * Se ignoran únicamente valores que no representen una sección
   * seleccionable porque no contienen un identificador.
   *
   * El orden original entregado por el backend se conserva.
   */
  const availableSections = useMemo(() => {
    if (!Array.isArray(sections)) {
      return [];
    }

    return sections.filter(hasValidSectionId);
  }, [sections]);

  /**
   * Si el hook recibe secciones desde el primer render,
   * inicia directamente con la primera.
   *
   * Cuando las secciones llegan después de una petición HTTP,
   * el useEffect inferior actualizará esta selección.
   */
  const [selectedSectionId, setSelectedSectionId] = useState(() => {
    return availableSections[0]?.id ?? null;
  });

  /**
   * Sincroniza la sección seleccionada cuando cambia el payload.
   *
   * Casos:
   * 1. No hay secciones:
   *    selectedSectionId = null.
   *
   * 2. La sección seleccionada todavía existe:
   *    conserva esa misma sección.
   *
   * 3. La sección seleccionada desapareció:
   *    selecciona la primera sección disponible.
   */
  useEffect(() => {
    setSelectedSectionId((currentSectionId) => {
      if (availableSections.length === 0) {
        return null;
      }

      const currentSection = availableSections.find((section) =>
        isSameSectionId(section.id, currentSectionId)
      );

      if (currentSection) {
        /**
         * Se devuelve el ID original de la nueva respuesta.
         * Esto conserva el tipo exacto entregado por el backend.
         */
        return currentSection.id;
      }

      return availableSections[0].id;
    });
  }, [availableSections]);

  /**
   * Obtiene el objeto completo de la sección seleccionada.
   */
  const selectedSection = useMemo(() => {
    if (selectedSectionId === null || selectedSectionId === undefined) {
      return null;
    }

    return (
      availableSections.find((section) =>
        isSameSectionId(section.id, selectedSectionId)
      ) ?? null
    );
  }, [availableSections, selectedSectionId]);

  /**
   * Cambia la sección únicamente cuando el identificador
   * pertenece a una sección disponible en el payload actual.
   *
   * No acepta IDs inventados ni conserva selecciones inválidas.
   */
  const selectSection = useCallback(
    (sectionId) => {
      const nextSection = availableSections.find((section) =>
        isSameSectionId(section.id, sectionId)
      );

      if (!nextSection) {
        return;
      }

      setSelectedSectionId(nextSection.id);
    },
    [availableSections]
  );

  /**
   * Con una sola sección se conserva la selección internamente,
   * pero no se muestra el componente visual.
   */
  const showSectionSelector = availableSections.length > 1;

  return {
    selectedSectionId,
    selectedSection,
    selectSection,
    showSectionSelector,
  };
}