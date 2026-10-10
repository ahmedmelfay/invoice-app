import { fillInvoice, input, openNewInvoice, visitInvoices } from "../support/invoices";

describe("Invoice creation and editing", () => {
  it("validates required fields and moves focus to the first invalid field", () => {
    visitInvoices();
    openNewInvoice();
    cy.contains("button", "Save & Send").click();
    cy.get('form [role="alert"]').should("contain.text", "Check the highlighted fields");
    input("senderAddress.street").should("have.attr", "aria-invalid", "true").and("be.focused");
    cy.get('form [aria-invalid="true"]').should("have.length.at.least", 10);
    cy.get('[role="dialog"]').should("be.visible");
    cy.get('a[href^="/invoices/"]').should("have.length", 3);
  });

  it("validates email, quantity, and price without saving an invalid invoice", () => {
    visitInvoices();
    openNewInvoice();
    fillInvoice();
    input("clientEmail").clear().type("invalid");
    input("items.0.quantity").clear().type("0.5");
    input("items.0.price").clear().type("-1");
    cy.contains("button", "Save & Send").click();
    input("clientEmail").should("have.attr", "aria-invalid", "true");
    input("items.0.quantity").should("have.attr", "aria-invalid", "true");
    input("items.0.price").should("have.attr", "aria-invalid", "true");
    cy.get('[role="dialog"]').should("be.visible");
  });

  it("saves a blank draft with a generated ID and restores it after refresh", () => {
    visitInvoices();
    openNewInvoice();
    input("createdAt").clear();
    cy.contains("button", "Save as Draft").click();
    cy.get('[role="dialog"]').should("not.exist");
    cy.get('a[href^="/invoices/"]').should("have.length", 4);
    cy.contains("a", "Unnamed client").should("contain.text", "Draft").invoke("attr", "href").then(href => {
      expect(href).to.match(/^\/invoices\/[A-Z]{2}\d{4}$/);
      cy.reload();
      cy.get(`a[href="${href}"]`).click();
      cy.get(".status-group").should("contain.text", "Draft");
      cy.get(".amount-due").should("contain.text", "£ 0.00");
      cy.contains("strong", "Not set").should("be.visible");
    });
  });

  it("creates a pending invoice with calculated totals and payment due date", () => {
    visitInvoices();
    openNewInvoice();
    fillInvoice();
    cy.contains("button", "Save & Send").click();
    cy.get('[role="dialog"]').should("not.exist");
    cy.contains("a", "Cypress Client").should("contain.text", "Pending").and("contain.text", "£ 251.00").click();
    cy.get(".invoice-document").should("contain.text", "04 Feb 2030");
    cy.get(".amount-due").should("contain.text", "£ 251.00");
    cy.reload();
    cy.get(".invoice-document").should("contain.text", "Cypress Client");
  });

  it("adds and removes line items and rejects an invoice with no items", () => {
    visitInvoices();
    openNewInvoice();
    fillInvoice();
    cy.contains("button", "+ Add New Item").click();
    input("items.1.name").type("Review");
    input("items.1.quantity").clear().type("3");
    input("items.1.price").clear().type("0.10");
    cy.get(".item-total").last().should("contain.text", "0.30");
    cy.get('[aria-label="Delete item 1"]').click();
    input("items.0.name").should("have.value", "Review");
    cy.get('[aria-label="Delete item 1"]').click();
    cy.contains("button", "Save & Send").click();
    cy.get('form [role="alert"]').should("contain.text", "Add at least one item");
    cy.contains("button", "+ Add New Item").click();
    input("items.0.name").type("Review");
    input("items.0.price").clear().type("12.35");
    cy.contains("button", "Save & Send").click();
    cy.get('[role="dialog"]').should("not.exist");
    cy.contains("a", "Cypress Client").should("contain.text", "£ 12.35");
  });

  it("discards a new invoice and resets unsaved edits when cancelled", () => {
    visitInvoices();
    openNewInvoice();
    input("clientName").type("Discarded Client");
    cy.contains("button", "Discard").click();
    cy.get('[role="dialog"]').should("not.exist");
    cy.get('a[href^="/invoices/"]').should("have.length", 3);
    cy.get('a[href="/invoices/BB2002"]').click();
    cy.contains("button", /^Edit$/).click();
    input("clientName").clear().type("Unsaved Client");
    cy.get('[role="dialog"]').contains("button", "Cancel").click();
    cy.get('[role="dialog"]').should("not.exist");
    cy.get(".invoice-document").should("contain.text", "Pending Client").and("not.contain.text", "Unsaved Client");
    cy.contains("button", /^Edit$/).click();
    input("clientName").should("have.value", "Pending Client");
  });

  it("promotes a completed draft to pending when changes are saved", () => {
    visitInvoices("/invoices/CC3003");
    cy.contains("button", /^Edit$/).click();
    cy.contains("button", "+ Add New Item").click();
    fillInvoice();
    cy.contains("button", "Save Changes").click();
    cy.get('[role="dialog"]').should("not.exist");
    cy.get(".status-group").should("contain.text", "Pending");
    cy.get(".amount-due").should("contain.text", "£ 251.00");
    cy.reload();
    cy.get(".status-group").should("contain.text", "Pending");
  });

  it("retains paid status when editing an already paid invoice", () => {
    visitInvoices("/invoices/AA1001");
    cy.contains("button", /^Edit$/).click();
    input("description").clear().type("Updated brand design");
    cy.contains("button", "Save Changes").click();
    cy.get('[role="dialog"]').should("not.exist");
    cy.get(".status-group").should("contain.text", "Paid");
    cy.get(".invoice-document").should("contain.text", "Updated brand design");
    cy.contains("button", "Mark as Paid").should("not.exist");
  });
});
