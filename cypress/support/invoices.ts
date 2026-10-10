import type { IInvoice } from "../../app/_interfaces/invoice";

const address = {
  street: "19 Union Terrace",
  city: "London",
  postCode: "E1 3EZ",
  country: "United Kingdom",
};
export const invoices: IInvoice[] = [
  {
    id: "AA1001",
    createdAt: "2030-01-01",
    paymentDue: "2030-01-08",
    paymentTerms: 7,
    description: "Brand design",
    clientName: "Paid Client",
    clientEmail: "paid@example.com",
    status: "paid",
    senderAddress: address,
    clientAddress: address,
    items: [
      { name: "Brand Guidelines", quantity: 1, price: 1800.9, total: 1800.9 },
    ],
    total: 1800.9,
  },
  {
    id: "BB2002",
    createdAt: "2030-01-21",
    paymentDue: "2030-02-20",
    paymentTerms: 30,
    description: "Graphic Design",
    clientName: "Pending Client",
    clientEmail: "pending@example.com",
    status: "pending",
    senderAddress: address,
    clientAddress: address,
    items: [
      { name: "Banner Design", quantity: 1, price: 156, total: 156 },
      { name: "Email Design", quantity: 2, price: 200, total: 400 },
    ],
    total: 556,
  },
  {
    id: "CC3003",
    createdAt: "2030-01-01",
    paymentDue: "2030-01-31",
    paymentTerms: 30,
    description: "",
    clientName: "Draft Client",
    clientEmail: "",
    status: "draft",
    senderAddress: address,
    clientAddress: address,
    items: [],
    total: 0,
  },
];

// Each visit installs deterministic data before Zustand hydrates. Cypress also
// clears cookies and storage between tests; it never uses the user's browser.
export function visitInvoices(path = "/", records = invoices) {
  cy.visit(path, {
    onBeforeLoad(win) {
      win.localStorage.setItem(
        "invoice-app-v1",
        JSON.stringify({
          state: { invoices: records, theme: "light" },
          version: 1,
        }),
      );
    },
  });
  cy.get('.app-shell[data-theme="light"]').should("be.visible");
}

export function input(name: string) {
  return cy.get(`input[name="${name}"]`).scrollIntoView().should("be.visible");
}

export function openNewInvoice() {
  cy.contains("button", /^New(?: Invoice)?$/)
    .should("be.enabled")
    .click();
  cy.get('[role="dialog"]').should("be.visible");
}

export function fillInvoice() {
  for (const group of ["senderAddress", "clientAddress"]) {
    input(`${group}.street`).clear().type("1 Test Street");
    input(`${group}.city`).clear().type("London");
    input(`${group}.postCode`).clear().type("SW1A 1AA");
    input(`${group}.country`).clear().type("United Kingdom");
  }
  input("clientName").clear().type("Cypress Client");
  input("clientEmail").clear().type("cypress@example.com");
  input("createdAt").clear().type("2030-01-28{enter}");
  cy.get(".ant-select").click();
  cy.get(".ant-select-dropdown:visible").contains("Net 7 Days").click();
  input("description").clear().type("Website design");
  input("items.0.name").clear().type("Design");
  input("items.0.quantity").clear().type("2");
  input("items.0.price").clear().type("125.50");
}

export function expectNoHorizontalOverflow() {
  cy.document().should((doc) => {
    expect(doc.documentElement.scrollWidth).to.be.at.most(
      doc.documentElement.clientWidth,
    );
  });
}
