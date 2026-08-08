// Tokenizer Arena - Using simple tokenization patterns for demo
// Simulated tokenization for different LLM tokenizers

// DOM elements (will be initialized when DOM is ready)
let textInput, tokenizeBtn, summaryStats, tokenizerCards, loadingDiv;

// Simulated tokenizer patterns based on real tokenizer behaviors
const tokenizerPatterns = {
  gpt2: {
    name: 'GPT-2',
    encoding: 'r50k_base',
    // GPT-2 uses byte-level encoding with 50k vocabulary
    tokenize: (text) => {
      // Simulate GPT-2 tokenization (rough approximation)
      const tokens = [];
      let remaining = text;
      const commonWords = ['the', 'be', 'to', 'of', 'and', 'a', 'in', 'that', 'have', 'I', 'it', 'for', 'not', 'on', 'with', 'he', 'as', 'you', 'do', 'at'];
      const words = remaining.toLowerCase().split(/(\s+|[.,!?;:"'()])/);
      
      words.forEach(word => {
        if (word.trim() === '') {
          if (word.match(/\s+/)) tokens.push(word);
          return;
        }
        if (commonWords.includes(word.toLowerCase())) {
          tokens.push(word);
        } else {
          // Split longer words into subwords
          for (let i = 0; i < word.length; i += 4) {
            tokens.push(word.substring(i, i + 4));
          }
        }
      });
      return tokens.filter(t => t.length > 0);
    }
  },
  gpt4: {
    name: 'GPT-4',
    encoding: 'cl100k_base',
    // GPT-4 uses cl100k_base with better multi-token support
    tokenize: (text) => {
      const tokens = [];
      const words = text.split(/(\s+|[.,!?;:"'()])/);
      
      words.forEach(word => {
        if (word.trim() === '') {
          if (word.match(/\s+/)) tokens.push(word);
          return;
        }
        // GPT-4 tends to group common patterns better
        if (word.length <= 3) {
          tokens.push(word);
        } else {
          for (let i = 0; i < word.length; i += 3) {
            tokens.push(word.substring(i, i + 3));
          }
        }
      });
      return tokens.filter(t => t.length > 0);
    }
  },
  llama3: {
    name: 'Llama 3',
    encoding: 'llama3',
    // Llama 3 uses sentencepiece-style tokenization
    tokenize: (text) => {
      const tokens = [];
      const words = text.split(/(\s+|[.,!?;:"'()])/);
      
      words.forEach(word => {
        if (word.trim() === '') {
          if (word.match(/\s+/)) tokens.push(word);
          return;
        }
        // Llama 3 tends to be more conservative with tokenization
        if (word.length <= 5) {
          tokens.push(word);
        } else {
          for (let i = 0; i < word.length; i += 5) {
            tokens.push(word.substring(i, i + 5));
          }
        }
      });
      return tokens.filter(t => t.length > 0);
    }
  },
  claude: {
    name: 'Claude 3',
    encoding: 'claude',
    // Claude uses a custom tokenizer similar to GPT-4
    tokenize: (text) => {
      const tokens = [];
      const words = text.split(/(\s+|[.,!?;:"'()])/);
      
      words.forEach(word => {
        if (word.trim() === '') {
          if (word.match(/\s+/)) tokens.push(word);
          return;
        }
        // Claude tends to be efficient with common words
        if (word.length <= 4) {
          tokens.push(word);
        } else {
          for (let i = 0; i < word.length; i += 4) {
            tokens.push(word.substring(i, i + 4));
          }
        }
      });
      return tokens.filter(t => t.length > 0);
    }
  }
};

// Tokenizer instances
let tokenizers = {};

// Initialize all tokenizers on page load
async function initializeTokenizers() {
  // Get DOM elements
  textInput = document.getElementById('text-input');
  tokenizeBtn = document.getElementById('tokenize-btn');
  summaryStats = document.getElementById('summary-stats');
  tokenizerCards = document.getElementById('tokenizer-cards');
  loadingDiv = document.getElementById('loading');
  
  loadingDiv.style.display = 'flex';
  loadingDiv.querySelector('span').textContent = 'Loading tokenizers...';
  
  try {
    console.log('Loading tokenizers...');
    
    // Simulate loading delay
    await new Promise(resolve => setTimeout(resolve, 500));
    
    tokenizers = tokenizerPatterns;
    
    loadingDiv.style.display = 'none';
    console.log('All tokenizers initialized successfully');
  } catch (error) {
    console.error('Failed to load tokenizers:', error);
    loadingDiv.innerHTML = `
      <div class="error-message" style="background:#fef2f2;border:1px solid #fecaca;border-radius:8px;padding:12px;color:#b91c1c;">
        <strong>Error loading tokenizers:</strong> ${error.message}
        <br><small>Check console for details</small>
      </div>
    `;
  }
}

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
  
  // Clear previous results
  tokenizerCards.innerHTML = '';
  summaryStats.innerHTML = '';
  summaryStats.classList.remove('visible');
  
  const results = [];
  
  try {
    // Tokenize with each selected tokenizer
    for (const tokenizerId of selectedTokenizerIds) {
      const tokenizerInfo = tokenizers[tokenizerId];
      
      if (!tokenizerInfo) {
        console.error(`Unknown tokenizer: ${tokenizerId}`);
        continue;
      }
      
      const startTime = performance.now();
      
      // Tokenize text using the simulated tokenizer
      console.log(`Tokenizing with ${tokenizerId}...`);
      const tokens = tokenizerInfo.tokenize(text);
      console.log(`Tokens:`, tokens);
      
      // Generate fake token IDs for demo purposes
      const tokenIds = tokens.map((_, i) => i + 1000);
      
      const endTime = performance.now();
      
      results.push({
        id: tokenizerId,
        name: tokenizerInfo.name,
        encoding: tokenizerInfo.encoding,
        tokenIds: tokenIds,
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
    console.error('Error stack:', error.stack);
    tokenizerCards.innerHTML = `
      <div class="error-message">
        <strong>Error:</strong> ${error.message}
        <br><small>Check browser console (F12) for full error details</small>
      </div>
    `;
  } finally {
    tokenizeBtn.disabled = false;
  }
}

// Helper function to escape HTML
function escapeHtml(text) {
  const div = document.createElement('div');
  div.textContent = text;
  return div.innerHTML;
}

// Initialize tokenizers on page load
window.addEventListener('DOMContentLoaded', () => {
  // Get DOM elements first
  textInput = document.getElementById('text-input');
  tokenizeBtn = document.getElementById('tokenize-btn');
  summaryStats = document.getElementById('summary-stats');
  tokenizerCards = document.getElementById('tokenizer-cards');
  loadingDiv = document.getElementById('loading');
  
  // Set up event listeners
  tokenizeBtn.addEventListener('click', compareTokenizers);
  
  textInput.addEventListener('keydown', (e) => {
    if (e.key === 'Enter' && (e.ctrlKey || e.metaKey)) {
      e.preventDefault();
      compareTokenizers();
    }
  });
  
  // Initialize tokenizers
  initializeTokenizers();
  
  // Auto-tokenize if there's text after tokenizers load
  if (textInput.value.trim()) {
    setTimeout(compareTokenizers, 1000);
  }
});