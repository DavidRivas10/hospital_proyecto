import { MantineProvider, createTheme } from "@mantine/core";
import { Global } from "@emotion/react";
import { Notifications } from "@mantine/notifications";
import type { PropsWithChildren } from "react";

const theme = createTheme({
  primaryColor: "indigo",
  primaryShade: 6,
  defaultRadius: "lg",
  fontFamily:
    "Inter, ui-sans-serif, system-ui, -apple-system, Segoe UI, Roboto, Arial, sans-serif",
  headings: { fontFamily: "Inter, ui-sans-serif, system-ui", fontWeight: "800" },
  shadows: {
    sm: "0 2px 8px rgba(16,24,40,.06)",
    md: "0 8px 28px rgba(16,24,40,.08)",
    xl: "0 22px 60px rgba(16,24,40,.14)",
  },
  components: {
    Card: { defaultProps: { withBorder: false, padding: "lg", shadow: "md" } },
    Button: { defaultProps: { radius: "md" } },
    Paper: { defaultProps: { radius: "lg" } },
    TextInput: { defaultProps: { radius: "md" } },
    Select: { defaultProps: { radius: "md" } },
    Textarea: { defaultProps: { radius: "md" } },
  },
});

export default function Provider({ children }: PropsWithChildren) {
  return (
    <MantineProvider theme={theme} defaultColorScheme="light">
      <Global
        styles={{
          "html, body, #root": { height: "100%" },
          body: {
            background: "transparent", // lo pinta AppBackground
            WebkitFontSmoothing: "antialiased",
            MozOsxFontSmoothing: "grayscale",
          },
          a: { textDecoration: "none", color: "inherit" },
        }}
      />
      <Notifications position="top-right" />
      {children}
    </MantineProvider>
  );
}
