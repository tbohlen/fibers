interface SVGNode {
    addChild: (child: SVGNode) => void;
    removeChild: (child: SVGNode) => void;
    getNumChildren: () => number;
    getChild: (i: number) => SVGNode;
    setFillStyle: (style: any) => void;
    getFillStyle: () => any;
    setStrokeStyle: (style: any) => void;
    getStrokeStyle: () => any;
    setLineWidth: (lineWidth: number) => void;
    getLineWidth: () => number;
    translate: (x: number, y: number) => void;
    scale: (x: number, y: number) => void;
    rotate: (angle: number, x: number, y: number) => void;
    transform: (a: number, b: number, c: number, d: number, e: number, f: number) => void;
    removeTransforms: () => void;
    draw: (ctx: CanvasContext) => void;
}
declare class SVGNodeTransform {
    static Translate: number;
    static Rotate: number;
    static Scale: number;
    static Matrix: number;
}
declare class SVGBaseNode implements SVGNode {
    public draw: (ctx: CanvasContext) => void;
    public _children: SVGNode[];
    public _fill: any;
    public _stroke: any;
    public _lineWidth: number;
    public _transforms: any[];
    constructor();
    public addChild(child: SVGNode): void;
    public removeChild(child: SVGNode): void;
    public getNumChildren(): number;
    public getChild(i: number): SVGNode;
    public setFillStyle(style: any): void;
    public getFillStyle(): any;
    public setStrokeStyle(style: any): void;
    public getStrokeStyle(): any;
    public setLineWidth(lineWidth: number): void;
    public getLineWidth(): number;
    public translate(x: number, y: number): void;
    public scale(x: number, y: number): void;
    public rotate(angle: number, x: number, y: number): void;
    public transform(a: number, b: number, c: number, d: number, e: number, f: number): void;
    public _addTransform(type: number, values: number[]): void;
    public _combineTransforms(): void;
    public removeTransforms(): void;
    private _checkState();
    public _setState(ctx: CanvasContext): void;
    public _drawState(ctx: CanvasContext): void;
    public _drawStateChildren(ctx: CanvasContext): void;
    public _drawChildren(ctx: CanvasContext): void;
    public _drawShape(ctx: CanvasContext): void;
}
declare class SVGEmptyNode extends SVGBaseNode {
    public _drawState(ctx: CanvasContext): void;
    public _drawStateChildren(ctx: CanvasContext): void;
    public _drawChildren(ctx: CanvasContext): void;
}
declare class SVGPathNode extends SVGBaseNode {
    public compiledPath: number[];
    constructor(path: string);
    public _drawShape(ctx: CanvasContext): void;
}
declare class SVGPolygonNode extends SVGBaseNode {
    public points: any[];
    constructor(points: any[]);
    public _drawShape(ctx: CanvasContext): void;
}
declare class SVGPolylineNode extends SVGBaseNode {
    public points: any[];
    constructor(points: any[]);
    public _drawShape(ctx: CanvasContext): void;
}
declare class SVGRectNode extends SVGBaseNode {
    public x: number;
    public y: number;
    public width: number;
    public height: number;
    constructor(x: number, y: number, w: number, h: number);
    public _drawShape(ctx: CanvasContext): void;
}
declare class SVGCircleNode extends SVGBaseNode {
    public x: number;
    public y: number;
    public radius: number;
    constructor(x: number, y: number, r: number);
    public _drawShape(ctx: CanvasContext): void;
}
declare class SVGEllipseNode extends SVGBaseNode {
    public x: number;
    public y: number;
    public radiusX: number;
    public radiusY: number;
    constructor(x: number, y: number, rx: number, ry: number);
    public _drawShape(ctx: CanvasContext): void;
}
declare class SVGLineNode extends SVGBaseNode {
    public x1: number;
    public y1: number;
    public x2: number;
    public y2: number;
    constructor(x1: number, y1: number, x2: number, y2: number);
    public _drawShape(ctx: CanvasContext): void;
}
declare class SVGTextNode extends SVGBaseNode {
    public font: string;
    public text: string;
    public x: number;
    public y: number;
    constructor(font: string, text: string, x: number, y: number);
    public _drawShape(ctx: CanvasContext): void;
}
