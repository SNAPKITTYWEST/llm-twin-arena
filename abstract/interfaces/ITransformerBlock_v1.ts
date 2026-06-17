export interface ITransformerBlock_v1 {
  index: number
  attention: {
    type: string
    heads: number | string
    kvCache: boolean
  }
  normalization: {
    preAttention: string
    preFeedForward: string
  }
  feedForward: {
    type: string
    activation: string
  }
}

