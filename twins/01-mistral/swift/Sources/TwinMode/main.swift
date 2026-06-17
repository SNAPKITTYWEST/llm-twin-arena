import Foundation

struct TransformerBlock: Codable {
    let index: Int
    let attention: String
    let feedForward: String
    let normalization: String
}

struct TwinResult: Codable {
    let twin: String
    let model: String
    let mode: String
    let architectureVisualizer: [TransformerBlock]
    let challengeLevel: String
    let challengePrompt: String
    let wormPayload: [String: String]
}

let challenges = [
    "atom": "Validate a WORM event JSON object for Mistral without mutating input.",
    "molecule": "Build a parent-child seal summary for two Mistral WORM events.",
    "compound": "Design a local Mistral review CLI that emits a JS-sealable result."
]

let level = CommandLine.arguments.dropFirst().first ?? "atom"
let visualizer = (1...4).map {
    TransformerBlock(index: $0, attention: "grouped-query attention", feedForward: "SwiGLU", normalization: "RMSNorm")
}

let result = TwinResult(
    twin: "mistral",
    model: "mistral:7b",
    mode: "swift-deep-compute",
    architectureVisualizer: visualizer,
    challengeLevel: level,
    challengePrompt: challenges[level] ?? challenges["atom"]!,
    wormPayload: [
        "source": "twins/01-mistral/swift",
        "sealAuthority": "browser-js-worm",
        "resultType": "architecture-and-challenge"
    ]
)

let encoder = JSONEncoder()
encoder.outputFormatting = [.prettyPrinted, .sortedKeys]
print(String(data: try encoder.encode(result), encoding: .utf8)!)

