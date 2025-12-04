
# Visual Test Builder

A visual, drag-and-drop tool to generate robust **Selenium (Python)** and **Cypress (JavaScript)** automation scripts without writing code. Built with **React Flow** and **Vite**.

## 🚀 Features

### 🧩 Visual Flow Editor
- **Drag-and-Drop Interface:** Easily construct test flows using a node-based editor.
- **Interactive Minimap & Controls:** Navigate large complex flows with ease.
- **Context Menu:** Right-click support for quick actions (Copy, Cut, Paste, Delete).
- **Undo/Redo History:** Full `Ctrl+Z` and `Ctrl+Y` support to safely experiment.
- **Glassmorphism UI:** Modern dark theme with blur effects and gradient accents.

### 📦 Nodes & Components

#### Setup
- **Start Session:** Configure Browser (Chrome/Firefox), Base URL, Window settings, and beforeEach cleanup hooks (clear cookies, localStorage, sessionStorage).

#### Components
- **Element Definition:** Define elements centrally using ID, CSS, XPath, Name, etc.

#### Interactions
- **Interact:** Click, Type, Clear, or Hover over elements.
- **Wait:** Add time delays or wait for network requests (`@alias`).
- **Screenshot:** Capture full-page screenshots with auto-incrementing filenames.

#### Data Management
- **Set Variable:** Store values for reuse throughout the test.
- **Load Fixture:** Load test data from JSON fixture files with dot notation access (`${user.email}`).

#### Network & API
- **Network Intercept:** Mock API responses with `cy.intercept` (Cypress) - configure method, URL pattern, alias, status code, and response body.

#### Assertions
- **Assert:** Comprehensive verification options:
  - Element visibility and text content
  - URL contains / URL regex pattern
  - Page title verification
  - Element has specific CSS class
  - Element property equals value
  - Network response status code

#### Logic Control
- **Conditions (If/Else):** Branch logic based on element presence or text.
- **Loops:** Create `For` loops (counters) or `While` loops (wait until visible).

#### Reusability
- **Custom Command:** Call reusable Cypress custom commands or Python helper functions with arguments.

### 🛠️ Dual Framework Code Generation

Generate tests for both frameworks from the same visual flow:

#### Selenium (Python)
- Rich color-coded terminal output (Green for PASS, Red for FAIL)
- Test summary with statistics table
- Automatic screenshot capture on failure
- Execution time tracking
- Fixture loading via `json.load()`
- Dot notation variable access: `self.vars.get("user")["email"]`

#### Cypress (JavaScript)
- Modern ES6+ syntax
- Network mocking with `cy.intercept()`
- Fixture support with `cy.fixture()`
- Wait for network aliases (`cy.wait('@alias')`)
- Dynamic beforeEach hooks for cleanup
- Dot notation variable access: `Cypress.env("user").email`

### 💾 Persistence & Sharing
- **Save/Load:** Export flows to JSON files to share or backup.
- **Auto-Save:** Progress automatically saved to LocalStorage.
- **Export Tests:** Generate and download test files as ZIP or save to folder.

---

## ⌨️ Keyboard Shortcuts

| Shortcut | Action |
| :--- | :--- |
| `Ctrl + C` | Copy selected node |
| `Ctrl + X` | Cut selected node |
| `Ctrl + V` | Paste node |
| `Ctrl + Z` | Undo last action |
| `Ctrl + Y` | Redo last action |
| `Delete` / `Backspace` | Delete selected node/edge |

---

## 🛠️ Installation & Setup

### 1. Prerequisites
- **Node.js** (v16+)
- **Python** (v3.8+) - for Selenium tests
- **Chrome Browser**

### 2. Frontend Setup
```bash
# Clone the repository
git clone https://github.com/Muhammad-Subhan-Rauf/selenium-builder
cd selenium-builder

# Install dependencies
npm install

# Start the dev server
npm run dev
```

### 3. Running Selenium Tests
```bash
# Create a virtual environment (Optional but recommended)
python -m venv venv
source venv/bin/activate  # Windows: venv\Scripts\activate

# Install required Python packages
pip install selenium colorama webdriver-manager
```

### 4. Running Cypress Tests
```bash
# Install Cypress (already in package.json)
npm install

# Open Cypress Test Runner
npx cypress open

# Or run headlessly
npx cypress run
```

---

## 🏗️ Project Structure

```text
src/
├── components/         # UI Components (Sidebar, Properties, TopBar, ContextMenu)
├── hooks/              # Custom Hooks (useUndoRedo)
├── nodes/              # React Flow Node Definitions
│   ├── StartNode.jsx           # Session setup with hooks
│   ├── ElementNode.jsx         # Element locator definition
│   ├── InteractNode.jsx        # Click, Type, Clear, Hover
│   ├── WaitNode.jsx            # Time delay or network wait
│   ├── AssertNode.jsx          # Assertions with multiple conditions
│   ├── ConditionNode.jsx       # If/Else branching
│   ├── LoopNode.jsx            # For/While loops
│   ├── ScreenshotNode.jsx      # Screenshot capture
│   ├── SetVarNode.jsx          # Variable assignment
│   ├── NetworkNode.jsx         # API mocking (cy.intercept)
│   ├── LoadFixtureNode.jsx     # Fixture data loading
│   └── CustomCommandNode.jsx   # Custom command calls
├── pages/              # Internal Test Page
├── utils/
│   ├── codeGenerator.js        # Main orchestrator & header generation
│   ├── fileManager.js          # JSON Import/Export
│   └── generator/
│       ├── blockHandlers.js    # Selenium/Python handlers
│       ├── cypressHandlers.js  # Cypress/JavaScript handlers
│       └── helpers.js          # Graph traversal & variable formatting
├── App.jsx             # Main Application Logic
└── main.jsx            # Entry Point
```

---

## 🤝 Contributing

1. Fork the repo.
2. Create a feature branch (`git checkout -b feature/NewBlock`).
3. Add your new node in `src/nodes/`.
4. Add generation logic in both `blockHandlers.js` (Python) and `cypressHandlers.js` (Cypress).
5. Register the node type in `App.jsx`.
6. Add sidebar entry in `Sidebar.jsx`.
7. Add properties panel in `PropertiesPanel.jsx`.
8. Commit and Push.

---

## 📄 License

MIT
