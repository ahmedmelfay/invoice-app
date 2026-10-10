/* eslint-disable @next/next/no-img-element -- Small local design assets retain their original SVG geometry. */
"use client";
import { ConfigProvider, theme as antdTheme } from "antd";
import Link from "next/link";
import { useEffect, type ReactNode } from "react";
import { useInvoiceStore } from "../store";
export function AppShell({ children }: { children: ReactNode }) {
  const theme = useInvoiceStore((state) => state.theme);
  const toggleTheme = useInvoiceStore((state) => state.toggleTheme);
  useEffect(() => {
    Promise.resolve(useInvoiceStore.persist.rehydrate()).finally(() =>
      useInvoiceStore.getState().setReady(),
    );
  }, []);
  return (
    <ConfigProvider
      theme={{
        algorithm:
          theme === "dark"
            ? antdTheme.darkAlgorithm
            : antdTheme.defaultAlgorithm,
        token: {
          colorPrimary: "#7c5dfa",
          fontFamily: '"League Spartan", sans-serif',
          borderRadius: 4,
          controlHeight: 48,
        },
      }}
    >
      <div className="app-shell" data-theme={theme}>
        <a href="#main-content" className="skip-link">
          Skip to content
        </a>
        <aside className="sidebar" aria-label="Application navigation">
          <Link href="/" className="brand" aria-label="Invoice home">
            <picture>
              <source media="(max-width: 1100px)" srcSet="/assets/logo.svg" />
              <img src="/assets/logo-desktop.svg" alt="" />
            </picture>
          </Link>
          <button
            className="theme-toggle"
            onClick={toggleTheme}
            aria-label={`Switch to ${theme === "light" ? "dark" : "light"} mode`}
          >
            <img
              src={`/assets/icon-${theme === "light" ? "moon" : "sun"}.svg`}
              alt=""
            />
          </button>
          <div className="avatar">
            <img
              src="/assets/image-avatar.jpg"
              width="40"
              height="40"
              alt="Your profile"
            />
          </div>
        </aside>
        <main id="main-content" className="main-content">
          {children}
        </main>
      </div>
    </ConfigProvider>
  );
}
