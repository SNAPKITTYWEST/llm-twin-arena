import Foundation

struct TransformerBlock: Codable {
    let index: Int
    let attention: String
    let feedForward: String
    let compactReasoningHint: String
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
    "atom": "Reject empty challenge prompts before local execution.",
    "molecule": "Compress a long challenge into a small Phi-friendly prompt.",
    "compound": "Build an offline judge and hand the verdict to JS WORM."
]

let level = CommandLine.arguments.dropFirst().first ?? "atom"
let visualizer = (1...4).map {
    TransformerBlock(index: $0, attention: "multi-head attention", feedForward: "compact MLP", compactReasoningHint: "prefer explicit invariants")
}

let result = TwinResult(
    twin: "phi",
    model: "phi3:mini",
    mode: "swift-deep-compute",
    architectureVisualizer: visualizer,
    challengeLevel: level,
    challengePrompt: challenges[level] ?? challenges["atom"]!,
    wormPayload: [
        "source": "twins/03-phi/swift",
        "sealAuthority": "browser-js-worm",
        "resultType": "architecture-and-challenge"
    ]
)

let encoder = JSONEncoder()
encoder.outputFormatting = [.prettyPrinted, .sortedKeys]
print(String(data: try encoder.encode(result), encoding: .utf8)!)

