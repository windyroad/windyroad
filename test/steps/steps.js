import openWebsite from '../support/action/openWebsite'
import checkTitle from '../support/check/checkTitle'
import checkIfElementExists from '../support/lib/checkIfElementExists'

const { When, Then } = require('cucumber')

When(/^I open the Windy Road site$/, () => openWebsite('site', '/'))

Then(/^the title will( not)* be "([^"]*)"$/, checkTitle)

Then(/^there will be a header bar at the top of the page$/, () => {
  checkIfElementExists('header#header')
})
