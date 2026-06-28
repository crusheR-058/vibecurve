// design-sync shim for `next/dynamic` — maps to React.lazy + Suspense so
// `dynamic(() => import("./X"), { ssr:false })` resolves the same module in a
// plain browser bundle. The `ssr` option is irrelevant (previews are client).
import { createElement, lazy, Suspense } from "react";

type Loader = () => Promise<unknown>;

export default function dynamic(loader: Loader, _options?: unknown) {
  const Lazy = lazy(async () => {
    const mod: any = await loader();
    return { default: mod?.default ?? mod };
  });
  return function Dynamic(props: Record<string, unknown>) {
    return createElement(Suspense, { fallback: null }, createElement(Lazy, props));
  };
}
