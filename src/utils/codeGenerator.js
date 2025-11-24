// Original relative path: utils/codeGenerator.js

export const generateCode = (nodes, edges) => {
  let code = `import unittest
from selenium import webdriver
from selenium.webdriver.common.by import By
from selenium.webdriver.common.keys import Keys
from selenium.webdriver.support.ui import WebDriverWait
from selenium.webdriver.support import expected_conditions as EC
from selenium.common.exceptions import NoSuchElementException
import time
import datetime

# pip install colorama
from colorama import init, Fore, Style

# Initialize Colorama
init(autoreset=True)

# --- Custom Logging Helpers ---
def log_step(message):
    timestamp = datetime.datetime.now().strftime("%H:%M:%S")
    print(f"{Fore.CYAN}[STEP {timestamp}] {message}")

def log_pass(message):
    print(f"{Fore.GREEN}[PASS] {message}")

def log_fail(message):
    print(f"{Fore.RED}[FAIL] {message}")

def log_info(message):
    print(f"{Style.DIM}[INFO] {message}")

class TestSuite(unittest.TestCase):
`;

  const startNodes = nodes.filter((n) => n.type === 'start_session');

  if (startNodes.length === 0) {
    return '# Error: No "Start Session" block found.';
  }

  // --- HELPERS ---
  const getConnectedElement = (node) => {
    const connectedEdge = edges.find(e => e.target === node.id && e.targetHandle === 'data-in');
    if (!connectedEdge) return null;
    const elementNode = nodes.find(n => n.id === connectedEdge.source);
    return elementNode ? elementNode.data : null;
  };

  const getOutgoerByHandle = (node, handleId) => {
    const edge = edges.find(e => e.source === node.id && e.sourceHandle === handleId);
    if (!edge) return null;
    return nodes.find(n => n.id === edge.target);
  };

  const getNextNode = (node) => {
      const edge = edges.find(e => e.source === node.id && (e.sourceHandle === 'flow-out' || node.type === 'start_session'));
      if(!edge) return null;
      return nodes.find(n => n.id === edge.target);
  };

  const getSelector = (type, value) => {
    switch (type) {
      case 'ID': return `By.ID, "${value}"`;
      case 'CSS': return `By.CSS_SELECTOR, "${value}"`;
      case 'XPath': return `By.XPATH, "${value}"`;
      case 'Name': return `By.NAME, "${value}"`;
      case 'Link Text': return `By.LINK_TEXT, "${value}"`;
      default: return `By.ID, "${value}"`;
    }
  };

  // --- RECURSIVE GENERATOR ---
  const processNode = (node, indentLevel, visited = new Set()) => {
      if (!node) return '';
      
      // Cycle detection for non-loop flows
      if (visited.has(node.id)) return `${'    '.repeat(indentLevel)}# ... (Flow merges or cycle detected)\n`;
      
      const newVisited = new Set(visited);
      newVisited.add(node.id);

      let output = '';
      const indent = '    '.repeat(indentLevel);

      // --- START NODE ---
      if (node.type === 'start_session') {
          const next = getNextNode(node);
          if (next) output += processNode(next, indentLevel, newVisited);
      } 
      
      // --- INTERACT ---
      else if (node.type === 'interact') {
          const el = getConnectedElement(node);
          if (el) {
              const sel = getSelector(el.selectorType, el.selectorValue);
              const act = node.data.action || 'Click';
              const val = node.data.value || '';
              const elName = el.name || 'Unknown Element';

              output += `${indent}log_step("Action: ${act} on '${elName}'")\n`;

              if (act === 'Click') output += `${indent}driver.find_element(${sel}).click()\n`;
              else if (act === 'Type') output += `${indent}driver.find_element(${sel}).send_keys("${val}")\n`;
              else if (act === 'Clear') output += `${indent}driver.find_element(${sel}).clear()\n`;
              else if (act === 'Hover') {
                  output += `${indent}element = driver.find_element(${sel})\n`;
                  output += `${indent}webdriver.ActionChains(driver).move_to_element(element).perform()\n`;
              }
              output += `${indent}time.sleep(0.5)\n`;
          } else {
              output += `${indent}log_info("Warning: Interact node has no element connected")\n`;
          }
          const next = getNextNode(node);
          if (next) output += processNode(next, indentLevel, newVisited);
      }

      // --- ASSERT ---
      else if (node.type === 'assert') {
          const el = getConnectedElement(node);
          const cond = node.data.condition || 'Is Visible';
          const val = node.data.value || '';
          const printRes = node.data.printResults || false;
          let check = '';
          let msg = '';

          if (cond === 'Is Visible' && el) {
             check = `driver.find_element(${getSelector(el.selectorType, el.selectorValue)}).is_displayed()`;
             msg = `Element '${el.name}' is visible`;
          } else if (cond === 'Contains Text' && el) {
             const sel = getSelector(el.selectorType, el.selectorValue);
             output += `${indent}el = driver.find_element(${sel})\n`;
             output += `${indent}txt = el.text or el.get_attribute("value") or ""\n`;
             check = `"${val}" in txt`;
             msg = `Element '${el.name}' contains text '${val}'`;
          } else if (cond === 'URL Contains') {
              check = `"${val}" in driver.current_url`;
              msg = `URL contains '${val}'`;
          } else if (cond === 'Title Equals') {
              check = `driver.title == "${val}"`;
              msg = `Title is '${val}'`;
          }

          if (check) {
              output += `${indent}log_step("Asserting: ${cond}")\n`;
              // We wrap in Try/Except to capture the failure log
              output += `${indent}try:\n`;
              output += `${indent}    assert ${check}\n`;
              if (printRes) output += `${indent}    log_pass("${msg}")\n`;
              output += `${indent}except AssertionError:\n`;
              output += `${indent}    log_fail("${msg}")\n`;
              output += `${indent}    raise\n`;
          }
          const next = getNextNode(node);
          if (next) output += processNode(next, indentLevel, newVisited);
      }

      // --- CONDITION (IF/ELSE) ---
      else if (node.type === 'condition') {
          const el = getConnectedElement(node);
          const cond = node.data.condition || 'Is Visible';
          const val = node.data.value || '';
          let ifLine = 'if True:'; 

          output += `${indent}log_info("Checking condition: ${cond}...")\n`;

          if (cond === 'Is Visible' && el) {
             const sel = getSelector(el.selectorType, el.selectorValue);
             output += `${indent}elements = driver.find_elements(${sel})\n`;
             ifLine = `if len(elements) > 0 and elements[0].is_displayed():`;
          } else if (cond === 'Contains Text' && el) {
             const sel = getSelector(el.selectorType, el.selectorValue);
             output += `${indent}try: el_txt = driver.find_element(${sel}).text\n`;
             output += `${indent}except: el_txt = ""\n`;
             ifLine = `if "${val}" in el_txt:`;
          } else if (cond === 'URL Contains') {
             ifLine = `if "${val}" in driver.current_url:`;
          }

          output += `${indent}${ifLine}\n`;
          output += `${indent}    log_info(">> Condition matched (TRUE)")\n`;
          
          // True Branch
          const trueNode = getOutgoerByHandle(node, 'true-out');
          if (trueNode) output += processNode(trueNode, indentLevel + 1, newVisited);
          else output += `${indent}    pass\n`;

          // False Branch
          const falseNode = getOutgoerByHandle(node, 'false-out');
          if (falseNode) {
              output += `${indent}else:\n`;
              output += `${indent}    log_info(">> Condition failed (FALSE)")\n`;
              output += processNode(falseNode, indentLevel + 1, newVisited);
          }
      }

      // --- LOOP ---
      else if (node.type === 'loop') {
          const loopType = node.data.loopType || 'Counter';
          
          if (loopType === 'Counter') {
              const count = node.data.count || 1;
              output += `${indent}log_info("Starting Loop (${count} iterations)")\n`;
              output += `${indent}for i in range(${count}):\n`;
              output += `${indent}    log_info(f"--- Loop Iteration {i+1}/{count} ---")\n`;
          } else {
              output += `${indent}log_info("Starting While Loop")\n`;
              const cond = node.data.condition || 'Is Visible';
              const el = getConnectedElement(node);
              if (cond === 'Is Visible' && el) {
                  const sel = getSelector(el.selectorType, el.selectorValue);
                  output += `${indent}while True:\n`;
                  output += `${indent}    try:\n`;
                  output += `${indent}        if not driver.find_element(${sel}).is_displayed(): break\n`;
                  output += `${indent}    except: break\n`;
              } else {
                   output += `${indent}while True:\n`;
              }
          }

          // Body
          const bodyNode = getOutgoerByHandle(node, 'loop-body');
          if (bodyNode) {
              const bodyVisited = new Set(newVisited);
              output += processNode(bodyNode, indentLevel + 1, bodyVisited);
          } else {
              output += `${indent}    pass\n`;
          }

          // Done
          output += `${indent}log_info("Loop Finished")\n`;
          const doneNode = getOutgoerByHandle(node, 'loop-done');
          if (doneNode) {
              output += processNode(doneNode, indentLevel, newVisited);
          }
      }

      return output;
  };

  // --- MAIN GENERATION LOOP ---
  startNodes.forEach((startNode, index) => {
    const testName = startNode.data.testName ? startNode.data.testName.replace(/\s+/g, '_') : `test_case_${index + 1}`;
    const browser = startNode.data.browser || 'Chrome';
    const url = startNode.data.url || 'https://example.com';

    code += `
    def ${testName}(self):
        log_info("Starting Test Case: ${testName}")
        log_info("Browser: ${browser}, URL: ${url}")
        
        # Setup Driver
        driver = webdriver.${browser}()
        driver.maximize_window()
        driver.get("${url}")
        time.sleep(2)
        
        try:
`;
    code += processNode(startNode, 3);

    code += `        finally:
            log_info("Test finished. Closing driver.")
            driver.quit()
`;
  });

  code += `
if __name__ == "__main__":
    unittest.main()
`;

  return code;
};