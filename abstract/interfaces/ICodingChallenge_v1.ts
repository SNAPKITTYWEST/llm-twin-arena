export interface ICodingChallenge_v1 {
  id: string
  twinId: string
  level: 'atom' | 'molecule' | 'compound'
  title: string
  prompt: string
  expectedArtifacts: string[]
  sealRequired: true
}

export interface IChallengeResult_v1 {
  tick: number
  model: string
  challenge: string
  result: 'pass' | 'review' | 'blocked'
  response: string
  seal: string
}

