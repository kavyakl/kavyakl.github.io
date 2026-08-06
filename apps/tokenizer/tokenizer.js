import { AutoTokenizer, env } from 'https://cdn.jsdelivr.net/npm/@xenova/transformers@2.17.2';

// Disable local models to use browser-only
env.allowLocalModels = false;
env.useBrowserCache = true;

const modelSelect = document.getElementById('model-select');
const textInput = document.getElementById('text-input');
const tokenizeBtn = document.getElementById('tokenize-btn');
const tokensList = document.getElementById('tokens-list');
const tokenCount = document.getElementById('token-count');

let tokenizer = null;
let currentModel = null;

async function loadTokenizer(modelId) {
  try {
    console.log('Loading tokenizer for:', modelId);
    // Load the tokenizer using AutoTokenizer
    tokenizer = await AutoTokenizer.from_pretrained(modelId);
    currentModel = modelId;
    console.log('Tokenizer loaded successfully');
  } catch (error) {
    console.error('Error loading tokenizer:', error);
    throw new Error(`Failed to load tokenizer: ${error.message}`);
  }
}

async function tokenizeText(text) {
  if (!tokenizer || currentModel !== modelSelect.value) {
    await loadTokenizer(modelSelect.value);
  }
  
  const result = tokenizer.encode(text);
  return result;
}

async function initialize() {
  try {
    // Load initial tokenizer
    await loadTokenizer(modelSelect.value);
    
    tokenizeBtn.addEventListener('click', async () => {
      const text = textInput.value;
      tokensList.innerHTML = '';
      tokenCount.textContent = '';
      
      if (!text.trim()) {
        tokensList.innerHTML = '<div style="color:#6B7280;font-size:0.9rem;">Please enter some text to tokenize.</div>';
        return;
      }
      
      tokenizeBtn.disabled = true;
      tokenizeBtn.textContent = 'Tokenizing...';
      
      try {
        const result = await tokenizeText(text);
        
        if (!result || !result.token_ids || result.token_ids.length === 0) {
          tokensList.innerHTML = '<div style="color:#6B7280;font-size:0.9rem;">No tokens generated.</div>';
          return;
        }
        
        // Display token count
        tokenCount.textContent = `Total tokens: ${result.token_ids.length}`;
        
        // Display tokens
        if (result.tokens) {
          result.tokens.forEach((token) => {
            const chip = document.createElement('div');
            chip.className = 'token-chip';
            chip.textContent = token;
            tokensList.appendChild(chip);
          });
        } else {
          // Fallback to showing IDs if tokens not available
          result.token_ids.forEach((id) => {
            const chip = document.createElement('div');
            chip.className = 'token-chip';
            chip.textContent = `ID: ${id}`;
            tokensList.appendChild(chip);
          });
        }
        
      } catch (err) {
        console.error('Tokenization error:', err);
        tokensList.innerHTML = `<div style="color:#b91c1c;font-size:0.9rem;">Error: ${err.message}</div>`;
      } finally {
        tokenizeBtn.disabled = false;
        tokenizeBtn.textContent = 'Tokenize';
      }
    });
    
    // Also tokenize on model change
    modelSelect.addEventListener('change', async () => {
      tokenizer = null;
      currentModel = null;
      // Auto-tokenize if there's text
      if (textInput.value.trim()) {
        tokenizeBtn.click();
      }
    });
    
  } catch (error) {
    console.error('Initialization error:', error);
    tokensList.innerHTML = `<div style="color:#b91c1c;font-size:0.9rem;">Failed to initialize tokenizer: ${error.message}</div>`;
  }
}

// Initialize when DOM is ready
initialize();