import ContextOverview from "../common/ContextOverview";
import CategoryOutlinedIcon from "@mui/icons-material/CategoryOutlined";
import CheckCircleOutlineOutlinedIcon from "@mui/icons-material/CheckCircleOutlineOutlined";
import Inventory2OutlinedIcon from "@mui/icons-material/Inventory2Outlined";
import SettingsSuggestOutlinedIcon from "@mui/icons-material/SettingsSuggestOutlined";

export default function CatalogContextCard({
  selectedBranch,
  contextData,
}) {
  const modeLabel = contextData?.mode === "branch" ? "Por sucursal" : "Global";

  const contextItems = [
    {
      key: "listed",
      icon: <CategoryOutlinedIcon fontSize="small" />,
      title: "Productos listados",
      value: `${contextData?.totalRows || 0} producto(s)`,
      chipLabel: "Sucursal",
      chipColor: "primary",
    },
    {
      key: "enabled",
      icon: <CheckCircleOutlineOutlinedIcon fontSize="small" />,
      title: "Productos habilitados",
      value: `${contextData?.enabledCount || 0} habilitado(s)`,
      chipLabel: "Disponibles",
      chipColor: "success",
    },
    {
      key: "active",
      icon: <Inventory2OutlinedIcon fontSize="small" />,
      title: "Productos activos",
      value: `${contextData?.activeProductsCount || 0} vigentes`,
      chipLabel: "Base",
      chipColor: "default",
    },
    {
      key: "mode",
      icon: <SettingsSuggestOutlinedIcon fontSize="small" />,
      title: "Modo del catálogo",
      value: modeLabel,
      chipLabel: "Operación",
      chipColor: "primary",
    },
  ];

  const description = selectedBranch?.name
    ? `Los cambios que realices aquí se aplicarán únicamente al catálogo de ${selectedBranch.name}.`
    : "Selecciona una sucursal para continuar.";

  return (
    <ContextOverview
      items={contextItems}
      description={description}
    />
  );
}