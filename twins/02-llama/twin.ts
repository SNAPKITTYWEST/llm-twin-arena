import type { IDigitalTwin_v1 } from '../../abstract/interfaces/IDigitalTwin_v1'

export const llamaTwin: IDigitalTwin_v1 = {
  id: 'llama',
  modelName: 'Llama 3.2',
  modelFamily: 'Llama',
  parameterCount: '3B',
  ollamaTag: 'llama3.2:3b',
  contextWindow: '128k tokens',
  architecture: {
    tokenizer: 'tiktoken-style BPE',
    embedding: 'RoPE-positioned token embedding',
    blockCount: 28,
    attention: 'grouped-query attention',
    feedForward: 'SwiGLU feed-forward',
    normalization: 'RMSNorm',
    outputHead: 'causal language modeling head'
  },
  challenges: [
    { id: 'llama-atom', level: 'atom', title: 'Tokenizer Probe', prompt: 'Expose token boundary assumptions with a small prompt.' },
    { id: 'llama-molecule', level: 'molecule', title: 'Context Budget', prompt: 'Trim messages while preserving WORM evidence.' },
    { id: 'llama-compound', level: 'compound', title: 'Arena Adapter', prompt: 'Stream from Ollama and record a final seal.' }
  ],
  wormSeal: 'browser-generated'
}

