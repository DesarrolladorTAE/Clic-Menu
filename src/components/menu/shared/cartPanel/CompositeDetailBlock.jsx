//src/components/menu/shared/cartPanel/CompositeDetailBlock.jsx

import React, { useState } from "react";
import { alpha, useTheme } from "@mui/material/styles";
import {
  formatComponentDetailLabel,
  safeNum,
} from "../../../../hooks/public/publicMenu.utils";

import CartProductDetailIcons from "./CartProductDetailIcons";
import CartProductDetailsDialog from "./CartProductDetailsDialog";

function asArray(value) {
  return Array.isArray(value) ? value : [];
}

function positiveId(value) {
  const number = Number(value);
  return Number.isSafeInteger(number) && number > 0 ? number : null;
}

function getComponents(item, details = []) {
  const children = asArray(item?.children);
  if (children.length > 0) return children;

  const components = asArray(item?.components);
  if (components.length > 0) return components;

  const savedDetails = asArray(item?.components_detail);
  if (savedDetails.length > 0) return savedDetails;

  return asArray(details);
}

function findDefinition(component, definitions = []) {
  const componentId = positiveId(component?.component_product_id ?? component?.product_id);
  if (!componentId) return null;

  return asArray(definitions).find((definition) =>
    positiveId(definition?.component_product_id ?? definition?.product_id) === componentId
  ) || null;
}

function getComponentLabel(component, definition = null) {
  const name = String(
    component?.display_name ||
    component?.product_name ||
    component?.component_name ||
    component?.name ||
    definition?.component_name ||
    definition?.name ||
    definition?.product?.name ||
    ""
  ).trim();

  const variant = String(component?.variant_name || "").trim();

  if (name) {
    return variant && !name.includes(variant) ? `${name} · ${variant}` : name;
  }

  return formatComponentDetailLabel(component) || "Producto";
}

function getComponentQuantity(component) {
  return Math.max(0, safeNum(component?.effective_quantity ?? component?.quantity ?? 1, 1));
}

function ComponentRows({ components, definitions = [], depth = 0, onShowDetails }) {
  if (depth >= 10 || !asArray(components).length) return null;

  return (
    <div className="cm-composite-products">
      {components.map((component, index) => {
        const definition = findDefinition(component, definitions);
        const label = getComponentLabel(component, definition);
        const quantity = getComponentQuantity(component);
        const nestedComponents = getComponents(component);
        const nestedDefinitions = asArray(
          definition?.composite?.items || definition?.product?.composite?.items
        );

        const originalQuantity = Math.max(0, safeNum(
          component?.original_quantity ?? component?.quantity ?? quantity, quantity
        ));
        const cancelledQuantity = Math.max(0, safeNum(component?.cancelled_quantity, 0));

        return (
          <div
            key={`${component?.id || component?.component_product_id || index}-${index}`}
            className="cm-composite-product"
          >
            <div className="cm-composite-product-main">
              <div className="cm-composite-product-info">
                <strong className="cm-composite-product-name">{label}</strong>

                <span className="cm-composite-product-quantity">
                  {quantity} {quantity === 1 ? "unidad" : "unidades"}

                  {component?.is_optional === true ? " · Opcional" : ""}
                  {component?.apply_variant_price === true ? " · Ajusta precio" : ""}
                </span>

                {cancelledQuantity > 0 ? (
                  <span className="cm-composite-product-cancellation">
                    Originales: {originalQuantity} · Canceladas: {cancelledQuantity}
                  </span>
                ) : null}
              </div>

              <div className="cm-composite-product-details">
                <CartProductDetailIcons
                  item={component}
                  option={component?.__option || null}
                  onShowDetails={onShowDetails}
                />
              </div>
            </div>

            {nestedComponents.length > 0 ? (
              <div className="cm-composite-product-nested">
                <ComponentRows
                  components={nestedComponents}
                  definitions={nestedDefinitions}
                  depth={depth + 1}
                  onShowDetails={onShowDetails}
                />
              </div>
            ) : null}
          </div>
        );
      })}
    </div>
  );
}

export default function CompositeDetailBlock({
  item = null,
  details = [],
  definitions = [],
  themeColor = "",
  onShowDetails,
}) {
  const theme = useTheme();
  const [selectedDetail, setSelectedDetail] = useState(null);

  const components = getComponents(item, details);
  const color = /^#[0-9A-Fa-f]{6}$/.test(String(themeColor || ""))
    ? themeColor : theme.palette.primary.main;

  const showDetails = (component, section, option = null) => {
    if (typeof onShowDetails === "function") {
      onShowDetails(component, section, option);
      return;
    }

    setSelectedDetail({ item: component, section, option });
  };

  if (!components.length) return null;

  return (
    <>
      <div
        className="cm-composite-products-wrap"
        style={{ "--cm-composite-row-border": alpha(color, 0.19) }}
      >
        <ComponentRows
          components={components}
          definitions={definitions}
          onShowDetails={showDetails}
        />
      </div>

      {selectedDetail ? (
        <CartProductDetailsDialog
          open
          item={selectedDetail.item}
          option={selectedDetail.option}
          section={selectedDetail.section}
          themeColor={color}
          onClose={() => setSelectedDetail(null)}
        />
      ) : null}
    </>
  );
}