"use client";

import { MantineProvider, createTheme } from "@mantine/core";

/**
 * Theme aligned with Mantine docs / UI: blue primary, neutral grays, comfortable radius.
 * @see https://mantine.dev/
 */
const theme = createTheme({
  primaryColor: "blue",
  primaryShade: 6,
  defaultRadius: "md",
  fontFamily: "var(--font-geist-sans), system-ui, -apple-system, BlinkMacSystemFont, sans-serif",
  headings: {
    fontFamily: "var(--font-geist-sans), system-ui, -apple-system, BlinkMacSystemFont, sans-serif",
    fontWeight: "600",
  },
  defaultGradient: {
    from: "blue.6",
    to: "blue.8",
    deg: 90,
  },
});

export function MantineProviders({ children }: { children: React.ReactNode }) {
  return (
    <MantineProvider theme={theme} defaultColorScheme="light">
      {children}
    </MantineProvider>
  );
}
