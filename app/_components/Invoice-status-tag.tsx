"use client";
import { Tag } from "antd";
export function InvoiceStatusTag({ value }: { value: string }) {
  return (
    <Tag variant="filled" className={`status status-${value.toLowerCase()}`}>
      <span className="status-dot" />
      {value}
    </Tag>
  );
}
