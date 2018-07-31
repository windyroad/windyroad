
@landing @services @wip
Feature: Services Section
 
    @nav 
    Scenario: Scoll to Services Section
        Given I've opened the Windy Road site
        And I've scrolled to the about us section
        And I've waited for the down arror to appear
        When I click on the down arror
        Then the page will scroll to the services section

    @nav 
    Scenario: Scoll to Contact Section
        Given I've opened the Windy Road site
        And I've scrolled to the services section
        And I've waited for the down arror to appear
        When I click on the down arror
        Then the page will scroll to the contact section

    @content 
    Scenario: Services Heading
        Given I've opened the Windy Road site
        And I've scrolled to the services section
        Then there will be a heading with the text "Services"

    @content
    Scenario: Services Grid
        Given I've opened the Windy Road site
        And I've scrolled to the services section
        Then the services will be displayed

    @content @wip
    Scenario: Agile & Lean Mentoring Service
        Given I've opened the Windy Road site
        And I've scrolled to the services section
        Then there will be a services tile for "Agile & Lean Mentoring"
        And it will have an excerpt of
            """
            Need help or a refresher on your Agile or Lean journey?
            """

    @content
    Scenario: Continuous Integration & Continuous Delivery Service
        Given I've opened the Windy Road site
        And I've scrolled to the services section
        Then there will be a services tile for "Continuous Integration & Continuous Delivery"
        And it will have an excerpt of
            """
            Going live doesn't need to be expensive and risky.
            """

    @content 
    Scenario: Product Resharpening Service
        Given I've opened the Windy Road site
        And I've scrolled to the services section
        Then there will be a services tile for "Product Resharpening"
        And it will have an excerpt of
            """
            Get your great idea moving again.
            """

    @content @wip
    Scenario: BDD & Test Automation Service
        Given I've opened the Windy Road site
        And I've scrolled to the services section
        Then there will be a services tile for "BDD & Test Automation"
        And it will have an excerpt of
            """
            Get so much more from your test automation efforts.
            """
