import checkTitle from '../support/check/checkTitle'
import LandingPage from '../support/landing/landing-page'

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
  browser.debug()
  LandingPage.servicesSection.scrollTo()
})

Given(/^the page will scroll to the contact section$/, () =>
  LandingPage.contactSection.checkWithinViewport(),
)

Given(/^there will be a heading with the text "([^"]*)"$/, heading => {
  // Write code here that turns the phrase above into concrete actions
  return 'pending'
})
