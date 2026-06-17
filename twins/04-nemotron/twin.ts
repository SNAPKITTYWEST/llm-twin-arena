import type { IDigitalTwin_v1 } from '../../abstract/interfaces/IDigitalTwin_v1'

export const nemotronTwin: IDigitalTwin_v1 = {
  id: 'nemotron',
  modelName: 'Nemotron-Mini-4B',
  modelFamily: 'NVIDIA Nemotron',
  parameterCount: '4B',
  ollamaTag: 'nemotron',
  contextWindow: 'local Ollama runtime dependent',
  architecture: {
    tokenizer: 'Nemotron GGUF tokenizer',
    embedding: '2048 hidden-dimension embedding layer',
    blockCount: 32,
    attention: 'grouped-query attention, 32 heads',
    feedForward: 'Nemotron transformer MLP',
    normalization: 'RMSNorm',
    outputHead: 'causal language modeling head'
  },
  challenges: [
    { id: 'nemotron-atom', level: 'atom', title: 'Attention Mechanism', prompt: 'Check grouped-query attention shape for 32 heads.' },
    { id: 'nemotron-molecule', level: 'molecule', title: 'Tokenizer', prompt: 'Probe tokenizer edge cases and prepare a WORM handoff.' },
    { id: 'nemotron-compound', level: 'compound', title: 'Embedding Layer', prompt: 'Inspect hidden dimension 2048 and emit a sealed payload.' }
  ],
  wormSeal: 'browser-generated'
}

