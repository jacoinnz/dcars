"use client";

import { Box, Flex } from "@mantine/core";

/** Root layout: responsive sidebar + main column (replaces Tailwind flex utilities). */
export function AppShell(props: {
  children: React.ReactNode;
}) {
  return (
    <Flex direction={{ base: "column", md: "row" }} mih="100vh" style={{ width: "100%" }}>
      {props.children}
    </Flex>
  );
}

export function AppMainColumn(props: { children: React.ReactNode }) {
  return (
    <Flex direction="column" style={{ flex: 1, minWidth: 0, minHeight: 0 }}>
      {props.children}
    </Flex>
  );
}

export function AppMain(props: { children: React.ReactNode }) {
  return (
    <Box component="main" style={{ flex: 1, minHeight: 0, overflow: "auto" }}>
      {props.children}
    </Box>
  );
}
