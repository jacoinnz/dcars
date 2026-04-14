"use client";

import { Button } from "@mantine/core";

export function PrintPageButton() {
  return (
    <Button
      type="button"
      variant="default"
      size="compact-sm"
      onClick={() => window.print()}
    >
      Print or save as PDF
    </Button>
  );
}
