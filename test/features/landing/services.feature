
@landing @services 
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
