@landing
Feature: Landing Page


    @content
    Scenario: Landing page Title
        When I open the Windy Road site
        Then the title will be "Windy Road"

    @layout
    Scenario: Landing page header
        When I open the Windy Road site
        Then there will be a header bar at the top of the page

    @content
    Scenario: Down Arror In Banner
        When I open the Windy Road site
        Then a down arror will appear

    @nav
    Scenario: Down Arror In Banner Clicked
        Given I've opened the Windy Road site
        And I've waited for the down arror to appear
        When I click on the down arror
        Then the page will scroll to the about us section

    @content @about
    Scenario: CTA In About Us
        Given I've opened the Windy Road site
        And I've scrolled to the about us section
        Then there will be a "Find your navigator" CTA

    @nav @about
    Scenario: CTA In About Us
        Given I've opened the Windy Road site
        And I've scrolled to the about us section
        When I click on the CTA
        Then the page will scroll to the contact section

    @nav @about
    Scenario: Down Arror In About Us Does Not Overlap CTA
        Given I've opened the Windy Road site
        And I've scrolled to the about us section
        And I've waited for the down arror to appear
        Then down arror does not overlap the CTA

    @nav @about @not-services
    Scenario: Scoll to Contact Section from About
        Given I've opened the Windy Road site
        And I've scrolled to the about us section
        And I've waited for the down arror to appear
        When I click on the down arror
        Then the page will scroll to the contact section



