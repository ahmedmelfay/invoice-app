/* eslint-disable @next/next/no-img-element -- Small local design assets retain their original SVG geometry. */
"use client";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { Empty, Modal, Table } from "antd";
import { useState } from "react";
import { InvoiceButton } from "@/app/_components/invoice-button";
import { InvoiceStatusTag } from "@/app/_components/Invoice-status-tag";
import { useInvoiceStore } from "../store";
import {
  formatDate,
  money,
  STATUS_FILTER_MAP,
  type Address,
} from "../lib/invoice";
import { InvoiceForm } from "./invoice-form";
function AddressLines({ address }: { address: Address }) {
  return (
    <address>
      {Object.values(address).map((line, index) => (
        <span key={index}>{line || "—"}</span>
      ))}
    </address>
  );
}
export function InvoiceDetails({ id }: { id: string }) {
  const invoice = useInvoiceStore((state) =>
    state.invoices.find((item) => item.id === id),
  );
  const ready = useInvoiceStore((state) => state.ready);
  const remove = useInvoiceStore((state) => state.remove);
  const markPaid = useInvoiceStore((state) => state.markPaid);
  const router = useRouter();
  const [editing, setEditing] = useState(false);
  const [deleting, setDeleting] = useState(false);
  const back = (
    <Link href="/" className="back-link">
      <img src="/assets/icon-arrow-left.svg" alt="" />
      Go back
    </Link>
  );
  if (!ready) return <p role="status">Loading invoice…</p>;
  if (!invoice)
    return (
      <>
        {back}
        <section className="empty-state">
          <Empty
            description={
              <>
                <h1>Invoice not found</h1>
                <p>This invoice may have been deleted.</p>
              </>
            }
          />
        </section>
      </>
    );
  return (
    <div className="details-page">
      {back}
      <header className="details-toolbar">
        <div className="status-group">
          <span>Status</span>
          <InvoiceStatusTag value={STATUS_FILTER_MAP[invoice.status]} />
        </div>
        <div className="invoice-actions">
          <InvoiceButton type="secondary" onClick={() => setEditing(true)}>
            Edit
          </InvoiceButton>
          <InvoiceButton type="danger" onClick={() => setDeleting(true)}>
            Delete
          </InvoiceButton>
          {invoice.status === "pending" && (
            <InvoiceButton onClick={() => markPaid(id)}>
              Mark as Paid
            </InvoiceButton>
          )}
        </div>
      </header>
      <article className="invoice-document">
        <div className="document-heading">
          <div>
            <h1 className="invoice-id">
              <span>#</span>
              {invoice.id}
            </h1>
            <p>{invoice.description || "No description"}</p>
          </div>
          <AddressLines address={invoice.senderAddress} />
        </div>
        <div className="document-meta">
          <div className="invoice-dates">
            <div>
              <p>Invoice Date</p>
              <strong>{formatDate(invoice.createdAt)}</strong>
            </div>
            <div>
              <p>Payment Due</p>
              <strong>{formatDate(invoice.paymentDue)}</strong>
            </div>
          </div>
          <div>
            <p>Bill To</p>
            <strong>{invoice.clientName || "Unnamed client"}</strong>
            <AddressLines address={invoice.clientAddress} />
          </div>
          <div className="sent-to">
            <p>Sent to</p>
            <strong>{invoice.clientEmail || "Not set"}</strong>
          </div>
        </div>
        <div className="line-items">
          <Table
            className="invoice-items-table"
            pagination={false}
            size="small"
            rowKey="key"
            dataSource={invoice.items.map((item, key) => ({ ...item, key }))}
            columns={[
              {
                title: "Item Name",
                dataIndex: "name",
                render: (name, item) => (
                  <>
                    <strong>{name || "Unnamed item"}</strong>
                    <span className="mobile-item-price">
                      {item.quantity} x {money(item.price)}
                    </span>
                  </>
                ),
              },
              {
                title: "QTY.",
                dataIndex: "quantity",
                align: "right",
                responsive: ["md"],
              },
              {
                title: "Price",
                dataIndex: "price",
                align: "right",
                responsive: ["md"],
                render: money,
              },
              {
                title: "Total",
                dataIndex: "total",
                align: "right",
                render: money,
              },
            ]}
          />
          <div className="amount-due">
            <span>Amount Due</span>
            <strong>{money(invoice.total)}</strong>
          </div>
        </div>
      </article>
      <Modal
        open={deleting}
        getContainer={false}
        centered
        closable={false}
        title="Confirm Deletion"
        onCancel={() => setDeleting(false)}
        className="delete-modal"
        width={480}
        footer={
          <>
            <InvoiceButton type="secondary" onClick={() => setDeleting(false)}>
              Cancel
            </InvoiceButton>
            <InvoiceButton
              type="danger"
              onClick={() => {
                remove(id);
                router.replace("/");
              }}
            >
              Delete
            </InvoiceButton>
          </>
        }
      >
        <p>
          Are you sure you want to delete invoice #{id}? This action cannot be
          undone.
        </p>
      </Modal>
      {editing && (
        <InvoiceForm invoice={invoice} onClose={() => setEditing(false)} />
      )}
    </div>
  );
}
