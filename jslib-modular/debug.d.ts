interface IError {
    new(message?: string): Error;
    (message?: string): Error;
    prototype: Error;
    captureStackTrace? (a: any, b: any): any;
}
interface IErrorStackResult {
    stack: string;
}
interface TurbulenzDebug {
    reportAssert(msg: string): void;
    abort(msg: string): void;
    assert(condition: any, msg?: string): void;
    log(msg: string): void;
    evaluate(fn: () => void): void;
    isNumber(s: any): boolean;
    isMathType(v): boolean;
    isVec2(v): boolean;
    isVec3(v): boolean;
    isVec4(v): boolean;
    isAABB(v): boolean;
    isQuat(v): boolean;
    isMtx33(v): boolean;
    isMtx43(v): boolean;
    isMtx34(v): boolean;
    isMtx44(v): boolean;
    isQuatPos(v): boolean;
}
declare var debug: TurbulenzDebug;
