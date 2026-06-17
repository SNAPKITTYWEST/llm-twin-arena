export interface IDigitalTwin_v1 {
  id: string
  modelName: string
  modelFamily: string
  parameterCount: string
  ollamaTag: string
  contextWindow: string
  architecture: ITransformerArchitecture
  challenges: ICodingChallengeRef[]
  wormSeal: string
}

export interface ITransformerArchitecture {
  tokenizer: string
  embedding: string
  blockCount: number
  attention: string
  feedForward: string
  normalization: string
  outputHead: string
}

export interface ICodingChallengeRef {
  id: string
  level: 'atom' | 'molecule' | 'compound'
  title: string
  prompt: string
}

