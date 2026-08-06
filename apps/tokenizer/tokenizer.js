// Tokenizer using gpt-tokenizer and @lenml/tokenizers libraries
const modelSelect = document.getElementById('model-select');
const textInput = document.getElementById('text-input');
const tokenizeBtn = document.getElementById('tokenize-btn');
const tokensList = document.getElementById('tokens-list');
const tokenCount = document.getElementById('token-count');

async function tokenizeText(text, model) {
    try {
        let tokens = [];
        
        if (model === 'gpt2') {
            // Use gpt-tokenizer for GPT-2
            if (window.GPTTokenizer) {
                const tokenizer = new window.GPTTokenizer();
                tokens = tokenizer.encode(text);
            } else {
                throw new Error('GPT tokenizer library not loaded');
            }
        } else if (model === 'gpt4') {
            // Use gpt-tokenizer for GPT-4 (cl100k_base)
            if (window.GPTTokenizer) {
                const tokenizer = new window.GPTTokenizer({ type: 'cl100k_base' });
                tokens = tokenizer.encode(text);
            } else {
                throw new Error('GPT tokenizer library not loaded');
            }
        } else if (['llama2', 'llama3', 'cohere', 'claude'].includes(model)) {
            // Use @lenml/tokenizers for other models
            if (window.lenml_tokenizers) {
                const tokenizer = new window.lenml_tokenizers[model]();
                tokens = tokenizer.encode(text);
            } else {
                throw new Error('LenML tokenizers library not loaded');
            }
        } else {
            throw new Error('Model not supported');
        }
        
        return tokens;
    } catch (error) {
        console.error('Tokenization error:', error);
        throw error;
    }
}

async function initialize() {
    // Wait for libraries to load
    await new Promise(resolve => setTimeout(resolve, 1000));
    
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
            const tokens = await tokenizeText(text, modelSelect.value);
            
            if (!tokens || tokens.length === 0) {
                tokensList.innerHTML = '<div style="color:#6B7280;font-size:0.9rem;">No tokens generated.</div>';
                return;
            }
            
            // Display token count
            tokenCount.textContent = `Total tokens: ${tokens.length}`;
            
            // Display tokens
            tokens.forEach((token, index) => {
                const chip = document.createElement('div');
                chip.className = 'token-chip';
                chip.textContent = `${token} (${index})`;
                tokensList.appendChild(chip);
            });
            
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
        if (textInput.value.trim()) {
            tokenizeBtn.click();
        }
    });
}

// Initialize when DOM is ready
if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', initialize);
} else {
    initialize();
}