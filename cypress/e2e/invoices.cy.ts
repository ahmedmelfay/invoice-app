import { invoices, visitInvoices } from "../support/invoices";

describe("Invoice list and details", () => {
  it("lists invoices and opens a detail route with the correct line items", () => {
    visitInvoices();
    cy.get('a[href^="/invoices/"]').should("have.length", 3);
    cy.contains("There are 3 total invoices").should("be.visible");
    cy.get('a[href="/invoices/BB2002"]').click();
    cy.location("pathname").should("eq", "/invoices/BB2002");
    cy.get("h1").should("contain.text", "BB2002");
    cy.get("tbody tr").should("have.length", 2);
    cy.contains("td", "Banner Design").should("be.visible");
    cy.get(".amount-due").should("contain.text", "£ 556.00");
    cy.contains("a", "Go back").click();
    cy.location("pathname").should("eq", "/");
  });

  it("combines status filters and restores all invoices when cleared", () => {
    visitInvoices();
    cy.contains("button", "Filter by status").click();
    cy.contains("label", "Pending").click();
    cy.get('a[href^="/invoices/"]').should("have.length", 1);
    cy.get('a[href="/invoices/BB2002"]').should("be.visible");
    cy.contains("label", "Draft").click();
    cy.get('a[href^="/invoices/"]').should("have.length", 2);
    cy.contains("label", "Pending").click();
    cy.contains("label", "Draft").click();
    cy.get('a[href^="/invoices/"]').should("have.length", 3);
  });

  it("shows an empty state when no invoices match a filter", () => {
    visitInvoices("/", [invoices[0]]);
    cy.contains("button", "Filter by status").click();
    cy.contains("label", "Pending").click();
    cy.get('a[href^="/invoices/"]').should("not.exist");
    cy.contains("There is nothing here").should("be.visible");
    cy.contains("No invoices match your selected filters.").should("be.visible");
  });

  it("marks a pending invoice paid and persists the change after refresh", () => {
    visitInvoices("/invoices/BB2002");
    cy.contains("button", "Mark as Paid").click();
    cy.get(".status-group").should("contain.text", "Paid");
    cy.contains("button", "Mark as Paid").should("not.exist");
    cy.reload();
    cy.get(".status-group").should("contain.text", "Paid");
  });

  it("preserves an invoice when deletion is cancelled, then deletes it on confirmation", () => {
    visitInvoices("/invoices/BB2002");
    cy.contains("button", /^Delete$/).click();
    cy.get('[role="dialog"]').should("contain.text", "BB2002");
    cy.get('[role="dialog"]').contains("button", "Cancel").click();
    cy.get('[role="dialog"]').should("not.be.visible");
    cy.get("h1").should("contain.text", "BB2002");
    cy.contains("button", /^Delete$/).click();
    cy.get('[role="dialog"]').contains("button", /^Delete$/).click();
    cy.location("pathname").should("eq", "/");
    cy.get('a[href^="/invoices/"]').should("have.length", 2);
    cy.get('a[href="/invoices/BB2002"]').should("not.exist");
    cy.reload();
    cy.get('a[href^="/invoices/"]').should("have.length", 2);
  });

  it("handles a missing invoice and provides navigation back home", () => {
    visitInvoices("/invoices/ZZ9999");
    cy.contains("h1", "Invoice not found").should("be.visible");
    cy.contains("a", "Go back").click();
    cy.location("pathname").should("eq", "/");
  });
});
