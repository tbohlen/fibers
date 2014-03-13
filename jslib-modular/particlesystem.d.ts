interface FloatArray {
    [index: number]: number;
    length: number;
}
declare class TextureEncode {
    static version: number;
    static encodeByteUnsignedFloat(f: number): number;
    static decodeByteUnsignedFloat(v: number): number;
    static encodeByteSignedFloat(f: number): number;
    static decodeByteSignedFloat(v: number): number;
    static encodeHalfUnsignedFloat(f: number): number;
    static decodeHalfUnsignedFloat(v: number): number;
    static encodeHalfSignedFloat(f: number): number;
    static decodeHalfSignedFloat(v: number): number;
    static encodeUnsignedFloat(f: number): number;
    static decodeUnsignedFloat(v: number): number;
    static encodeSignedFloat(f: number): number;
    static decodeSignedFloat(v: number): number;
    static encodeUnsignedFloat4(v: FloatArray): number;
    static decodeUnsignedFloat4(v: number, dst?: FloatArray): FloatArray;
    static encodeUnsignedFloat2(v: FloatArray): number;
    static encodeUnsignedFloat2xy(x: number, y: number): number;
    static decodeUnsignedFloat2(v: number, dst?: FloatArray): FloatArray;
    static encodeSignedFloat2(v: FloatArray): number;
    static decodeSignedFloat2(v: number, dst?: FloatArray): FloatArray;
}
interface SizeTreeNode<T> {
    w: number;
    h: number;
    data: T;
    parent: SizeTreeNode<T>;
    height: number;
    child: SizeTreeNode<T>[];
}
declare class SizeTree<T> {
    private root;
    constructor();
    private static gen<T>(data, w, h);
    public insert(data: T, w: number, h: number): SizeTreeNode<T>;
    public remove(leaf: SizeTreeNode<T>): void;
    private filterUp(node);
    private balance(node);
    public stack: SizeTreeNode<T>[];
    public traverse(lambda: (node: SizeTreeNode<T>) => boolean): void;
    public searchBestFit(w: number, h: number, getCost: (w: number, h: number, data: T) => number): SizeTreeNode<T>;
}
interface PackedRect {
    x: number;
    y: number;
    w: number;
    h: number;
    bin: number;
}
declare class OnlineTexturePacker {
    private free;
    public bins: PackedRect[];
    public maxWidth: number;
    public maxHeight: number;
    constructor(maxWidth: number, maxHeight: number);
    public release(rect: PackedRect): void;
    private releaseSpace(bin, x, y, w, h);
    private static costFit(w, h, rect);
    public pack(w: number, h: number): PackedRect;
    private split(rect, w, h);
    private static nearPow2Geq(x);
    private grow(w, h, bin?);
    private growRight(rect, w, h);
    private growDown(rect, w, h);
}
declare class MinHeap<K, T> {
    static pool: {
        key: any;
        data: any;
    }[];
    private heap;
    private compare;
    private swap(i1, i2);
    constructor(compare: (key1: K, key2: K) => boolean);
    public clear(cb?: (data: T) => void): void;
    private removeNode(i);
    private findNode(data);
    public remove(data: T): boolean;
    public insert(data: T, key: K): void;
    public headData(): T;
    public headKey(): K;
    public pop(): T;
}
declare class TimeoutQueue<T> {
    private heap;
    public time: number;
    static compare(x, y): boolean;
    constructor();
    public clear(cb?: (data: T) => void): void;
    public remove(data: T): boolean;
    public insert(data: T, timeout: number): void;
    public update(deltaTime: number): void;
    public hasNext(): boolean;
    public next(): T;
    public iter(lambda: (data: T) => void): void;
}
declare class ParticleQueue {
    private heap;
    private heapSize;
    private time;
    private lastDeath;
    public wasForced: boolean;
    private swap(i1, i2);
    constructor(maxParticles: number);
    public clear(): void;
    public replace(i: number, time: number): number;
    private find(particleID);
    public removeParticle(particleID: number): void;
    public updateParticle(particleID: number, lifeDelta: number): void;
    public create(timeTillDeath: number, forceCreation?: boolean): number;
    public update(timeUpdate: number): boolean;
}
interface ParticleSystemAnimation {
    maxLifeTime: number;
    animation: Texture;
    particle: ParticleDefn[];
    attribute: {
        [name: string]: AttributeRange;
    };
}
interface AttributeRange {
    min: number[];
    delta: number[];
}
interface ParticleDefn {
    lifeTime: number;
    animationRange: number[];
}
declare enum AttributeCompress {
    cNone,
    cHalf,
    cFull,
}
declare enum AttributeStorage {
    sDirect,
    sNormalized,
}
interface Attribute {
    name: string;
    type: any;
    defaultValue: number[];
    defaultInterpolator: Interpolator;
    minValue: number[];
    maxValue: number[];
    compress: AttributeCompress;
    storage: AttributeStorage;
}
interface Particle {
    name: string;
    fps: number;
    animation: Snapshot[];
    textureUVs: {
        [name: string]: number[][];
    };
    textureSizes: {
        [name: string]: number[];
    };
}
interface Snapshot {
    time: number;
    attributes: {
        [name: string]: number[];
    };
    interpolators: {
        [name: string]: Interpolator;
    };
}
interface InterpolatorFun {
    (vs: number[][], ts: number[], t: number): number[];
}
interface Interpolator {
    fun: InterpolatorFun;
    offsets: number[];
    type: string;
}
declare class ParticleBuildError {
    static wrap(x: any): string;
    private uncheckedErrorCount;
    private uncheckedWarningCount;
    private log;
    public empty(includeWarnings: boolean): boolean;
    public error(x: string): void;
    public warning(x: string): void;
    private static ERROR;
    private static WARNING;
    public checkErrorState(msg?: string): boolean;
    public fail(msg: string): string;
    constructor();
}
declare class Types {
    static arrayTypes: string[];
    static isTypedArray(x: any): boolean;
    static isArray(x: any): boolean;
    static isFunction(x: any): boolean;
    static isNumber(x: any): boolean;
    static isString(x: any): boolean;
    static isBoolean(x: any): boolean;
    static isObject(x: any): boolean;
    static isNullUndefined(x: any): boolean;
    static copy(from: any, to?: any, json?: boolean);
    static copyElements(from: any[], to: any[], json?: boolean): any[];
    static copyFields(from: {
        [name: string]: any;
    }, to: {
        [name: string]: any;
    }, json?: boolean): {
        [name: string]: any;
    };
}
declare class Parser {
    private static interpolators;
    static extraFields(error: ParticleBuildError, obj: string, x: Object, excludes: string[]): void;
    static field(error: ParticleBuildError, obj: string, x: Object, n: string): any;
    static stringField(error: ParticleBuildError, obj: string, x: Object, n: string): string;
    static numberField(error: ParticleBuildError, obj: string, x: Object, n: string): number;
    static checkNumber(error: ParticleBuildError, obj: string, n: string, ret: any): number;
    static checkNullNumber(error: ParticleBuildError, obj: string, n: string, ret: any): number;
    static maybeField<R>(x: Object, n: string, run: (field: any) => R, def: () => R): R;
    static runField<R>(error: ParticleBuildError, obj: string, x: Object, n: string, run: (field: any) => R): R;
    static checkVector(error, obj: string, n: string, dim: number, field: any): FloatArray;
    static checkBoolean(error, obj: string, n: string, field: any): boolean;
    static checkString(error, obj: string, n: string, field: any): string;
    static typeAttr(error: ParticleBuildError, obj: string, type: any, acceptNull: boolean, val: any): number[];
    static defaultAttr(type: any, val?: number): number[];
    static parseSystem(error: ParticleBuildError, defn: any): Attribute[];
    static hasTextureIndex(system, index): boolean;
    static parseSystemAttribute(error: ParticleBuildError, defn: any): Attribute;
    static parseInterpolator(error: ParticleBuildError, obj: string, defn: any): Interpolator;
    private static zero();
    static parseParticle(error: ParticleBuildError, defn: any): Particle;
    static parseAttributeValue(error: ParticleBuildError, obj: string, def: any): number[];
}
declare class ParticleBuilder {
    private static buildAnimationTexture(graphicsDevice, width, height, data);
    private static nearPow2Geq(x);
    private static packedTextureVertices;
    private static packedTextureSemantics;
    private static packedCopyParameters;
    private static packedCopyTechnique;
    static packTextures(params: {
        graphicsDevice: GraphicsDevice;
        textures: Texture[];
        borderShrink?: number;
    }): {
        texture: () => Texture;
        uvMap: number[][];
    };
    static compile(params: {
        graphicsDevice: GraphicsDevice;
        particles: any[];
        system: any;
        alreadyParsed?: boolean;
        uvMap?: {
            [name: string]: number[][];
        };
        tweaks?: {
            [name: string]: any;
        }[];
        failOnWarnings?: boolean;
    }): ParticleSystemAnimation;
    private static checkAssignment(error, objx, objt, value, type);
    private static compileData(system, width, particles);
    private static normalizeAttributes(system, particle, minDelta);
    private static attributesMapping(system, particles);
    private static clampAttributes(system, particle);
    private static setDefaults(particle, system);
    private static applyTweak(system, particle, tweak);
    private static remapUVs(particle, uvMap, index);
    private static interpolate(snaps, attr, time);
    private static discretize(system, particle);
    static checkAttributes(error: ParticleBuildError, particle: Particle, system: Attribute[]): void;
    private static getAttribute(system, name);
    private static normalizeParticleUVs(particle);
}
interface Context {
    width: number;
    height: number;
    renderTargets: RenderTarget[];
    store: {
        fit: PackedRect;
        set: (ctx: AllocatedContext) => void;
        ctx: AllocatedContext;
    }[];
}
interface AllocatedContext {
    renderTargets: RenderTarget[];
    uvRectangle: number[];
    bin: number;
}
declare class SharedRenderContext {
    private graphicsDevice;
    private contexts;
    private packer;
    private static textureVertices;
    private static textureSemantics;
    private static copyParameters;
    private static copyTechnique;
    private static init(graphicsDevice);
    static create(params: {
        graphicsDevice: GraphicsDevice;
    }): SharedRenderContext;
    constructor(params: {
        graphicsDevice: GraphicsDevice;
    });
    public destroy(): void;
    public release(ctx: AllocatedContext): void;
    public allocate(params: {
        set: (ctx: AllocatedContext) => void;
        width: number;
        height: number;
    }): AllocatedContext;
    private resizeContext(ctx, w, h);
    private static copyTexture(gd, from, to);
    private static createContext(gd, w, h);
}
declare class ParticleGeometry {
    public vertexBuffer: VertexBuffer;
    public particleStride: number;
    public semantics: Semantics;
    public attributes: any[];
    public primitive: any;
    public maxParticles: number;
    public shared: boolean;
    private graphicsDevice;
    private template;
    private handlers;
    public register(cb: () => void): void;
    public unregister(cb: () => void): void;
    public resize(maxParticles: number): void;
    constructor();
    static create(params: {
        graphicsDevice: GraphicsDevice;
        maxParticles: number;
        template: number[];
        attributes: any[];
        stride: number;
        semantics: Semantics;
        primitive?: any;
        shared?: boolean;
    }): ParticleGeometry;
    public destroy(): void;
}
interface ParticleUpdater {
    technique: Technique;
    parameters: {
        [name: string]: any;
    };
    update? (parameters: TechniqueParameters, data: Float32Array, dataI: Uint32Array, tracked: Uint16Array, numTracked: number): void;
    predict? (parameters: TechniqueParameters, position: FloatArray, velocity: FloatArray, userData: number, time: number): number;
    createUserDataSeed(): number;
    createUserData(params: {
        [name: string]: any;
    }): number;
    applyArchetype(textureManager: TextureManager, system: ParticleSystem, archetype: ParticleArchetype): void;
}
interface DefaultUpdaterArchetype {
    acceleration: FloatArray;
    drag: number;
    noiseTexture: string;
    randomizedAcceleration: FloatArray;
}
declare class DefaultParticleUpdater {
    public technique: Technique;
    public parameters: {
        [name: string]: any;
    };
    static template: {
        acceleration: number[];
        drag: number;
        noiseTexture: string;
        randomizedAcceleration: number[];
    };
    static load(archetype: DefaultUpdaterArchetype, shaderLoad, textureLoad): void;
    static compressArchetype(archetype: DefaultUpdaterArchetype): any;
    static parseArchetype(error: ParticleBuildError, delta: any): DefaultUpdaterArchetype;
    public applyArchetype(textureManager, system, archetype): void;
    public createUserDataSeed(): number;
    public createUserData(params: {
        randomizeAcceleration?: boolean;
        seed?: number;
    }): number;
    public predict(parameters: TechniqueParameters, pos: FloatArray, vel: FloatArray, userData: number, time: number): number;
    public update(parameters: TechniqueParameters, dataF: Float32Array, dataI: Uint32Array, tracked: Uint16Array, numTracked: number): void;
    constructor();
    static create(graphicsDevice: GraphicsDevice, shaderManager: ShaderManager): DefaultParticleUpdater;
}
interface ParticleGeometryFn {
    (graphicsDevice: GraphicsDevice, maxParticles: number, shared?: boolean): ParticleGeometry;
}
interface ParticleRenderer {
    technique: Technique;
    parameters: {
        [name: string]: any;
    };
    createGeometry(graphicsDevice: GraphicsDevice, maxParticles: number, shared?: boolean): ParticleGeometry;
    setAnimationParameters(system: ParticleSystem, definition: {
        attribute: {
            [name: string]: AttributeRange;
        };
    }): void;
    createUserDataSeed(): number;
    createUserData(params: {
        [name: string]: any;
    }): number;
    applyArchetype(textureManager: TextureManager, system: ParticleSystem, archetype: ParticleArchetype, textures: (name: string) => Texture): void;
}
interface DefaultRendererArchetype {
    noiseTexture: string;
    randomizedRotation: number;
    randomizedOrientation: FloatArray;
    randomizedScale: FloatArray;
    randomizedAlpha: number;
    animatedRotation: boolean;
    animatedOrientation: boolean;
    animatedScale: boolean;
    animatedAlpha: boolean;
}
declare class DefaultParticleRenderer {
    public technique: Technique;
    public parameters: {
        [name: string]: any;
    };
    static template: {
        noiseTexture: string;
        randomizedRotation: number;
        randomizedOrientation: number[];
        randomizedScale: number[];
        randomizedAlpha: number;
        animatedRotation: boolean;
        animatedOrientation: boolean;
        animatedScale: boolean;
        animatedAlpha: boolean;
    };
    static load(archetype: DefaultUpdaterArchetype, shaderLoad, textureLoad): void;
    static compressArchetype(archetype: DefaultRendererArchetype): any;
    static parseArchetype(error: ParticleBuildError, delta: any): DefaultRendererArchetype;
    public applyArchetype(textureManager, system, archetype, textures): void;
    public createUserDataSeed(): number;
    public createUserData(params: {
        facing?: string;
        randomizeOrientation?: boolean;
        randomizeScale?: boolean;
        randomizeRotation?: boolean;
        randomizeAlpha?: boolean;
        seed?: number;
        phi?: number;
        theta?: number;
    }): number;
    public setAnimationParameters(system: ParticleSystem, definition: {
        attribute: {
            [name: string]: AttributeRange;
        };
    }): void;
    public createGeometry(graphicsDevice: GraphicsDevice, maxParticles: number, shared?: boolean): ParticleGeometry;
    constructor();
    static create(graphicsDevice: GraphicsDevice, shaderManager: ShaderManager, blendMode?: string): DefaultParticleRenderer;
}
interface ParticleSystemSynchronizer {
    synchronize(system: ParticleSystem, timeStep: number): void;
}
interface ParticleSystemArchetype {
    center: FloatArray;
    halfExtents: FloatArray;
    maxSpeed: number;
    maxParticles: number;
    zSorted: boolean;
    maxSortSteps: number;
    trackingEnabled: boolean;
    maxLifeTime: number;
}
declare class ParticleSystem {
    static PARTICLE_DIMX: number;
    static PARTICLE_DIMY: number;
    static PARTICLE_SPAN: number;
    static PARTICLE_POS: number;
    static PARTICLE_VEL: number;
    static PARTICLE_LIFE: number;
    static PARTICLE_ANIM: number;
    static PARTICLE_DATA: number;
    static template: {
        center: number[];
        halfExtents: number[];
        maxSpeed: number;
        maxParticles: number;
        zSorted: boolean;
        maxSortSteps: number;
        trackingEnabled: boolean;
        maxLifeTime: number;
    };
    static compressArchetype(archetype: ParticleSystemArchetype): any;
    static parseArchetype(error: ParticleBuildError, delta: any): ParticleSystemArchetype;
    private static defaultNoiseTexture;
    static getDefaultNoiseTexture(graphicsDevice: GraphicsDevice): Texture;
    private static computeMaxParticleDependents(maxParticles, zSorted);
    private graphicsDevice;
    public center: FloatArray;
    public halfExtents: FloatArray;
    private invHalfExtents;
    public maxSpeed: number;
    public maxParticles: number;
    public zSorted: boolean;
    public maxSortSteps: number;
    public maxMergeStage: number;
    private animation;
    private sharedAnimation;
    public maxLifeTime: number;
    private queue;
    public particleSize: FloatArray;
    public geometry: ParticleGeometry;
    private lastVisible;
    private lastTime;
    public synchronizer: ParticleSystemSynchronizer;
    public timer: () => number;
    private renderContextShared;
    private renderContext;
    private stateContext;
    private currentState;
    public updater: ParticleUpdater;
    public renderer: ParticleRenderer;
    public views: ParticleView[];
    public updateParameters: TechniqueParameters;
    public renderParameters: TechniqueParameters;
    public trackingEnabled: boolean;
    private numTracked;
    private tracked;
    private cpuF32;
    private cpuU32;
    private addTracked(id);
    static fullTextureVertices: VertexBuffer;
    static fullTextureSemantics: Semantics;
    private static numCreated;
    private static createdIndices;
    private static createdData;
    private static createdData32;
    private static createdTexture;
    private static createdValidWidth;
    private static createdValidHeight;
    private static addCreated(id);
    private static resizeUInt16(arr, total, used);
    private static sizeCreated(gd, particleSize);
    private static dispatchCreated(particleSize);
    private static sharedDefaultUpdater;
    private static sharedDefaultRenderer;
    private constructor();
    static create(params: {
        graphicsDevice: GraphicsDevice;
        center?: FloatArray;
        halfExtents: FloatArray;
        maxSpeed: number;
        maxParticles: number;
        zSorted?: boolean;
        maxSortSteps?: number;
        geometry?: ParticleGeometry;
        sharedRenderContext?: SharedRenderContext;
        maxLifeTime: number;
        animation: Texture;
        sharedAnimation?: boolean;
        timer?: () => number;
        synchronizer?: ParticleSystemSynchronizer;
        trackingEnabled?: boolean;
        updater?: ParticleUpdater;
        renderer?: ParticleRenderer;
        shaderManager?: ShaderManager;
    }): ParticleSystem;
    public destroy(): void;
    public reset(lastTime?): void;
    private setStateContext(ctx);
    public createParticle(params: {
        position: FloatArray;
        velocity: FloatArray;
        lifeTime: number;
        animationRange: FloatArray;
        userData?: number;
        forceCreation?: boolean;
        isTracked?: boolean;
    }): number;
    public removeAllParticles(): void;
    public removeParticle(id: number): void;
    public updateParticle(id: number, params: {
        position?: FloatArray;
        velocity?: FloatArray;
        animationRange?: FloatArray;
        userData?: number;
        isTracked?: boolean;
    }): void;
    public sync(frameVisible: number): void;
    private shouldUpdate;
    public hasLiveParticles: boolean;
    private updateTime;
    private updateShift;
    public beginUpdate(deltaTime: number, shift?: FloatArray): void;
    public endUpdate(): boolean;
    private updateParticleState(deltaTime, shift);
    public queryPosition(id: number, dst?: FloatArray): FloatArray;
    public queryVelocity(id: number, dst?: FloatArray): FloatArray;
    public queryRemainingLife(id: number): number;
    public queryUserData(id: number): number;
    public render(view: ParticleView): void;
    public renderDebug(): void;
}
interface ParticleViewParameters {
    modelView: FloatArray;
    projection: FloatArray;
    mappingTable: Texture;
    mappingSize: FloatArray;
    invMappingSize: FloatArray;
    mappingPos: FloatArray;
}
interface PrepareSortParameters {
    zBound: number;
}
interface MergeSortParameters {
    cpass: number;
    PmS: number;
    twoStage: number;
    twoStage_PmS_1: number;
    mappingTable: Texture;
}
declare class ParticleView {
    private graphicsDevice;
    private mappingContext;
    private currentMapping;
    private renderContext;
    private renderContextShared;
    public system: ParticleSystem;
    public parameters: ParticleViewParameters;
    private mergePass;
    private mergeStage;
    private constructor();
    static create(params: {
        graphicsDevice: GraphicsDevice;
        system?: ParticleSystem;
        sharedRenderContext?: SharedRenderContext;
    }): ParticleView;
    public destroy(): void;
    private setMappingContext(ctx);
    private static mergeSortTechnique;
    private static prepareSortTechnique;
    private static mergeSortParameters;
    private static prepareSortParameters;
    private static initSorting(gd);
    public setSystem(system: ParticleSystem): void;
    public update(modelView?: FloatArray, projection?: FloatArray): void;
    public render(): void;
    private sort();
}
declare class ParticleRenderable {
    public addCustomWorldExtents(extents: FloatArray): void;
    public clone(): ParticleRenderable;
    public getCustomWorldExtents(): FloatArray;
    public getMaterial(): Material;
    public getWorldExtents(): FloatArray;
    public hasCustomWorldExtents(): boolean;
    public removeCustomWorldExtents(): void;
    public setMaterial(material: Material): void;
    public getNode(): SceneNode;
    public disabled: boolean;
    public geometryType: string;
    public drawParameters: DrawParameters[];
    public diffuseDrawParameters: DrawParameters[];
    public shadowDrawParameters: DrawParameters[];
    public sharedMaterial: Material;
    public worldExtents: FloatArray;
    public distance: number;
    public frameVisible: number;
    public rendererInfo: any;
    public halfExtents: FloatArray;
    public center: FloatArray;
    public setNode(node: SceneNode): void;
    public queryCounter: number;
    public diffuseShadowDrawParameters: DrawParameters[];
    public shadowMappingDrawParameters: DrawParameters[];
    public geometry: Geometry;
    public surface: Surface;
    public techniqueParameters: TechniqueParameters;
    public skinController: any;
    public isNormal: boolean;
    public node: SceneNode;
    public normalInfos: any;
    public isSkinned(): boolean;
    private graphicsDevice;
    private lazySystem;
    private lazyView;
    private passIndex;
    private views;
    private sharedRenderContext;
    private invalidated;
    private worldExtentsUpdate;
    public world: FloatArray;
    public system: ParticleSystem;
    public fixedOrientation: boolean;
    public localTransform: FloatArray;
    public setLocalTransform(localTransform?: FloatArray): void;
    public setFixedOrientation(fixedOrientation: boolean): void;
    private updateWorldExtents();
    private static material;
    constructor();
    static create(params: {
        graphicsDevice: GraphicsDevice;
        passIndex: number;
        system?: ParticleSystem;
        sharedRenderContext?: SharedRenderContext;
    }): ParticleRenderable;
    public releaseViews(callback?: (view: ParticleView) => void): void;
    public destroy(): void;
    static cameraId: number;
    public renderUpdate(camera: Camera): void;
    public setLazyView(view: () => ParticleView): void;
    public setLazySystem(system: () => ParticleSystem, center: FloatArray, halfExtents: FloatArray): void;
    public setSystem(system: ParticleSystem): void;
    private resizedGeometryCb;
    private static resizedGeometry(self);
}
interface ParticleEmitter {
    enabled: boolean;
    sync(synchronizer: ParticleSynchronizer, system: ParticleSystem, timeStep: number);
    reset(): void;
    enable(): void;
    disable(): void;
    burst(count?): void;
    timeout(timeout): void;
    applyArchetype(archetype: any, particleDef: {
        [name: string]: ParticleDefn;
    }, renderer: ParticleRenderer, updater: ParticleUpdater): void;
    getMaxLifeTime(): number;
    getMaxParticles(): number;
    getMaxSpeed(): number;
}
interface ParticleSynchronizer {
    emitters: ParticleEmitter[];
    renderable: ParticleRenderable;
    synchronize(system: ParticleSystem, timeStep: number): void;
    reset(): void;
    addEmitter(emitter: ParticleEmitter): void;
    removeEmitter(emitter: ParticleEmitter): void;
    applyArchetype(archetype: any): void;
}
interface DefaultParticleSynchronizerEvent {
    time: number;
    fun(event: DefaultParticleSynchronizerEvent, synchronizer: DefaultParticleSynchronizer, system: ParticleSystem): void;
    recycle(event: DefaultParticleSynchronizerEvent): void;
}
interface DefaultSynchronizerArchetype {
    fixedTimeStep: number;
    maxSubSteps: number;
    trailFollow: number;
}
declare class DefaultParticleSynchronizer {
    public emitters: ParticleEmitter[];
    public events: TimeoutQueue<DefaultParticleSynchronizerEvent>;
    public renderable: ParticleRenderable;
    public trailFollow: number;
    static template: {
        fixedTimeStep: number;
        maxSubSteps: number;
        trailFollow: number;
    };
    static compressArchetype(archetype: DefaultSynchronizerArchetype): any;
    static parseArchetype(error: ParticleBuildError, delta: any): DefaultSynchronizerArchetype;
    public applyArchetype(archetype): void;
    public fixedTimeStep: number;
    public maxSubSteps: number;
    public offsetTime: number;
    public synchronize(system: ParticleSystem, timeStep: number): void;
    private previousPos;
    private shift;
    private update(system, timeStep);
    public enqueue(event: DefaultParticleSynchronizerEvent): void;
    public addEmitter(sync: ParticleEmitter): void;
    public removeEmitter(sync: ParticleEmitter): void;
    public reset(): void;
    static recycleEvent(event): void;
    constructor();
    static create(params: {
        fixedTimeStep?: number;
        maxSubSteps?: number;
        renderable?: ParticleRenderable;
        trailFollow?: number;
    }): DefaultParticleSynchronizer;
}
interface DefaultEmitterArchetype {
    forceCreation: boolean;
    usePrediction: boolean;
    emittance: {
        delay: number;
        rate: number;
        burstMin: number;
        burstMax: number;
    };
    particle: {
        name: string;
        lifeTimeMin: number;
        lifeTimeMax: number;
        useAnimationLifeTime: boolean;
        lifeTimeScaleMin: number;
        lifeTimeScaleMax: number;
        renderUserData: {
            [name: string]: any;
        };
        updateUserData: {
            [name: string]: any;
        };
    };
    position: {
        position: FloatArray;
        spherical: boolean;
        normal: FloatArray;
        radiusMin: number;
        radiusMax: number;
        radiusDistribution: string;
        radiusSigma: number;
    };
    velocity: {
        theta: number;
        phi: number;
        speedMin: number;
        speedMax: number;
        flatSpread: number;
        flatSpreadAngle: number;
        flatSpreadDistribution: string;
        flatSpreadSigma: number;
        conicalSpread: number;
        conicalSpreadDistribution: string;
        conicalSpreadSigma: number;
    };
}
declare class DefaultParticleEmitter {
    private offsetTime;
    private bursting;
    public forceCreation: boolean;
    public usePrediction: boolean;
    public emittance: {
        delay: number;
        rate: number;
        burstMin: number;
        burstMax: number;
    };
    public particle: {
        animationRange: FloatArray;
        lifeTimeMin: number;
        lifeTimeMax: number;
        userData: number;
    };
    public position: {
        position: FloatArray;
        spherical: boolean;
        normal: FloatArray;
        radiusMin: number;
        radiusMax: number;
        radiusDistribution: string;
        radiusSigma: number;
    };
    public velocity: {
        theta: number;
        phi: number;
        speedMin: number;
        speedMax: number;
        flatSpread: number;
        flatSpreadAngle: number;
        flatSpreadDistribution: string;
        flatSpreadSigma: number;
        conicalSpread: number;
        conicalSpreadDistribution: string;
        conicalSpreadSigma: number;
    };
    public enabled: boolean;
    static template: {
        forceCreation: boolean;
        usePrediction: boolean;
        emittance: {
            delay: number;
            rate: number;
            burstMin: number;
            burstMax: number;
        };
        particle: {
            name: string;
            lifeTimeMin: number;
            lifeTimeMax: number;
            useAnimationLifeTime: boolean;
            lifeTimeScaleMin: number;
            lifeTimeScaleMax: number;
            renderUserData: {};
            updateUserData: {};
        };
        position: {
            position: number[];
            spherical: boolean;
            normal: number[];
            radiusMin: number;
            radiusMax: number;
            radiusDistribution: string;
            radiusSigma: number;
        };
        velocity: {
            theta: number;
            phi: number;
            speedMin: number;
            speedMax: number;
            flatSpread: number;
            flatSpreadAngle: number;
            flatSpreadDistribution: string;
            flatSpreadSigma: number;
            conicalSpread: number;
            conicalSpreadDistribution: string;
            conicalSpreadSigma: number;
        };
    };
    static compressArchetype(archetype: DefaultEmitterArchetype): any;
    static parseArchetype(error: ParticleBuildError, delta: any, particles: {
        [name: string]: any;
    }): DefaultEmitterArchetype;
    public applyArchetype(archetype, particleDefns, renderer: ParticleRenderer, updater: ParticleUpdater): void;
    public getMaxLifeTime(): number;
    public getMaxParticles(): number;
    public getMaxSpeed(): number;
    public reset(): void;
    static eventPool: any[];
    static eventFun(event, emitter, system): void;
    static recycleFun(event): void;
    public sync(emitter: DefaultParticleSynchronizer, system: ParticleSystem, timeStep: number): void;
    constructor();
    static createArchetype: DefaultEmitterArchetype;
    static createParticleDefns;
    static create(): DefaultParticleEmitter;
    public enable(): void;
    public disable(): void;
    public burst(count?: number): void;
    public timeout(timeout): void;
}
interface ParticleArchetype {
    system: ParticleSystemArchetype;
    renderer: {
        name: string;
    };
    updater: {
        name: string;
    };
    synchronizer: {
        name: string;
    };
    animationSystem: string;
    packedTextures: string[];
    particles: {
        [name: string]: {
            animation: string;
            tweaks: {
                [name: string]: any;
            };
            textureUVs: number[][];
            textures: string[][];
        };
    };
    emitters: {
        name: string;
    }[];
    context: ParticleManagerContext;
}
interface ParticleManagerContext {
    packed: string[];
    textures: {
        [name: string]: any;
    };
    getTextureCb: (type: string) => Texture;
    definition: ParticleSystemAnimation;
    particleDefns: {
        [name: string]: ParticleDefn;
    };
    renderer: ParticleRenderer;
    updater: ParticleUpdater;
    geometry: ParticleGeometry;
    instances: ParticleInstance[];
    instancePool: ParticleInstance[];
    systemPool: ParticleSystem[];
    maxParticles: number;
    maxLifeTime: number;
    maxSpeed: number;
}
interface ParticleInstance {
    archetype: ParticleArchetype;
    system: ParticleSystem;
    renderable: ParticleRenderable;
    synchronizer: ParticleSynchronizer;
    queued: boolean;
    creationTime: number;
    lazySystem: () => ParticleSystem;
}
declare class ParticleManager {
    private geometries;
    private systems;
    private particles;
    private renderers;
    private updaters;
    private synchronizers;
    private emitters;
    private archetypes;
    private systemContext;
    private viewContext;
    private getViewCb;
    private viewPool;
    private graphicsDevice;
    private textureManager;
    private shaderManager;
    private uniqueId;
    private scene;
    private passIndex;
    private initialized;
    public failOnWarnings: boolean;
    private time;
    private timerCb;
    private queue;
    public update(timeStep: number): void;
    public clear(archetype?): void;
    private clearQueueFun(instance);
    public initialize(scene: Scene, passIndex: number): void;
    constructor();
    static create(graphicsDevice, textureManager, shaderManager): ParticleManager;
    public gatherInstanceMetrics(archetype?);
    public gatherMetrics(archetype?);
    private getGeometry(maxParticles, name?);
    public registerGeometry(name: string, generator: ParticleGeometryFn): void;
    private getRenderer(name?);
    public registerRenderer(name, parser, compressor, loader, generator, geometry): void;
    private getUpdater(name?);
    public registerUpdater(name, parser, compressor, loader, generator): void;
    private getAnimationSystem(name?);
    public registerAnimationSystem(name: string, definition: any): void;
    public computeAnimationLifeTime(name?: string): any;
    private getParticleAnimation(name?);
    public registerParticleAnimation(definition: any): void;
    private getEmitter(name?);
    public registerEmitter(name, parser, compressor, generator): void;
    private getSynchronizer(name?);
    public registerSynchronizer(name, parser, compressor, generator): void;
    public loadArchetype(archetype: ParticleArchetype, onload?: (_: ParticleArchetype) => void): void;
    public initializeArchetype(archetype: ParticleArchetype): void;
    public createInstance(archetype, timeout?);
    static m43Identity;
    public destroyInstance(instance, removedFromQueue?: boolean): void;
    public addInstanceToScene(instance, parent?): void;
    public removeInstanceFromScene(instance): void;
    private getSystem(archetype, instance);
    private getView();
    public createNewInstance(archetype): {
        archetype: any;
    };
    public replaceArchetype(oldArchetype, newArchetype): void;
    public destroy(): void;
    public destroyArchetype(archetype): void;
    private buildParticleSceneNode(archetype, instance);
    private releaseSynchronizer(instance);
    private buildSynchronizer(archetype, instance);
    private static JSONreplacer(key, value);
    public serializeArchetype(archetype: ParticleArchetype): string;
    public deserializeArchetype(archetype: string): ParticleArchetype;
    public compressArchetype(archetype: ParticleArchetype): any;
    public parseArchetype(delta: any): ParticleArchetype;
    static recordDelta(template, obj);
}
