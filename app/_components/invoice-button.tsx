/* eslint-disable @next/next/no-img-element -- Original local SVG icon. */
"use client";
import { Button, ConfigProvider, type ButtonProps } from "antd";
import { useInvoiceStore } from "@/features/invoices/store";
type InvoiceButtonProps = Omit<ButtonProps, "type"> & {
  type?: "primary" | "secondary" | "create" | "danger" | "black" | "wide";
};
export function InvoiceButton({
  type = "primary",
  className = "",
  children,
  ...props
}: InvoiceButtonProps) {
  const dark = useInvoiceStore((state) => state.theme === "dark");
  const secondary = type === "secondary" || type === "wide";
  const background = secondary
    ? dark
      ? "#252945"
      : "#f9fafe"
    : type === "black"
      ? "#373b53"
      : "#7c5dfa";
  const color = secondary
    ? dark
      ? "#dfe3fa"
      : "#7e88c3"
    : type === "black"
      ? "#888eb0"
      : "#fff";
  return (
    <ConfigProvider
      theme={{
        token: {
          colorPrimary: background,
          colorPrimaryHover: secondary
            ? dark
              ? "#1e2139"
              : "#dfe3fa"
            : type === "black"
              ? "#0c0e16"
              : "#9277ff",
        },
        components: {
          Button: {
            primaryColor: color,
            primaryShadow: "none",
            dangerShadow: "none",
            paddingInline: 24,
            borderRadius: 24,
          },
        },
      }}
    >
      <Button
        {...props}
        type="primary"
        danger={type === "danger"}
        block={type === "wide"}
        className={`invoice-button button-${type} ${className}`}
        icon={
          type === "create" ? (
            <span className="plus-circle">
              <img src="/assets/icon-plus.svg" alt="" />
            </span>
          ) : (
            props.icon
          )
        }
      >
        <span>{children}</span>
      </Button>
    </ConfigProvider>
  );
}
