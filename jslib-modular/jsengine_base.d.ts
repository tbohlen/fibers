interface CachedAsset {
    cacheHit: number;
    asset: any;
    isLoading: boolean;
    key: string;
    observer: Observer;
}
interface AssetCacheOnLoadFn {
    (key: string, params: any, callback: (asset: any) => void): void;
}
interface AssetCacheOnDestroyFn {
    (oldestKey: string, asset: any): void;
}
interface AssetCacheOnLoadedFn {
    (key: string, asset: any, params: any): void;
}
interface AssetCacheParams {
    size?: number;
    onLoad: AssetCacheOnLoadFn;
    onDestroy?: AssetCacheOnDestroyFn;
}
declare class AssetCache {
    static version: number;
    public maxCacheSize: number;
    public onLoad: AssetCacheOnLoadFn;
    public onDestroy: AssetCacheOnDestroyFn;
    public hitCounter: number;
    public cache: {
        [idx: string]: CachedAsset;
    };
    public cacheArray: CachedAsset[];
    public exists(key: string): boolean;
    public isLoading(key: string): boolean;
    public get(key: string): any;
    public request(key: string, params?, callback?: AssetCacheOnLoadedFn): void;
    static create(cacheParams: AssetCacheParams): AssetCache;
}
declare class AssetTracker {
    static version: number;
    public assetsLoadedCount: number;
    public loadingProgress: number;
    public numberAssetsToLoad: number;
    public callback: () => void;
    public displayLog: boolean;
    public eventOnLoadHandler: (event: any) => void;
    public getLoadedCount(): number;
    public getLoadingProgress(): number;
    public getNumberAssetsToLoad(): number;
    public eventOnAssetLoadedCallback(event): void;
    public setCallback(callback): void;
    public setNumberAssetsToLoad(numberAssetsToLoad): void;
    static create(numberAssetsToLoad: number, displayLog: boolean): AssetTracker;
}
declare class Camera {
    static version: number;
    public md: MathDevice;
    public matrix: any;
    public viewMatrix: any;
    public projectionMatrix: any;
    public viewProjectionMatrix: any;
    public frustumPlanes: any[];
    public viewOffsetX: number;
    public viewOffsetY: number;
    public recipViewWindowX: number;
    public recipViewWindowY: number;
    public infinite: boolean;
    public parallel: boolean;
    public aspectRatio: number;
    public nearPlane: number;
    public farPlane: number;
    public lookAt(lookAt, up, eyePosition): void;
    public updateProjectionMatrix(): void;
    public updateViewMatrix(): void;
    public updateViewProjectionMatrix(): void;
    public extractFrustumPlanes(m, p): any[];
    public updateFrustumPlanes(): void;
    public isVisiblePoint(p);
    public isVisibleSphere(c, r);
    public isVisibleBox(c, h);
    public isVisibleAABB(extents);
    public isFullyInsideAABB(extents);
    public getFrustumPoints(farPlane?: number, nearPlane?: number, points?: any[]): any[];
    public getFrustumFarPoints(farPlane?: number, points?: any[]): any[];
    public getFrustumExtents(extents, farClip, nearClip?): void;
    static create(md: MathDevice): Camera;
}
interface CameraControllerTouch {
    id: number;
    originX: number;
    originY: number;
}
declare class CameraController {
    static version: number;
    public rotateSpeed: number;
    public maxSpeed: number;
    public mouseRotateFactor: number;
    public md: MathDevice;
    public camera: Camera;
    public turn: number;
    public pitch: number;
    public right: number;
    public left: number;
    public up: number;
    public down: number;
    public forward: number;
    public backward: number;
    public step: number;
    public padright: number;
    public padleft: number;
    public padforward: number;
    public padbackward: number;
    public looktouch: CameraControllerTouch;
    public movetouch: CameraControllerTouch;
    public onkeydown: InputDeviceEventListener;
    public onkeyup: (keyCode: number) => void;
    public onmouseup: (button: number, x: number, y: number) => void;
    public onmousewheel: (delta: number) => void;
    public onmousemove: (deltaX: number, deltaY: number) => void;
    public onpadmove: (lX: number, lY: number, lZ: number, rX: number, rY: number, rZ: number, dpadState: number) => void;
    public onmouselocklost: () => void;
    public ontouchstart: (touchEvent: TouchEvent) => void;
    public ontouchend: (touchEvent: TouchEvent) => void;
    public ontouchmove: (touchEvent: TouchEvent) => void;
    public attach: (id: InputDevice) => void;
    public rotate(turn, pitch): void;
    public translate(right, up, forward): void;
    public update(): void;
    static create(gd: GraphicsDevice, id: InputDevice, camera: Camera, log?: HTMLElement): CameraController;
}
interface CharacterControllerTouch {
    id: number;
    originX: number;
    originY: number;
}
declare class CharacterController {
    static version: number;
    public md: MathDevice;
    public matrix: any;
    public turn: number;
    public pitch: number;
    public right: number;
    public left: number;
    public up: number;
    public forward: number;
    public backward: number;
    public padright: number;
    public padleft: number;
    public padforward: number;
    public padbackward: number;
    public looktouch: CharacterControllerTouch;
    public movetouch: CharacterControllerTouch;
    public step: number;
    public extents: any;
    public radius: number;
    public halfHeight: number;
    public crouchHalfHeight: number;
    public rotateSpeed: number;
    public mouseRotateFactor: number;
    public collisionMargin: number;
    public maxSpeed: number;
    public speedModifier: number;
    public maxStepHeight: number;
    public maxJumpHeight: number;
    public jump: boolean;
    public jumped: boolean;
    public crouch: boolean;
    public onGround: boolean;
    public dead: boolean;
    public god: boolean;
    public walkDirection: any;
    public physicsHeightOffset: number;
    public physicsStandingHeightOffset: number;
    public physicsCrouchingHeightOffset: any;
    public deadHeightOffset: any;
    public character: PhysicsCharacter;
    public onkeydown: (keynum: number) => void;
    public onkeyup: (keynum: number) => void;
    public onmousewheel: (delta: number) => void;
    public onmousemove: (deltaX: number, deltaY: number) => void;
    public onpadmove: (lX: number, lY: number, lZ: number, rX: number, rY: number, rZ: number, dpadState: number) => void;
    public onpaddown: (buttonnum: number) => void;
    public ontouchstart: (touchEvent: TouchEvent) => void;
    public ontouchend: (touchEvent: TouchEvent) => void;
    public ontouchmove: (touchEvent: TouchEvent) => void;
    public attach: (id: InputDevice) => void;
    static create(gd: GraphicsDevice, id: InputDevice, pd: PhysicsDevice, dynamicsWorld: PhysicsWorld, matrix: any, params: any, log: HTMLElement): CharacterController;
    public rotate(turn, pitch): void;
    public setPosition(position): void;
    public setDead(dead): void;
    public updateExtents(position): void;
    public update(deltaTime): void;
}
interface IndexBufferPoolChunk {
    baseIndex: number;
    length: number;
    nextChunk: IndexBufferPoolChunk;
}
interface IndexBufferPoolBucket {
    headChunk: IndexBufferPoolChunk;
}
interface IndexBufferData {
    indexBuffer: IndexBuffer;
    bucket: IndexBufferPoolBucket[];
}
interface IndexBuffersPool {
    format: number;
    indexBufferData: IndexBufferData[];
}
declare class IndexBufferManager {
    static version: number;
    public maxIndicesPerIndexBuffer: number;
    public numBuckets: number;
    public indexBuffersPools: IndexBuffersPool[];
    public debugCreatedIndexBuffers: number;
    public graphicsDevice: GraphicsDevice;
    public dynamicIndexBuffers: boolean;
    public bucket(numIndices): number;
    public makeBuckets(): IndexBufferPoolBucket[];
    public allocate(numIndices, format): {
        indexBuffer: any;
        baseIndex: number;
        length: any;
        poolIndex: any;
    };
    public free(allocation): void;
    public destroy(): void;
    static create(graphicsDevice: GraphicsDevice, dynamicIndexBuffers?: boolean): IndexBufferManager;
}
interface SoundManagerErrorCallback {
    (msg?: string): void;
}
interface SoundManagerOnSoundLoadedFn {
    (sound: Sound): void;
}
/**
@class  Sound manager
@private

@since TurbulenzEngine 0.1.0
*/
declare class SoundManager {
    static version: number;
    public load: (path: string, uncompress?: boolean, onSoundLoaded?: SoundManagerOnSoundLoadedFn) => void;
    public map: (dst: string, src: string) => void;
    public get(path: string): Sound;
    public remove: (path: string) => void;
    public reload: (path: string) => void;
    public reloadAll: () => void;
    public getAll: () => any;
    public getNumPendingSounds: () => number;
    public isSoundLoaded: (path: string) => boolean;
    public isSoundMissing: (path: string) => boolean;
    public setPathRemapping: (prm: any, assetUrl: string) => void;
    public destroy: () => void;
    /**
    Generates beep sound data
    @return {array} returns an Array of numbers with the sample data
    */
    static beep(amplitude, frequency, wavefrequency, length): any;
    /**
    @constructs Constructs a SoundManager object.
    
    @return {SoundManager} object, null if failed
    */
    static create(sd: SoundDevice, rh: RequestHandler, ds?: Sound, errorCallback?: SoundManagerErrorCallback, log?: HTMLElement): SoundManager;
}
declare class TextureInstance {
    static version: number;
    public name: string;
    public texture: Texture;
    public reference: Reference;
    public textureChangedObserver: Observer;
    public setTexture(texture): void;
    public getTexture(): Texture;
    public subscribeTextureChanged(observerFunction): void;
    public unsubscribeTextureChanged(observerFunction): void;
    public destroy(): void;
    static create(name: string, texture: Texture): TextureInstance;
}
interface TextureManagerDelayedTexture {
    nomipmaps: boolean;
    onload: (texture: Texture) => void;
}
interface TextureManagerArchive {
    textures: {
        [path: string]: Texture;
    };
}
/**
@class  Texture manager
@private

@since TurbulenzEngine 0.1.0
*/
declare class TextureManager {
    static version: number;
    public textureInstances: {
        [idx: string]: TextureInstance;
    };
    public loadingTexture: {
        [idx: string]: boolean;
    };
    public loadedTextureObservers: {
        [idx: string]: Observer;
    };
    public delayedTextures: {
        [idx: string]: TextureManagerDelayedTexture;
    };
    public numLoadingTextures: number;
    public archivesLoaded: {
        [path: string]: TextureManagerArchive;
    };
    public loadingArchives: {
        [path: string]: TextureManagerArchive;
    };
    public loadedArchiveObservers: {
        [path: string]: Observer;
    };
    public numLoadingArchives: number;
    public internalTexture: {
        [path: string]: boolean;
    };
    public pathRemapping: {
        [path: string]: string;
    };
    public pathPrefix: string;
    public graphicsDevice: GraphicsDevice;
    public requestHandler: RequestHandler;
    public defaultTexture: Texture;
    public errorCallback: (msg?: string) => void;
    public onTextureInstanceDestroyed: (textureInstance: TextureInstance) => void;
    public prototype: any;
    /**
    Adds external texture
    
    @memberOf TextureManager.prototype
    @public
    @function
    @name add
    
    @param {string} name Name of the texture
    @param {Texture} texture Texture
    */
    public add(name, texture, internal?: boolean): void;
    /**
    Get texture created from a given file or with the given name
    
    @memberOf TextureManager.prototype
    @public
    @function
    @name get
    
    @param {string} path Path or name of the texture
    
    @return {Texture} object, returns the default texture if the texture is not yet loaded or the file didn't exist
    */
    public get(path): Texture;
    public getInstance(path): TextureInstance;
    /**
    Creates texture from an image file
    
    @memberOf TextureManager.prototype
    @public
    @function
    @name load
    
    @param {string} path Path to the image file
    @param {boolean} nomipmaps True to disable mipmaps
    @param {function()} onTextureLoaded function to call once the texture is loaded
    
    @return {Texture} object, returns the default Texture if the file at given path is not yet loaded
    */
    public load(path, nomipmaps?, onTextureLoaded?): Texture;
    /**
    Alias one texture to another name
    
    @memberOf TextureManager.prototype
    @public
    @function
    @name map
    
    @param {string} dst Name of the alias
    @param {string} src Name of the texture to be aliased
    */
    public map(dst, src): void;
    /**
    Removes a texture from the manager
    
    @memberOf TextureManager.prototype
    @public
    @function
    @name remove
    
    @param {string} path Path or name of the texture
    */
    public remove(path): void;
    /**
    Loads a textures archive
    
    @memberOf TextureManager.prototype
    @public
    @function
    @name loadArchive
    
    @param {string} path Path to the archive file
    @param {boolean} nomipmaps True to disable mipmaps
    */
    public loadArchive(path, nomipmaps, onTextureLoaded, onArchiveLoaded): void;
    /**
    Check if an archive is not pending
    
    @memberOf TextureManager.prototype
    @public
    @function
    @name isArchiveLoaded
    
    @param {string} path Path or name of the archive
    
    @return {boolean}
    */
    public isArchiveLoaded(path): boolean;
    /**
    Removes a textures archive and all the textures it references.
    
    @memberOf TextureManager.prototype
    @public
    @function
    @name removeArchive
    
    @param {string} path Path of the archive file
    */
    public removeArchive(path): void;
    /**
    Get object containing all loaded textures
    
    @memberOf TextureManager.prototype
    @public
    @function
    @name getAll
    
    @return {object}
    */
    public getAll(): {
        [path: string]: TextureInstance;
    };
    /**
    Get number of textures pending
    
    @memberOf TextureManager.prototype
    @public
    @function
    @name getNumLoadingTextures
    
    @return {number}
    */
    public getNumPendingTextures(): number;
    /**
    Check if a texture is not pending
    
    @memberOf TextureManager.prototype
    @public
    @function
    @name isTextureLoaded
    
    @param {string} path Path or name of the texture
    
    @return {boolean}
    */
    public isTextureLoaded(path): boolean;
    /**
    Check if a texture is missing
    
    @memberOf TextureManager.prototype
    @public
    @function
    @name isTextureMissing
    
    @param {string} path Path or name of the texture
    
    @return {boolean}
    */
    public isTextureMissing(path): boolean;
    /**
    Set path remapping dictionary
    
    @memberOf TextureManager.prototype
    @public
    @function
    @name setPathRemapping
    
    @param {string} prm Path remapping dictionary
    @param {string} assetUrl Asset prefix for all assets loaded
    */
    public setPathRemapping(prm, assetUrl): void;
    public addProceduralTexture(params): void;
    public destroy(): void;
    /**
    @constructs Constructs a TextureManager object.
    
    @param {GraphicsDevice} graphicsDevice Graphics device
    @param {Texture} dt Default texture
    @param {Element} log Logging element
    
    @return {TextureManager} object, null if failed
    */
    static create(graphicsDevice: GraphicsDevice, requestHandler: RequestHandler, dt: Texture, errorCallback, log?: HTMLElement): TextureManager;
}
interface VertexBuffersBucketChunk {
    length: number;
    baseIndex: number;
    nextChunk: VertexBuffersBucketChunk;
}
interface VertexBuffersBucket {
    headChunk: any;
}
interface VertexBuffersPool {
    attributesHash: string;
    vertexBufferData: {
        vertexBuffer: VertexBuffer;
        bucket: VertexBuffersBucket[];
    }[];
}
interface VertexBufferAllocation {
    vertexBuffer: VertexBuffer;
    baseIndex: number;
    length: number;
    poolIndex: number;
}
declare class VertexBufferManager {
    static version: number;
    public maxVerticesPerVertexBuffer: number;
    public numBuckets: number;
    public vertexBuffersPools: VertexBuffersPool[];
    public debugCreatedVertexBuffers: number;
    public graphicsDevice: GraphicsDevice;
    public dynamicVertexBuffers: boolean;
    public bucket(numVertices): number;
    public makeBuckets(): VertexBuffersBucket[];
    public allocate(numVertices, attributes): VertexBufferAllocation;
    public free(allocation: VertexBufferAllocation): void;
    public destroy(): void;
    static create(graphicsDevice: GraphicsDevice, dynamicVertexBuffers?: boolean): VertexBufferManager;
}
declare class ShaderManager {
    static version: number;
    public load: (path: string, callback?: (shader: Shader) => void) => Shader;
    public map: (dst: string, src: string) => void;
    public get(path: string): Shader;
    public getAll: () => {
        [path: string]: Shader;
    };
    public remove: (path: string) => void;
    public reload: (path: string, callback: (shader: Shader) => void) => void;
    public reloadAll: () => void;
    public getNumPendingShaders: () => number;
    public isShaderLoaded: (path: string) => boolean;
    public isShaderMissing: (path: string) => boolean;
    public setPathRemapping: (prm: any, assetUrl: any) => void;
    public setAutomaticParameterResize: (name: string, size: number) => void;
    public destroy: () => void;
    /**
    @constructs Constructs a ShaderManager object.
    
    @param {GraphicsDevice} gd Graphics device
    @param {RequestHandler} rh RequestHandler device
    @param {Shader} ds Default shader
    @param {Element} log Logging element
    
    @return {ShaderManager} object, null if failed
    */
    static create(gd: GraphicsDevice, rh: RequestHandler, ds?: Shader, errorCallback?: (msg: string) => void, log?: HTMLElement): ShaderManager;
}
