# 🚀 Future Development Plan: Advanced Cypress Features

This roadmap outlines the features required to upgrade the Visual Selenium/Cypress Builder from a basic interaction tool to a professional-grade testing suite capable of handling complex authentication flows, API mocking, and data fixtures.

## Phase 1: Test Lifecycle & Hooks
**Goal:** Support `beforeEach`, `afterEach`, and global cleanup commands.

- [ ] **Start Node "Hooks" Configuration**
    - Update `StartNode` properties panel to include a "Setup / Teardown" section.
    - Add checkboxes for common cleanup commands:
        - `cy.clearCookies()`
        - `cy.clearLocalStorage()`
        - `cy.clearAllSessionStorage()`
    - **Implementation:** Update `utils/codeGenerator.js` to inject these commands inside the `beforeEach` block of the generated suite.

## Phase 2: Network & API Mocking
**Goal:** Eliminate dependency on real backends and speed up tests using `cy.intercept`.

- [ ] **Network Request Node (`cy.intercept`)**
    - **Inputs:**
        - Method: (GET, POST, PUT, DELETE, PATCH)
        - URL Matcher: (String or Glob pattern, e.g., `**/auth/login`)
        - Alias Name: (e.g., `loginRequest`)
    - **Response Mocking (Optional):**
        - Status Code: (e.g., 200, 401, 500)
        - Body: JSON editor field to define the mock response.
    - **Implementation:** Create `NetworkNode`. Update handlers to generate `cy.intercept(method, url, { statusCode, body }).as(alias)`.

- [ ] **Wait for Network Node**
    - Update the existing **Wait Node**.
    - **Feature:** Add a toggle between "Time (seconds)" and "Network Alias".
    - **Logic:** If "Network Alias" is selected, generate `cy.wait('@aliasName')` instead of `cy.wait(1000)`.

## Phase 3: Data Management & Fixtures
**Goal:** Support external data files instead of hardcoding values in nodes.

- [ ] **Load Fixture Node**
    - **Inputs:**
        - File Path: (e.g., `users.json`)
        - Variable Name: (e.g., `userData`)
    - **Logic:** This node should wrap subsequent nodes in a `.then()` block or store the data in a global variable (e.g., `Cypress.env`) so downstream nodes can access `${userData.email}`.

- [ ] **Variable System Upgrade**
    - Support dot notation in the variable parser.
    - **Current:** `${user}`
    - **Target:** `${user.validUser.email}` to allow accessing nested JSON objects loaded from fixtures.

## Phase 4: Logic & Reusability
**Goal:** Reduce repetition (DRY) and support custom Cypress commands.

- [ ] **Custom Command Node**
    - **Inputs:**
        - Command Name: (e.g., `login`)
        - Arguments: List of arguments (e.g., `email`, `password`).
    - **Implementation:** Generates `cy.commandName(arg1, arg2)`.
    - *Note:* This assumes the user has defined the command in their project's `support/commands.js`.

- [ ] **Group / Sub-Flow Support**
    - Ability to select multiple nodes and "Group" them into a single reusable component.
    - Useful for repetitive steps like "Login" or "Fill Address Form".

## Phase 5: Enhanced Assertions
**Goal:** Expand the capability of the Assert node beyond simple visibility checks.

- [ ] **Advanced Assertions**
    - Update **Assert Node** to support:
        - `URL matches regex`
        - `Element has class`
        - `Element property equals` (e.g., checking input value)
        - `Network Status` (asserting on the result of an intercepted call)

## Summary of Priority

1.  **Phase 1** is critical for test reliability (cleaning state).
2.  **Phase 2** is essential for the specific Login test case provided (mocking API errors).
3.  **Phase 3** allows the use of the `users` fixture data.

By implementing these nodes, the builder will be able to fully replicate complex authentication suites without writing a single line of raw code.