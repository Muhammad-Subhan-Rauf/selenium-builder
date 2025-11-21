import { getOutgoers } from '@xyflow/react';

export const generateCode = (nodes, edges) => {
  let code = `from selenium import webdriver
from selenium.webdriver.common.by import By
from selenium.webdriver.common.keys import Keys
from selenium.webdriver.support.ui import WebDriverWait
from selenium.webdriver.support import expected_conditions as EC
import time

`;

  // 1. Find Start Node
  const startNode = nodes.find((n) => n.type === 'start_session');
  if (!startNode) {
    return '# Error: No "Start Session" block found.';
  }

  // 2. Generate Setup Code
  const browser = startNode.data.browser || 'Chrome';
  const url = startNode.data.url || 'https://example.com';

  code += `# Setup Driver
driver = webdriver.${browser}()
driver.maximize_window()
driver.get("${url}")

try:
`;

  // 3. Traverse Graph
  let currentNode = startNode;
  const visited = new Set();
  visited.add(currentNode.id);

  // Helper to find the next node in the flow
  const getNextNode = (node) => {
    const outgoers = getOutgoers(node, nodes, edges);
    // Filter for flow connections (source handle 'flow-out' or default source for StartNode)
    return outgoers.find(outgoer => {
      const edge = edges.find(e => e.source === node.id && e.target === outgoer.id);
      return edge && (edge.sourceHandle === 'flow-out' || node.type === 'start_session');
    });
  };

  // Helper to find connected element data
  const getConnectedElement = (node) => {
    const connectedEdges = edges.filter(e => e.target === node.id && e.targetHandle === 'data-in');
    if (connectedEdges.length === 0) return null;
    
    // Assuming only one element connected
    const edge = connectedEdges[0];
    const elementNode = nodes.find(n => n.id === edge.source);
    return elementNode ? elementNode.data : null;
  };

  // Helper to format selector
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

  while (true) {
    const nextNode = getNextNode(currentNode);
    if (!nextNode) break;
    
    if (visited.has(nextNode.id)) {
      code += `    # Error: Cycle detected at node ${nextNode.id}\n`;
      break;
    }
    
    visited.add(nextNode.id);
    currentNode = nextNode;

    code += `    # ${currentNode.data.label || currentNode.type}\n`;

    if (currentNode.type === 'interact') {
      const elementData = getConnectedElement(currentNode);
      const action = currentNode.data.action || 'Click';
      const value = currentNode.data.value || '';

      if (!elementData) {
        code += `    # Warning: No element connected to this interaction\n`;
        continue;
      }

      const selector = getSelector(elementData.selectorType, elementData.selectorValue);
      
      if (action === 'Click') {
        code += `    driver.find_element(${selector}).click()\n`;
      } else if (action === 'Type') {
        code += `    driver.find_element(${selector}).send_keys("${value}")\n`;
      } else if (action === 'Clear') {
        code += `    driver.find_element(${selector}).clear()\n`;
      } else if (action === 'Hover') {
        code += `    element = driver.find_element(${selector})\n`;
        code += `    webdriver.ActionChains(driver).move_to_element(element).perform()\n`;
      }
    } else if (currentNode.type === 'assert') {
      const elementData = getConnectedElement(currentNode); // Optional for some asserts
      const condition = currentNode.data.condition || 'Is Visible';
      const value = currentNode.data.value || '';

      if (condition === 'Is Visible') {
        if (elementData) {
          const selector = getSelector(elementData.selectorType, elementData.selectorValue);
          code += `    assert driver.find_element(${selector}).is_displayed()\n`;
        }
      } else if (condition === 'Contains Text') {
        if (elementData) {
          const selector = getSelector(elementData.selectorType, elementData.selectorValue);
          code += `    element_text = driver.find_element(${selector}).text\n`;
          code += `    assert "${value}" in element_text\n`;
        }
      } else if (condition === 'URL Contains') {
        code += `    assert "${value}" in driver.current_url\n`;
      } else if (condition === 'Title Equals') {
        code += `    assert driver.title == "${value}"\n`;
      }
    }
    
    // Add a small delay for visibility in demo
    code += `    time.sleep(1)\n\n`;
  }

  code += `finally:
    driver.quit()
`;

  return code;
};
