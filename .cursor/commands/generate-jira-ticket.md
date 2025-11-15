---
name: "Generate Jira Ticket"
description: "Generate a well-structured Jira ticket from a feature idea using Jira Ticket Generator"
agent: "Jira Ticket Generator"
tags: ["pm", "jira", "ticket", "planning", "documentation"]
---

# Generate Jira Ticket

## Overview

Generate a complete, well-structured Jira ticket from a feature idea or description using the **Jira Ticket Generator** agent. The ticket will be aligned with Clean Architecture principles and project conventions, ready to copy-paste into Jira.

## Agent

**Use**: @Jira Ticket Generator

The Jira Ticket Generator:

-   Transforms feature ideas into well-structured Jira tickets
-   Includes all necessary sections: summary, description, acceptance criteria, technical considerations
-   Aligns tickets with Clean Architecture (Domain → Usecases → Infrastructure → Presentation)
-   Provides clear acceptance criteria and definition of done
-   Suggests appropriate labels, priority, and estimation
-   Identifies dependencies and related components

## Steps

1. **Describe Your Feature Idea**

    - Provide a clear description of what you want to build
    - Include context, business value, and user needs
    - Mention any constraints or requirements

2. **Agent Generates Ticket**

    - Analyzes the feature idea
    - Identifies impacted Clean Architecture layers
    - Generates ticket title, description, and user story
    - Creates testable acceptance criteria
    - Lists technical considerations
    - Suggests labels, priority, and story points
    - Identifies dependencies and related components

3. **Review and Refine**

    - Review the generated ticket
    - Refine if needed using the "refine" prompt
    - Adjust acceptance criteria or technical considerations
    - Update labels, priority, or estimation

4. **Ticket Saved Automatically**

    - Ticket is automatically saved to `jira/{number}.md` (numbered sequentially: 1, 2, 3, etc.)
    - Check the saved location displayed in the output
    - Ticket is ready to copy-paste into Jira

5. **Create Git Branch** (If not already created)

    - Use the provided branch name from the ticket
    - Create branch: `git checkout -b feat/fbc-{number}-{short-description}`
    - Start working on the feature

6. **Copy to Jira** (Optional)
    - Copy the formatted ticket from the saved file
    - Paste into Jira
    - Add any additional context or attachments
    - Create sub-tickets if the feature is complex

## Ticket Structure

The generated ticket includes:

-   **Title**: Concise, action-oriented
-   **Type**: Feature/Bug/Story/Task
-   **Priority**: High/Medium/Low
-   **Story Points**: 1-13 estimation
-   **Labels**: Relevant tags
-   **Git Branch**: Suggested branch name (format: `feat/fbc-{number}-{short-description}`)
-   **Description**: Context and business value
-   **User Story**: As a... I want... So that...
-   **Acceptance Criteria**: Testable, specific criteria
-   **Technical Considerations**: Architecture layers, dependencies, data flow
-   **Definition of Done**: Checklist of completion criteria
-   **Related Components**: Files and modules impacted

## Example Usage

### Input

```
I want to add a product search feature that allows users to search products by name,
category, and stock status. The search should be real-time as the user types, and
results should be displayed in a table with pagination.
```

### Output

The agent will generate a complete Jira ticket with:

-   Title: "Add product search with filters and real-time results"
-   Git Branch: `feat/fbc-5-add-product-search` (example, actual number depends on existing tickets)
-   User Story: As a user, I want to search products... So that I can quickly find what I need
-   Acceptance Criteria: Search by name, category, stock status, real-time updates, pagination
-   Technical Considerations: Domain (Product type), Usecases (searchProducts), Infrastructure (productRepositorySupabase), Presentation (SearchBar component, useProducts hook)
-   Definition of Done: Tests, SCSS variables, accessibility, code review

## Tips

-   **Be specific**: Provide clear details about the feature
-   **Include context**: Mention business value and user needs
-   **Review carefully**: Check that acceptance criteria are testable
-   **Break down complex features**: Suggest sub-tickets for large features
-   **Align with architecture**: Ensure technical considerations reference Clean Architecture layers

## Important Notes

-   **Git Branch**: Each ticket includes a suggested Git branch name following the format `feat/fbc-{number}-{short-description}`
-   **Branch Creation**: Create the branch before starting work using: `git checkout -b feat/fbc-{number}-{short-description}`
-   **Manual copy-paste**: The agent generates the ticket content, but you need to create it in Jira manually
-   **Clean Architecture alignment**: All tickets reference the project's Clean Architecture structure
-   **Testable criteria**: Acceptance criteria are written to be testable and specific
-   **Definition of Done**: Includes project-specific completion criteria (tests, SCSS variables, accessibility)
