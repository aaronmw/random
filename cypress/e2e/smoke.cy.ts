export {}

const CLICK_DELAY = 50

describe("smoke test spec", { scrollBehavior: false }, () => {
  beforeEach(() => {
    cy.visit("http://localhost:3000", {
      onBeforeLoad(win) {
        cy.spy(win.console, "log").as("console.log")
      },
    })

    cy.contains("Execute").as("executeButton")
  })

  it("does not allow execution when nothing is randomized", () => {
    cy.get("@executeButton").should("be.disabled")

    cy.get("#opacity-toggle-button").scrollIntoView().click().wait(CLICK_DELAY)

    cy.get("@executeButton").should("be.enabled")

    cy.get("@executeButton").click()

    cy.get("@console.log").should(
      "be.calledWith",
      "dispatchPluginAction",
      Cypress.sinon.match({
        type: "execute",
        payload: Cypress.sinon.match({
          propertySettings: {
            opacity: Cypress.sinon.match({
              mode: "range",
              modeOptions: Cypress.sinon.match({
                range: Cypress.sinon.match({
                  min: 0,
                  max: 100,
                }),
              }),
              sortOrder: "random",
            }),
          },
        }),
      }),
    )
  })

  it("changes payload upon switching randomization mode", () => {
    cy.get("#opacity-toggle-button").scrollIntoView().click().wait(CLICK_DELAY)

    cy.contains("Pick from a list").click().wait(CLICK_DELAY)

    cy.get("@executeButton").click()

    cy.get("@console.log").should(
      "be.calledWith",
      "dispatchPluginAction",
      Cypress.sinon.match({
        type: "execute",
        payload: Cypress.sinon.match({
          propertySettings: {
            opacity: Cypress.sinon.match({
              mode: "list",
              modeOptions: Cypress.sinon.match({
                list: Cypress.sinon.match({
                  options: [0, 25, 50, 75, 100],
                }),
              }),
              sortOrder: "random",
            }),
          },
        }),
      }),
    )
  })

  it("shows error on invalid numeric entry", () => {
    cy.get("#opacity-toggle-button").scrollIntoView().click().wait(CLICK_DELAY)

    cy.contains("Pick from a list").click().wait(CLICK_DELAY)

    cy.get("[role='button']").contains("100").click().wait(CLICK_DELAY)
    cy.get("textarea").type("{enter}101{esc}")

    cy.contains("Invalid: Out of Range").should("exist")

    cy.get("[role='button']").contains("101").click().wait(CLICK_DELAY)
    cy.get("textarea").type("{backspace}99{esc}")

    cy.contains("Invalid: Out of Range").should("not.exist")
  })

  it("filters the list if keywords given", () => {
    cy.get("#fillColor-checkbox").should("exist")
    cy.get("#position-checkbox").should("exist")

    cy.get(".js-filter-input").type("fill")

    cy.get("#fillColor-checkbox").should("exist")
    cy.get("#position-checkbox").should("not.exist")
  })

  it("disables width if height preserves aspect ratio", () => {
    cy.get("#width-toggle-button").scrollIntoView().click().wait(CLICK_DELAY)
    cy.get("#height-toggle-button").scrollIntoView().click().wait(CLICK_DELAY)

    cy.get("#width-checkbox").should("be.checked")
    cy.get("#height-checkbox").should("be.checked")

    cy.get("#height-preserve-aspect-ratio-on").click().wait(CLICK_DELAY)

    cy.get("#width-checkbox").should("not.be.checked")
    cy.get("#height-checkbox").should("be.checked")
  })
})
