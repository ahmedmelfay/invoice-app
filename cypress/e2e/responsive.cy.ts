import { expectNoHorizontalOverflow, openNewInvoice, visitInvoices } from "../support/invoices";

describe("Responsive layouts and theme", () => {
  for (const [name, width, height] of [["mobile", 375, 812], ["tablet", 768, 1024], ["desktop", 1440, 1000]] as const) {
    it(`supports the invoice list, details, and form on ${name}`, () => {
      cy.viewport(width, height);
      visitInvoices();
      cy.get('a[href^="/invoices/"]').should("have.length", 3).and("be.visible");
      expectNoHorizontalOverflow();
      cy.get('a[href="/invoices/BB2002"]').click();
      cy.get(".amount-due").scrollIntoView().should("be.visible");
      cy.contains("button", "Mark as Paid").should("be.visible");
      expectNoHorizontalOverflow();
      cy.contains("a", "Go back").click();
      openNewInvoice();
      cy.get('[role="dialog"]').should(dialog => {
        const rect = dialog[0].getBoundingClientRect();
        expect(rect.left).to.be.at.least(0);
        expect(rect.right).to.be.at.most(width);
      });
      cy.contains("button", "Discard").should("be.visible").click();
      cy.get('[role="dialog"]').should("not.exist");
    });
  }

  it("persists dark mode through refresh and navigation", () => {
    visitInvoices();
    cy.get('[aria-label="Switch to dark mode"]').click();
    cy.get('.app-shell[data-theme="dark"]').should("be.visible");
    cy.reload();
    cy.get('.app-shell[data-theme="dark"]').should("be.visible");
    cy.get('a[href="/invoices/BB2002"]').click();
    cy.get('.app-shell[data-theme="dark"]').should("be.visible");
    cy.contains("button", /^Edit$/).click();
    cy.get(".drawer-dark").should("be.visible");
    cy.get('[role="dialog"]').contains("button", "Cancel").click();
    cy.get('[role="dialog"]').should("not.exist");
    cy.get('[aria-label="Switch to light mode"]').click();
    cy.get('.app-shell[data-theme="light"]').should("be.visible");
  });

  it("shows a useful empty state and lets the user start their first invoice", () => {
    visitInvoices("/", []);
    cy.contains("No invoices").should("be.visible");
    cy.contains("There is nothing here").should("be.visible");
    cy.get('img[src="/assets/illustration-empty.svg"]').should("be.visible");
    openNewInvoice();
  });
});
