import type { IDigitalTwin_v1 } from '../../abstract/interfaces/IDigitalTwin_v1'

export const phiTwin: IDigitalTwin_v1 = {
  id: 'phi',
  modelName: 'Phi-3 Mini',
  modelFamily: 'Phi',
  parameterCount: '3.8B',
  ollamaTag: 'phi3:mini',
  contextWindow: '4k tokens',
  architecture: {
    tokenizer: 'SentencePiece',
    embedding: 'compact token embedding',
    blockCount: 32,
    attention: 'multi-head attention',
    feedForward: 'MLP feed-forward',
    normalization: 'RMSNorm',
    outputHead: 'causal language modeling head'
  },
  challenges: [
    { id: 'phi-atom', level: 'atom', title: 'Small Proof', prompt: 'Reject empty challenge prompts.' },
    { id: 'phi-molecule', level: 'molecule', title: 'Memory Fit', prompt: 'Compress a long challenge into a constrained local prompt.' },
    { id: 'phi-compound', level: 'compound', title: 'Offline Judge', prompt: 'Grade a response locally and seal the result.' }
  ],
  wormSeal: 'browser-generated'
}

