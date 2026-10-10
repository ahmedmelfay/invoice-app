/* eslint-disable @next/next/no-img-element -- Original local SVG icons. */
"use client";
import {
  Alert,
  Button,
  ConfigProvider,
  DatePicker,
  Drawer,
  Form,
  Input,
  InputNumber,
  Select,
} from "antd";
import dayjs, { type Dayjs } from "dayjs";
import { useState } from "react";
import { InvoiceButton } from "@/app/_components/invoice-button";
import { emptyInvoice, type Address, type Invoice } from "../lib/invoice";
import { useInvoiceStore } from "../store";

type Props = { invoice?: Invoice; onClose: () => void };
type Values = Omit<Invoice, "createdAt" | "items"> & {
  createdAt: Dayjs | null;
  items: {
    name: string;
    quantity: number | null;
    price: number | null;
    total: number;
  }[];
};
const required = {
  required: true,
  whitespace: true,
  message: "can't be empty",
};
export function InvoiceForm({ invoice, onClose }: Props) {
  const [form] = Form.useForm<Values>();
  const [failed, setFailed] = useState(false);
  const [open, setOpen] = useState(true);
  const close = () => setOpen(false);
  const save = useInvoiceStore((state) => state.save);
  const theme = useInvoiceStore((state) => state.theme);
  const initial = invoice ?? emptyInvoice();
  const items = Form.useWatch("items", form) as Values["items"] | undefined;
  function persist(values: Values, draft = false) {
    if (!open) return;
    save({
      ...initial,
      ...values,
      createdAt: values.createdAt?.format("YYYY-MM-DD") ?? "",
      items: (values.items ?? []).map((item) => ({
        ...item,
        quantity: Number(item.quantity ?? 0),
        price: Number(item.price ?? 0),
      })),
      status: draft ? "draft" : invoice?.status === "paid" ? "paid" : "pending",
    });
    close();
  }
  function textField(name: string | string[], label: string, email = false) {
    return (
      <Form.Item
        name={name}
        label={label}
        rules={[
          required,
          ...(email
            ? [{ type: "email" as const, message: "must be a valid email" }]
            : []),
        ]}
      >
        <Input
          name={Array.isArray(name) ? name.join(".") : name}
          autoFocus={
            Array.isArray(name) && name.join(".") === "senderAddress.street"
          }
        />
      </Form.Item>
    );
  }
  function addressFields(group: "senderAddress" | "clientAddress") {
    return (
      <>
        {textField([group, "street"], "Street Address")}
        <div className="address-grid">
          {(
            [
              ["city", "City"],
              ["postCode", "Post Code"],
              ["country", "Country"],
            ] as [keyof Address, string][]
          ).map(([key, label]) => (
            <div key={key}>{textField([group, key], label)}</div>
          ))}
        </div>
      </>
    );
  }
  return (
    <ConfigProvider
      theme={{
        token: { colorBgContainer: theme === "dark" ? "#1e2139" : "#ffffff" },
      }}
    >
      <Drawer
        open={open}
        afterOpenChange={(visible) => {
          // Unmount only once Ant Design has finished sliding out.
          if (!visible) onClose();
        }}
        placement="left"
        size={616}
        rootClassName={`invoice-drawer drawer-${theme}`}
        title={invoice ? `Edit invoice ${invoice.id}` : "New Invoice"}
        styles={{
          header: { display: "none" },
          section: { background: theme === "dark" ? "#141625" : "#fff" },
        }}
        closable={false}
        onClose={close}
        footer={
          <div className="form-actions">
            <InvoiceButton type="secondary" onClick={close}>
              {invoice ? "Cancel" : "Discard"}
            </InvoiceButton>
            <div>
              {!invoice && (
                <InvoiceButton
                  type="black"
                  onClick={() => persist(form.getFieldsValue(true), true)}
                >
                  Save as Draft
                </InvoiceButton>
              )}
              <InvoiceButton onClick={() => form.submit()}>
                {invoice ? "Save Changes" : "Save & Send"}
              </InvoiceButton>
            </div>
          </div>
        }
      >
        <Form
          form={form}
          name="invoice"
          layout="vertical"
          requiredMark={false}
          initialValues={{
            ...initial,
            createdAt: initial.createdAt ? dayjs(initial.createdAt) : null,
          }}
          scrollToFirstError={{ focus: true }}
          onFinish={(values) => persist(values)}
          onFinishFailed={() => setFailed(true)}
        >
          <Button
            type="text"
            className="back-link mobile-form-back"
            onClick={close}
            icon={<img src="/assets/icon-arrow-left.svg" alt="" />}
          >
            Go back
          </Button>
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
            {textField("clientEmail", "Client’s Email", true)}
            {addressFields("clientAddress")}
          </fieldset>
          <div className="date-grid">
            <Form.Item
              name="createdAt"
              label="Invoice Date"
              rules={[{ required: true, message: "can't be empty" }]}
            >
              <DatePicker name="createdAt" format="YYYY-MM-DD" />
            </Form.Item>
            <Form.Item
              name="paymentTerms"
              label="Payment Terms"
              rules={[{ required: true }]}
            >
              <Select
                aria-label="Payment Terms"
                options={[1, 7, 14, 30].map((value) => ({
                  value,
                  label: `Net ${value} ${value === 1 ? "Day" : "Days"}`,
                }))}
              />
            </Form.Item>
          </div>
          {textField("description", "Project Description")}
          <section className="item-editor">
            <h3>Item List</h3>
            <Form.List
              name="items"
              rules={[
                {
                  validator: async (_, value) => {
                    if (!value?.length)
                      throw new Error("Add at least one item");
                  },
                },
              ]}
            >
              {(fields, { add, remove }, { errors }) => (
                <>
                  {fields.map(({ key, name }) => (
                    <div className="item-grid" key={key}>
                      <Form.Item
                        name={[name, "name"]}
                        label="Item Name"
                        rules={[required]}
                      >
                        <Input name={`items.${name}.name`} />
                      </Form.Item>
                      <Form.Item
                        name={[name, "quantity"]}
                        label="Qty."
                        rules={[
                          {
                            required: true,
                            type: "integer",
                            min: 1,
                            message: "use a whole number above zero",
                          },
                        ]}
                      >
                        <InputNumber
                          name={`items.${name}.quantity`}
                          controls={false}
                        />
                      </Form.Item>
                      <Form.Item
                        name={[name, "price"]}
                        label="Price"
                        rules={[
                          {
                            required: true,
                            type: "number",
                            min: 0,
                            message: "must be zero or more",
                          },
                        ]}
                      >
                        <InputNumber
                          name={`items.${name}.price`}
                          controls={false}
                          step={0.01}
                        />
                      </Form.Item>
                      <div className="item-total">
                        <span>Total</span>
                        <strong>
                          {(
                            Math.round(
                              Number(items?.[name]?.quantity ?? 0) *
                                Number(items?.[name]?.price ?? 0) *
                                100,
                            ) / 100
                          ).toFixed(2)}
                        </strong>
                      </div>
                      <Button
                        type="text"
                        className="delete-item"
                        aria-label={`Delete item ${name + 1}`}
                        onClick={() => remove(name)}
                        icon={<img src="/assets/icon-delete.svg" alt="" />}
                      />
                    </div>
                  ))}
                  <InvoiceButton
                    type="wide"
                    onClick={() =>
                      add({ name: "", quantity: 1, price: 0, total: 0 })
                    }
                  >
                    + Add New Item
                  </InvoiceButton>
                  <Form.ErrorList errors={errors} />
                </>
              )}
            </Form.List>
          </section>
          {failed && (
            <Alert
              className="form-errors"
              type="error"
              title="Check the highlighted fields before saving."
            />
          )}
        </Form>
      </Drawer>
    </ConfigProvider>
  );
}
