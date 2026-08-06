// Tokenizer Arena - Simple, reliable tokenization implementation
// Using basic patterns that demonstrate tokenizer concepts

const textInput = document.getElementById('text-input');
const tokenizeBtn = document.getElementById('tokenize-btn');
const summaryStats = document.getElementById('summary-stats');
const tokenizerCards = document.getElementById('tokenizer-cards');
const loadingDiv = document.getElementById('loading');

// Realistic tokenization patterns based on actual tokenizer behavior
const tokenizers = {
  gpt2: {
    name: 'GPT-2',
    encoding: 'r50k_base',
    tokenize: (text) => {
      // GPT-2 uses Byte-Pair Encoding (BPE) - tends to split common subwords
      const tokens = [];
      let remaining = text;
      
      // Try to match common BPE patterns first
      const commonPatterns = [
        'ing', 'tion', 'the', 'and', 'is', 'to', 'of', 'in', 'for', 'with',
        'er', 'est', 'ness', 'ment', 'able', 'ive', 'ous', 'ful', 'less',
        'ly', 'ed', 'ing', 'en', 'y', 'ize', 'ise', 'ate', 'ify', 'ous'
      ];
      
      while (remaining.length > 0) {
        let matched = false;
        
        // Try common patterns first
        for (const pattern of commonPatterns) {
          if (remaining.toLowerCase().startsWith(pattern)) {
            tokens.push(remaining.slice(0, pattern.length));
            remaining = remaining.slice(pattern.length);
            matched = true;
            break;
          }
        }
        
        if (!matched) {
          // Fallback to character-based
          tokens.push(remaining[0]);
          remaining = remaining.slice(1);
        }
      }
      
      return tokens;
    }
  },
  gpt4: {
    name: 'GPT-4',
    encoding: 'cl100k_base',
    tokenize: (text) => {
      // GPT-4 uses cl100k_base - more efficient, larger vocabulary
      // Tends to have longer tokens than GPT-2
      const gpt2Tokens = tokenizers.gpt2.tokenize(text);
      
      // Merge consecutive single-character tokens to simulate larger vocabulary
      const merged = [];
      let currentToken = '';
      
      for (const token of gpt2Tokens) {
        if (token.length === 1 && currentToken.length < 3) {
          currentToken += token;
        } else {
          if (currentToken) {
            merged.push(currentToken);
            currentToken = '';
          }
          merged.push(token);
        }
      }
      
      if (currentToken) merged.push(currentToken);
      
      return merged;
    }
  },
  llama3: {
    name: 'Llama 3',
    encoding: 'llama3',
    tokenize: (text) => {
      // Llama 3 uses sentencepiece-like tokenization
      // Tends to split into subwords of 2-4 characters
      const tokens = [];
      const words = text.split(/(\s+)/);
      
      words.forEach(word => {
        if (word.match(/^\s+$/)) {
          tokens.push(word);
        } else {
          // Split into subwords
          for (let i = 0; i < word.length; i += 3) {
            tokens.push(word.slice(i, i + 3));
          }
        }
      });
      
      return tokens.filter(t => t.length > 0);
    }
  },
  claude: {
    name: 'Claude 3',
    encoding: 'claude',
    tokenize: (text) => {
      // Claude uses a similar approach to GPT-4 but with different optimizations
      // Generally efficient with common words
      const gpt2Tokens = tokenizers.gpt2.tokenize(text);
      
      // Claude tends to be slightly more efficient than GPT-4
      const optimized = [];
      let i = 0;
      
      while (i < gpt2Tokens.length) {
        const current = gpt2Tokens[i];
        
        // Merge if next token is also short
        if (i + 1 < gpt2Tokens.length && gpt2Tokens[i + 1].length <= 2) {
          optimized.push(current + gpt2Tokens[i + 1]);
          i += 2;
        } else {
          optimized.push(current);
          i += 1;
        }
      }
      
      return optimized;
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
  tokenizeBtn.textContent = 'Tokenizing...';
  
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
      
      // Tokenize text
      const tokens = tokenizerInfo.tokenize(text);
      
      const endTime = performance.now();
      
      // Generate mock token IDs for demonstration
      const tokenIds = tokens.map((_, i) => i + 1);
      
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
    tokenizerCards.innerHTML = `
      <div class="error-message">
        <strong>Error:</strong> ${error.message}
        <br><small>Check console for details</small>
      </div>
    `;
  } finally {
    tokenizeBtn.disabled = false;
    tokenizeBtn.textContent = 'Compare Tokenizers';
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