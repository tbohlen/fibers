declare class Observer {
    public subscribers: {
        (): void;
    }[];
    public subscribe(subscriber): void;
    public unsubscribe(subscriber): void;
    public unsubscribeAll(): void;
    public notify(a0?, a1?, a2?, a3?, a4?, a5?, a6?, a7?, a8?, a9?, a10?, a11?): void;
    static create(): Observer;
}
interface RequestFn {
    (src: string, responseCallback, callContext: RequestHandlerCallContext): void;
}
interface RequestOwner {
    request: RequestFn;
}
interface RequestOnLoadCB {
    (asset: any, status: number, callContext: RequestHandlerCallContext): void;
}
interface RequestHandlerResponseFilter {
    (callContext: RequestHandlerCallContext, makeRequest: () => void, responseAsset: string, status: number): boolean;
}
interface RequestHandlerCallContext {
    onload: RequestOnLoadCB;
    src: string;
    requestFn?: RequestFn;
    requestOwner?: RequestOwner;
    responseFilter?: RequestHandlerResponseFilter;
}
declare class RequestHandler {
    public initialRetryTime: number;
    public notifyTime: number;
    public maxRetryTime: number;
    public notifiedConnectionLost: boolean;
    public connected: boolean;
    public reconnectedObserver: Observer;
    public reconnectTest: any;
    public connectionLostTime: number;
    public destroyed: boolean;
    public onReconnected: (reason: number, reconnectTest: any) => void;
    public onRequestTimeout: (reason: number, callContext: RequestHandlerCallContext) => void;
    public handlers: {
        eventOnload: any[];
        [index: string]: any[];
    };
    public responseFilter: (callContext: RequestHandlerCallContext, makeRequest: () => void, responseAsset: any, status: number) => void;
    public reasonConnectionLost: number;
    public reasonServiceBusy: number;
    public retryExponential(callContext, requestFn, status): void;
    public retryAfter(callContext, retryAfter, requestFn, status): void;
    public request(callContext: RequestHandlerCallContext): void;
    public addEventListener(eventType, eventListener): void;
    public removeEventListener(eventType, eventListener): void;
    public sendEventToHandlers(eventHandlers, arg0): void;
    public destroy(): void;
    static create(params: any): RequestHandler;
}
interface Utilities {
    skipAsserts: boolean;
    assert: (test: any, msg?: string) => void;
    beget: (o: any) => any;
    log: (...arguments: any[]) => void;
    nearestLowerPow2: (num: number) => number;
    nearestUpperPow2: (num: number) => number;
    ajax: (params: any) => void;
    ajaxStatusCodes: any;
}
declare var Utilities: Utilities;
declare var MathDeviceConvert: {
    v2ToArray: (v2: any) => any[];
    arrayToV2: (mathDevice: any, v2Array: any, v2Dest: any) => any;
    v3ToArray: (v3: any) => any[];
    arrayToV3: (mathDevice: any, v3Array: any, v3Dest: any) => any;
    v4ToArray: (v4: any) => any[];
    arrayToV4: (mathDevice: any, v4Array: any, v4Dest: any) => any;
    quatToArray: (quat: any) => any[];
    arrayToQuat: (mathDevice: any, quatArray: any, quatDest: any) => any;
    aabbToArray: (aabb: any) => any[];
    arrayToAABB: (mathDevice: any, aabbArray: any, aabbDest: any) => any;
    quatPosToArray: (quatPos: any) => any[];
    arrayToQuatPos: (mathDevice: any, quatPosArray: any, quatPosDest: any) => any;
    m33ToArray: (m33: any) => any[];
    arrayToM33: (mathDevice: any, m33Array: any, m33Dest: any) => any;
    m43ToArray: (m43: any) => any[];
    arrayToM43: (mathDevice: any, m43Array: any, m43Dest: any) => any;
    m34ToArray: (m34: any) => any[];
    m44ToArray: (m44: any) => any[];
    arrayToM44: (mathDevice: any, m44Array: any, m44Dest: any) => any;
};
declare class Reference {
    static version: number;
    public object: any;
    public referenceCount: number;
    public destroyedObserver: Observer;
    public add(): void;
    public remove(): void;
    public subscribeDestroyed(observerFunction): void;
    public unsubscribeDestroyed(observerFunction): void;
    static create(object): Reference;
}
declare var Profile: {
    profiles: {};
    sortMode: {
        alphabetical: number;
        duration: number;
        max: number;
        min: number;
        calls: number;
    };
    start: (name: any) => void;
    stop: (name: any) => void;
    reset: () => void;
    getReport: (sortMode: any, format: any) => string;
};
interface JSProfiling {
    createArray(rootNode: any): any[];
    sort(array: any[], propertyName: string, descending: boolean): void;
}
declare var JSProfiling: JSProfiling;
