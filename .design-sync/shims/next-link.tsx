// design-sync shim for `next/link` — VibeCurve previews render outside Next,
// so there is no router context. Plain anchor keeps markup + classNames intact.
import * as React from "react";

type LinkProps = {
  href?: string | { pathname?: string };
  children?: React.ReactNode;
  className?: string;
  [key: string]: unknown;
};

export default function Link({ href, children, ...rest }: LinkProps) {
  const url = typeof href === "string" ? href : href?.pathname ?? "#";
  return React.createElement("a", { href: url, ...rest }, children as React.ReactNode);
}
