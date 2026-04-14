"use client";

import { MantineProvider, createTheme } from "@mantine/core";

const theme = createTheme({
  primaryColor: "teal",
  defaultRadius: "md",
  fontFamily: "var(--font-geist-sans), system-ui, sans-serif",
  headings: {
    fontFamily: "var(--font-geist-sans), system-ui, sans-serif",
  },
});

export function MantineProviders({ children }: { children: React.ReactNode }) {
  return (
    <MantineProvider theme={theme} defaultColorScheme="light">
      {children}
    </MantineProvider>
  );
}
