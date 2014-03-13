declare class SpatialGridNode {
    static version: number;
    public extents: any;
    public cellExtents: any;
    public queryIndex: number;
    public id: number;
    public externalNode: {};
    constructor(extents: any, cellExtents: any, id: number, externalNode: {});
    public clear(): void;
    static create(extents: any, cellExtents: any, id: number, externalNode?: {}): SpatialGridNode;
}
declare class SpatialGrid {
    static version: number;
    public extents: any;
    public cellSize: number;
    public numCellsX: number;
    public numCellsZ: number;
    public cells: SpatialGridNode[][];
    public nodes: SpatialGridNode[];
    public numNodes: number;
    public queryIndex: number;
    public queryRowPlanes: any[];
    public queryCellPlanes: any[];
    public floatArrayConstructor: any;
    public intArrayConstructor: any;
    constructor(extents: any, cellSize: number);
    public add(externalNode: {}, extents: any): void;
    public update(externalNode: {}, extents: any): void;
    public remove(externalNode: {}): void;
    public _addToCells(node: SpatialGridNode, minX: number, minRow: number, maxX: number, maxRow: number): void;
    public _removeFromCells(node: SpatialGridNode, minX: number, minRow: number, maxX: number, maxRow: number): void;
    public finalize(): void;
    public getOverlappingNodes(queryExtents: any, overlappingNodes: any[], startIndex?: number): number;
    public getSphereOverlappingNodes(center: any, radius: number, overlappingNodes: any[]): void;
    public getOverlappingPairs(overlappingPairs: any[], startIndex: number): number;
    public getVisibleNodes(planes: any[], visibleNodes: any[], startIndex?: number): number;
    public getExtents(): any;
    public getCells(): SpatialGridNode[][];
    public getCellSize(): number;
    public clear(): void;
    static create(extents: any, cellSize: number): SpatialGrid;
}
