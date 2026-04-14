"use client";

import type { ReactNode } from "react";
import Link from "next/link";
import {
  Anchor,
  type AnchorProps,
  Button,
  type ButtonProps,
} from "@mantine/core";

/** Use from Server Components instead of `<Anchor component={Link} />` (RSC cannot pass Link as a prop). */
export type NextMantineAnchorProps = Omit<AnchorProps, "component"> & {
  href: string;
  children?: ReactNode;
};

export function NextMantineAnchor({ href, ...rest }: NextMantineAnchorProps) {
  return <Anchor component={Link} href={href} {...rest} />;
}

/** Use from Server Components instead of `<Button component={Link} />`. */
export type NextMantineButtonLinkProps = Omit<ButtonProps, "component"> & {
  href: string;
  children?: ReactNode;
};

export function NextMantineButtonLink({ href, ...rest }: NextMantineButtonLinkProps) {
  return <Button component={Link} href={href} {...rest} />;
}
