/* eslint-disable @next/next/no-img-element -- Small local design assets retain their original SVG geometry. */
"use client";
import { Drawer } from "antd";
import { useRef, useState, type FormEvent, type ReactNode } from "react";
import { InvoiceButton } from "@/app/_components/invoice-button";
import {
  emptyInvoice,
  normalizeInvoice,
  validateInvoice,
  type Address,
  type Invoice,
} from "../lib/invoice";
import { useInvoiceStore } from "../store";
type Props = { invoice?: Invoice; onClose: () => void };
type FormInvoice = Omit<Invoice, "items"> & {
  items: Array<
    Omit<Invoice["items"][number], "quantity" | "price"> & {
      quantity: string;
      price: string;
    }
  >;
};
export function InvoiceForm({ invoice, onClose }: Props) {
  const [values, setValues] = useState<FormInvoice>(() => {
    const initial = invoice ? structuredClone(invoice) : emptyInvoice();
    return {
      ...initial,
      items: initial.items.map((item) => ({
        ...item,
        quantity: String(item.quantity),
        price: String(item.price),
      })),
    };
  });
  const [errors, setErrors] = useState<Record<string, string>>({});
  const save = useInvoiceStore((state) => state.save);
  const theme = useInvoiceStore((state) => state.theme);
  const formRef = useRef<HTMLFormElement>(null);
  // Keep text while typing so intermediate decimals such as "125." survive.
  function toInvoice(draft = false): Invoice {
    return {
      ...values,
      items: values.items.map((item) => ({
        ...item,
        quantity:
          item.quantity === "" ? (draft ? 0 : NaN) : Number(item.quantity),
        price: item.price === "" ? (draft ? 0 : NaN) : Number(item.price),
      })),
    };
  }
  function field(
    name: string,
    label: string,
    value: string | number,
    onChange: (value: string) => void,
    type = "text",
    extra: Record<string, string | number> = {},
  ) {
    const error = errors[name];
    const id = `invoice-${name}`;
    return (
      <label
        className={`form-field ${error ? "field-error" : ""}`}
        htmlFor={id}
      >
        <span>
          {label}
          {error && <small id={`${id}-error`}>{error}</small>}
        </span>
        <input
          autoFocus={name === "senderAddress.street"}
          id={id}
          name={name}
          type={type}
          value={value}
          onChange={(event) => onChange(event.target.value)}
          aria-invalid={!!error}
          aria-describedby={error ? `${id}-error` : undefined}
          {...extra}
        />
      </label>
    );
  }
  function textField(
    name: "clientName" | "clientEmail" | "description" | "createdAt",
    label: string,
    type = "text",
  ) {
    return field(
      name,
      label,
      values[name],
      (value) => setValues((current) => ({ ...current, [name]: value })),
      type,
    );
  }
  function addressFields(group: "senderAddress" | "clientAddress") {
    const addressField = (key: keyof Address, label: string) =>
      field(`${group}.${key}`, label, values[group][key], (value) =>
        setValues((current) => ({
          ...current,
          [group]: { ...current[group], [key]: value },
        })),
      );
    return (
      <>
        {addressField("street", "Street Address")}
        <div className="address-grid">
          {addressField("city", "City")}
          {addressField("postCode", "Post Code")}
          {addressField("country", "Country")}
        </div>
      </>
    );
  }
  function submit(draft = false) {
    const next = toInvoice(draft);
    const nextErrors = draft ? {} : validateInvoice(next);
    setErrors(nextErrors);
    if (Object.keys(nextErrors).length) {
      requestAnimationFrame(() =>
        formRef.current
          ?.querySelector<HTMLInputElement>('[aria-invalid="true"]')
          ?.focus(),
      );
      return;
    }
    const status = draft
      ? "draft"
      : invoice?.status === "paid"
        ? "paid"
        : "pending";
    save({ ...next, status });
    onClose();
  }
  function updateItem(
    index: number,
    key: "name" | "quantity" | "price",
    value: string,
  ) {
    setValues((current) => ({
      ...current,
      items: current.items.map((item, i) =>
        i === index ? { ...item, [key]: value } : item,
      ),
    }));
  }
  const footer: ReactNode = (
    <div className="form-actions">
      {invoice ? (
        <>
          <InvoiceButton type="secondary" onClick={onClose}>
            Cancel
          </InvoiceButton>
          <InvoiceButton onClick={() => submit()}>Save Changes</InvoiceButton>
        </>
      ) : (
        <>
          <InvoiceButton type="secondary" onClick={onClose}>
            Discard
          </InvoiceButton>
          <div>
            <InvoiceButton type="black" onClick={() => submit(true)}>
              Save as Draft
            </InvoiceButton>
            <InvoiceButton onClick={() => submit()}>
              Save &amp; Send
            </InvoiceButton>
          </div>
        </>
      )}
    </div>
  );
  return (
    <Drawer
      open
      placement="left"
      size={616}
      rootClassName={`invoice-drawer drawer-${theme}`}
      title={invoice ? `Edit invoice ${invoice.id}` : "New Invoice"}
      styles={{ header: { display: "none" } }}
      closable={false}
      onClose={onClose}
      footer={footer}
    >
      <form
        ref={formRef}
        noValidate
        onSubmit={(event: FormEvent) => {
          event.preventDefault();
          submit();
        }}
      >
        <button
          type="button"
          className="back-link mobile-form-back"
          onClick={onClose}
        >
          <img src="/assets/icon-arrow-left.svg" alt="" />
          Go back
        </button>
        <h2>
          {invoice ? (
            <>
              Edit <span className="muted">#</span>
              {invoice.id}
            </>
          ) : (
            "New Invoice"
          )}
        </h2>
        <fieldset>
          <legend>Bill From</legend>
          {addressFields("senderAddress")}
        </fieldset>
        <fieldset>
          <legend>Bill To</legend>
          {textField("clientName", "Client’s Name")}
          {textField("clientEmail", "Client’s Email", "email")}
          {addressFields("clientAddress")}
        </fieldset>
        <div className="date-grid">
          {textField("createdAt", "Invoice Date", "date")}
          <label className="form-field">
            <span>Payment Terms</span>
            <select
              value={values.paymentTerms}
              onChange={(event) =>
                setValues((current) => ({
                  ...current,
                  paymentTerms: Number(event.target.value),
                }))
              }
            >
              {[1, 7, 14, 30].map((days) => (
                <option key={days} value={days}>
                  Net {days} {days === 1 ? "Day" : "Days"}
                </option>
              ))}
            </select>
          </label>
        </div>
        {textField("description", "Project Description")}
        <section className="item-editor">
          <h3>Item List</h3>
          {values.items.map((item, index) => (
            <div className="item-grid" key={index}>
              {field(`items.${index}.name`, "Item Name", item.name, (value) =>
                updateItem(index, "name", value),
              )}
              {field(
                `items.${index}.quantity`,
                "Qty.",
                item.quantity,
                (value) => updateItem(index, "quantity", value),
                "number",
                { min: 1, step: 1 },
              )}
              {field(
                `items.${index}.price`,
                "Price",
                item.price,
                (value) => updateItem(index, "price", value),
                "number",
                { min: 0, step: "0.01" },
              )}
              <div className="item-total">
                <span>Total</span>
                <strong>
                  {normalizeInvoice(toInvoice(true)).items[index].total.toFixed(
                    2,
                  )}
                </strong>
              </div>
              <button
                type="button"
                className="delete-item"
                aria-label={`Delete item ${index + 1}`}
                onClick={() =>
                  setValues((current) => ({
                    ...current,
                    items: current.items.filter((_, i) => i !== index),
                  }))
                }
              >
                <img src="/assets/icon-delete.svg" alt="" />
              </button>
            </div>
          ))}
          <InvoiceButton
            type="wide"
            onClick={() =>
              setValues((current) => ({
                ...current,
                items: [
                  ...current.items,
                  { name: "", quantity: "1", price: "0", total: 0 },
                ],
              }))
            }
          >
            + Add New Item
          </InvoiceButton>
        </section>
        {!!Object.keys(errors).length && (
          <div className="form-errors" role="alert">
            <p>Check the highlighted fields before saving.</p>
            {errors.items && <p>{errors.items}</p>}
          </div>
        )}
      </form>
    </Drawer>
  );
}
