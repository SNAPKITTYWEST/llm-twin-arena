import type { IDigitalTwin_v1 } from '../../abstract/interfaces/IDigitalTwin_v1'

export const mistralTwin: IDigitalTwin_v1 = {
  id: 'mistral',
  modelName: 'Mistral 7B',
  modelFamily: 'Mistral',
  parameterCount: '7B',
  ollamaTag: 'mistral:7b',
  contextWindow: '32k tokens',
  architecture: {
    tokenizer: 'SentencePiece',
    embedding: 'dense token embedding',
    blockCount: 32,
    attention: 'grouped-query attention',
    feedForward: 'SwiGLU feed-forward',
    normalization: 'RMSNorm',
    outputHead: 'causal language modeling head'
  },
  challenges: [
    { id: 'mistral-atom', level: 'atom', title: 'Parse Guard', prompt: 'Validate a WORM event JSON object.' },
    { id: 'mistral-molecule', level: 'molecule', title: 'Seal Join', prompt: 'Join two sealed events into a parent-child summary.' },
    { id: 'mistral-compound', level: 'compound', title: 'Local Review CLI', prompt: 'Create a CLI that appends a sealed Ollama result.' }
  ],
  wormSeal: 'browser-generated'
}

