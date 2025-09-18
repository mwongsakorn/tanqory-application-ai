# Vision Development Standards

> **Platform Memory**: visionOS development standards and spatial computing

---

## Overview

This document establishes comprehensive development standards for Apple Vision Pro and visionOS applications. It covers spatial computing patterns, SwiftUI for visionOS, RealityKit integration, and immersive experience design principles for building enterprise-grade mixed reality applications.

## Spatial Computing Architecture

### App Architecture for visionOS

```swift
import SwiftUI
import RealityKit
import ARKit
import VisionKit

@main
struct VisionApp: App {
    @StateObject private var appModel = AppModel()
    @StateObject private var immersiveSpaceManager = ImmersiveSpaceManager()
    @StateObject private var spatialTrackingManager = SpatialTrackingManager()

    var body: some Scene {
        // Main window group for 2D content
        WindowGroup("Main Window", id: "main") {
            ContentView()
                .environmentObject(appModel)
                .environmentObject(immersiveSpaceManager)
        }
        .windowStyle(.automatic)
        .windowResizability(.contentSize)

        // Volume for 3D content
        WindowGroup("3D Content", id: "3d-volume", for: String.self) { $modelID in
            Model3DView(modelID: modelID ?? "")
                .environmentObject(appModel)
        }
        .windowStyle(.volumetric)
        .defaultSize(width: 0.8, height: 0.8, depth: 0.8, in: .meters)

        // Immersive space for full AR/VR experiences
        ImmersiveSpace("Immersive", id: "immersive") {
            ImmersiveView()
                .environmentObject(appModel)
                .environmentObject(spatialTrackingManager)
        }
        .immersionStyle(selection: $immersiveSpaceManager.immersionStyle, in: .mixed, .progressive, .full)
        .upperLimbVisibility($immersiveSpaceManager.upperLimbVisibility)
    }
}

class AppModel: ObservableObject {
    @Published var isImmersiveSpaceOpen = false
    @Published var currentScene: AppScene = .main
    @Published var spatialDataModels: [SpatialDataModel] = []

    private let persistenceManager = SpatialPersistenceManager()
    private let networkManager = SpatialNetworkManager()

    enum AppScene: CaseIterable {
        case main, visualization, collaboration, immersive

        var displayName: String {
            switch self {
            case .main: return "Main Interface"
            case .visualization: return "Data Visualization"
            case .collaboration: return "Collaborative Space"
            case .immersive: return "Immersive Experience"
            }
        }
    }

    func transitionToScene(_ scene: AppScene) async {
        await MainActor.run {
            currentScene = scene
        }

        switch scene {
        case .immersive:
            await openImmersiveSpace()
        default:
            await closeImmersiveSpace()
        }
    }

    @MainActor
    private func openImmersiveSpace() async {
        guard !isImmersiveSpaceOpen else { return }

        switch await OpenImmersiveSpaceAction(id: "immersive").callAsFunction() {
        case .opened:
            isImmersiveSpaceOpen = true
        case .error, .userCancelled:
            print("Failed to open immersive space")
        @unknown default:
            break
        }
    }

    @MainActor
    private func closeImmersiveSpace() async {
        guard isImmersiveSpaceOpen else { return }

        await DismissImmersiveSpaceAction().callAsFunction()
        isImmersiveSpaceOpen = false
    }
}

class ImmersiveSpaceManager: ObservableObject {
    @Published var immersionStyle: ImmersionStyle = .mixed
    @Published var upperLimbVisibility: Visibility = .automatic
    @Published var spatialAnchor: SpatialAnchor?

    private let anchorManager = SpatialAnchorManager()

    func setImmersionLevel(_ style: ImmersionStyle) {
        immersionStyle = style
    }

    func toggleUpperLimbVisibility() {
        upperLimbVisibility = upperLimbVisibility == .visible ? .hidden : .visible
    }

    func createSpatialAnchor(at transform: simd_float4x4) async -> SpatialAnchor? {
        return await anchorManager.createAnchor(at: transform)
    }
}
```

### SwiftUI for visionOS

```swift
struct ContentView: View {
    @EnvironmentObject private var appModel: AppModel
    @EnvironmentObject private var immersiveSpaceManager: ImmersiveSpaceManager
    @State private var selectedTab: String = "dashboard"

    var body: some View {
        NavigationStack {
            TabView(selection: $selectedTab) {
                DashboardView()
                    .tabItem {
                        Label("Dashboard", systemImage: "chart.bar.fill")
                    }
                    .tag("dashboard")

                DataVisualizationView()
                    .tabItem {
                        Label("Visualization", systemImage: "cube.fill")
                    }
                    .tag("visualization")

                CollaborationView()
                    .tabItem {
                        Label("Collaboration", systemImage: "person.2.fill")
                    }
                    .tag("collaboration")

                SettingsView()
                    .tabItem {
                        Label("Settings", systemImage: "gear")
                    }
                    .tag("settings")
            }
            .navigationTitle("Vision Enterprise")
            .toolbar {
                ToolbarItemGroup(placement: .primaryAction) {
                    ImmersiveModeToggle()
                    WindowControlsView()
                }
            }
        }
        .frame(minWidth: 400, minHeight: 300)
    }
}

struct ImmersiveModeToggle: View {
    @EnvironmentObject private var appModel: AppModel
    @EnvironmentObject private var immersiveSpaceManager: ImmersiveSpaceManager

    var body: some View {
        Menu {
            Button("Mixed Reality") {
                immersiveSpaceManager.setImmersionLevel(.mixed)
                Task {
                    await appModel.transitionToScene(.immersive)
                }
            }

            Button("Progressive Immersion") {
                immersiveSpaceManager.setImmersionLevel(.progressive)
                Task {
                    await appModel.transitionToScene(.immersive)
                }
            }

            Button("Full Immersion") {
                immersiveSpaceManager.setImmersionLevel(.full)
                Task {
                    await appModel.transitionToScene(.immersive)
                }
            }

            Divider()

            Button("Exit Immersive Mode") {
                Task {
                    await appModel.transitionToScene(.main)
                }
            }
            .disabled(!appModel.isImmersiveSpaceOpen)
        } label: {
            Image(systemName: "visionpro")
                .foregroundStyle(appModel.isImmersiveSpaceOpen ? .blue : .primary)
        }
        .help("Immersive Mode Options")
    }
}

struct DataVisualizationView: View {
    @EnvironmentObject private var appModel: AppModel
    @State private var selectedDataset: String = "sales"
    @State private var visualizationType: VisualizationType = .chart3D

    enum VisualizationType: String, CaseIterable {
        case chart3D = "3D Chart"
        case spatialMap = "Spatial Map"
        case timeline = "Timeline"
        case network = "Network Graph"
    }

    var body: some View {
        VStack(spacing: 20) {
            HStack {
                Picker("Dataset", selection: $selectedDataset) {
                    Text("Sales Data").tag("sales")
                    Text("User Analytics").tag("analytics")
                    Text("Performance Metrics").tag("performance")
                }
                .pickerStyle(.segmented)

                Spacer()

                Picker("Visualization", selection: $visualizationType) {
                    ForEach(VisualizationType.allCases, id: \.self) { type in
                        Text(type.rawValue).tag(type)
                    }
                }
                .pickerStyle(.menu)
            }

            // 3D Visualization Container
            RealityView { content in
                await setupVisualization(content: content)
            } update: { content in
                await updateVisualization(content: content)
            }
            .frame(minHeight: 400)
            .background(.ultraThinMaterial, in: RoundedRectangle(cornerRadius: 12))

            HStack {
                Button("Open in Volume") {
                    openInVolumetricWindow()
                }
                .buttonStyle(.borderedProminent)

                Button("Enter Immersive Mode") {
                    Task {
                        await appModel.transitionToScene(.visualization)
                    }
                }
                .buttonStyle(.bordered)

                Spacer()

                Button("Export Data") {
                    exportVisualization()
                }
                .buttonStyle(.bordered)
            }
        }
        .padding()
    }

    private func setupVisualization(content: RealityViewContent) async {
        let visualizationEntity = await createVisualizationEntity(
            dataset: selectedDataset,
            type: visualizationType
        )
        content.add(visualizationEntity)
    }

    private func updateVisualization(content: RealityViewContent) async {
        // Update visualization based on current selection
        for entity in content.entities {
            entity.removeFromParent()
        }

        let updatedEntity = await createVisualizationEntity(
            dataset: selectedDataset,
            type: visualizationType
        )
        content.add(updatedEntity)
    }

    private func openInVolumetricWindow() {
        // Open volumetric window with 3D visualization
    }

    private func exportVisualization() {
        // Export current visualization data
    }
}
```

### RealityKit Integration

```swift
import RealityKit
import ARKit
import Combine

class SpatialVisualizationManager: ObservableObject {
    private var realityViewContent: RealityViewContent?
    private var subscriptions = Set<AnyCancellable>()

    func createDataVisualization(
        data: [DataPoint],
        visualizationType: VisualizationType
    ) async -> Entity {

        let rootEntity = Entity()
        rootEntity.name = "DataVisualization"

        switch visualizationType {
        case .chart3D:
            return await create3DChart(data: data, parent: rootEntity)
        case .spatialMap:
            return await createSpatialMap(data: data, parent: rootEntity)
        case .timeline:
            return await createTimeline(data: data, parent: rootEntity)
        case .network:
            return await createNetworkGraph(data: data, parent: rootEntity)
        }
    }

    private func create3DChart(data: [DataPoint], parent: Entity) async -> Entity {
        let chartEntity = Entity()
        chartEntity.name = "3DChart"

        // Create base platform
        let platformMesh = MeshResource.generateBox(width: 2.0, height: 0.1, depth: 2.0)
        let platformMaterial = SimpleMaterial(color: .gray.withAlphaComponent(0.3), isMetallic: false)
        let platformEntity = ModelEntity(mesh: platformMesh, materials: [platformMaterial])
        chartEntity.addChild(platformEntity)

        // Create data bars
        for (index, dataPoint) in data.enumerated() {
            let barHeight = Float(dataPoint.value) / 100.0 // Normalize to 0-1 range
            let barMesh = MeshResource.generateBox(width: 0.15, height: barHeight, depth: 0.15)

            // Color based on value
            let color = interpolateColor(value: dataPoint.value, min: 0, max: 100)
            let barMaterial = SimpleMaterial(color: color, isMetallic: false)

            let barEntity = ModelEntity(mesh: barMesh, materials: [barMaterial])

            // Position bars in grid
            let x = Float(index % 10) * 0.2 - 1.0
            let z = Float(index / 10) * 0.2 - 1.0
            barEntity.position = SIMD3(x, barHeight / 2, z)

            // Add interaction
            barEntity.generateCollisionShapes(recursive: false)
            barEntity.components.set(InputTargetComponent())
            barEntity.components.set(HoverEffectComponent())

            // Add label
            let labelEntity = createFloatingLabel(
                text: "\(dataPoint.label): \(dataPoint.value)",
                position: SIMD3(x, barHeight + 0.1, z)
            )
            barEntity.addChild(labelEntity)

            chartEntity.addChild(barEntity)
        }

        // Add animations
        animateChartEntrance(chartEntity)

        parent.addChild(chartEntity)
        return parent
    }

    private func createSpatialMap(data: [DataPoint], parent: Entity) async -> Entity {
        let mapEntity = Entity()
        mapEntity.name = "SpatialMap"

        // Create terrain mesh from data
        let terrainMesh = await generateTerrainMesh(from: data)
        let terrainMaterial = await generateTerrainMaterial(from: data)

        let terrainEntity = ModelEntity(mesh: terrainMesh, materials: [terrainMaterial])
        terrainEntity.scale = SIMD3(repeating: 2.0)

        // Add data point markers
        for dataPoint in data {
            let markerEntity = await createDataMarker(dataPoint: dataPoint)
            terrainEntity.addChild(markerEntity)
        }

        mapEntity.addChild(terrainEntity)
        parent.addChild(mapEntity)
        return parent
    }

    private func createTimeline(data: [DataPoint], parent: Entity) async -> Entity {
        let timelineEntity = Entity()
        timelineEntity.name = "Timeline"

        // Create timeline spine
        let spineMesh = MeshResource.generateBox(width: 3.0, height: 0.05, depth: 0.05)
        let spineMaterial = SimpleMaterial(color: .white, isMetallic: true)
        let spineEntity = ModelEntity(mesh: spineMesh, materials: [spineMaterial])
        timelineEntity.addChild(spineEntity)

        // Create time markers
        for (index, dataPoint) in data.enumerated() {
            let markerPosition = Float(index) / Float(data.count - 1) * 3.0 - 1.5

            // Create marker sphere
            let markerMesh = MeshResource.generateSphere(radius: 0.05)
            let markerColor = interpolateColor(value: dataPoint.value, min: 0, max: 100)
            let markerMaterial = SimpleMaterial(color: markerColor, isMetallic: false)
            let markerEntity = ModelEntity(mesh: markerMesh, materials: [markerMaterial])
            markerEntity.position = SIMD3(markerPosition, 0, 0)

            // Add interaction
            markerEntity.generateCollisionShapes(recursive: false)
            markerEntity.components.set(InputTargetComponent())

            // Add detail panel
            let detailPanel = await createDetailPanel(for: dataPoint)
            detailPanel.position = SIMD3(markerPosition, 0.3, 0)
            detailPanel.isEnabled = false // Initially hidden
            markerEntity.addChild(detailPanel)

            timelineEntity.addChild(markerEntity)
        }

        parent.addChild(timelineEntity)
        return parent
    }

    private func createNetworkGraph(data: [DataPoint], parent: Entity) async -> Entity {
        let networkEntity = Entity()
        networkEntity.name = "NetworkGraph"

        // Create network nodes
        var nodeEntities: [String: Entity] = [:]

        for dataPoint in data {
            let nodeEntity = await createNetworkNode(dataPoint: dataPoint)
            nodeEntities[dataPoint.id] = nodeEntity
            networkEntity.addChild(nodeEntity)
        }

        // Create connections between nodes
        for dataPoint in data {
            guard let sourceNode = nodeEntities[dataPoint.id] else { continue }

            for connectionId in dataPoint.connections {
                guard let targetNode = nodeEntities[connectionId] else { continue }

                let connectionEntity = createConnection(
                    from: sourceNode.position,
                    to: targetNode.position
                )
                networkEntity.addChild(connectionEntity)
            }
        }

        // Apply force-directed layout
        await applyForceDirectedLayout(to: networkEntity)

        parent.addChild(networkEntity)
        return parent
    }
}

// MARK: - Spatial Interaction System

class SpatialInteractionManager: ObservableObject {
    @Published var selectedEntity: Entity?
    @Published var hoveredEntity: Entity?
    @Published var interactionState: InteractionState = .idle

    private var gestureRecognizer: SpatialTapGestureRecognizer?
    private var subscriptions = Set<AnyCancellable>()

    enum InteractionState {
        case idle, hovering, selecting, manipulating
    }

    func setupInteractions(for entity: Entity) {
        // Add tap gesture
        let tapGesture = SpatialTapGestureRecognizer { [weak self] event in
            self?.handleTap(event: event)
        }
        entity.components.set(InputTargetComponent(allowedInputTypes: .indirect))

        // Add hover effect
        entity.components.set(HoverEffectComponent(.automatic))

        // Subscribe to interaction events
        entity.scene?.subscribe(to: ComponentEvents.DidAdd.self, on: entity) { event in
            // Handle component additions
        }.store(in: &subscriptions)
    }

    private func handleTap(event: SpatialTapEvent) {
        guard let entity = event.entity else { return }

        selectedEntity = entity
        interactionState = .selecting

        // Trigger selection animation
        animateSelection(entity: entity)

        // Show detail view
        showDetailView(for: entity)
    }

    private func animateSelection(entity: Entity) {
        let originalScale = entity.scale
        let pulseScale = originalScale * 1.2

        // Pulse animation
        entity.move(
            to: entity.transform,
            relativeTo: entity.parent,
            duration: 0.2
        )
    }

    private func showDetailView(for entity: Entity) {
        // Create and show contextual detail panel
        let detailPanel = createContextualPanel(for: entity)
        entity.addChild(detailPanel)
    }

    private func createContextualPanel(for entity: Entity) -> Entity {
        let panelEntity = Entity()
        panelEntity.name = "DetailPanel"

        // Create panel background
        let panelMesh = MeshResource.generatePlane(width: 0.4, depth: 0.3)
        let panelMaterial = SimpleMaterial(color: .black.withAlphaComponent(0.8), isMetallic: false)
        let panelBackground = ModelEntity(mesh: panelMesh, materials: [panelMaterial])

        // Position panel above entity
        panelBackground.position = SIMD3(0, 0.5, 0)
        panelBackground.look(at: SIMD3(0, 0, -1), from: panelBackground.position, upVector: SIMD3(0, 1, 0))

        panelEntity.addChild(panelBackground)

        return panelEntity
    }
}

// MARK: - Spatial Audio Integration

class SpatialAudioManager: ObservableObject {
    private var audioEngine: AVAudioEngine
    private var spatialMixer: AVAudioEnvironmentNode
    private var audioSources: [String: AudioSource] = [:]

    struct AudioSource {
        let player: AVAudioPlayerNode
        let buffer: AVAudioPCMBuffer
        var position: SIMD3<Float>
    }

    init() {
        audioEngine = AVAudioEngine()
        spatialMixer = AVAudioEnvironmentNode()

        setupAudioEngine()
    }

    private func setupAudioEngine() {
        audioEngine.attach(spatialMixer)
        audioEngine.connect(spatialMixer, to: audioEngine.outputNode, format: nil)

        // Configure spatial audio environment
        spatialMixer.listenerPosition = SIMD3(0, 0, 0)
        spatialMixer.listenerVectorOrientation = AVAudio3DVectorOrientation(
            forward: SIMD3(0, 0, -1),
            up: SIMD3(0, 1, 0)
        )

        do {
            try audioEngine.start()
        } catch {
            print("Failed to start audio engine: \(error)")
        }
    }

    func addSpatialAudio(
        for entityId: String,
        audioFile: String,
        position: SIMD3<Float>
    ) {
        guard let url = Bundle.main.url(forResource: audioFile, withExtension: "wav"),
              let audioFile = try? AVAudioFile(forReading: url),
              let buffer = AVAudioPCMBuffer(
                pcmFormat: audioFile.processingFormat,
                frameCapacity: AVAudioFrameCount(audioFile.length)
              ) else {
            print("Failed to load audio file: \(audioFile)")
            return
        }

        try? audioFile.read(into: buffer)

        let player = AVAudioPlayerNode()
        audioEngine.attach(player)
        audioEngine.connect(player, to: spatialMixer, format: buffer.format)

        let audioSource = AudioSource(
            player: player,
            buffer: buffer,
            position: position
        )

        audioSources[entityId] = audioSource

        // Set 3D position
        spatialMixer.setSourceMode(.spatializeIfMono, for: player)
        spatialMixer.setPosition(position, for: player)
    }

    func playSpatialAudio(for entityId: String, loop: Bool = false) {
        guard let audioSource = audioSources[entityId] else { return }

        if loop {
            audioSource.player.scheduleBuffer(audioSource.buffer, at: nil, options: .loops)
        } else {
            audioSource.player.scheduleBuffer(audioSource.buffer)
        }

        audioSource.player.play()
    }

    func updateListenerPosition(_ position: SIMD3<Float>, orientation: AVAudio3DVectorOrientation) {
        spatialMixer.listenerPosition = position
        spatialMixer.listenerVectorOrientation = orientation
    }
}

// MARK: - Collaborative Spaces

struct CollaborativeSpaceView: View {
    @StateObject private var collaborationManager = CollaborationManager()
    @StateObject private var spatialSharingManager = SpatialSharingManager()
    @State private var connectedUsers: [CollaborativeUser] = []

    var body: some View {
        VStack {
            HStack {
                Text("Collaborative Space")
                    .font(.largeTitle)
                    .bold()

                Spacer()

                Menu {
                    Button("Invite Users") {
                        collaborationManager.showInviteSheet = true
                    }

                    Button("Share Space") {
                        spatialSharingManager.shareCurrentSpace()
                    }

                    Divider()

                    Button("Recording Settings") {
                        collaborationManager.showRecordingSettings = true
                    }
                } label: {
                    Image(systemName: "ellipsis.circle")
                }
            }
            .padding()

            // Connected users display
            ScrollView(.horizontal) {
                HStack {
                    ForEach(connectedUsers) { user in
                        UserAvatarView(user: user)
                    }
                }
                .padding(.horizontal)
            }

            // Collaborative 3D space
            RealityView { content in
                await setupCollaborativeSpace(content: content)
            } update: { content in
                await updateCollaborativeSpace(content: content)
            }
            .gesture(
                SpatialTapGesture()
                    .onEnded { event in
                        handleCollaborativeInteraction(event: event)
                    }
            )
        }
        .sheet(isPresented: $collaborationManager.showInviteSheet) {
            InviteUsersSheet()
        }
        .sheet(isPresented: $collaborationManager.showRecordingSettings) {
            RecordingSettingsSheet()
        }
        .onAppear {
            Task {
                await collaborationManager.startCollaborativeSession()
            }
        }
    }

    private func setupCollaborativeSpace(content: RealityViewContent) async {
        let collaborativeRoot = Entity()
        collaborativeRoot.name = "CollaborativeSpace"

        // Create shared workspace
        let workspace = await createSharedWorkspace()
        collaborativeRoot.addChild(workspace)

        // Add user presence indicators
        for user in connectedUsers {
            let presenceIndicator = await createUserPresenceIndicator(for: user)
            collaborativeRoot.addChild(presenceIndicator)
        }

        content.add(collaborativeRoot)
    }

    private func updateCollaborativeSpace(content: RealityViewContent) async {
        // Update user positions and interactions
        for entity in content.entities {
            if entity.name == "CollaborativeSpace" {
                await updateUserPresence(in: entity)
                break
            }
        }
    }

    private func handleCollaborativeInteraction(event: SpatialTapEvent) {
        // Broadcast interaction to other users
        collaborationManager.broadcastInteraction(
            type: .tap,
            position: event.location3D,
            timestamp: Date()
        )
    }
}

class CollaborationManager: ObservableObject {
    @Published var showInviteSheet = false
    @Published var showRecordingSettings = false
    @Published var isRecording = false
    @Published var connectedUsers: [CollaborativeUser] = []

    private let networkManager = CollaborativeNetworkManager()
    private let spatialSyncManager = SpatialSyncManager()

    func startCollaborativeSession() async {
        await networkManager.createSession()
        await spatialSyncManager.startSpatialSync()
    }

    func broadcastInteraction(
        type: InteractionType,
        position: SIMD3<Float>,
        timestamp: Date
    ) {
        let interaction = CollaborativeInteraction(
            id: UUID().uuidString,
            type: type,
            position: position,
            userId: getCurrentUserId(),
            timestamp: timestamp
        )

        networkManager.broadcast(interaction)
    }

    private func getCurrentUserId() -> String {
        // Return current user ID
        return "current-user-id"
    }
}
```

## Accessibility and Inclusion

### VisionOS Accessibility Features

```swift
struct AccessibleVisualizationView: View {
    @State private var isVoiceOverEnabled = false
    @State private var reducedMotionEnabled = false
    @State private var highContrastEnabled = false

    var body: some View {
        RealityView { content in
            await setupAccessibleVisualization(content: content)
        }
        .accessibilityLabel("Data Visualization")
        .accessibilityHint("Interactive 3D chart showing sales data. Use gestures to explore different data points.")
        .accessibilityAction(named: "Read Data Summary") {
            announceDataSummary()
        }
        .accessibilityAction(named: "Toggle High Contrast") {
            toggleHighContrast()
        }
        .onAppear {
            checkAccessibilitySettings()
        }
    }

    private func setupAccessibleVisualization(content: RealityViewContent) async {
        let visualizationEntity = await createAccessibleVisualization()
        content.add(visualizationEntity)
    }

    private func createAccessibleVisualization() async -> Entity {
        let rootEntity = Entity()

        // Create visualization with accessibility considerations
        let chartEntity = await createAccessibleChart()

        // Add audio cues
        if isVoiceOverEnabled {
            await addAudioCues(to: chartEntity)
        }

        // Apply high contrast colors if needed
        if highContrastEnabled {
            await applyHighContrastColors(to: chartEntity)
        }

        // Reduce animations if motion sensitivity is enabled
        if reducedMotionEnabled {
            await disableAnimations(for: chartEntity)
        }

        rootEntity.addChild(chartEntity)
        return rootEntity
    }

    private func checkAccessibilitySettings() {
        isVoiceOverEnabled = UIAccessibility.isVoiceOverRunning
        reducedMotionEnabled = UIAccessibility.isReduceMotionEnabled
        // Check for high contrast (would need additional implementation)
    }

    private func announceDataSummary() {
        let summary = "Sales data visualization showing 12 months of data with values ranging from 1000 to 5000 units."
        UIAccessibility.post(notification: .announcement, argument: summary)
    }

    private func toggleHighContrast() {
        highContrastEnabled.toggle()
        // Re-render visualization with new contrast settings
    }
}

// MARK: - Haptic Feedback System

class SpatialHapticManager {
    private let hapticEngine: CHHapticEngine?

    init() {
        guard CHHapticEngine.capabilitiesForHardware().supportsHaptics else {
            hapticEngine = nil
            return
        }

        do {
            hapticEngine = try CHHapticEngine()
            try hapticEngine?.start()
        } catch {
            print("Failed to create haptic engine: \(error)")
            hapticEngine = nil
        }
    }

    func playSelectionHaptic() {
        guard let hapticEngine = hapticEngine else { return }

        let intensity = CHHapticEventParameter(parameterID: .hapticIntensity, value: 0.7)
        let sharpness = CHHapticEventParameter(parameterID: .hapticSharpness, value: 0.5)

        let event = CHHapticEvent(
            eventType: .hapticTransient,
            parameters: [intensity, sharpness],
            relativeTime: 0
        )

        do {
            let pattern = try CHHapticPattern(events: [event], parameters: [])
            let player = try hapticEngine.makePlayer(with: pattern)
            try player.start(atTime: 0)
        } catch {
            print("Failed to play haptic: \(error)")
        }
    }

    func playNavigationHaptic() {
        guard let hapticEngine = hapticEngine else { return }

        let intensity = CHHapticEventParameter(parameterID: .hapticIntensity, value: 0.4)
        let sharpness = CHHapticEventParameter(parameterID: .hapticSharpness, value: 0.3)

        let event = CHHapticEvent(
            eventType: .hapticTransient,
            parameters: [intensity, sharpness],
            relativeTime: 0
        )

        do {
            let pattern = try CHHapticPattern(events: [event], parameters: [])
            let player = try hapticEngine.makePlayer(with: pattern)
            try player.start(atTime: 0)
        } catch {
            print("Failed to play haptic: \(error)")
        }
    }
}
```

## Performance Optimization

### Rendering Optimization

```swift
class RenderingOptimizationManager {
    private var lodManager: LODManager
    private var occlusionCulling: OcclusionCullingManager
    private var performanceMonitor: PerformanceMonitor

    init() {
        self.lodManager = LODManager()
        self.occlusionCulling = OcclusionCullingManager()
        self.performanceMonitor = PerformanceMonitor()
    }

    func optimizeScene(_ scene: RealityViewContent) {
        // Apply Level of Detail based on distance
        lodManager.updateLOD(for: scene)

        // Perform occlusion culling
        occlusionCulling.cullHiddenEntities(in: scene)

        // Monitor performance and adjust quality
        let currentPerformance = performanceMonitor.getCurrentMetrics()
        adjustQualitySettings(based: currentPerformance)
    }

    private func adjustQualitySettings(based metrics: PerformanceMetrics) {
        if metrics.frameRate < 60 {
            // Reduce quality to maintain frame rate
            lodManager.increaseLODBias()
            occlusionCulling.setAggressiveMode(true)
        } else if metrics.frameRate > 80 && metrics.cpuUsage < 60 {
            // Increase quality if performance allows
            lodManager.decreaseLODBias()
            occlusionCulling.setAggressiveMode(false)
        }
    }
}

class LODManager {
    private var lodBias: Float = 1.0
    private let maxLODDistance: Float = 10.0

    func updateLOD(for content: RealityViewContent) {
        for entity in content.entities {
            updateEntityLOD(entity)
        }
    }

    private func updateEntityLOD(_ entity: Entity) {
        guard let modelComponent = entity.components[ModelComponent.self] else { return }

        // Calculate distance to camera (simplified)
        let distance = length(entity.position)
        let normalizedDistance = min(distance / maxLODDistance, 1.0)

        // Adjust model complexity based on distance and bias
        let lodLevel = Int(normalizedDistance * 3 * lodBias)
        applyLODLevel(lodLevel, to: entity)
    }

    private func applyLODLevel(_ level: Int, to entity: Entity) {
        // Apply appropriate level of detail
        switch level {
        case 0: // Highest quality - close objects
            entity.isEnabled = true
            // Use high-poly mesh
        case 1: // Medium quality
            entity.isEnabled = true
            // Use medium-poly mesh
        case 2: // Low quality
            entity.isEnabled = true
            // Use low-poly mesh
        default: // Very far or disabled
            entity.isEnabled = false
        }
    }

    func increaseLODBias() {
        lodBias = min(lodBias * 1.2, 3.0)
    }

    func decreaseLODBias() {
        lodBias = max(lodBias * 0.8, 0.5)
    }
}

class PerformanceMonitor {
    private var frameRateHistory: [Double] = []
    private var cpuUsageHistory: [Double] = []

    func getCurrentMetrics() -> PerformanceMetrics {
        let currentFrameRate = getCurrentFrameRate()
        let currentCPUUsage = getCurrentCPUUsage()

        frameRateHistory.append(currentFrameRate)
        cpuUsageHistory.append(currentCPUUsage)

        // Keep only last 60 frames (1 second at 60fps)
        if frameRateHistory.count > 60 {
            frameRateHistory.removeFirst()
            cpuUsageHistory.removeFirst()
        }

        return PerformanceMetrics(
            frameRate: currentFrameRate,
            averageFrameRate: frameRateHistory.average(),
            cpuUsage: currentCPUUsage,
            averageCPUUsage: cpuUsageHistory.average()
        )
    }

    private func getCurrentFrameRate() -> Double {
        // Implementation would measure actual frame rate
        return 60.0 // Placeholder
    }

    private func getCurrentCPUUsage() -> Double {
        // Implementation would measure actual CPU usage
        return 50.0 // Placeholder
    }
}

struct PerformanceMetrics {
    let frameRate: Double
    let averageFrameRate: Double
    let cpuUsage: Double
    let averageCPUUsage: Double
}

extension Array where Element == Double {
    func average() -> Double {
        return isEmpty ? 0 : reduce(0, +) / Double(count)
    }
}
```

## Testing and Quality Assurance

### Unit Testing for visionOS

```swift
import XCTest
import RealityKit
@testable import VisionApp

class VisionAppTests: XCTestCase {
    var appModel: AppModel!
    var spatialManager: SpatialVisualizationManager!

    override func setUp() {
        super.setUp()
        appModel = AppModel()
        spatialManager = SpatialVisualizationManager()
    }

    override func tearDown() {
        appModel = nil
        spatialManager = nil
        super.tearDown()
    }

    func testAppModelInitialization() {
        XCTAssertEqual(appModel.currentScene, .main)
        XCTAssertFalse(appModel.isImmersiveSpaceOpen)
        XCTAssertTrue(appModel.spatialDataModels.isEmpty)
    }

    func testSceneTransition() async {
        await appModel.transitionToScene(.visualization)
        XCTAssertEqual(appModel.currentScene, .visualization)
    }

    func testImmersiveSpaceTransition() async {
        await appModel.transitionToScene(.immersive)
        XCTAssertEqual(appModel.currentScene, .immersive)
        // Note: Actual immersive space opening would require simulator/device
    }

    func testDataVisualizationCreation() async {
        let testData = [
            DataPoint(id: "1", label: "Test 1", value: 50, connections: []),
            DataPoint(id: "2", label: "Test 2", value: 75, connections: [])
        ]

        let visualization = await spatialManager.createDataVisualization(
            data: testData,
            visualizationType: .chart3D
        )

        XCTAssertEqual(visualization.name, "DataVisualization")
        XCTAssertTrue(visualization.children.count > 0)
    }

    func testSpatialInteractionSetup() {
        let testEntity = Entity()
        let interactionManager = SpatialInteractionManager()

        interactionManager.setupInteractions(for: testEntity)

        XCTAssertNotNil(testEntity.components[InputTargetComponent.self])
        XCTAssertNotNil(testEntity.components[HoverEffectComponent.self])
    }

    func testPerformanceMetricsCalculation() {
        let performanceMonitor = PerformanceMonitor()
        let metrics = performanceMonitor.getCurrentMetrics()

        XCTAssertGreaterThan(metrics.frameRate, 0)
        XCTAssertGreaterThanOrEqual(metrics.cpuUsage, 0)
        XCTAssertLessThanOrEqual(metrics.cpuUsage, 100)
    }
}

// Integration Tests
class VisionAppIntegrationTests: XCTestCase {
    func testCompleteVisualizationWorkflow() async {
        let appModel = AppModel()
        let spatialManager = SpatialVisualizationManager()

        // Test complete workflow from data loading to visualization
        let testData = generateTestData()

        // Create visualization
        let visualization = await spatialManager.createDataVisualization(
            data: testData,
            visualizationType: .chart3D
        )

        XCTAssertNotNil(visualization)

        // Test interaction setup
        let interactionManager = SpatialInteractionManager()
        interactionManager.setupInteractions(for: visualization)

        // Verify components are properly set up
        XCTAssertTrue(hasInteractionComponents(visualization))
    }

    func testCollaborativeSession() async {
        let collaborationManager = CollaborationManager()

        await collaborationManager.startCollaborativeSession()

        // Test interaction broadcasting
        collaborationManager.broadcastInteraction(
            type: .tap,
            position: SIMD3(0, 0, 0),
            timestamp: Date()
        )

        // Verify session is active
        // This would require actual network testing in a real scenario
    }

    private func generateTestData() -> [DataPoint] {
        return [
            DataPoint(id: "1", label: "Sales Q1", value: 1000, connections: []),
            DataPoint(id: "2", label: "Sales Q2", value: 1250, connections: []),
            DataPoint(id: "3", label: "Sales Q3", value: 1100, connections: []),
            DataPoint(id: "4", label: "Sales Q4", value: 1400, connections: [])
        ]
    }

    private func hasInteractionComponents(_ entity: Entity) -> Bool {
        return entity.components[InputTargetComponent.self] != nil &&
               entity.components[HoverEffectComponent.self] != nil
    }
}
```

## Deployment and Distribution

### App Store Guidelines Compliance

```swift
// Privacy and Data Handling
class PrivacyManager {
    static func requestCameraPermission() async -> Bool {
        let status = AVCaptureDevice.authorizationStatus(for: .video)

        switch status {
        case .authorized:
            return true
        case .notDetermined:
            return await AVCaptureDevice.requestAccess(for: .video)
        case .denied, .restricted:
            return false
        @unknown default:
            return false
        }
    }

    static func requestWorldSensingPermission() async -> Bool {
        // Request permission for world sensing capabilities
        let arkitSession = ARKitSession()
        let worldTrackingProvider = WorldTrackingProvider()

        do {
            let authorizationResult = await arkitSession.requestAuthorization(for: [worldTrackingProvider])
            return authorizationResult[worldTrackingProvider] == .allowed
        } catch {
            print("Failed to request world sensing permission: \(error)")
            return false
        }
    }
}

// Content Guidelines Compliance
struct ContentModerationManager {
    static func validateContent(_ content: Any) -> Bool {
        // Implement content validation logic
        // Ensure compliance with App Store guidelines
        return true
    }

    static func reportInappropriateContent(_ contentId: String) {
        // Implement reporting mechanism
    }
}
```

## Implementation Roadmap

### Phase 1: Foundation (Weeks 1-3)
- ✅ visionOS app architecture setup
- ✅ SwiftUI for spatial interfaces
- ✅ Basic RealityKit integration
- ✅ Window and scene management

### Phase 2: Core Features (Weeks 4-6)
- ✅ 3D data visualization system
- ✅ Spatial interaction framework
- ✅ Multi-modal input handling
- ✅ Performance optimization system

### Phase 3: Advanced Features (Weeks 7-9)
- ✅ Collaborative spaces implementation
- ✅ Spatial audio integration
- ✅ Accessibility features
- ✅ Haptic feedback system

### Phase 4: Polish and Deployment (Weeks 10-12)
- ✅ Testing and quality assurance
- ✅ Performance profiling and optimization
- ✅ App Store compliance and submission
- ✅ Documentation and user guides

## Success Metrics

- **Performance**: Consistent 60+ FPS in all interaction modes
- **Accessibility**: 100% VoiceOver compatibility and WCAG compliance
- **User Experience**: < 2 second app launch time, intuitive spatial navigation
- **Collaboration**: Real-time sync with < 100ms latency for up to 8 users
- **Quality**: < 1% crash rate, 4.5+ App Store rating
- **Adoption**: 80%+ task completion rate for new users
- **Platform Integration**: Full visionOS feature utilization
- **Scalability**: Support for 10,000+ data points with smooth interaction

This comprehensive visionOS development standards document provides enterprise-grade patterns for building immersive, accessible, and performant mixed reality applications that fully leverage Apple Vision Pro capabilities.