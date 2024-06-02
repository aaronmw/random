export {}

const CLICK_DELAY = 50

describe("presets spec", { scrollBehavior: false }, () => {
  beforeEach(() => {
    cy.visit("http://localhost:3000", {
      onBeforeLoad(win) {
        cy.spy(win.console, "log").as("console.log")
      },
    })

    cy.get("#fillColor-toggle-button").click().wait(CLICK_DELAY)
    cy.get("#opacity-toggle-button").click().wait(CLICK_DELAY)
    cy.get("#presets-menu-button").click().wait(CLICK_DELAY)
    cy.get("#save-as-preset-button").click().wait(CLICK_DELAY)
    cy.get("#preset-name-input")
      .click()
      .wait(CLICK_DELAY)
      .type("Dummy Preset{enter}")
    cy.get("#load-preset-button-0").contains("Dummy Preset").should("exist")
  })

  it("renames a preset", () => {
    cy.get("#rename-preset-button-0").click().wait(CLICK_DELAY)
    cy.get("#preset-name-input")
      .click()
      .wait(CLICK_DELAY)
      .type("Renamed Dummy Preset{enter}")
    cy.get("#load-preset-button-0")
      .contains("Renamed Dummy Preset")
      .should("exist")
  })

  it("loads a preset, replacing current settings", () => {
    cy.get("#presets-menu-button").click().wait(CLICK_DELAY)
    cy.get("#fillColor-toggle-button")
      .scrollIntoView()
      .click()
      .wait(CLICK_DELAY)
    cy.get("#text-toggle-button").scrollIntoView().click().wait(CLICK_DELAY)
    cy.get("#strokeColor-toggle-button")
      .scrollIntoView()
      .click()
      .wait(CLICK_DELAY)
    cy.get("#presets-menu-button").click().wait(CLICK_DELAY)
    cy.get("#load-preset-button-0").click().wait(CLICK_DELAY)

    cy.get("#fillColor-checkbox").should("be.checked")
    cy.get("#opacity-checkbox").should("be.checked")
    cy.get("#text-checkbox").should("not.be.checked")
    cy.get("#strokeColor-checkbox").should("not.be.checked")
  })

  it("re-saves a preset with new settings", () => {
    cy.get("#presets-menu-button").click().wait(CLICK_DELAY)
    cy.get("#fillColor-toggle-button").click().wait(CLICK_DELAY)

    cy.get("#fillColor-checkbox").should("not.be.checked")

    cy.get("#presets-menu-button").click().wait(CLICK_DELAY)
    cy.get("#resave-preset-button-0").click().wait(CLICK_DELAY)
    cy.get("#presets-menu-button").click().wait(CLICK_DELAY)
    cy.get("#text-toggle-button").scrollIntoView().click().wait(CLICK_DELAY)
    cy.get("#strokeColor-toggle-button")
      .scrollIntoView()
      .click()
      .wait(CLICK_DELAY)

    cy.get("#text-checkbox").should("be.checked")
    cy.get("#strokeColor-checkbox").should("be.checked")

    cy.get("#presets-menu-button").click().wait(CLICK_DELAY)
    cy.get("#load-preset-button-0").click().wait(CLICK_DELAY)

    cy.get("#opacity-checkbox").should("be.checked")
    cy.get("#fillColor-checkbox").should("not.be.checked")
    cy.get("#text-checkbox").should("not.be.checked")
    cy.get("#strokeColor-checkbox").should("not.be.checked")
  })

  it("deletes a preset", () => {
    cy.get("#delete-preset-button-0").click().wait(CLICK_DELAY)
    cy.contains("Dummy Preset").should("not.exist")
  })
})
