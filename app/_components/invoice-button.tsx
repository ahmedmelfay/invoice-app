/* eslint-disable @next/next/no-img-element -- Small local design assets retain their original SVG geometry. */
"use client";
import { Button, type ButtonProps } from "antd";
type InvoiceButtonProps = Omit<ButtonProps, "type"> & { type?: "primary" | "secondary" | "create" | "danger" | "black" | "wide" };
export function InvoiceButton({ type = "primary", className = "", children, ...props }: InvoiceButtonProps) {
  return <Button {...props} className={`invoice-button button-${type} ${className}`} icon={type === "create" ? <span className="plus-circle"><img src="/assets/icon-plus.svg" alt="" /></span> : props.icon}><span>{children}</span></Button>;
}

