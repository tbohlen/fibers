interface FontDimensions {
    width: number;
    height: number;
    numGlyphs: number;
    linesWidth: number[];
    glyphCounts: {
        length: number;
        [pageIdx: number]: number;
    };
}
interface FontGlyph {
    width: number;
    height: number;
    awidth: number;
    xoffset: number;
    yoffset: number;
    left: number;
    top: number;
    right: number;
    bottom: number;
    page: number;
}
interface FontKerning {
    [charcode: number]: number;
}
interface FontKerningMap {
    [charcode: number]: FontKerning;
}
interface FontDrawParameters {
    rect: any;
    scale: number;
    alignment: any;
    spacing?: number;
    lineSpacing?: number;
    dimensions?: FontDimensions;
}
interface FontDrawPageContext {
    vertices: Float32Array;
    vertexIndex: number;
}
interface FontDrawContext {
    pageContexts: FontDrawPageContext[];
}
/**
@class  Font
@private

@since TurbulenzEngine 0.1.0
*/
declare class Font {
    static version: number;
    public bold: boolean;
    public italic: boolean;
    public pageWidth: number;
    public pageHeight: number;
    public baseline: any;
    public glyphs: FontGlyph[];
    public numGlyphs: number;
    public minGlyphIndex: number;
    public unknownGlyphIndex: number;
    public lineHeight: number;
    public pages: string[];
    public kernings: FontKerningMap;
    public textures: Texture[];
    public gd: GraphicsDevice;
    public fm: FontManager;
    constructor(gd: GraphicsDevice, fontManager: FontManager);
    public calculateTextDimensions(text: string, scale: number, spacing: number, lineSpacing?: number, dimensions?: FontDimensions): FontDimensions;
    public generatePageTextVertices(text: string, params: FontDrawParameters, pageIdx: number, drawCtx?: FontDrawPageContext): FontDrawPageContext;
    public drawTextRect(text: string, params: FontDrawParameters): void;
    public drawTextVertices(pageCtx: FontDrawPageContext, pageIdx: number, reuseVertices?): void;
    private createIndexBuffer(maxGlyphs);
    private createVertexBuffer(maxGlyphs);
}
/**
@class  Font manager
@private

@since TurbulenzEngine 0.1.0
*/
declare class FontManager {
    static version: number;
    public fonts: {
        [name: string]: Font;
    };
    public load: (path: string, onFontLoaded?: (font: any) => void) => Font;
    public map: (dst: string, src: string) => void;
    public remove: (path: string) => void;
    public get(path: string): Font;
    public getAll: () => {
        [name: string]: Font;
    };
    public getNumPendingFonts: () => number;
    public isFontLoaded: (path: string) => boolean;
    public isFontMissing: (path: string) => boolean;
    public setPathRemapping: (prm: any, assetUrl: string) => void;
    public calculateTextDimensions: (path: string, text: string, scale: number, spacing: number) => FontDimensions;
    public reuseVertices: (vertices: any) => void;
    public destroy: () => void;
    public primitive: number;
    public primitiveTristrip: number;
    public semantics: Semantics;
    public techniqueParameters: TechniqueParameters;
    public sharedIndexBuffer: IndexBuffer;
    public sharedVertexBuffer: VertexBuffer;
    public reusableArrays: {
        [idx: number]: Float32Array;
    };
    public scratchPageContext: FontDrawPageContext;
    public float32ArrayConstructor: new(i: number) => Float32Array;
    constructor(gd: GraphicsDevice);
    /**
    @constructs Constructs a FontManager object.
    
    @param {GraphicsDevice} gd Graphics device
    @param {RequestHandler} rh RequestHandler object
    
    @return {FontManager} object, null if failed
    */
    static create(gd: GraphicsDevice, rh: RequestHandler, df?: Font, errorCallback?: (msg: string) => void, log?: HTMLElement): FontManager;
}
