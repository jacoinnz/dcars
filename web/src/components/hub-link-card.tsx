"use client";

import Link from "next/link";
import { Paper } from "@mantine/core";

type Props = {
  href: string;
  children: React.ReactNode;
  /** Live / primary cards: teal hover. Planned: neutral hover. */
  variant?: "live" | "planned";
};

/** Hub home: bordered card linking to a feature (evaluations, HR, etc.). */
export function HubLinkCard(props: Props) {
  const { variant = "live" } = props;
  const hover =
    variant === "live"
      ? {
          borderColor: "var(--mantine-color-teal-3)",
          backgroundColor: "rgba(230, 255, 250, 0.35)",
        }
      : {
          borderColor: "var(--mantine-color-gray-4)",
          backgroundColor: "var(--mantine-color-gray-0)",
        };

  return (
    <Paper
      component={Link}
      href={props.href}
      withBorder
      shadow="sm"
      p="lg"
      radius="lg"
      h="100%"
      styles={{
        root: {
          display: "block",
          textDecoration: "none",
          color: "inherit",
          transition: "border-color 0.15s ease, background-color 0.15s ease",
          "&:hover": hover,
        },
      }}
    >
      {props.children}
    </Paper>
  );
}
