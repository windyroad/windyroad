import openWebsite from '../support/action/openWebsite'
import waitForVisible from '../support/action/waitForVisible'
import checkTitle from '../support/check/checkTitle'
import checkWithinViewport from '../support/check/checkWithinViewport'
import checkIfElementExists from '../support/lib/checkIfElementExists'

const { Given, When, Then } = require('cucumber')

function openWindyRoad() {
  openWebsite('site', '/')
  waitForVisible('body.is-loaded')
  browser.pause(1500)
  // wait for body to have class 'is-loaded'
  // then wait 1.5s for transitions to complete
}

When(/^I open the Windy Road site$/, () => openWindyRoad())
Given(/^I've opened the Windy Road site$/, () => openWindyRoad())

Then(/^the title will( not)* be "([^"]*)"$/, checkTitle)

Then(/^there will be a header bar at the top of the page$/, () => {
  checkIfElementExists('header#header')
  // TODO: check position on page
})

Then(/^a down arror will appear at the bottom of the page$/, () => {
  checkIfElementExists('section#banner a.goto-next')
  waitForVisible('section#banner a.goto-next')
  checkWithinViewport('section#banner a.goto-next')
})

Given(
  /^I've waited for the down arror to appear at the bottom of the page$/,
  () => {
    waitForVisible('section#banner a.goto-next')
  },
)

When(/^I click on the down arror$/, () => {
  // clickElement('click', 'element', 'section#banner a.goto-next')
  // browser.touchAction('section#banner a.goto-next', 'tap')
  browser.execute(
    "clickEvent = document.createEvent('MouseEvent'); clickEvent.initEvent('click', true, true); document.querySelector('section#banner a.goto-next').dispatchEvent(clickEvent);",
  )

  browser.pause(
    browser.getAttribute('section#banner a.goto-next', 'data-duration'),
  )
})

Then(/^the page will scroll to the about us section$/, () => {
  checkWithinViewport('section#about')
})
