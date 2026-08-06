import { Tokenizer } from 'https://cdn.skypack.dev/@huggingface/tokenizers@0.1.0';

const modelSelect = document.getElementById('model-select');
const textInput = document.getElementById('text-input');
const tokenizeBtn = document.getElementById('tokenize-btn');
const tokensList = document.getElementById('tokens-list');

let currentTokenizer = null;

async function loadTokenizer(modelId) {
  // For now, just gpt2; later we can map modelId -> config / URL
  if (modelId === 'gpt2') {
    // Using a prebuilt tokenizer from HF hub via a simple wrapper
    const url = 'https://huggingface.co/gpt2/resolve/main/tokenizer.json';
    const res = await fetch(url);
    const json = await res.json();
    currentTokenizer = Tokenizer.fromJSON(json);
  } else {
    throw new Error('Model not supported yet');
  }
}

async function tokenizeText(text) {
  if (!currentTokenizer) {
    await loadTokenizer(modelSelect.value);
  }
  const encoding = currentTokenizer.encode(text);
  return {
    tokens: encoding.tokens,
    ids: encoding.ids,
  };
}

tokenizeBtn.addEventListener('click', async () => {
  const text = textInput.value;
  tokensList.innerHTML = '';
  try {
    const { tokens, ids } = await tokenizeText(text);
    tokens.forEach((tok, i) => {
      const chip = document.createElement('div');
      chip.className = 'token-chip';
      chip.textContent = `${tok} (${ids[i]})`;
      tokensList.appendChild(chip);
    });
  } catch (err) {
    tokensList.innerHTML = `<div style="color:#b91c1c;font-size:0.9rem;">Error: ${err.message}</div>`;
  }
});

// Load initial tokenizer
loadTokenizer(modelSelect.value);