interface AABBTreeRayTestResult {
    hitPoint: any;
    hitNormal: any;
    factor: number;
    collisionObject?: PhysicsCollisionObject;
    body?: PhysicsRigidBody;
}
interface AABBTreeRay {
    origin: any;
    direction: any;
    maxFactor: number;
}
declare class AABBTreeNode {
    static version: number;
    public escapeNodeOffset: number;
    public externalNode: {};
    public extents: any;
    constructor(extents: any, escapeNodeOffset: number, externalNode: {});
    public isLeaf(): boolean;
    public reset(minX: number, minY: number, minZ: number, maxX: number, maxY: number, maxZ: number, escapeNodeOffset: number, externalNode?: {}): void;
    public clear(): void;
    static create(extents: any, escapeNodeOffset: number, externalNode?: {}): AABBTreeNode;
}
declare class AABBTree {
    static version: number;
    static useFloat32Array: boolean;
    static nodesPoolAllocationSize: number;
    static nodesPool: any[];
    public numNodesLeaf: number;
    public nodes: AABBTreeNode[];
    public endNode: number;
    public needsRebuild: boolean;
    public needsRebound: boolean;
    public numAdds: number;
    public numUpdates: number;
    public numExternalNodes: number;
    public startUpdate: number;
    public endUpdate: number;
    public highQuality: boolean;
    public ignoreY: boolean;
    public nodesStack: number[];
    static allocateNode(): AABBTreeNode;
    static releaseNode(node: AABBTreeNode): void;
    static recycleNodes(nodes: AABBTreeNode[], start: number): void;
    constructor(highQuality: boolean);
    public add(externalNode, extents: any): void;
    public remove(externalNode): void;
    public findParent(nodeIndex: number): AABBTreeNode;
    public update(externalNode, extents: any): void;
    public needsFinalize(): boolean;
    public finalize(): void;
    public rebound(): void;
    public rebuild(): void;
    public _sortNodes(nodes: AABBTreeNode[]): void;
    public _sortNodesNoY(nodes: AABBTreeNode[]): void;
    public _sortNodesHighQuality(nodes: AABBTreeNode[]): void;
    public _calculateSAH(buildNodes: AABBTreeNode[], startIndex: number, endIndex: number): number;
    public _nthElement(nodes: AABBTreeNode[], first: number, nth: number, last: number, getkey: (AABBTreeNode: any) => number): void;
    public _recursiveBuild(buildNodes: AABBTreeNode[], startIndex: number, endIndex: number, lastNodeIndex: number): void;
    public _replaceNode(nodes: AABBTreeNode[], nodeIndex: number, newNode: AABBTreeNode): void;
    public _predictNumNodes(startIndex: number, endIndex: number, lastNodeIndex: number): number;
    public getVisibleNodes(planes: any[], visibleNodes: {}[], startIndex?: number): number;
    public getOverlappingNodes(queryExtents: any, overlappingNodes: {}[], startIndex?: number): number;
    public getSphereOverlappingNodes(center: any, radius: number, overlappingNodes: {}[]): void;
    public getOverlappingPairs(overlappingPairs: {}[], startIndex: number): number;
    public getExtents(): any;
    public getRootNode(): AABBTreeNode;
    public getNodes(): AABBTreeNode[];
    public getEndNodeIndex(): number;
    public clear(): void;
    static rayTest(trees: AABBTree[], ray: AABBTreeRay, callback: (tree: AABBTree, externalNode: {}, ray: AABBTreeRay, distance: number, upperBound: number) => AABBTreeRayTestResult): AABBTreeRayTestResult;
    static create(highQuality?: boolean): AABBTree;
}
