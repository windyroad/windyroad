import checkTitle from '../support/check/checkTitle'
import LandingPage from '../support/page-elements/landing/landing-page'

const { Given, When, Then } = require('cucumber')

When(/^I open the Windy Road site$/, () => LandingPage.open())
Given(/^I've opened the Windy Road site$/, () => LandingPage.open())

Then(/^the title will( not)* be "([^"]*)"$/, checkTitle)

Then(/^there will be a header bar at the top of the page$/, () => {
  LandingPage.header.checkWithinViewport()
  LandingPage.header.checkAtTopOfPage()
})

Then(/^a down arror will appear$/, () => {
  LandingPage.currentSection.downArrow.checkWithinViewport()
})

Given(/^I've waited for the down arror to appear$/, () => {
  LandingPage.currentSection.downArrow.checkWithinViewport()
})

When(/^I click on the down arror$/, () => {
  LandingPage.currentSection.downArrow.click()
})

Then(/^the page will scroll to the about us section$/, () => {
  LandingPage.aboutUsSection.checkWithinViewport()
})

Given(/^I've scrolled to the about us section$/, () => {
  LandingPage.currentSection.downArrow.click()
  LandingPage.aboutUsSection.checkWithinViewport()
})

Given(/^the page will scroll to the services section$/, () =>
  LandingPage.servicesSection.checkWithinViewport(),
)

Given(/^I've scrolled to the services section$/, () => {
  LandingPage.servicesSection.scrollTo()
})

Then(/^the page will scroll to the contact section$/, () => {
  LandingPage.contactSection.checkWithinViewport()
})

Then(/^there will be a heading with the text "([^"]*)"$/, heading => {
  LandingPage.currentSection.heading.checkContent(heading)
})

Then(/^there will be a "([^"]*)" CTA$/, text => {
  LandingPage.currentSection.cta.checkContent(text)
})

When(/^I click on the CTA$/, () => {
  LandingPage.currentSection.cta.click()
})

Then(/^down arror does not overlap the CTA$/, () => {
  LandingPage.currentSection.downArrow.checkNotIn(
    LandingPage.currentSection.cta,
  )
})

Then(/^the services will be displayed$/, () => {
  LandingPage.servicesSection.grid.checkWithinViewport()
})

Then(/^there will be a services tile for "([^"]*)"$/, title => {
  LandingPage.currentSection.grid.getTileForTitle(title)
  // cant check content of items that only display on hover
  //    .heading.checkContent(title)
})

Given(/^it will have an excerpt of$/, content => {
  LandingPage.currentSection.grid.currentTile.excerpt
  //cant check content of items that only display on hover
  //.checkContent(content)
})
