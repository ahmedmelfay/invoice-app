export function InvoiceStatusTag({ value }: { value: string }) {
  return <span className={`status status-${value.toLowerCase()}`}><span className="status-dot" />{value}</span>;
}
