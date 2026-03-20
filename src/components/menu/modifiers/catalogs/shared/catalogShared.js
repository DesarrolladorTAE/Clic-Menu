export const ALL_CATEGORIES_VALUE = "__all__";
export const PAGE_SIZE = 5;

export function getAppliesToLabel(value) {
  switch (value) {
    case "product":
      return "Producto";
    case "variant":
      return "Variante";
    case "component":
      return "Componente";
    case "any":
      return "Cualquiera";
    default:
      return "Producto";
  }
}

export function getBranchHelpText({
  productsAreByBranch,
  modifiersAreByBranch,
}) {
  if (productsAreByBranch && modifiersAreByBranch) {
    return "La sucursal seleccionada filtrará productos y modificadores.";
  }

  if (productsAreByBranch && !modifiersAreByBranch) {
    return "La sucursal seleccionada filtrará solo los productos.";
  }

  if (!productsAreByBranch && modifiersAreByBranch) {
    return "La sucursal seleccionada filtrará solo los modificadores.";
  }

  return "";
}

export const fieldLabelSx = {
  fontSize: 14,
  fontWeight: 800,
  color: "text.primary",
  mb: 1,
};

export const switchLabelSx = {
  fontSize: 14,
  fontWeight: 700,
  color: "text.primary",
};

export const iconEditSx = {
  width: 40,
  height: 40,
  bgcolor: "#E3C24A",
  color: "#fff",
  borderRadius: 1.5,
  "&:hover": {
    bgcolor: "#C9AA39",
  },
};

export const iconDeleteSx = {
  width: 40,
  height: 40,
  bgcolor: "error.main",
  color: "#fff",
  borderRadius: 1.5,
  "&:hover": {
    bgcolor: "error.dark",
  },
};

export function groupProductsByCategory(products = []) {
  const map = new Map();

  products.forEach((product) => {
    const categoryName = product?.category?.name || "Sin categoría";

    if (!map.has(categoryName)) {
      map.set(categoryName, []);
    }

    map.get(categoryName).push(product);
  });

  return Array.from(map.entries())
    .sort((a, b) => a[0].localeCompare(b[0], "es", { sensitivity: "base" }))
    .map(([categoryName, rows]) => ({
      categoryName,
      products: [...rows].sort((a, b) =>
        (a?.name || "").localeCompare(b?.name || "", "es", {
          sensitivity: "base",
        })
      ),
    }));
}