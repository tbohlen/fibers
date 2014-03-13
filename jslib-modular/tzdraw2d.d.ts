declare class Draw2DGroup {
    public indices: number[];
    public textures: Texture[];
    public numSets: number;
    public vertexBufferData: any;
    public numVertices: number;
    static create(): Draw2DGroup;
}
interface Draw2DSpriteParams {
    x?: number;
    y?: number;
    width?: number;
    height?: number;
    texture?: Texture;
    color?: any;
    rotation?: number;
    textureRectangle?: any;
    scale?: number;
    shear?: number;
    origin?: any;
}
declare class Draw2DSprite {
    static version: number;
    public x: number;
    public y: number;
    public rotation: number;
    private data;
    private _texture;
    public getTextureRectangle(dst);
    public setTextureRectangle(uvRect): void;
    public getColor(dst);
    public setColor(color): void;
    public getTexture(): Texture;
    public setTexture(texture): void;
    public getWidth(): number;
    public setWidth(width): void;
    public getHeight(): number;
    public setHeight(height): void;
    public getScale(dst);
    public setScale(scale): void;
    public getShear(dst);
    public setShear(shear): void;
    public getOrigin(dst);
    public setOrigin(origin): void;
    private _invalidate();
    private _update(angleScaleFactor);
    static create(params: Draw2DSpriteParams): Draw2DSprite;
}
declare var Draw2DSpriteData: {
    setFromRotatedRectangle: (sprite: any, texture: any, rect: any, uvrect: any, color: any, rotation: any, origin: any) => void;
    create: () => any;
};
interface Draw2DRenderTargetParams {
    name?: string;
    backBuffer?: boolean;
    width?: number;
    height?: number;
}
interface Draw2DRenderTarget {
    managed: boolean;
    renderTarget: RenderTarget;
    texture: Texture;
    backBuffer: boolean;
    actualWidth: number;
    actualHeight: number;
}
interface Draw2DParameters {
    graphicsDevice: GraphicsDevice;
    blendModes?: {
        [name: string]: Technique;
    };
    initialGpuMemory?: number;
    maxGpuMemory?: number;
}
declare class Draw2D {
    static version: number;
    public forceUpdate: boolean;
    public clearBackBuffer: boolean;
    public graphicsDevice: GraphicsDevice;
    public width: number;
    public height: number;
    public scissorX: number;
    public scissorY: number;
    public scissorWidth: number;
    public scissorHeight: number;
    public clipOffsetX: number;
    public clipOffsetY: number;
    public clipScaleX: number;
    public clipScaleY: number;
    public viewScaleX: number;
    public viewScaleY: number;
    public viewportRectangle: number[];
    public spriteAngleFactor: number;
    public state: number;
    public sortMode: string;
    public scaleMode: string;
    public blendMode: string;
    public sortModeStack: string[];
    public blendModeStack: string[];
    public drawGroups: Draw2DGroup[];
    public numGroups: number;
    public texLists: {
        [name: string]: Draw2DGroup;
    };
    public texGroup: Draw2DGroup;
    public drawSprite: any;
    public defaultTexture: Texture;
    public draw: (params: any) => void;
    public drawRaw: (texture: Texture, multiSprite: number[], count?: number, offset?: number) => void;
    public renderTargetStructs: Draw2DRenderTarget[];
    public renderTargetCount: number;
    public renderTargetIndex: number;
    public renderTargetTextureParameters: TextureParameters;
    public currentRenderTarget: Draw2DRenderTarget;
    public currentTextureGroup: Draw2DGroup;
    public techniqueParameters: TechniqueParameters;
    public vertexBufferParameters: VertexBufferParameters;
    public vertexBuffer: VertexBuffer;
    public indexBufferParameters: IndexBufferParameters;
    public indexBuffer: IndexBuffer;
    public semantics: Semantics;
    public renderTargetParams: RenderTargetParameters;
    public blendModeTechniques: {
        additive: Technique;
        alpha: Technique;
        opaque: Technique;
    };
    public copyTechnique: Technique;
    public copyTechniqueParameters: TechniqueParameters;
    public copyVertexBufferParams: VertexBufferParameters;
    public copyVertexBuffer: VertexBuffer;
    public quadSemantics: Semantics;
    public quadPrimitive: number;
    public vertexBufferData: any;
    public performanceData: {
        gpuMemoryUsage: number;
        minBatchSize: number;
        maxBatchSize: number;
        avgBatchSize: number;
        batchCount: number;
        dataTransfers: number;
    };
    public maxGpuMemory: number;
    public maxVertices: number;
    public cpuStride: number;
    public gpuStride: number;
    static floatArray: any;
    static uint16Array: any;
    static defaultClearColor: any;
    public defaultClearColor: any;
    public sort: {
        deferred: string;
        immediate: string;
        texture: string;
    };
    public scale: {
        scale: string;
        none: string;
    };
    public blend: {
        additive: string;
        alpha: string;
        opaque: string;
    };
    public drawStates: {
        uninit: number;
        ready: number;
        draw: number;
    };
    public clear(clearColor?): boolean;
    public clearBatch(): void;
    public bufferSprite(buffer, sprite, index): void;
    public update(): void;
    public getViewport(dst);
    public getScreenSpaceViewport(dst?: any): any;
    public viewportMap(screenX, screenY, dst?): any;
    public viewportUnmap(x, y, dst?): any;
    public viewportClamp(point);
    public configure(params): boolean;
    public destroy(): void;
    public begin(blendMode?, sortMode?): boolean;
    private _bufferSprite(group, sprite);
    private bufferMultiSprite(group, buffer, count?, offset?);
    public indexData(count);
    public uploadBuffer(group, count, offset): void;
    public drawRawImmediate(texture: Texture, multiSprite, count?: number, offset?: number): void;
    public drawSpriteImmediate(sprite): void;
    public drawImmediate(params): void;
    public drawRawDeferred(texture, multiSprite, count?, offset?): void;
    public drawSpriteDeferred(sprite): void;
    public drawDeferred(params): void;
    public drawRawTextured(texture, multiSprite, count?, offset?): void;
    public drawSpriteTextured(sprite): void;
    public drawTextured(params): void;
    public prepareSortMode(sortMode): void;
    public end(): boolean;
    public dispatch(): boolean;
    public bufferSizeAlgorithm(target, stride): number;
    public updateRenderTargetVbo(viewX, viewY, viewWidth, viewHeight): void;
    static makePow2(dim): number;
    public createRenderTarget(params: Draw2DRenderTargetParams): number;
    public validateTarget(target, viewWidth, viewHeight): void;
    public setBackBuffer(): boolean;
    public getRenderTargetTexture(renderTargetIndex): Texture;
    public getRenderTarget(renderTargetIndex): RenderTarget;
    public setRenderTarget(renderTargetIndex): boolean;
    public copyRenderTarget(renderTargetIndex): boolean;
    public resetPerformanceData(): void;
    static create(params: Draw2DParameters): Draw2D;
}
