import type { IInvoice } from "@/app/_interfaces/invoice";
export type Invoice = IInvoice;
export type Address = Invoice["senderAddress"];
export const STATUS_FILTER_MAP = {
  draft: "Draft",
  pending: "Pending",
  paid: "Paid",
};
export const money = (value: number) =>
  `£ ${new Intl.NumberFormat("en-GB", { minimumFractionDigits: 2, maximumFractionDigits: 2 }).format(value)}`;
export const formatDate = (value: string) =>
  value
    ? new Intl.DateTimeFormat("en-GB", {
        day: "2-digit",
        month: "short",
        year: "numeric",
        timeZone: "UTC",
      }).format(new Date(`${value}T00:00:00Z`))
    : "Not set";
export function paymentDue(date: string, days: number) {
  if (!date) return "";
  const result = new Date(`${date}T00:00:00Z`);
  result.setUTCDate(result.getUTCDate() + days);
  return result.toISOString().slice(0, 10);
}
export function normalizeInvoice(invoice: Invoice): Invoice {
  const items = invoice.items.map((item) => ({
    ...item,
    total: Math.round(item.quantity * item.price * 100) / 100,
  }));
  return {
    ...invoice,
    items,
    paymentDue: paymentDue(invoice.createdAt, invoice.paymentTerms),
    total:
      Math.round(items.reduce((sum, item) => sum + item.total, 0) * 100) / 100,
  };
}
export function createId(existing: Invoice[]) {
  let id: string;
  do {
    const values = crypto.getRandomValues(new Uint32Array(3));
    id =
      String.fromCharCode(65 + (values[0] % 26), 65 + (values[1] % 26)) +
      String(values[2] % 10000).padStart(4, "0");
  } while (existing.some((invoice) => invoice.id === id));
  return id;
}
export function emptyInvoice(): Invoice {
  const address = { street: "", city: "", postCode: "", country: "" };
  const now = new Date();
  const today = `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, "0")}-${String(now.getDate()).padStart(2, "0")}`;
  return {
    id: "",
    createdAt: today,
    paymentDue: "",
    description: "",
    paymentTerms: 30,
    clientName: "",
    clientEmail: "",
    status: "draft",
    senderAddress: { ...address },
    clientAddress: { ...address },
    items: [{ name: "", quantity: 1, price: 0, total: 0 }],
    total: 0,
  };
}
export function validateInvoice(invoice: Invoice) {
  const errors: Record<string, string> = {};
  for (const key of [
    "clientName",
    "clientEmail",
    "description",
    "createdAt",
  ] as const)
    if (!invoice[key].trim()) errors[key] = "can't be empty";
  if (
    invoice.clientEmail &&
    !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(invoice.clientEmail)
  )
    errors.clientEmail = "must be a valid email";
  for (const group of ["senderAddress", "clientAddress"] as const)
    for (const key of ["street", "city", "postCode", "country"] as const)
      if (!invoice[group][key].trim())
        errors[`${group}.${key}`] = "can't be empty";
  if (!invoice.items.length) errors.items = "Add at least one item";
  invoice.items.forEach((item, index) => {
    if (!item.name.trim()) errors[`items.${index}.name`] = "can't be empty";
    if (
      !Number.isFinite(item.quantity) ||
      item.quantity <= 0 ||
      !Number.isInteger(item.quantity)
    )
      errors[`items.${index}.quantity`] = "use a whole number above zero";
    if (!Number.isFinite(item.price) || item.price < 0)
      errors[`items.${index}.price`] = "must be zero or more";
  });
  return errors;
}
