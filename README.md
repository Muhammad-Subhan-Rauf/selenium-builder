# Visual Selenium Builder

Visual Selenium Builder is a powerful, user-friendly tool that allows you to create Selenium automation scripts visually. Instead of writing complex code, you can simply drag and drop nodes, connect them, and generate ready-to-run Python Selenium scripts.

## Features

- **Visual Interface**: Drag-and-drop nodes to build your automation flow.
- **Node-Based Logic**: Clear separation of logic with Start, Element, Interact, and Assert nodes.
- **Code Generation**: Instantly generate Python Selenium code from your visual flow.
- **Dark Mode**: A sleek, modern dark interface.

## Prerequisites

Before you begin, ensure you have the following installed:

- **Node.js** (v16 or higher): [Download Node.js](https://nodejs.org/)
- **Python** (to run the generated scripts): [Download Python](https://www.python.org/)

## Installation

1.  **Clone or Download** this repository to your local machine.
2.  Open a terminal (Command Prompt, PowerShell, or Terminal) and navigate to the project folder.
3.  Install the dependencies by running:

    ```bash
    npm install
    ```

## Running the Application

To start the visual builder:

1.  Run the development server:

    ```bash
    npm run dev
    ```

2.  Open your browser and navigate to the URL shown in the terminal (usually `http://localhost:5173`).

## Hello World Tutorial

Let's create a simple "Hello World" automation that opens Google and types "Hello World" into the search bar.

### Step 1: Open the Builder
Launch the application as described in the "Running the Application" section. You will see an empty canvas with a sidebar on the left.

### Step 2: Start the Session
1.  From the **Sidebar** under **Setup**, drag the **Start Session** node onto the canvas.
2.  Click on the node to select it.
3.  In the **Properties Panel** (right side), set the **URL** to `https://www.google.com`.
4.  (Optional) You can leave the Browser as 'Chrome'.

### Step 3: Define the Element
We need to tell the builder which element to interact with (the search bar).
1.  From the **Sidebar** under **Components**, drag an **Element** node onto the canvas.
2.  Click on the node to select it.
3.  In the **Properties Panel**:
    *   Set **Name** to `Search Bar`.
    *   Set **Selector Type** to `Name` (since Google's search input has the name "q").
    *   Set **Selector Value** to `q`.

### Step 4: Add an Interaction
Now, let's tell the script to type into that element.
1.  From the **Sidebar** under **Actions**, drag an **Interact** node onto the canvas.
2.  Click on the node to select it.
3.  In the **Properties Panel**:
    *   Set **Action** to `Type`.
    *   Set **Value** to `Hello World`.

### Step 5: Connect the Nodes
Now, wire everything together:
1.  **Control Flow**: Connect the **Bottom Handle** (Green) of the **Start Session** node to the **Top Handle** (Grey) of the **Interact** node. This tells the script to run the interaction after starting the session.
2.  **Data Flow**: Connect the **Right Handle** (Blue) of the **Element** node to the **Left Handle** (Blue) of the **Interact** node. This tells the interaction *which* element to act upon.

### Step 6: Generate and Run
1.  Click the **Generate Code** button in the top right corner.
2.  A file named `test_script.py` will be downloaded.
3.  Open your terminal and install Selenium if you haven't already:
    ```bash
    pip install selenium
    ```
4.  Run the script:
    ```bash
    python test_script.py
    ```

You should see a Chrome browser open, navigate to Google, and type "Hello World"!

## Project Structure

- `src/nodes`: Contains the logic for different node types (Start, Element, Interact, Assert).
- `src/components`: UI components like the Sidebar and Properties Panel.
- `src/utils`: Helper functions, including the code generator.
- `src/App.jsx`: The main application entry point and routing.
