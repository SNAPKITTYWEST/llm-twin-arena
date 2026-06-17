// swift-tools-version: 5.9
import PackageDescription

let package = Package(
    name: "NemotronTwinMode",
    platforms: [.macOS(.v13)],
    products: [
        .executable(name: "TwinMode", targets: ["TwinMode"])
    ],
    targets: [
        .executableTarget(name: "TwinMode")
    ]
)

