interface Bounds {
    center: any;
    halfExtent: any;
}
interface Hierarchy {
    numNodes: number;
    names: string[];
    parents: number[];
}
interface Skeleton extends Hierarchy {
    invBoneLTMs: any[];
    bindPoses?: any[];
}
interface ControllerBaseClass {
    mathDevice: MathDevice;
    bounds: Bounds;
    output: any[];
    outputChannels: any;
    dirty: boolean;
    dirtyBounds: boolean;
    hierarchy: Hierarchy;
    onUpdateCallback: (controller: ControllerBaseClass) => void;
    onLoopCallback: (controller: ControllerBaseClass) => boolean;
    onFinishedCallback: (controller: ControllerBaseClass) => boolean;
    getHierarchy(): Hierarchy;
    addTime(delta: number): void;
    setTime(time: number): void;
    setRate(rate: number): void;
    update(): void;
    updateBounds(): void;
    getJointTransform(jointId: number): any;
    getJointWorldTransform(jointId: number, asMatrix?: boolean): any;
}
interface Animation {
    length: number;
    nodeData: any;
    channels: any;
    bounds: any;
}
declare var AnimationMath: {
    quatPosscalefromm43: (matrix: any, mathDevice: any) => {
        rotation: any;
        translation: any;
        scale: any;
    };
};
declare var AnimationChannels: {
    copy: (channels: any) => {};
    union: (channelsA: any, channelsB: any) => {};
    add: (channels: any, newChannels: any) => void;
};
declare var Animation: {
    minKeyframeDelta: number;
    standardGetJointWorldTransform: (controller: ControllerBaseClass, jointId: number, mathDevice: MathDevice, asMatrix?: boolean) => any;
};
declare class InterpolatorController implements ControllerBaseClass {
    static version: number;
    public mathDevice: MathDevice;
    public bounds: Bounds;
    public output: any[];
    public outputChannels: any;
    public dirty: boolean;
    public dirtyBounds: boolean;
    public hierarchy: Hierarchy;
    public onUpdateCallback: (controller: ControllerBaseClass) => void;
    public onLoopCallback: (controller: ControllerBaseClass) => boolean;
    public onFinishedCallback: (controller: ControllerBaseClass) => boolean;
    public rate: number;
    public currentTime: number;
    public looping: boolean;
    public currentAnim: Animation;
    public translationEndFrames: Uint32Array;
    public rotationEndFrames: Uint32Array;
    public scaleEndFrames: Uint32Array;
    public scratchV3: any;
    public scratchPad: {
        v1: any;
        v2: any;
        q1: any;
        q2: any;
    };
    public addTime(delta): void;
    public update(): void;
    public updateBounds(): void;
    public _updateBoundsNoop(): void;
    public getJointTransform(jointId: number);
    public getJointWorldTransform(jointId: number, asMatrix?: boolean): any;
    public setAnimation(animation: Animation, looping): void;
    public setTime(time): void;
    public setRate(rate): void;
    public getHierarchy(): Hierarchy;
    static create(hierarchy): InterpolatorController;
}
declare class OverloadedNodeController {
    static version: number;
    public mathDevice: MathDevice;
    public bounds: Bounds;
    public output: any[];
    public outputChannels: any;
    public dirty: boolean;
    public dirtyBounds: boolean;
    public hierarchy: Hierarchy;
    public onUpdateCallback: (controller: ControllerBaseClass) => void;
    public onLoopCallback: (controller: ControllerBaseClass) => boolean;
    public onFinishedCallback: (controller: ControllerBaseClass) => boolean;
    public baseController: ControllerBaseClass;
    public nodeOverloads: any[];
    public addTime(delta): void;
    public update(): void;
    public updateBounds(): void;
    public getJointTransform(jointId);
    public getJointWorldTransform(jointId: number, asMatrix?: boolean);
    public getHierarchy(): Hierarchy;
    public addOverload(sourceController, sourceIndex, overloadIndex): void;
    static create(baseController: ControllerBaseClass): OverloadedNodeController;
}
declare class ReferenceController {
    public mathDevice: MathDevice;
    public bounds: Bounds;
    public output: any[];
    public outputChannels: any;
    public dirty: boolean;
    public dirtyBounds: boolean;
    public hierarchy: Hierarchy;
    public onUpdateCallback: (controller: ControllerBaseClass) => void;
    public onLoopCallback: (controller: ControllerBaseClass) => boolean;
    public onFinishedCallback: (controller: ControllerBaseClass) => boolean;
    public referenceSource: ControllerBaseClass;
    public setReferenceController: (controller: ControllerBaseClass) => void;
    private __proto__;
    static create(baseController): ReferenceController;
}
declare class TransitionController implements ControllerBaseClass {
    static version: number;
    public mathDevice: MathDevice;
    public bounds: Bounds;
    public output: any[];
    public outputChannels: any;
    public dirty: boolean;
    public dirtyBounds: boolean;
    public hierarchy: Hierarchy;
    public onUpdateCallback: (controller: ControllerBaseClass) => void;
    public onLoopCallback: (controller: ControllerBaseClass) => boolean;
    public onFinishedCallback: (controller: ControllerBaseClass) => boolean;
    public rate: number;
    public startController: ControllerBaseClass;
    public endController: ControllerBaseClass;
    public transitionTime: number;
    public transitionLength: number;
    public onFinishedTransitionCallback: (controller: ControllerBaseClass) => boolean;
    public addTime(delta): void;
    public update(): void;
    public updateBounds(): void;
    public getJointTransform(jointId);
    public getJointWorldTransform(jointId: number, asMatrix?: boolean);
    public setStartController(controller): void;
    public setEndController(controller): void;
    public setTransitionLength(length): void;
    public setTime(time): void;
    public setRate(rate): void;
    public getHierarchy(): Hierarchy;
    static create(startController: ControllerBaseClass, endController: ControllerBaseClass, length: number): TransitionController;
}
declare class BlendController implements ControllerBaseClass {
    static version: number;
    public mathDevice: MathDevice;
    public bounds: Bounds;
    public output: any[];
    public outputChannels: any;
    public dirty: boolean;
    public dirtyBounds: boolean;
    public hierarchy: Hierarchy;
    public onUpdateCallback: (controller: ControllerBaseClass) => void;
    public onLoopCallback: (controller: ControllerBaseClass) => boolean;
    public onFinishedCallback: (controller: ControllerBaseClass) => boolean;
    public controllers: ControllerBaseClass[];
    public blendDelta: number;
    public addTime(delta): void;
    public update(): void;
    public updateBounds(): void;
    public getJointTransform(jointId);
    public getJointWorldTransform(jointId: number, asMatrix?: boolean);
    public setBlendDelta(delta): void;
    public setTime(time): void;
    public setRate(rate): void;
    public getHierarchy(): Hierarchy;
    static create(controllers: ControllerBaseClass[]): BlendController;
}
declare class MaskController implements ControllerBaseClass {
    static version: number;
    public mathDevice: MathDevice;
    public bounds: Bounds;
    public output: any[];
    public outputChannels: any;
    public dirty: boolean;
    public dirtyBounds: boolean;
    public hierarchy: Hierarchy;
    public onUpdateCallback: (controller: ControllerBaseClass) => void;
    public onLoopCallback: (controller: ControllerBaseClass) => boolean;
    public onFinishedCallback: (controller: ControllerBaseClass) => boolean;
    public controllers: ControllerBaseClass[];
    public masks: {
        [idx: number]: boolean;
    }[];
    public addTime(delta): void;
    public update(): void;
    public updateBounds(): void;
    public getJointTransform(jointId);
    public getJointWorldTransform(jointId: number, asMatrix?: boolean);
    public setTime(time): void;
    public setRate(rate): void;
    public setMask(controllerIndex, maskJoints, maskArray): void;
    public getHierarchy(): Hierarchy;
    static create(controllers: ControllerBaseClass[]): MaskController;
}
declare class PoseController implements ControllerBaseClass {
    static version: number;
    public mathDevice: MathDevice;
    public bounds: Bounds;
    public output: any[];
    public outputChannels: any;
    public dirty: boolean;
    public dirtyBounds: boolean;
    public hierarchy: Hierarchy;
    public onUpdateCallback: (controller: ControllerBaseClass) => void;
    public onLoopCallback: (controller: ControllerBaseClass) => boolean;
    public onFinishedCallback: (controller: ControllerBaseClass) => boolean;
    public addTime(delta): void;
    public update(): void;
    public updateBounds(): void;
    public getJointTransform(jointId);
    public getJointWorldTransform(jointId: number, asMatrix?: boolean);
    public setTime(time): void;
    public setRate(rate): void;
    public setOutputChannels(channels): void;
    public setJointPose(jointIndex, rotation, translation, scale): void;
    public getHierarchy(): Hierarchy;
    static create(hierarchy: Hierarchy): PoseController;
}
declare class NodeTransformController {
    static version: number;
    public mathDevice: MathDevice;
    public bounds: Bounds;
    public output: any[];
    public outputChannels: any;
    public dirty: boolean;
    public dirtyBounds: boolean;
    public hierarchy: Hierarchy;
    public onUpdateCallback: (controller: ControllerBaseClass) => void;
    public onLoopCallback: (controller: ControllerBaseClass) => boolean;
    public onFinishedCallback: (controller: ControllerBaseClass) => boolean;
    public ltms: any[];
    public nodesMap: any[];
    public scene: Scene;
    public inputController: ControllerBaseClass;
    public addTime(delta): void;
    public setInputController(input): void;
    public setHierarchy(hierarchy, fromNode?): void;
    public setScene(scene): void;
    public update(): void;
    static create(hierarchy: Hierarchy, scene: Scene): NodeTransformController;
}
interface SkinControllerBase {
    dirty: boolean;
    skeleton: Skeleton;
    inputController: ControllerBaseClass;
    setInputController(input);
    setSkeleton(skeleton);
    update();
}
declare class SkinController implements SkinControllerBase {
    static version: number;
    public mathDevice: MathDevice;
    public bounds: Bounds;
    public output: any[];
    public outputChannels: any;
    public dirty: boolean;
    public dirtyBounds: boolean;
    public hierarchy: Hierarchy;
    public onUpdateCallback: (controller: ControllerBaseClass) => void;
    public onLoopCallback: (controller: ControllerBaseClass) => boolean;
    public onFinishedCallback: (controller: ControllerBaseClass) => boolean;
    public skeleton: Skeleton;
    public inputController: ControllerBaseClass;
    public md: MathDevice;
    public ltms: any[];
    public setInputController(input): void;
    public setSkeleton(skeleton): void;
    public update(): void;
    static create(md: MathDevice): SkinController;
}
declare class GPUSkinController implements SkinControllerBase {
    static version: number;
    public mathDevice: MathDevice;
    public bounds: Bounds;
    public output: TechniqueParameterBuffer;
    public outputChannels: any;
    public dirty: boolean;
    public dirtyBounds: boolean;
    public hierarchy: Hierarchy;
    public onUpdateCallback: (controller: ControllerBaseClass) => void;
    public onLoopCallback: (controller: ControllerBaseClass) => boolean;
    public onFinishedCallback: (controller: ControllerBaseClass) => boolean;
    public skeleton: Skeleton;
    public inputController: ControllerBaseClass;
    public md: MathDevice;
    public gd: GraphicsDevice;
    public ltms: any[];
    public outputMat: any;
    public convertedquatPos: any;
    public bufferSize: number;
    public setInputController(input): void;
    public setSkeleton(skeleton): void;
    public update(): void;
    public defaultBufferSize: number;
    static setDefaultBufferSize(size: number): void;
    static create(gd: GraphicsDevice, md: MathDevice, bufferSize?: number): GPUSkinController;
}
declare class SkinnedNode {
    static version: number;
    public md: MathDevice;
    public input: ControllerBaseClass;
    public skinController: SkinControllerBase;
    public node: SceneNode;
    public scratchM43: any;
    public scratchExtents: any;
    public addTime(delta): void;
    public setNodeHierarchyBoneMatricesAndBounds(node, extents, skinController): boolean;
    public update(updateSkinController): void;
    public getJointIndex(jointName): number;
    public getJointLTM(jointIndex, dst);
    public setInputController(controller): void;
    public getSkeleton(): Skeleton;
    static create(gd: GraphicsDevice, md: MathDevice, node: SceneNode, skeleton: Skeleton, inputController?: ControllerBaseClass, bufferSize?: number): SkinnedNode;
}
interface AnimationList {
    [name: string]: Animation;
}
declare class AnimationManager {
    static version: number;
    public mathDevice: MathDevice;
    public loadFile(path: string, callback: any): void;
    public loadData(data: any, prefix?: string): void;
    public get(name: string): Animation;
    public remove(name: string): void;
    public nodeHasSkeleton(node: Node): Skeleton;
    public getAll(): AnimationList;
    public setPathRemapping(prm: any, assetUrl: string): void;
    static create(errorCallback?: (msg: string) => void, log?: HTMLElement): AnimationManager;
}
interface DefaultRenderingPassIndex {
    opaque: number;
    decal: number;
    transparent: number;
}
interface DefaultRenderingRendererInfo {
    id: number;
    frameVisible: number;
    worldUpdate: number;
    worldViewProjection: any;
    worldInverse: any;
    eyePosition: any;
    lightPosition: any;
    worldUpdateEnv?: number;
    worldInverseTranspose?: any;
}
declare class DefaultRendering {
    static version: number;
    static numPasses: number;
    static passIndex: DefaultRenderingPassIndex;
    static nextRenderinfoID: number;
    static nextSkinID: number;
    static v4One: Float32Array;
    static identityUVTransform: Float32Array;
    public md: MathDevice;
    public sm: ShaderManager;
    public lightPositionUpdated: boolean;
    public lightPosition: any;
    public eyePositionUpdated: boolean;
    public eyePosition: any;
    public globalTechniqueParameters: TechniqueParameters;
    public globalTechniqueParametersArray: TechniqueParameters[];
    public passes: any[];
    public defaultSkinBufferSize: number;
    public camera: Camera;
    public scene: Scene;
    public wireframeInfo: any;
    public wireframe: boolean;
    public defaultPrepareFn: (geometryInstance: Geometry) => void;
    public defaultUpdateFn: (camera: Camera) => void;
    public defaultSkinnedUpdateFn: (camera: Camera) => void;
    public loadTechniquesFn: (shaderManager: ShaderManager) => void;
    public updateShader(): void;
    public sortRenderablesAndLights(camera, scene): void;
    public update(gd, camera, scene, currentTime): void;
    public updateBuffers(gd?, deviceWidth?, deviceHeight?): boolean;
    public draw(gd, clearColor, drawDecalsFn, drawTransparentFn, drawDebugFn): void;
    public setGlobalLightPosition(pos): void;
    public setGlobalLightColor(color): void;
    public setAmbientColor(color): void;
    public setDefaultTexture(tex): void;
    public setWireframe(wireframeEnabled, wireframeInfo): void;
    public getDefaultSkinBufferSize(): number;
    public destroy(): void;
    static defaultPrepareFn(geometryInstance): void;
    static create(gd: GraphicsDevice, md: MathDevice, shaderManager: ShaderManager, effectsManager: EffectManager): DefaultRendering;
}
declare class LoadingScreen {
    static version: number;
    public gd: GraphicsDevice;
    public clipSpace: any;
    public textureWidthHalf: number;
    public textureHeightHalf: number;
    public textureTechnique: Technique;
    public textureMaterial: TechniqueParameters;
    public textureVertexFormats: any[];
    public textureSemantics: Semantics;
    public backgroundColor: any;
    public backgroundTechnique: Technique;
    public backgroundMaterial: TechniqueParameters;
    public posVertexFormats: any[];
    public posSemantics: Semantics;
    public barBackgroundColor: any;
    public barColor: any;
    public barCenter: {
        x: number;
        y: number;
    };
    public barBorderSize: number;
    public barBackgroundWidth: number;
    public barBackgroundHeight: number;
    public assetTracker: AssetTracker;
    public progress: number;
    public setProgress(progress: number): void;
    public setTexture(texture): void;
    public loadAndSetTexture(graphicsDevice, requestHandler, mappingTable, name): void;
    public render(backgroundAlpha, textureAlpha): void;
    static create(gd: GraphicsDevice, md: MathDevice, parameters: any): LoadingScreen;
}
interface EffectPrepareObject {
    prepare(renderable: Renderable);
    shaderName: string;
    techniqueName: string;
    shader?: Shader;
    technique?: Technique;
    techniqueIndex?: number;
    update(camera: Camera);
    loadTechniques(shaderManager: ShaderManager);
}
declare class Effect {
    static version: number;
    public name: string;
    public geometryType: {
        [type: string]: EffectPrepareObject;
    };
    public numMaterials: number;
    public materialsMap: {
        [hash: string]: number;
    };
    static create(name: string): Effect;
    public hashMaterial(material: Material);
    public prepareMaterial(material: Material): void;
    public add(geometryType: string, prepareObject): void;
    public remove(geometryType: string): void;
    public get(geometryType: string): EffectPrepareObject;
    public prepare(renderable: Renderable): void;
}
declare class EffectManager {
    static version: number;
    public effects: any;
    static create(): EffectManager;
    public add(effect: Effect): void;
    public remove(name: string): void;
    public map(destination: string, source: string): void;
    public get(name: string): Effect;
}
declare class Material {
    static version: number;
    public name: string;
    public reference: Reference;
    public techniqueParameters: TechniqueParameters;
    public meta: any;
    public effect: Effect;
    public effectName: string;
    public texturesNames: {
        [name: string]: string;
    };
    public textureInstances: {
        [name: string]: TextureInstance;
    };
    public onTextureChanged: (textureInstance: TextureInstance) => void;
    static create(graphicsDevice: GraphicsDevice): Material;
    public getName(): string;
    public setName(name): void;
    public clone(graphicsDevice: GraphicsDevice): Material;
    public loadTextures(textureManager): void;
    public setTextureInstance(propertryName, textureInstance): void;
    public isSimilar(other: Material): boolean;
    public destroy(): void;
}
declare class Floor {
    static version: number;
    public render: (gd: GraphicsDevice, camera: Camera) => void;
    public color: any;
    public fadeToColor: any;
    public numLines: number;
    public _frustumPoints: any[];
    static create(gd: any, md: any): Floor;
}
interface Surface {
    first: number;
    numVertices: number;
    primitive: number;
    numIndices?: number;
    vertexData?: any;
    indexData?: any;
    indexBuffer?: IndexBuffer;
}
declare class Geometry {
    static version: number;
    public name: string;
    public type: string;
    public center: any;
    public halfExtents: any;
    public reference: Reference;
    public primitive: number;
    public semantics: Semantics;
    public vertexBuffer: VertexBuffer;
    public vertexOffset: number;
    public baseIndex: number;
    public indexBuffer: IndexBuffer;
    public numIndices: number;
    public skeleton: Skeleton;
    public surfaces: any;
    public vertexData: any;
    public indexData: any;
    public first: number;
    public vertexBufferAllocation: any;
    public vertexBufferManager: VertexBufferManager;
    public indexBufferAllocation: any;
    public indexBufferManager: IndexBufferManager;
    constructor();
    public destroy(): void;
    static create(): Geometry;
}
declare class GeometryInstance implements Renderable {
    static version: number;
    static maxUpdateValue: number;
    public geometry: Geometry;
    public geometryType: string;
    public node: SceneNode;
    public renderUpdate: any;
    public rendererInfo: any;
    public distance: number;
    public drawParameters: DrawParameters[];
    public sharedMaterial: Material;
    public surface: Surface;
    public halfExtents: any;
    public center: any;
    public worldExtents: any;
    public semantics: Semantics;
    public techniqueParameters: TechniqueParameters;
    public worldExtentsUpdate: number;
    public disabled: boolean;
    public arrayConstructor: any;
    public clone(): GeometryInstance;
    public isSkinned(): boolean;
    public setNode(node): void;
    public getNode(): SceneNode;
    public setMaterial(material): void;
    public getMaterial(): Material;
    public getWorldExtents();
    public updateWorldExtents(world): void;
    public addCustomWorldExtents(customWorldExtents): void;
    public removeCustomWorldExtents(): void;
    public getCustomWorldExtents();
    public hasCustomWorldExtents(): boolean;
    public destroy(): void;
    public prepareDrawParameters(drawParameters): void;
    static create(geometry: Geometry, surface: Surface, sharedMaterial: Material): GeometryInstance;
}
declare class Light {
    static version: number;
    public name: string;
    public color: any;
    public directional: boolean;
    public spot: boolean;
    public ambient: boolean;
    public point: boolean;
    public origin: any;
    public radius: number;
    public direction: any;
    public frustum: any;
    public frustumNear: number;
    public center: any;
    public halfExtents: any;
    public shadows: boolean;
    public dynamicshadows: boolean;
    public disabled: boolean;
    public dynamic: boolean;
    public material: Material;
    public techniqueParameters: TechniqueParameters;
    public sharedMaterial: Material;
    public fog: boolean;
    public global: boolean;
    public target: any;
    public clone(): Light;
    public isGlobal(): boolean;
    static create(params): Light;
}
declare class LightInstance {
    static version: number;
    public node: SceneNode;
    public light: Light;
    public worldExtents: any;
    public worldExtentsUpdate: number;
    public arrayConstructor: any;
    public disabled: boolean;
    public setMaterial(material): void;
    public setNode(node): void;
    public getNode(): SceneNode;
    public getWorldExtents();
    public updateWorldExtents(world): void;
    public clone(): LightInstance;
    static create(light: Light): LightInstance;
}
declare class MouseForces {
    static version: number;
    public md: MathDevice;
    public pd: PhysicsDevice;
    public pickFilter: number;
    public pickRayFrom: number[];
    public pickRayTo: number[];
    public clamp: number;
    public pickConstraint: PhysicsPoint2PointConstraint;
    public pickedBody: PhysicsRigidBody;
    public oldPickingDist: number;
    public dragExtentsMin: any;
    public dragExtentsMax: any;
    public mouseX: number;
    public mouseY: number;
    public mouseZ: number;
    public X: number;
    public Y: number;
    public Z: number;
    public grabBody: boolean;
    public onmousewheel: (delta: number) => boolean;
    public onmousemove: (deltaX: number, deltaY: number) => boolean;
    public onmousedown: () => boolean;
    public onmouseup: () => boolean;
    public generatePickRay(cameraTransform, viewWindowX, viewWindowY, aspectRatio, farPlane): void;
    public update(dynamicsWorld: PhysicsWorld, camera: Camera, force): void;
    static create(gd: GraphicsDevice, id: InputDevice, md: MathDevice, pd: PhysicsDevice, dragExtentsMin?, dragExtentsMax?): MouseForces;
}
interface PhysicsNode {
    target: SceneNode;
    body: PhysicsCollisionObject;
    origin?: any;
    triangleArray?: any;
    dynamic?: boolean;
    kinematic?: boolean;
    worldUpdate?: any;
}
declare class PhysicsManager {
    static version: number;
    public arrayConstructor: any;
    public mathsDevice: MathDevice;
    public physicsDevice: PhysicsDevice;
    public dynamicsWorld: PhysicsWorld;
    public physicsNodes: PhysicsNode[];
    public dynamicPhysicsNodes: PhysicsNode[];
    public kinematicPhysicsNodes: PhysicsNode[];
    public tempMatrix: any;
    public sceneNodeCloned: (data: any) => void;
    public sceneNodeDestroyed: (data: any) => void;
    public addNode(sceneNode: SceneNode, physicsObject: PhysicsCollisionObject, origin?: any, triangleArray?: any): void;
    public update(): void;
    public enableNode(sceneNode, enabled): void;
    public enableHierarchy(sceneNode, enabled): void;
    public deletePhysicsNode(physicsNode): void;
    public deleteNode(sceneNode): void;
    public deleteHierarchy(sceneNode): void;
    public calculateHierarchyExtents(sceneNode);
    public calculateExtents(sceneNode);
    public clear(): void;
    public loadNodes(loadParams, scene): void;
    public unsubscribeSceneNode(sceneNode): void;
    public subscribeSceneNode(sceneNode): void;
    public cloneSceneNode(oldSceneNode, newSceneNode): void;
    public createSnapshot(): {};
    public restoreSnapshot(snapshot): void;
    static create(mathsDevice: MathDevice, physicsDevice: PhysicsDevice, dynamicsWorld: PhysicsWorld): PhysicsManager;
}
interface PostEffectsEntry {
    technique: Technique;
    techniqueParameters: TechniqueParameters;
    textureName: String;
    callback: (gd: GraphicsDevice, colTex: Texture) => void;
}
declare class PostEffects {
    static version: number;
    public shader: Shader;
    public bicolor: PostEffectsEntry;
    public copy: PostEffectsEntry;
    public copyFiltered: PostEffectsEntry;
    public fadein: PostEffectsEntry;
    public modulate: PostEffectsEntry;
    public blend: PostEffectsEntry;
    public updateShader(sm): void;
    public getEffectSetupCB(name): (gd: GraphicsDevice, colTex: Texture) => void;
    public destroy(): void;
    static create(gd: GraphicsDevice, sm: ShaderManager): PostEffects;
}
declare var renderingCommonGetTechniqueIndexFn: {
    techniquesIndexMap: {
        [techniqueName: string]: number;
    };
    numTechniques: number;
    (techniqueName: string): number;
};
declare function renderingCommonSortKeyFn(techniqueIndex, materialIndex, nodeIndex?): number;
declare function renderingCommonCreateRendererInfoFn(renderable): {
    far: any;
};
declare var renderingCommonAddDrawParameterFastestFn: (drawParameters: any) => void;
interface LoadParameters {
    nodesNamePrefix?: string;
    shapesNamePrefix?: string;
    request?: any;
    nodes: SceneNodeParameters[];
    parentNode: any;
    requestHandler?: RequestHandler;
    isReference: boolean;
    data: any;
}
interface SceneParameters extends LoadParameters {
    append: boolean;
    skin: any;
}
interface GeometryInstanceParameters {
    geometry: string;
}
interface SceneNodeParameters {
    reference?: string;
    geometryinstances?: {
        [name: string]: GeometryInstanceParameters;
    };
    inplace: boolean;
    skin: any;
    nodes: {
        [name: string]: SceneNodeParameters;
    };
    matrix: number[];
}
declare class ResourceLoader {
    static version: number;
    public nodesMap: {
        [name: string]: SceneNodeParameters;
    };
    public referencesPending: {
        [name: string]: any[];
    };
    public numReferencesPending: number;
    public animationsPending: {
        [name: string]: boolean;
    };
    public skeletonNames: {
        [name: string]: string;
    };
    public data: any;
    public clear(): void;
    public endLoading(onload): void;
    public resolveShapes(loadParams): void;
    public resolveSkeletons(loadParams): void;
    public resolveAnimations(loadParams): void;
    public resolveNodes(loadParams: LoadParameters): void;
    public resolvePhysicsNodes(loadParams): void;
    public resolveAreas(loadParams): void;
    public resolve(loadParams): void;
    public load(assetPath, loadParams): void;
    static create(): ResourceLoader;
}
interface ScenePortal {
    disabled: boolean;
    area: SceneArea;
    extents: any;
    plane: any;
}
interface SceneArea {
    portals: ScenePortal[];
    extents: any;
    target?: SceneNode;
    queryCounter?: number;
    externalNodes?: SceneNode[];
}
interface SceneBSPNode {
    plane: any;
    pos: any;
    neg: any;
}
interface SpatialMap {
    add: (externalNode: any, extents: any) => void;
    update: (externalNode: any, extents: any) => void;
    remove: (externalNode: any) => void;
    finalize: () => void;
    getVisibleNodes: (planes: any, visibleNodes: any, startIndex?: any) => number;
    getOverlappingNodes: (queryExtents: any, overlappingNodes: any, startIndex?: any) => number;
    getSphereOverlappingNodes: (center: any, radius: any, overlappingNodes: any) => void;
    getOverlappingPairs: (overlappingPairs: any, startIndex: any) => number;
    getExtents: () => any;
    clear: () => void;
}
declare class Scene {
    static version: number;
    public md: MathDevice;
    public onGeometryDestroyed: (geometry: Geometry) => void;
    public onMaterialDestroyed: (material: Material) => void;
    public effects: Effect[];
    public effectsMap: {
        [name: string]: Effect;
    };
    public semantics: Semantics;
    public lights: {
        [name: string]: Light;
    };
    public globalLights: Light[];
    public rootNodes: SceneNode[];
    public rootNodesMap: {
        [name: string]: SceneNode;
    };
    public dirtyRoots: {
        [name: string]: SceneNode;
    };
    public nodesToUpdate: SceneNode[];
    public numNodesToUpdate: number;
    public queryVisibleNodes: SceneNode[];
    public materials: {
        [name: string]: Material;
    };
    public shapes: any;
    public staticSpatialMap: SpatialMap;
    public dynamicSpatialMap: SpatialMap;
    public frustumPlanes: any[];
    public animations: any;
    public skeletons: any;
    public extents: any;
    public visibleNodes: SceneNode[];
    public visibleRenderables: Renderable[];
    public visibleLights: LightInstance[];
    public cameraAreaIndex: number;
    public cameraExtents: any;
    public visiblePortals: any[];
    public frameIndex: number;
    public queryCounter: number;
    public staticNodesChangeCounter: number;
    public testExtents: any;
    public externalNodesStack: SceneNode[];
    public overlappingPortals: any[];
    public newPoints: any[];
    public vertexBufferManager: VertexBufferManager;
    public indexBufferManager: IndexBufferManager;
    public areas: SceneArea[];
    public areaInitalizeStaticNodesChangeCounter: number;
    public nearPlane: any;
    public maxDistance: number;
    public bspNodes: SceneBSPNode[];
    public float32ArrayConstructor: any;
    public uint16ArrayConstructor: any;
    public uint32ArrayConstructor: any;
    constructor(mathDevice: MathDevice, staticSpatialMap?: SpatialMap, dynamicSpatialMap?: SpatialMap);
    public getMaterialName: (node: any) => string;
    public findLightName: (light: any) => string;
    public writeBox: (writer: any, extents: any, r: any, g: any, b: any) => void;
    public writeRotatedBox: (writer: any, transform: any, halfExtents: any, r: any, g: any, b: any) => void;
    public drawLights: (gd: any, sm: any, camera: any) => void;
    public drawLightsExtents: (gd: any, sm: any, camera: any) => void;
    public drawLightsScreenExtents: (gd: any, sm: any) => void;
    public drawAreas: (gd: any, sm: any, camera: any) => void;
    public drawPortals: (gd: any, sm: any, camera: any) => void;
    public drawTransforms: (gd: any, sm: any, camera: any, scale: any) => void;
    public drawAnimationHierarchy: (gd: any, sm: any, camera: any, hierarchy: any, numJoints: any, controller: any, matrix: any, boneColor: any, boundsColor: any) => void;
    public getDebugSemanticsPos: () => Semantics;
    public getDebugSemanticsPosCol: () => Semantics;
    public getMetrics: () => any;
    public getVisibilityMetrics: () => any;
    public drawWireframe: (gd: any, sm: any, camera: any, wireframeInfo: any) => void;
    public attributeComponents: (attribute: any) => number;
    public updateNormals: (gd: any, scale: any, drawNormals: any, normalMaterial: any, drawTangents: any, tangentMaterial: any, drawBinormals: any, binormalMaterial: any) => void;
    public drawNodesTree: (tree: any, gd: any, sm: any, camera: any, drawLevel: any) => void;
    public drawCellsGrid: (grid: any, gd: any, sm: any, camera: any) => void;
    public drawDynamicNodesTree: (gd: any, sm: any, camera: any, drawLevel: any) => void;
    public drawStaticNodesTree: (gd: any, sm: any, camera: any, drawLevel: any) => void;
    public drawTransparentNodesExtents: (gd: any, sm: any, camera: any) => void;
    public drawDecalNodesExtents: (gd: any, sm: any, camera: any) => void;
    public drawOpaqueNodesExtents: (gd: any, sm: any, camera: any) => void;
    public drawVisibleRenderablesExtents: (gd: any, sm: any, camera: any, drawDecals: any, drawTransparents: any) => void;
    public drawPhysicsGeometry: (gd: any, sm: any, camera: any, physicsManager: any) => void;
    public drawPhysicsNodes: (gd: any, sm: any, camera: any, physicsManager: any) => void;
    public createConvexHull: (dw: any, body: any, numRays: any) => {
        indices: any;
        vertices: any;
    };
    public createBox: (halfExtents: any) => {
        indices: any;
        vertices: any;
        minExtent: number[];
        maxExtent: number[];
    };
    public createRoundedPrimitive: (mSizeX: any, mSizeY: any, mSizeZ: any, radius: any, mChamferNumSeg: any) => {
        indices: any;
        vertices: any;
        minExtent: number[];
        maxExtent: number[];
    };
    public createCylinder: (radius1: any, radius2: any, len: any, capEnds: any, tesselation: any) => {
        indices: any;
        vertices: any;
        minExtent: number[];
        maxExtent: number[];
    };
    public createGeoSphere: (radius: any, recursionLevel: any) => {
        indices: any;
        vertices: any;
        minExtent: number[];
        maxExtent: number[];
    };
    public drawSceneNodeHierarchy: (gd: any, sm: any, camera: any) => void;
    public findNode(nodePath): SceneNode;
    public addRootNode(rootNode): void;
    public removeRootNode(rootNode): void;
    public addLight(light): void;
    public removeLight(light): void;
    public getLight(name): Light;
    public getGlobalLights(): Light[];
    public calculateNumNodes(nodes);
    public buildPortalPlanes(points, planes, cX, cY, cZ, frustumPlanes): boolean;
    public findAreaIndex(bspNodes, cX, cY, cZ): number;
    public findAreaIndicesAABB(bspNodes, n0, n1, n2, p0, p1, p2): number[];
    public findVisiblePortals(areaIndex, cX, cY, cZ): void;
    public findVisibleNodes(camera, visibleNodes): void;
    public findVisibleNodesTree(tree, camera, visibleNodes): void;
    public buildPortalPlanesNoFrustum(points: any[], planes: any[], cX: number, cY: number, cZ: number, parentPlanes: any[]): boolean;
    public findOverlappingPortals(areaIndex, cX, cY, cZ, extents, overlappingPortals): number;
    public findOverlappingNodes(tree, origin, extents, overlappingNodes): void;
    public findStaticOverlappingNodes(origin, extents, overlappingNodes): void;
    public findDynamicOverlappingNodes(origin, extents, overlappingNodes): void;
    public _findOverlappingNodesAreas(tree, origin, extents, overlappingNodes): boolean;
    public findOverlappingRenderables(tree, origin, extents, overlappingRenderables): void;
    public findStaticOverlappingRenderables(origin, extents, overlappingRenderables): void;
    public findDynamicOverlappingRenderables(origin, extents, overlappingRenderables): void;
    public _findOverlappingRenderablesAreas(tree, origin, extents, overlappingRenderables): boolean;
    public _findOverlappingRenderablesNoAreas(tree, extents, overlappingRenderables): void;
    public cloneRootNode(rootNode, newInstanceName);
    public updateVisibleNodes(camera): void;
    public _updateVisibleNodesNoAreas(camera): void;
    public _updateVisibleNodesAreas(camera): boolean;
    public _filterVisibleNodesForCameraBox(camera, numVisibleNodes, numVisibleRenderables, numVisibleLights): void;
    public getCurrentVisibleNodes(): SceneNode[];
    public getCurrentVisibleRenderables(): Renderable[];
    public getCurrentVisibleLights(): LightInstance[];
    public addRootNodeToUpdate(rootNode, name): void;
    public updateNodes(): void;
    public update(): void;
    public updateExtents(): void;
    public getExtents();
    public loadMaterial(graphicsDevice, textureManager, effectManager, materialName, material): boolean;
    public hasMaterial(materialName): boolean;
    public getMaterial(materialName): Material;
    public drawNodesArray(nodes, gd, globalMaterial, technique, renderUpdate): void;
    public drawVisibleNodes(gd, globalTechniqueParameters, technique, renderUpdate): void;
    public clearMaterials(): void;
    public clearShapes(): void;
    public clearShapesVertexData(): void;
    public clearRootNodes(): void;
    public clear(): void;
    public endLoading(onload): void;
    public initializeNodes(): void;
    public addAreaStaticNodes(): void;
    public findOverlappingAreas(startAreaIndex: number, extents: any, avoidDisabled?: boolean): any[];
    public checkAreaDynamicNodes(): void;
    public initializeAreas(): void;
    public createMaterial(materialName, fileMaterial, effectName, fileEffects, fileImages, graphicsDevice): Material;
    public loadMaterials(loadParams): void;
    public loadSkeletons(loadParams): void;
    public _updateSingleIndexTables(surface, indicesPerVertex, verticesAsIndexLists, verticesAsIndexListTable, numUniqueVertices);
    public _isSequentialIndices(indices, numIndices): boolean;
    public _optimizeRenderables(node: SceneNode, gd: GraphicsDevice): void;
    public loadShape(shapeName, fileShapeName, loadParams);
    public streamShapes(loadParams, postLoadFn): void;
    public loadLights(loadParams): void;
    public loadNodes(loadParams): void;
    public loadAreas(loadParams): void;
    public load(loadParams): void;
    public planeNormalize(a, b, c, d, dst?);
    public isInsidePlanesAABB(extents, planes): boolean;
    public isFullyInsidePlanesAABB(extents, planes): boolean;
    public extractFrustumPlanes(camera): any[];
    public calculateHullScreenExtents(polygons, screenExtents);
    public calculateLightsScreenExtents(camera): void;
    public destroy(): void;
    public getQueryCounter(): number;
    static create(mathDevice: MathDevice, staticSpatialMap?: SpatialMap, dynamicSpatialMap?: SpatialMap): Scene;
}
interface Renderable {
    geometry: Geometry;
    geometryType: string;
    node: SceneNode;
    renderUpdate: any;
    rendererInfo: any;
    distance: number;
    drawParameters: DrawParameters[];
    sharedMaterial: Material;
    skinController?: ControllerBaseClass;
    center: any;
    halfExtents: any;
    clone(): Renderable;
    isSkinned(): boolean;
    getWorldExtents();
    hasCustomWorldExtents(): boolean;
    addCustomWorldExtents(extents: any);
    setNode(node: SceneNode);
    destroy();
}
declare class SceneNode {
    static version: number;
    static _tempDirtyNodes: SceneNode[];
    public name: string;
    public dynamic: boolean;
    public disabled: boolean;
    public dirtyWorld: boolean;
    public dirtyWorldExtents: boolean;
    public dirtyLocalExtents: boolean;
    public worldUpdate: number;
    public frameVisible: number;
    public rendererInfo: any;
    public local: any;
    public world: any;
    public localExtents: any;
    public localExtentsCenter: any;
    public localHalfExtents: any;
    public customLocalExtents: any;
    public worldExtents: any;
    public worldExtentsUpdate: boolean;
    public customWorldExtents: any;
    public numCustomRenderableWorldExtents: number;
    public spatialIndex: number;
    public camera: Camera;
    public parent: SceneNode;
    public notifiedParent: boolean;
    public scene: Scene;
    public children: SceneNode[];
    public childNeedsUpdateCount: number;
    public clonedObserver: Observer;
    public destroyedObserver: Observer;
    public lightInstances: LightInstance[];
    public skin: any;
    public physicsNodes: PhysicsNode[];
    public kinematic: boolean;
    public geometryinstances: {
        [name: string]: GeometryInstance;
    };
    public renderables: Renderable[];
    public mathDevice: MathDevice;
    public arrayConstructor: any;
    static makePath(parentPath, childName): string;
    static invalidSetLocalTransform(): void;
    constructor(params);
    public getName(): string;
    public getPath(): string;
    public getParent(): SceneNode;
    public setParentHelper(parent): void;
    public addChild(child: SceneNode): void;
    public removeChild(child: SceneNode): void;
    public findChild(name): SceneNode;
    public clone(newNodeName?: string): SceneNode;
    public getRoot(): SceneNode;
    public isInScene(): boolean;
    private removedFromScene(scene);
    public setLocalTransform(matrix): void;
    public getLocalTransform();
    private _setDirtyWorldTransform();
    public getWorldTransform();
    public updateWorldTransform(): void;
    public setDynamic(): void;
    public setStatic(): void;
    public setDisabled(disabled): void;
    public getDisabled(): boolean;
    public enableHierarchy(enabled): void;
    private childUpdated();
    private childNeedsUpdate();
    private updateRequired();
    private checkUpdateRequired();
    public update(scene): void;
    static updateNodes(mathDevice, scene, nodes, numNodes): void;
    public updateLocalExtents(): void;
    public getLocalExtents();
    public updateWorldExtents(): void;
    public updateCustomRenderableWorldExtents(): void;
    public recalculateWorldExtents(): void;
    public getWorldExtents();
    public addCustomLocalExtents(localExtents): void;
    public removeCustomLocalExtents(): void;
    public getCustomLocalExtents();
    public addCustomWorldExtents(worldExtents): void;
    public removeCustomWorldExtents(): void;
    public getCustomWorldExtents();
    public renderableWorldExtentsUpdated(wasAlreadyCustom): void;
    public renderableWorldExtentsRemoved(): void;
    public calculateHierarchyWorldExtents(dst?);
    private _calculateNodeExtents(totalExtents);
    public addRenderable(renderable: Renderable): void;
    public addRenderableArray(additionalRenderables): void;
    public removeRenderable(renderable): void;
    public hasRenderables(): boolean;
    public addLightInstance(lightInstance): void;
    public addLightInstanceArray(additionalLightInstances): void;
    public removeLightInstance(lightInstance): void;
    public hasLightInstances(): boolean;
    public destroy(): void;
    public subscribeCloned(observerFunction): void;
    public unsubscribeCloned(observerFunction): void;
    public subscribeDestroyed(observerFunction): void;
    public unsubscribeDestroyed(observerFunction): void;
    static create(params): SceneNode;
}
interface ShadowMap {
    shadowMapTexture: Texture;
    shadowMapRenderTarget: RenderTarget;
    lightInstance: LightInstance;
    texture?: Texture;
}
declare class ShadowMapping {
    static version: number;
    public defaultSizeLow: number;
    public defaultSizeHigh: number;
    public blurEnabled: boolean;
    public gd: GraphicsDevice;
    public md: MathDevice;
    public clearColor: any;
    public tempMatrix43: any;
    public tempV3Up: any;
    public tempV3At: any;
    public tempV3Pos: any;
    public tempV3AxisX: any;
    public tempV3AxisY: any;
    public tempV3AxisZ: any;
    public quadPrimitive: number;
    public quadSemantics: Semantics;
    public quadVertexBuffer: VertexBuffer;
    public pixelOffsetH: number[];
    public pixelOffsetV: number[];
    public node: SceneNode;
    public bufferWidth: number;
    public bufferHeight: number;
    public techniqueParameters: TechniqueParameters;
    public shader: Shader;
    public shadowMapsLow: ShadowMap[];
    public shadowMapsHigh: ShadowMap[];
    public sizeLow: number;
    public sizeHigh: number;
    public lowIndex: number;
    public highIndex: number;
    public blurTextureHigh: Texture;
    public blurTextureLow: Texture;
    public depthBufferLow: RenderBuffer;
    public depthBufferHigh: RenderBuffer;
    public blurRenderTargetHigh: RenderTarget;
    public blurRenderTargetLow: RenderTarget;
    public occludersExtents: any[];
    public shadowMappingShader: Shader;
    public rigidTechnique: Technique;
    public skinnedTechnique: Technique;
    public blurTechnique: Technique;
    public shadowTechniqueParameters: TechniqueParameters;
    public skinController: SkinController;
    public updateShader(sm): void;
    public update(): void;
    public skinnedUpdate(): void;
    public destroyBuffers(): void;
    public updateBuffers(sizeLow, sizeHigh): boolean;
    public findVisibleRenderables(lightInstance): boolean;
    private _sortNegative(a, b);
    public drawShadowMap(cameraMatrix, minExtentsHigh, lightInstance): void;
    private _filterOccluders(overlappingRenderables, numStaticOverlappingRenderables, occludersDrawArray, occludersExtents);
    private _updateOccludersLimits(lightInstance, viewMatrix, frustumPlanes, occludersDrawArray, occludersExtents, numOccluders);
    public blurShadowMaps(): void;
    public lookAt(camera, lookAt, up, eyePosition): void;
    public destroy(): void;
    static create(gd, md, shaderManager, effectsManager, sizeLow, sizeHigh): ShadowMapping;
}
declare class CascadedShadowSplit {
    public viewportX: number;
    public viewportY: number;
    public camera: Camera;
    public origin: any;
    public at: any;
    public viewWindowX: number;
    public viewWindowY: number;
    public minLightDistance: number;
    public maxLightDistance: number;
    public minLightDistanceX: number;
    public maxLightDistanceX: number;
    public minLightDistanceY: number;
    public maxLightDistanceY: number;
    public lightViewWindowX: number;
    public lightViewWindowY: number;
    public lightDepth: number;
    public shadowDepthScale: number;
    public shadowDepthOffset: number;
    public staticNodesChangeCounter: number;
    public numStaticOverlappingRenderables: number;
    public numOverlappingRenderables: number;
    public needsRedraw: boolean;
    public needsBlur: boolean;
    public overlappingRenderables: Renderable[];
    public overlappingExtents: any[];
    public occludersDrawArray: DrawParameters[];
    public worldShadowProjection: any;
    public viewShadowProjection: any;
    public shadowScaleOffset: any;
    constructor(md, x, y);
    public setAsDummy(): void;
}
declare class CascadedShadowMapping {
    static version: number;
    static splitDistances: number[];
    public gd: GraphicsDevice;
    public md: MathDevice;
    public clearColor: any;
    public tempMatrix44: any;
    public tempMatrix43: any;
    public tempMatrix33: any;
    public tempV3Direction: any;
    public tempV3Up: any;
    public tempV3At: any;
    public tempV3Origin: any;
    public tempV3AxisX: any;
    public tempV3AxisY: any;
    public tempV3AxisZ: any;
    public tempV3Cross1: any;
    public tempV3Cross2: any;
    public tempV3Cross3: any;
    public tempV3Int: any;
    public techniqueParameters: TechniqueParameters;
    public quadPrimitive: number;
    public quadSemantics: Semantics;
    public quadVertexBuffer: VertexBuffer;
    public uvScaleOffset: any;
    public pixelOffsetH: number[];
    public pixelOffsetV: number[];
    public bufferWidth: number;
    public bufferHeight: number;
    public globalTechniqueParameters: TechniqueParameters;
    public globalTechniqueParametersArray: TechniqueParameters[];
    public shader: Shader;
    public splits: CascadedShadowSplit[];
    public dummySplit: CascadedShadowSplit;
    public size: number;
    public numSplitsToRedraw: number;
    public texture: Texture;
    public renderTarget: RenderTarget;
    public blurTexture: Texture;
    public depthBuffer: RenderBuffer;
    public blurRenderTarget: RenderTarget;
    public numMainFrustumSidePlanes: number;
    public numMainFrustumPlanes: number;
    public mainFrustumNearPlaneIndex: number;
    public mainFrustumPlanes: any[];
    public numSplitFrustumPlanes: number;
    public splitFrustumPlanes: any[];
    public intersectingPlanes: any[];
    public frustumPoints: any[];
    public visibleNodes: SceneNode[];
    public numOccludees: number;
    public occludeesExtents: any[];
    public occludersExtents: any[];
    public shadowMappingShader: Shader;
    public rigidTechnique: Technique;
    public skinnedTechnique: Technique;
    public blurTechnique: Technique;
    public blurEnabled: boolean;
    public update: () => void;
    public skinnedUpdate: () => void;
    constructor(gd: GraphicsDevice, md: MathDevice, shaderManager: ShaderManager, size: number);
    public updateShader(sm: ShaderManager): void;
    public destroyBuffers(): void;
    public updateBuffers(size: number): boolean;
    public updateShadowMap(lightDirection: any, camera: Camera, scene: Scene, maxDistance: number): void;
    private _planeNormalize(a, b, c, d, dst);
    private _extractMainFrustumPlanes(camera, lightDirection, maxDistance);
    private _extractSplitFrustumPlanes(camera);
    private _isInsidePlanesAABB(extents, planes, numPlanes, overlappingExtents, numOverlappingRenderables);
    private _filterFullyInsidePlanes(extents, planes, intersectingPlanes);
    private _v3Cross(a, b, dst);
    private _findPlanesIntersection(plane1, plane2, plane3, dst);
    private _findMaxWindowZ(zaxis, planes, currentMaxDistance);
    private _updateSplit(split, xaxis, yaxis, zaxis, mainCameraMatrix, frustumPoints, previousSplitPoints, scene, maxDistance);
    private _updateRenderables(split, zaxis, origin, frustumPlanes, scene);
    private _sortNegative(a, b);
    private _filterOccluders(overlappingRenderables, overlappingExtents, numOverlappingRenderables, numStaticOverlappingRenderables, occludersDrawArray, occludeesExtents, occludersExtents, frameIndex);
    private _updateOccludeesLimits(split, viewMatrix, occludeesExtents);
    private _updateOccludersLimits(split, viewMatrix, occludersDrawArray, occludersExtents, numOccluders);
    public drawShadowMap(): void;
    public blurShadowMap(): void;
    public destroy(): void;
    static create(gd: GraphicsDevice, md: MathDevice, shaderManager: ShaderManager, size: number): CascadedShadowMapping;
}
interface TextureEffect {
    technique: Technique;
    params: TechniqueParameters;
    destination: RenderTarget;
}
declare class TextureEffects {
    static version: number;
    public graphicsDevice: GraphicsDevice;
    public mathDevice: MathDevice;
    public staticVertexBufferParams: VertexBufferParameters;
    public staticVertexBuffer: VertexBuffer;
    public effectParams: TextureEffect;
    public quadSemantics: Semantics;
    public quadPrimitive: number;
    public distortParameters: TechniqueParameters;
    public distortTechnique: Technique;
    public colorMatrixParameters: TechniqueParameters;
    public colorMatrixTechnique: Technique;
    public bloomThresholdParameters: TechniqueParameters;
    public bloomThresholdTechnique: Technique;
    public bloomMergeParameters: TechniqueParameters;
    public bloomMergeTechnique: Technique;
    public gaussianBlurParameters: TechniqueParameters;
    public gaussianBlurTechnique: Technique;
    public grayScaleMatrix(dst);
    public sepiaMatrix(dst);
    public negativeMatrix(dst);
    public saturationMatrix(saturationScale, dst);
    public hueMatrix(angle, dst);
    public brightnessMatrix(brightnessOffset, dst);
    public additiveMatrix(additiveRGB, dst);
    public contrastMatrix(contrastScale, dst);
    public applyBloom(params): boolean;
    public applyGaussianBlur(params): boolean;
    public applyColorMatrix(params): boolean;
    public applyDistort(params): boolean;
    public applyEffect(effect): void;
    public destroy(): void;
    static create(params): TextureEffects;
}
