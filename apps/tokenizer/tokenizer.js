// Tokenizer Arena - Using @lenml/tokenizers for real tokenization
// Real tokenizers for GPT-4, Claude, Llama 3, GPT-2

import { fromPreTrained as fromGPT2 } from '@lenml/tokenizer-gpt2';
import { fromPreTrained as fromGPT4 } from '@lenml/tokenizer-gpt4';
import { fromPreTrained as fromLlama3 } from '@lenml/tokenizer-llama3';
import { fromPreTrained as fromClaude } from '@lenml/tokenizer-claude';

const textInput = document.getElementById('text-input');
const tokenizeBtn = document.getElementById('tokenize-btn');
const summaryStats = document.getElementById('summary-stats');
const tokenizerCards = document.getElementById('tokenizer-cards');
const loadingDiv = document.getElementById('loading');

// Tokenizer definitions with real implementations
const tokenizerDefs = {
  gpt2: {
    name: 'GPT-2',
    encoding: 'r50k_base',
    loader: fromGPT2,
    tokenizer: null,
    async init() {
      this.tokenizer = this.loader();
    },
    tokenize(text) {
      const encoded = this.tokenizer.encode(text, null, { add_special_tokens: false });
      return encoded.input_ids;
    }
  },
  gpt4: {
    name: 'GPT-4',
    encoding: 'cl100k_base',
    loader: fromGPT4,
    tokenizer: null,
    async init() {
      this.tokenizer = this.loader();
    },
    tokenize(text) {
      const encoded = this.tokenizer.encode(text, null, { add_special_tokens: false });
      return encoded.input_ids;
    }
  },
  llama3: {
    name: 'Llama 3',
    encoding: 'llama3',
    loader: fromLlama3,
    tokenizer: null,
    async init() {
      this.tokenizer = this.loader();
    },
    tokenize(text) {
      const encoded = this.tokenizer.encode(text, null, { add_special_tokens: false });
      return encoded.input_ids;
    }
  },
  claude: {
    name: 'Claude 3',
    encoding: 'claude',
    loader: fromClaude,
    tokenizer: null,
    async init() {
      this.tokenizer = this.loader();
    },
    tokenize(text) {
      const encoded = this.tokenizer.encode(text, null, { add_special_tokens: false });
      return encoded.input_ids;
    }
  }
};

// Main tokenization function
async function compareTokenizers() {
  const text = textInput.value;
  
  if (!text.trim()) {
    alert('Please enter some text to tokenize');
    return;
  }
  
  // Get selected tokenizers
  const selectedTokenizerIds = [];
  document.querySelectorAll('.checkbox-group input:checked').forEach(checkbox => {
    selectedTokenizerIds.push(checkbox.value);
  });
  
  if (selectedTokenizerIds.length === 0) {
    alert('Please select at least one tokenizer');
    return;
  }
  
  // Show loading
  tokenizeBtn.disabled = true;
  loadingDiv.style.display = 'flex';
  
  // Clear previous results
  tokenizerCards.innerHTML = '';
  summaryStats.innerHTML = '';
  summaryStats.classList.remove('visible');
  
  const results = [];
  
  try {
    // Initialize selected tokenizers
    for (const id of selectedTokenizerIds) {
      const tokenizer = tokenizerDefs[id];
      if (!tokenizer.tokenizer) {
        await tokenizer.init();
      }
    }
    
    // Tokenize with each selected tokenizer
    for (const tokenizerId of selectedTokenizerIds) {
      const tokenizer = tokenizerDefs[tokenizerId];
      const startTime = performance.now();
      const tokenIds = tokenizer.tokenize(text);
      const endTime = performance.now();
      
      // Decode tokens to show actual text
      const decodedTokens = tokenIds.map(id => {
        const decoded = tokenizer.tokenizer.decode([id]);
        return decoded;
      });
      
      results.push({
        id: tokenizerId,
        name: tokenizer.name,
        encoding: tokenizer.encoding,
        tokenIds: tokenIds,
        tokens: decodedTokens,
        tokenCount: tokenIds.length,
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
      
      const savings = ((1 - minTokens / maxTokens) * 100).toFixed(1);
      
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
          <span class="stat-label">Savings:</span>
          <span class="stat-value">${savings}% fewer tokens with ${bestTokenizer.name}</span>
        </div>
      `;
      summaryStats.classList.add('visible');
    }
    
    // Display tokenizer cards
    results.forEach(result => {
      const card = document.createElement('div');
      card.className = 'tokenizer-card';
      
      // Show first 30 tokens with token IDs
      const previewTokens = result.tokens.slice(0, 30);
      const previewIds = result.tokenIds.slice(0, 30);
      const moreIndicator = result.tokens.length > 30 ? ` (+${result.tokens.length - 30} more)` : '';
      
      card.innerHTML = `
        <div class="tokenizer-card-header">
          <span class="tokenizer-name">${result.name}</span>
          <span class="token-count">${result.tokenCount}</span>
        </div>
        <div class="encoding-time">${result.encoding} • ${result.encodingTime}ms</div>
        <div class="token-preview">
          ${previewTokens.map((t, i) => `
            <span class="token-chip" title="Token ID: ${result.tokenIds[i]}">
              ${escapeHtml(t)}
            </span>
          `).join('')}
          ${moreIndicator ? `<span class="token-chip more">${moreIndicator}</span>` : ''}
        </div>
        <div class="token-ids">
          Token IDs: [${result.tokenIds.slice(0, 15).join(', ')}${result.tokenIds.length > 15 ? '...' : ''}]
        </div>
      `;
      
      tokenizerCards.appendChild(card);
    });
    
  } catch (error) {
    console.error('Tokenization error:', error);
    tokenizerCards.innerHTML = `
      <div class="error-message">
        <strong>Error:</strong> ${error.message}
        <br><small>Check console for details</small>
      </div>
    `;
  } finally {
    tokenizeBtn.disabled = false;
    loadingDiv.style.display = 'none';
  }
}

// Helper function to escape HTML
function escapeHtml(text) {
  const div = document.createElement('div');
  div.textContent = text;
  return div.innerHTML;
}

// Event listeners
tokenizeBtn.addEventListener('click', compareTokenizers);

// Auto-tokenize on page load with sample text
window.addEventListener('DOMContentLoaded', () => {
  if (textInput.value.trim()) {
    compareTokenizers();
  }
});

// Allow Enter key to trigger tokenization (with Ctrl/Cmd)
textInput.addEventListener('keydown', (e) => {
  if (e.key === 'Enter' && (e.ctrlKey || e.metaKey)) {
    e.preventDefault();
    compareTokenizers();
  }
});