/* eslint-disable @next/next/no-img-element -- Small local design assets retain their original SVG geometry. */
"use client";
import Link from "next/link";
import { Checkbox, Dropdown } from "antd";
import { useState } from "react";
import { InvoiceButton } from "@/app/_components/invoice-button";
import { InvoiceStatusTag } from "@/app/_components/Invoice-status-tag";
import { useInvoiceStore } from "../store";
import {
  formatDate,
  money,
  STATUS_FILTER_MAP,
  type Invoice,
} from "../lib/invoice";
import { InvoiceForm } from "./invoice-form";
export function InvoiceList() {
  const invoices = useInvoiceStore((state) => state.invoices);
  const ready = useInvoiceStore((state) => state.ready);
  const [filters, setFilters] = useState<Invoice["status"][]>([]);
  const [creating, setCreating] = useState(false);
  const visible = invoices.filter(
    (invoice) => !filters.length || filters.includes(invoice.status),
  );
  return (
    <>
      <header className="list-header">
        <div>
          <h1>Invoices</h1>
          <p className="desktop-count">
            {visible.length
              ? `There ${visible.length === 1 ? "is" : "are"} ${visible.length} ${filters.length ? "matching" : "total"} ${visible.length === 1 ? "invoice" : "invoices"}`
              : "No invoices"}
          </p>
          <p className="mobile-count">
            {visible.length} {visible.length === 1 ? "invoice" : "invoices"}
          </p>
        </div>
        <div className="list-controls">
          <Dropdown
            trigger={["click"]}
            getPopupContainer={(trigger) => trigger.parentElement!}
            popupRender={() => (
              <div className="filter-menu">
                {(Object.keys(STATUS_FILTER_MAP) as Invoice["status"][]).map(
                  (status) => (
                    <Checkbox
                      key={status}
                      checked={filters.includes(status)}
                      onChange={(event) =>
                        setFilters((current) =>
                          event.target.checked
                            ? [...current, status]
                            : current.filter((value) => value !== status),
                        )
                      }
                    >
                      {STATUS_FILTER_MAP[status]}
                    </Checkbox>
                  ),
                )}
              </div>
            )}
          >
            <button className="filter-button">
              <span className="desktop-label">Filter by status</span>
              <span className="mobile-label">Filter</span>
              <img src="/assets/icon-arrow-down.svg" alt="" />
            </button>
          </Dropdown>
          <InvoiceButton
            type="create"
            disabled={!ready}
            onClick={() => setCreating(true)}
          >
            New<span className="desktop-label"> Invoice</span>
          </InvoiceButton>
        </div>
      </header>
      <div className="invoice-list">
        {visible.map((invoice) => (
          <Link
            href={`/invoices/${invoice.id}`}
            key={invoice.id}
            className="invoice-row"
            aria-label={`View invoice ${invoice.id} for ${invoice.clientName || "unnamed client"}`}
          >
            <strong className="invoice-id">
              <span>#</span>
              {invoice.id}
            </strong>
            <span className="invoice-due">
              Due&nbsp; {formatDate(invoice.paymentDue)}
            </span>
            <span className="invoice-client">
              {invoice.clientName || "Unnamed client"}
            </span>
            <strong className="invoice-total">{money(invoice.total)}</strong>
            <InvoiceStatusTag value={STATUS_FILTER_MAP[invoice.status]} />
            <img
              className="row-arrow"
              src="/assets/icon-arrow-right.svg"
              alt=""
            />
          </Link>
        ))}
      </div>
      {!visible.length && (
        <section className="empty-state">
          <img src="/assets/illustration-empty.svg" alt="" />
          <h2>There is nothing here</h2>
          <p>
            {filters.length ? (
              "No invoices match your selected filters."
            ) : (
              <>
                Create an invoice by clicking the
                <br />
                <strong>New Invoice</strong> button and get started
              </>
            )}
          </p>
        </section>
      )}
      {creating && <InvoiceForm onClose={() => setCreating(false)} />}
    </>
  );
}
