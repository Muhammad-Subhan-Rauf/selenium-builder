import { handlers } from './generator/blockHandlers';
import { getNextNode } from './generator/helpers';

const IMPORTS_AND_SETUP = `import unittest
from selenium import webdriver
from selenium.webdriver.common.by import By
from selenium.webdriver.common.keys import Keys
from selenium.webdriver.support.ui import WebDriverWait
from selenium.webdriver.support import expected_conditions as EC
from selenium.common.exceptions import NoSuchElementException, TimeoutException
import time
import datetime
import os 
import sys

# pip install colorama
from colorama import init, Fore, Back, Style

init(autoreset=True)

# --- Global Stats ---
class TestStats:
    total = 0
    passed = 0
    failed = 0
    results = [] # List of (test_name, status, duration)

# --- Logging Helpers ---
def log_header(message):
    print(f"\\n{Style.BRIGHT}{Fore.CYAN}{'='*60}")
    print(f"{Fore.CYAN}  {message}")
    print(f"{Fore.CYAN}{'='*60}{Style.RESET_ALL}")

def log_step(message):
    timestamp = datetime.datetime.now().strftime("%H:%M:%S")
    print(f"{Fore.YELLOW}[STEP {timestamp}]{Style.RESET_ALL} {message}")

def log_info(message):
    print(f"{Style.DIM}[INFO] {message}{Style.RESET_ALL}")

def log_pass(message):
    print(f"{Fore.GREEN}{Style.BRIGHT}[PASS] {message}{Style.RESET_ALL}")

def log_fail(message):
    print(f"{Fore.RED}{Style.BRIGHT}[FAIL] {message}{Style.RESET_ALL}")

def print_summary():
    print(f"\\n\\n{Style.BRIGHT}{Fore.WHITE}{Back.BLUE}  TEST EXECUTION SUMMARY  {Style.RESET_ALL}")
    print("-" * 60)
    print(f"{'TEST CASE':<40} | {'STATUS':<10} | {'TIME':<8}")
    print("-" * 60)
    
    for name, status, duration in TestStats.results:
        color = Fore.GREEN if status == "PASS" else Fore.RED
        print(f"{name:<40} | {color}{status:<10}{Style.RESET_ALL} | {duration:.2f}s")
    
    print("-" * 60)
    print(f"Total: {TestStats.total} | {Fore.GREEN}Passed: {TestStats.passed}{Style.RESET_ALL} | {Fore.RED}Failed: {TestStats.failed}{Style.RESET_ALL}")
    print("-" * 60 + "\\n")

class TestSuite(unittest.TestCase):
    def setUp(self):
        self.screenshot_counter = 0
        self.start_time = time.time()
`;

export const generateCode = (nodes, edges) => {
  let code = IMPORTS_AND_SETUP;
  const startNodes = nodes.filter((n) => n.type === 'start_session');

  if (startNodes.length === 0) {
    return '# Error: No "Start Session" block found.';
  }

  // --- RECURSIVE GENERATOR ---
  const processNode = (node, indentLevel, visited = new Set()) => {
      if (!node) return '';
      
      if (visited.has(node.id)) {
          return `${'    '.repeat(indentLevel)}# ... (Cycle detected)\n`;
      }
      
      const newVisited = new Set(visited);
      newVisited.add(node.id);

      const indent = '    '.repeat(indentLevel);
      
      const context = {
          nodes,
          edges,
          indentLevel,
          indent,
          processNodeFn: (n, lvl) => processNode(n, lvl, newVisited),
          processNext: (nCurrent) => {
               const next = getNextNode(nCurrent, edges, nodes);
               if (next) return processNode(next, indentLevel, newVisited);
               return '';
          }
      };

      const handler = handlers[node.type];
      
      if (handler) {
          return handler(node, context);
      } else {
          return `${indent}# Warning: No handler for node type '${node.type}'\n`;
      }
  };

  // --- MAIN LOOP ---
  startNodes.forEach((startNode, index) => {
    const testName = startNode.data.testName ? startNode.data.testName.replace(/\s+/g, '_') : `test_case_${index + 1}`;
    const browser = startNode.data.browser || 'Chrome';
    const url = startNode.data.url || 'https://example.com';

    code += `
    def ${testName}(self):
        TestStats.total += 1
        log_header("Running: ${testName}")
        log_info(f"Browser: ${browser}, URL: ${url}")
        
        # Reset counter
        self.screenshot_counter = 0
        
        try:
            driver = webdriver.${browser}()
            driver.maximize_window()
            driver.get("${url}")
            time.sleep(2)

`;
    // Insert the generated logic
    code += processNode(startNode, 3);

    // Success Block (reached if no exceptions occur)
    code += `
            # If we get here, test passed
            duration = time.time() - self.start_time
            TestStats.passed += 1
            TestStats.results.append(("${testName}", "PASS", duration))
            log_pass(f"Test '${testName}' completed successfully.")
            
        except Exception as e:
            # Failure Block
            duration = time.time() - self.start_time
            TestStats.failed += 1
            TestStats.results.append(("${testName}", "FAIL", duration))
            log_fail(f"Test failed: {str(e)}")
            # Take emergency screenshot
            try:
                driver.save_screenshot(f"error_${testName}.png")
                log_info("Error screenshot saved.")
            except: pass
            raise e  # Re-raise to let unittest know it failed

        finally:
            log_info("Closing driver...")
            try:
                driver.quit()
            except: pass
`;
  });

  // --- FOOTER: Custom Runner ---
  code += `
if __name__ == "__main__":
    # run=False prevents exit, allowing us to print our summary
    try:
        unittest.main(exit=False, verbosity=0)
    except:
        pass
    print_summary()
`;

  return code;
};