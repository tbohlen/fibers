declare class DrawPrimitives {
    static version: number;
    private shaderName;
    private techniqueName;
    private isTechnique2D;
    private isTextured;
    private device;
    private technique;
    private techniqueParameters;
    private rectPositionsParameters;
    private rectSemanticsParameters;
    private rectNumVertices;
    private rectPrimitive;
    private rectPositions;
    private rectSemantics;
    private rectTexPositionsParameters;
    private rectTexSemanticsParameters;
    private rectTexNumVertices;
    private rectTexPrimitive;
    private rectTexPositions;
    private rectTexSemantics;
    private boxPositionsParameters;
    private boxSemanticsParameters;
    private boxNumVertices;
    private boxPrimitive;
    private boxPositions;
    private boxSemantics;
    public initalize(gd, shaderPath): void;
    public setTechnique(technique, isTechnique2D): void;
    public updateParameters(params): void;
    public update2DTex(posa, posb): void;
    public update2D(posa, posb): void;
    public update(posa, posb): void;
    public dispatch(camera): void;
    static create(gd, shaderPath, shaderName, techniqueName): DrawPrimitives;
}
declare var DebuggingTools: {
    dataBreakpoints: any[];
    log: (a0?: string, a1?: string, a2?: string, a3?: string, a4?: string, a5?: string) => void;
    dataBreakpoint: (object: any, propertyName: any, breakOnRead: any, breakOnWrite: any) => void;
    clearDataBreakpoint: (object: any, propertyName: any) => boolean;
};
declare class NetworkLatencyBehaviour {
    public latency: number;
    public delayPeriod: number;
    public delayDuration: number;
    public startDelayTime: number;
    public endDelayTime: number;
    public nextMessageDelay(): number;
    public scheduleNextDelay(baseTime): void;
    static create(config): NetworkLatencyBehaviour;
}
declare class NetworkLatencySimulator {
    public queueMap: {
        send: any[];
        receive: any[];
    };
    public behaviour: NetworkLatencyBehaviour;
    public queueMessage(messageFunction, queueName): void;
    public processMessage(queue): void;
    public flushQueues(): void;
    public addMultiplayerSession(multiplayerSession): void;
    static create(behaviour): NetworkLatencySimulator;
}
interface SceneMetrics {
    numNodes: number;
    numRenderables: number;
    numLights: number;
    numVertices: number;
    numPrimitives: number;
}
interface SceneVisibilityMetrics {
    numPortals: number;
    numPortalsPlanes: number;
    numLights: number;
    numRenderables: number;
    numShadowMaps: number;
    numOccluders: number;
}
declare var dumpIndexBuffer: (indexbuffer: any, log: any) => void;
declare var dumpShader: (shader: any, log: any) => void;
declare var dumpTexture: (texture: any, log: any) => void;
declare var dumpVertexBuffer: (vertexbuffer: any, log: any) => void;
