import { InvoiceDetails } from "@/features/invoices/components/invoice-details";
export default async function InvoicePage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  return <InvoiceDetails id={id} />;
}
