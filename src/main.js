import { pipeline, env } from '@huggingface/transformers';
import './style.css';

const MODEL_ID = 'onnx-community/Qwen2.5-0.5B-Instruct';
const SYSTEM_PROMPT = `Você é a BG-AI, uma assistente virtual da comunidade BG SCRIPTS. Responda em português brasileiro por padrão. Seja clara, educada, útil e honesta. Não invente fatos; quando não souber, diga isso. Use Markdown simples quando ajudar. Em programação, explique o código e considere que a pessoa pode estar desenvolvendo pelo celular.`;
env.allowLocalModels = false;

const $ = (id) => document.getElementById(id);
const form = $('chat-form'), input = $('prompt'), send = $('send');
const messagesEl = $('messages'), welcome = $('welcome'), statusEl = $('load-status');
let generator = null, loading = false, history = [], currentMessages = [];

function setStatus(text, error = false) {
  statusEl.textContent = text;
  statusEl.classList.toggle('error', error);
}
function showChat() {
  welcome.style.display = 'none';
  messagesEl.style.display = 'block';
}
function addMessage(role, text) {
  showChat();
  const row = document.createElement('div');
  row.className = `message ${role}`;
  const avatar = document.createElement('div');
  avatar.className = 'avatar';
  avatar.textContent = role === 'user' ? 'EU' : 'BG';
  const bubble = document.createElement('div');
  bubble.className = 'bubble';
  bubble.textContent = text;
  row.append(avatar, bubble);
  messagesEl.append(row);
  row.scrollIntoView({ behavior: 'smooth', block: 'end' });
  return bubble;
}
async function loadModel() {
  if (generator) return generator;
  if (loading) throw new Error('O modelo já está sendo carregado. Aguarde.');
  loading = true; send.disabled = true;
  setStatus('Preparando o modelo… o primeiro carregamento pode demorar.');
  try {
    const device = navigator.gpu ? 'webgpu' : 'wasm';
    generator = await pipeline('text-generation', MODEL_ID, {
      device,
      dtype: 'q4',
      progress_callback: (p) => {
        if (p.status === 'progress' && p.total) {
          const pct = Math.round((p.loaded || 0) / p.total * 100);
          setStatus(`Baixando modelo: ${pct}%`);
        } else if (p.status === 'downloading') {
          setStatus('Baixando arquivos do modelo…');
        } else if (p.status === 'ready') {
          setStatus('Modelo pronto neste dispositivo.');
        }
      }
    });
    setStatus(`Modelo carregado (${device === 'webgpu' ? 'WebGPU' : 'CPU/WASM'}).`);
    return generator;
  } catch (err) {
    generator = null;
    throw err;
  } finally {
    loading = false; send.disabled = false;
  }
}
async function sendMessage(text) {
  const clean = text.trim();
  if (!clean || loading) return;
  input.value = '';
  input.style.height = 'auto';
  currentMessages.push({ role: 'user', content: clean });
  addMessage('user', clean);
  const answerBubble = addMessage('assistant', 'Preparando resposta…');
  send.disabled = true;
  try {
    const model = await loadModel();
    setStatus('A BG-AI está pensando…');
    const messages = [
      { role: 'system', content: SYSTEM_PROMPT },
      ...currentMessages.slice(-12)
    ];
    const result = await model(messages, {
      max_new_tokens: 240,
      do_sample: true,
      temperature: 0.7,
      top_p: 0.85,
      repetition_penalty: 1.08
    });
    const output = result[0]?.generated_text;
    let answer = '';
    if (Array.isArray(output)) answer = output[output.length - 1]?.content || '';
    else if (typeof output === 'string') answer = output;
    answer = answer.trim() || 'Não consegui gerar uma resposta. Tente novamente.';
    answerBubble.textContent = answer;
    currentMessages.push({ role: 'assistant', content: answer });
    setStatus('Modelo pronto neste dispositivo.');
  } catch (err) {
    answerBubble.textContent = `Não foi possível executar o modelo: ${err.message || err}. Confira sua conexão e tente novamente.`;
    answerBubble.classList.add('error');
    setStatus('Falha ao carregar ou executar o modelo.', true);
  } finally {
    send.disabled = false;
    input.focus();
  }
}
form.addEventListener('submit', e => { e.preventDefault(); sendMessage(input.value); });
input.addEventListener('input', () => {
  input.style.height = 'auto';
  input.style.height = `${Math.min(input.scrollHeight, 150)}px`;
});
$('new-chat').addEventListener('click', () => {
  currentMessages = [];
  messagesEl.innerHTML = '';
  messagesEl.style.display = 'none';
  welcome.style.display = 'block';
  setStatus(generator ? 'Modelo pronto neste dispositivo.' : 'O modelo será baixado do Hugging Face na primeira utilização.');
  $('sidebar').classList.remove('open');
});
document.querySelectorAll('.suggestion').forEach(btn => btn.addEventListener('click', () => sendMessage(btn.dataset.prompt)));
$('menu-toggle').addEventListener('click', () => document.querySelector('.sidebar').classList.toggle('open'));

// Aviso: histórico permanece apenas na memória desta aba nesta primeira versão.
