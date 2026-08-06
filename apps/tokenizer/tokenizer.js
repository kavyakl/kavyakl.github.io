// Simple GPT-2 tokenizer implementation
// Using the GPT-2 tokenizer via a simpler approach

const modelSelect = document.getElementById('model-select');
const textInput = document.getElementById('text-input');
const tokenizeBtn = document.getElementById('tokenize-btn');
const tokensList = document.getElementById('tokens-list');

// Basic GPT-2 vocabulary (simplified for demo)
// In production, you'd load the full tokenizer.json
const gpt2Vocab = {
  'Hello': 15496,
  'world': 995,
  '!': 0,
  ' ': 220,
  // This is a minimal example - in production, load full vocab
};

async function loadTokenizer(modelId) {
  console.log('Loading tokenizer for:', modelId);
  // For now, we'll use a simplified approach
  if (modelId === 'gpt2') {
    try {
      const url = 'https://huggingface.co/gpt2/resolve/main/tokenizer.json';
      const res = await fetch(url);
      const json = await res.json();
      console.log('Tokenizer loaded:', json);
      return json;
    } catch (err) {
      console.error('Failed to load tokenizer:', err);
      throw new Error('Failed to load tokenizer configuration');
    }
  }
  throw new Error('Model not supported yet');
}

async function tokenizeText(text, tokenizerConfig) {
  if (!tokenizerConfig) {
    tokenizerConfig = await loadTokenizer(modelSelect.value);
  }
  
  // Simple whitespace-based tokenization for demo
  // In production, use the actual tokenizer logic
  const words = text.split(/\s+/);
  const tokens = [];
  const ids = [];
  
  words.forEach((word, i) => {
    tokens.push(word);
    // Simple hash-based ID for demo (in production, use actual vocab lookup)
    ids.push(Math.abs(word.split('').reduce((a, b) => ((a << 5) - a) + b.charCodeAt(0), 0)) % 50000);
  });
  
  return { tokens, ids };
}

async function initializeTokenizer() {
  let tokenizerConfig = null;
  
  try {
    tokenizerConfig = await loadTokenizer(modelSelect.value);
  } catch (err) {
    console.log('Using fallback tokenization');
  }
  
  tokenizeBtn.addEventListener('click', async () => {
    const text = textInput.value;
    tokensList.innerHTML = '';
    
    if (!text.trim()) {
      tokensList.innerHTML = '<div style="color:#6B7280;font-size:0.9rem;">Please enter some text to tokenize.</div>';
      return;
    }
    
    try {
      const { tokens, ids } = await tokenizeText(text, tokenizerConfig);
      
      if (tokens.length === 0) {
        tokensList.innerHTML = '<div style="color:#6B7280;font-size:0.9rem;">No tokens generated.</div>';
        return;
      }
      
      tokens.forEach((tok, i) => {
        const chip = document.createElement('div');
        chip.className = 'token-chip';
        chip.textContent = `${tok} (${ids[i]})`;
        tokensList.appendChild(chip);
      });
      
      // Add token count
      const countDiv = document.createElement('div');
      countDiv.style.marginTop = '12px';
      countDiv.style.fontSize = '0.85rem';
      countDiv.style.color = '#6B7280';
      countDiv.textContent = `Total tokens: ${tokens.length}`;
      tokensList.appendChild(countDiv);
      
    } catch (err) {
      console.error('Tokenization error:', err);
      tokensList.innerHTML = `<div style="color:#b91c1c;font-size:0.9rem;">Error: ${err.message}</div>`;
    }
  });
}

// Initialize when DOM is ready
if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', initializeTokenizer);
} else {
  initializeTokenizer();
}