import { test } from "node:test";
import assert from "node:assert/strict";
import fs from "node:fs";
import { fileURLToPath } from "node:url";
import Module from "node:module";
import ts from "typescript";
const filename = fileURLToPath(new URL("../features/invoices/lib/invoice.ts", import.meta.url));
const compiled = ts.transpileModule(fs.readFileSync(filename, "utf8"), {
  compilerOptions: { module: ts.ModuleKind.CommonJS, target: ts.ScriptTarget.ES2020 },
}).outputText;
const domain = new Module(filename);
domain._compile(compiled, filename);
const { paymentDue, normalizeInvoice, emptyInvoice, validateInvoice, createId } = domain.exports;
const seed = JSON.parse(fs.readFileSync(new URL("../app/_data.json", import.meta.url), "utf8"));

test("payment terms cross month, leap-year, and year boundaries", () => {
  assert.equal(paymentDue("2024-02-28", 1), "2024-02-29");
  assert.equal(paymentDue("2025-02-28", 1), "2025-03-01");
  assert.equal(paymentDue("2025-12-31", 30), "2026-01-30");
  assert.equal(paymentDue("", 30), "");
});
test("totals are recalculated from line items and rounded to pennies", () => {
  const invoice = { ...seed[0], items: [{ name: "Design", quantity: 3, price: 0.1, total: 999 }, { name: "Review", quantity: 2, price: 12.35, total: 0 }], total: 999 };
  const result = normalizeInvoice(invoice);
  assert.equal(result.total, 25);
  assert.equal(result.items[0].total, 0.3);
  assert.equal(invoice.total, 999);
});
test("pending invoices require addresses, contact details, and items", () => {
  const errors = validateInvoice(emptyInvoice());
  assert.ok(errors.clientName);
  assert.ok(errors["senderAddress.street"]);
  assert.ok(errors["clientAddress.country"]);
  assert.ok(errors["items.0.name"]);
  assert.deepEqual(validateInvoice(seed[0]), {});
});
test("invalid email, fractional quantity, negative price, and empty items are rejected", () => {
  const invoice = { ...seed[0], clientEmail: "invalid", items: [{ name: "Design", quantity: 0.5, price: -1, total: 0 }] };
  const errors = validateInvoice(invoice);
  assert.ok(errors.clientEmail);
  assert.ok(errors["items.0.quantity"]);
  assert.ok(errors["items.0.price"]);
  assert.ok(validateInvoice({ ...seed[0], items: [] }).items);
});
test("generated invoice IDs use two letters and four digits without collisions", () => {
  const invoices = [...seed];
  for (let index = 0; index < 100; index++) {
    const id = createId(invoices);
    assert.match(id, /^[A-Z]{2}\d{4}$/);
    assert.ok(!invoices.some(invoice => invoice.id === id));
    invoices.push({ ...seed[0], id });
  }
});
