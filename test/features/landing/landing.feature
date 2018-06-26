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
    Scenario: Down Arror Clicked
        When I open the Windy Road site
        Then a down arror will appear at the bottom of the page

    @nav @wip
    Scenario: Down Arror Clicked
        Given I've opened the Windy Road site
        And I've waited for the down arror to appear at the bottom of the page
        When I click on the down arror
        Then the page will scroll to the about us section
        