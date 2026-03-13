import { Box } from "@mui/material";
import { useTheme } from "@mui/material/styles";

export default function PageContainer({
  children,
  maxWidth,
  disableInner = false,
  sx = {},
  innerSx = {},
}) {
  const theme = useTheme();

  const pageMaxWidth = maxWidth || theme?.customLayout?.pageMaxWidth || 1100;
  const pagePaddingX = theme?.customLayout?.pagePaddingX || {
    xs: 2,
    sm: 3,
    md: 4,
  };
  const pagePaddingY = theme?.customLayout?.pagePaddingY || {
    xs: 8,
    md: 4,
  };

  return (
    <Box
      sx={{
        width: "100%",
        px: pagePaddingX,
        py: pagePaddingY,
        ...sx,
      }}
    >
      {disableInner ? (
        children
      ) : (
        <Box
          sx={{
            width: "100%",
            maxWidth: pageMaxWidth,
            mx: "auto",
            ...innerSx,
          }}
        >
          {children}
        </Box>
      )}
    </Box>
  );
}