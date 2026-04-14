import { Container } from "@mantine/core";

const PAGE_MAX_WIDTH = {
  default: 1024,
  narrow: 672,
  medium: 768,
} as const;

export type AppPageMaxWidth = keyof typeof PAGE_MAX_WIDTH;

/** Standard main-column wrapper: fluid width up to a readable max, vertical padding. */
export function AppPage(props: {
  children: React.ReactNode;
  maxWidth?: AppPageMaxWidth;
}) {
  const maw = PAGE_MAX_WIDTH[props.maxWidth ?? "default"];
  return (
    <Container fluid px="md" py="xl" maw={maw} mx="auto" style={{ flex: 1, width: "100%" }}>
      {props.children}
    </Container>
  );
}
