@landing @wip
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
        Then a down arror will appear

    @nav
    Scenario: Down Arror Clicked
        Given I've opened the Windy Road site
        And I've waited for the down arror to appear
        When I click on the down arror
        Then the page will scroll to the about us section
        
    # @nav 
    # Scenario: Scoll to Services Section
    #     Given I've opened the Windy Road site
    #     And I've scrolled to the about us section
    #     And I've waited for the down arror to appear
    #     When I click on the down arror
    #     Then the page will scroll to the services section