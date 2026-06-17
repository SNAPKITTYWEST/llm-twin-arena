import Foundation

struct TransformerBlock: Codable {
    let index: Int
    let attention: String
    let positionEncoding: String
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
    "atom": "Probe Llama token boundaries with the smallest useful local prompt.",
    "molecule": "Trim a long context while preserving a WORM event footer.",
    "compound": "Build a local Llama adapter that streams output and hands results to JS WORM."
]

let level = CommandLine.arguments.dropFirst().first ?? "atom"
let visualizer = (1...4).map {
    TransformerBlock(index: $0, attention: "grouped-query attention", positionEncoding: "RoPE", normalization: "RMSNorm")
}

let result = TwinResult(
    twin: "llama",
    model: "llama3.2:3b",
    mode: "swift-deep-compute",
    architectureVisualizer: visualizer,
    challengeLevel: level,
    challengePrompt: challenges[level] ?? challenges["atom"]!,
    wormPayload: [
        "source": "twins/02-llama/swift",
        "sealAuthority": "browser-js-worm",
        "resultType": "architecture-and-challenge"
    ]
)

let encoder = JSONEncoder()
encoder.outputFormatting = [.prettyPrinted, .sortedKeys]
print(String(data: try encoder.encode(result), encoding: .utf8)!)

