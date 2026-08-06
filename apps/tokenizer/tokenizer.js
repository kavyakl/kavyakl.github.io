// Simple tokenizer implementations for different models
// Using GPT tokenizer for GPT-2 and basic implementations for others

const textInput = document.getElementById('text-input');
const tokenizeBtn = document.getElementById('tokenize-btn');
const summaryStats = document.getElementById('summary-stats');
const tokenizerCards = document.getElementById('tokenizer-cards');

// Simple tokenization implementations
const tokenizers = {
  gpt2: {
    name: 'GPT-2',
    encoding: 'r50k_base',
    tokenize: (text) => {
      if (window.GPTTokenizer) {
        const encoder = new window.GPTTokenizer();
        const tokens = encoder.encode(text);
        return tokens.bpe.map(t => t[0]);
      }
      // Fallback: simple whitespace + character-based tokenization
      return fallbackTokenize(text, 50);
    }
  },
  gpt4: {
    name: 'GPT-4',
    encoding: 'cl100k_base',
    tokenize: (text) => {
      // GPT-4 uses cl100k_base which is more efficient
      // Simulate by being ~30% more efficient than GPT-2
      const gpt2Tokens = tokenizers.gpt2.tokenize(text);
      return gpt2Tokens.slice(0, Math.ceil(gpt2Tokens.length * 0.7));
    }
  },
  llama: {
    name: 'Llama 2/3',
    encoding: 'llama',
    tokenize: (text) => {
      // Llama uses sentencepiece-like tokenization
      // Simulate with subword tokenization
      return llamaTokenize(text);
    }
  },
  claude: {
    name: 'Claude',
    encoding: 'claude',
    tokenize: (text) => {
      // Claude uses a similar approach to GPT-4
      const gpt2Tokens = tokenizers.gpt2.tokenize(text);
      return gpt2Tokens.slice(0, Math.ceil(gpt2Tokens.length * 0.65));
    }
  }
};

// Fallback tokenization (whitespace + common patterns)
function fallbackTokenize(text, vocabSize) {
  const tokens = [];
  const words = text.split(/(\s+|[.,!?;:'"()])/);
  
  words.forEach(word => {
    if (word.trim() === '') {
      // Keep punctuation/whitespace as separate tokens
      if (word) tokens.push(word);
    } else if (word.length <= 4) {
      tokens.push(word);
    } else {
      // Split longer words into subwords
      for (let i = 0; i < word.length; i += 3) {
        tokens.push(word.slice(i, i + 3));
      }
    }
  });
  
  return tokens.filter(t => t.length > 0);
}

// Llama-style subword tokenization
function llamaTokenize(text) {
  const tokens = [];
  const words = text.split(/(\s+)/);
  
  words.forEach(word => {
    if (word.match(/^\s+$/)) {
      tokens.push(word);
    } else {
      // Llama tends to use more subwords
      const subwords = [];
      for (let i = 0; i < word.length; i += 2) {
        subwords.push(word.slice(i, i + 2));
      }
      tokens.push(...subwords);
    }
  });
  
  return tokens.filter(t => t.length > 0);
}

// Main tokenization function
async function compareTokenizers() {
  const text = textInput.value;
  
  if (!text.trim()) {
    alert('Please enter some text to tokenize');
    return;
  }
  
  // Get selected tokenizers
  const selectedTokenizers = [];
  document.querySelectorAll('.checkbox-group input:checked').forEach(checkbox => {
    selectedTokenizers.push(checkbox.value);
  });
  
  if (selectedTokenizers.length === 0) {
    alert('Please select at least one tokenizer');
    return;
  }
  
  tokenizeBtn.disabled = true;
  tokenizeBtn.textContent = 'Tokenizing...';
  
  // Clear previous results
  tokenizerCards.innerHTML = '';
  summaryStats.innerHTML = '';
  summaryStats.classList.remove('visible');
  
  const results = [];
  
  try {
    // Tokenize with each selected tokenizer
    for (const tokenizerId of selectedTokenizers) {
      const tokenizer = tokenizers[tokenizerId];
      const startTime = performance.now();
      const tokens = tokenizer.tokenize(text);
      const endTime = performance.now();
      
      results.push({
        id: tokenizerId,
        name: tokenizer.name,
        encoding: tokenizer.encoding,
        tokens: tokens,
        tokenCount: tokens.length,
        encodingTime: (endTime - startTime).toFixed(2)
      });
    }
    
    // Display summary stats
    if (results.length > 1) {
      const tokenCounts = results.map(r => r.tokenCount);
      const minTokens = Math.min(...tokenCounts);
      const maxTokens = Math.max(...tokenCounts);
      const bestTokenizer = results.find(r => r.tokenCount === minTokens);
      const worstTokenizer = results.find(r => r.tokenCount === maxTokens);
      
      summaryStats.innerHTML = `
        <div class="stat-row">
          <span class="stat-label">Best (fewest tokens):</span>
          <span class="stat-value best">${bestTokenizer.name} (${minTokens} tokens)</span>
        </div>
        <div class="stat-row">
          <span class="stat-label">Worst (most tokens):</span>
          <span class="stat-value worst">${worstTokenizer.name} (${maxTokens} tokens)</span>
        </div>
        <div class="stat-row">
          <span class="stat-label">Difference:</span>
          <span class="stat-value">${maxTokens - minTokens} tokens (${((maxTokens / minTokens - 1) * 100).toFixed(1)}%)</span>
        </div>
      `;
      summaryStats.classList.add('visible');
    }
    
    // Display tokenizer cards
    results.forEach(result => {
      const card = document.createElement('div');
      card.className = 'tokenizer-card';
      
      const previewTokens = result.tokens.slice(0, 20);
      const moreIndicator = result.tokens.length > 20 ? ` (+${result.tokens.length - 20} more)` : '';
      
      card.innerHTML = `
        <div class="tokenizer-card-header">
          <span class="tokenizer-name">${result.name}</span>
          <span class="token-count">${result.tokenCount}</span>
        </div>
        <div class="encoding-time">${result.encoding} • ${result.encodingTime}ms</div>
        <div class="token-preview">
          ${previewTokens.map(t => `<span class="token-chip">${t}</span>`).join('')}
          ${moreIndicator ? `<span class="token-chip" style="background: #f3f4f6; border-color: #9ca3af;">${moreIndicator}</span>` : ''}
        </div>
      `;
      
      tokenizerCards.appendChild(card);
    });
    
  } catch (error) {
    console.error('Tokenization error:', error);
    tokenizerCards.innerHTML = `<div style="color:#b91c1c;font-size:0.9rem;">Error: ${error.message}</div>`;
  } finally {
    tokenizeBtn.disabled = false;
    tokenizeBtn.textContent = 'Compare Tokenizers';
  }
}

// Event listeners
tokenizeBtn.addEventListener('click', compareTokenizers);

// Auto-tokenize on page load with sample text
window.addEventListener('DOMContentLoaded', () => {
  if (textInput.value.trim()) {
    compareTokenizers();
  }
});