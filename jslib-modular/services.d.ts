interface BadgeManagerDataSpec {
    gameSessionId?: string;
    badge_key?: string;
    current?: number;
}
declare class BadgeManager {
    static version: number;
    public gameSession: GameSession;
    public gameSessionId: string;
    public service: ServiceRequester;
    public requestHandler: RequestHandler;
    public listUserBadges(callbackFn, errorCallbackFn): void;
    public awardUserBadge(badge_key, callbackFn, errorCallbackFn): void;
    public updateUserBadgeProgress(badge_key, current, callbackFn, errorCallbackFn): void;
    public addUserBadge(badge_key, current, callbackFn, errorCallbackFn): void;
    public listBadges(callbackFn, errorCallbackFn): void;
    public errorCallbackFn(): void;
    static create(requestHandler: RequestHandler, gameSession: GameSession): BadgeManager;
}
interface DataShareManagerCreateDataShareCB {
    (datashare: DataShare): void;
}
interface DataShareManagerErrorCB {
    (msg: string, status?: number, fn_called?: any, parameters_given?: any[]): void;
}
interface DataShareManagerFindDataSharesCB {
    user?: string;
    friendsOnly?: boolean;
    callback: (dataShares: DataShare[]) => void;
    errorCallback?: DataShareManagerErrorCB;
}
interface DataShareJoinCB {
    (success: boolean): void;
}
interface DataShareGetCBData {
    value: string;
    access: number;
}
interface DataShareGetCB {
    (data: DataShareGetCBData): void;
}
interface DataShareKeysSummary {
    key: string;
    ownedBy: string;
    access: number;
}
interface DataShareGetKeysCB {
    (keys: DataShareKeysSummary[]): void;
}
interface DataShareCompareAndSetParams {
    key: string;
    value: string;
    access?: number;
    callback?: (wasSet: boolean, reason?: string) => void;
    errorCallback?: DataShareManagerErrorCB;
}
interface DataShareCreateParams {
    id: string;
    created: number;
    owner: string;
    users: string[];
    joinable: boolean;
}
declare class DataShare {
    static version: number;
    static keyValidate: RegExp;
    static publicReadOnly: number;
    static publicReadAndWrite: number;
    static notSetReason: {
        changed: string;
        readOnly: string;
        readAndWrite: string;
    };
    public gameSession: GameSession;
    public gameSessionId: string;
    public errorCallbackFn: DataShareManagerErrorCB;
    public service: ServiceRequester;
    public requestHandler: RequestHandler;
    public id: string;
    public tokens: {
        [key: string]: string;
    };
    public created: number;
    public owner: string;
    public users: string[];
    public joinable: boolean;
    public validateKey(key: string): void;
    public getKey(params: any): string;
    public getAccess(params: any): boolean;
    public isJoined(username: string): boolean;
    public join(callbackFn?: DataShareJoinCB, errorCallbackFn?: DataShareManagerErrorCB): void;
    public setJoinable(joinable, callbackFn?: () => void, errorCallbackFn?: DataShareManagerErrorCB): void;
    public leave(callbackFn?: () => void, errorCallbackFn?: DataShareManagerErrorCB): void;
    public getKeys(callbackFn: DataShareGetKeysCB, errorCallbackFn?: DataShareManagerErrorCB): void;
    public get(key: string, callbackFn: DataShareGetCB, errorCallbackFn?: DataShareManagerErrorCB): void;
    public checkUnauthoizedError(jsonResponse: any, status: number): string;
    public set(params: DataShareCompareAndSetParams): void;
    public compareAndSet(params: DataShareCompareAndSetParams): void;
    static create(requestHandler: RequestHandler, gameSession: GameSession, params: DataShareCreateParams, errorCallbackFn?: DataShareManagerErrorCB): DataShare;
}
declare class DataShareManager {
    static version: number;
    public gameSession: GameSession;
    public gameSessionId: string;
    public errorCallbackFn: DataShareManagerErrorCB;
    public service: ServiceRequester;
    public requestHandler: RequestHandler;
    public createDataShare(callbackFn: DataShareManagerCreateDataShareCB, errorCallbackFn?: DataShareManagerErrorCB): void;
    public findDataShares(params: DataShareManagerFindDataSharesCB): void;
    static create(requestHandler: RequestHandler, gameSession: GameSession, errorCallbackFn?: DataShareManagerErrorCB): DataShareManager;
}
interface GameProfileErrorFn {
    (msg: string, status: number, fn: any, cb: any[]): void;
}
declare class GameProfileManager {
    static version: number;
    public maxValueSize: number;
    public maxGetListUsernames: number;
    public requestHandler: RequestHandler;
    public errorCallbackFn: GameProfileErrorFn;
    public gameSessionId: string;
    public service: ServiceRequester;
    public set(value, callbackFn, errorCallbackFn): boolean;
    public remove(callbackFn, errorCallbackFn): boolean;
    public get(username, callbackFn, errorCallbackFn): boolean;
    public getList(usernames, callbackFn, errorCallbackFn): boolean;
    static create(requestHandler: RequestHandler, gameSession: GameSession, errorCallbackFn?: GameProfileErrorFn): GameProfileManager;
}
interface GameSessionInfo {
    sessionData: any;
    playerSessionData: any;
}
interface GameSessionPlayerData {
    team: string;
    color: string;
    status: string;
    rank: string;
    score: string;
    sortkey: string;
}
declare class GameSession {
    static version: number;
    public post_delay: number;
    public gameSessionId: string;
    public gameSlug: string;
    public mappingTable: {
        [idx: string]: string;
    };
    public errorCallbackFn: (response: string, status?: number) => void;
    public info: GameSessionInfo;
    public templatePlayerData: GameSessionPlayerData;
    public pendingUpdate: number;
    public requestHandler: RequestHandler;
    public service: ServiceRequester;
    public status: number;
    public destroyed: boolean;
    public postData: () => void;
    public setStatus(status): void;
    public destroy(callbackFn?): void;
    /**
    * Handle player metadata
    */
    public setTeamInfo(teamList): void;
    public setPlayerInfo(playerId, data): void;
    public removePlayerInfo(playerId): void;
    public clearAllPlayerInfo(): void;
    public update(): void;
    static create(requestHandler, sessionCreatedFn, errorCallbackFn?): GameSession;
}
declare class LeaderboardManager {
    static version: number;
    public getTypes: {
        top: string;
        near: string;
        above: string;
        below: string;
    };
    public maxGetSize: number;
    public gameSession: GameSession;
    public gameSessionId: string;
    public errorCallbackFn: ServiceErrorCB;
    public service: ServiceRequester;
    public requestHandler: RequestHandler;
    public ready: boolean;
    public meta: any;
    public getOverview(spec, callbackFn, errorCallbackFn): void;
    public getAggregates(spec, callbackFn, errorCallbackFn): void;
    public getRaw(key, spec, callbackFn, errorCallbackFn): boolean;
    public get(key, spec, callbackFn, errorCallbackFn): boolean;
    public set(key, score, callbackFn, errorCallbackFn): void;
    public reset(callbackFn, errorCallbackFn): void;
    static create(requestHandler: RequestHandler, gameSession: GameSession, leaderboardMetaReceived?: (mngr: LeaderboardManager) => void, errorCallbackFn?: (errMsg: string) => void): LeaderboardManager;
}
interface LeaderboardDataSpec {
    type?: string;
    size?: number;
    friendsOnly?: boolean;
    friendsonly?: number;
    score?: number;
    time?: number;
}
interface LeaderboardResultsData {
    spec: any;
    overlap: any;
    player?: any;
    ranking?: any[];
    playerIndex?: number;
    top?: boolean;
    bottom?: boolean;
}
declare class LeaderboardResult {
    public leaderboardManager: LeaderboardManager;
    public key: string;
    public originalSpec: LeaderboardDataSpec;
    public spec: LeaderboardDataSpec;
    public results: any;
    public viewTop: number;
    public viewSize: number;
    public viewLock: boolean;
    public view: {
        player: any;
        ranking: any;
        playerIndex: number;
        top: boolean;
        bottom: boolean;
    };
    public invalidView: boolean;
    public onSlidingWindowUpdate: any;
    public version: number;
    public requestSize: number;
    public computeOverlap(): void;
    public getPageOffset(type, offsetIndex, callbackFn, errorCallbackFn): boolean;
    public viewOperationBegin(): boolean;
    public viewOperationEnd(callbackFn): void;
    public wrapViewOperationError(errorCallbackFn): (errorMsg: any, httpStatus: any, calledByFn: any, calledByParams: any) => void;
    public refresh(callbackFn, errorCallbackFn): boolean;
    public moveUp(offset, callbackFn, errorCallbackFn): boolean;
    public moveDown(offset, callbackFn, errorCallbackFn): boolean;
    public pageUp(callbackFn, errorCallbackFn): boolean;
    public pageDown(callbackFn, errorCallbackFn): boolean;
    public scrollUp(callbackFn, errorCallbackFn): boolean;
    public scrollDown(callbackFn, errorCallbackFn): boolean;
    public getView(): {
        player: any;
        ranking: any;
        playerIndex: number;
        top: boolean;
        bottom: boolean;
    };
    public getSlidingWindow();
    private parseResults(key, spec, data);
    static create(leaderboardManager: LeaderboardManager, key: string, spec: LeaderboardDataSpec, data: any): LeaderboardResult;
}
interface MappingTableErrorCB {
    (errMsg: string, status?: number): void;
}
interface MappingTableOnloadCB {
    (mappingTable: MappingTable): void;
}
interface MappingTableDataURNMapping {
    [logical: string]: string;
}
interface MappingTableDataOverride {
    urnmapping: MappingTableDataURNMapping;
    parent?: string;
}
interface MappingTableData {
    urnmapping: MappingTableDataURNMapping;
    overrides?: {
        [profile: string]: MappingTableDataOverride;
    };
    urnremapping?: MappingTableDataURNMapping;
    version?: number;
}
interface MappingTableParameters {
    mappingTableURL?: string;
    mappingTableData?: string;
    requestHandler?: RequestHandler;
    mappingTablePrefix: string;
    assetPrefix: string;
    onload: MappingTableOnloadCB;
    errorCallback?: MappingTableErrorCB;
}
declare class MappingTable {
    static version: number;
    private mappingTableURL;
    private tablePrefix;
    private assetPrefix;
    private urlMapping;
    private overrides;
    private errorCallbackFn;
    private currentProfile;
    public getURL(assetPath: string, missingCallbackFn: MappingTableErrorCB): string;
    public setMapping(mapping: MappingTableDataURNMapping): void;
    public map(logicalPath: string, physicalPath: string): void;
    public alias(alias: string, logicalPath: string): void;
    public getCurrentProfile(): string;
    public setProfile(profile: string): void;
    static create(params: MappingTableParameters): MappingTable;
}
declare class MultiPlayerSession {
    static version: number;
    public requestHandler: RequestHandler;
    public socket: WebSocket;
    public service: ServiceRequester;
    public sessionId: string;
    public playerId: string;
    public gameSessionId: string;
    public queue: any[];
    public onmessage: (senderID: string, messageType: number, messageData: string) => void;
    public onclose: () => void;
    public sendTo(destinationID, messageType, messageData?): void;
    public sendToGroup(destinationIDs, messageType, messageData): void;
    public sendToAll(messageType, messageData?): void;
    public makePublic(callbackFn): void;
    public destroy(callbackFn?): void;
    public connected(): boolean;
    private flushQueue();
    static create(sessionData, createdCB, errorCB): MultiPlayerSession;
}
declare class MultiPlayerSessionManager {
    public requestHandler: RequestHandler;
    public gameSession: GameSession;
    public sessionList: any[];
    public createSession(numSlots, sessionCreatedFn, errorCallbackFn): void;
    public getJoinRequestQueue(): {
        argsQueue: any[];
        handler: () => void;
        context: any;
        paused: boolean;
        onEvent: (handler: any, context: any) => void;
        push: (sessionId: any) => void;
        shift: () => any;
        clear: () => void;
        pause: () => void;
        resume: () => void;
    };
    public joinSession(sessionID, sessionJoinedFn, errorCallbackFn): void;
    public joinAnySession(sessionJoinedFn, failCallbackFn, errorCallbackFn): void;
    public joinOrCreateSession(numSlots, sessionJoinCreatedFn, errorCallbackFn): void;
    public getFriendsSessions(querySuccessFn, errorCallbackFn): void;
    public destroy(): void;
    public processRequest(source, request, successFn, errorFn): void;
    static create(requestHandler: RequestHandler, gameSession: GameSession): MultiPlayerSessionManager;
}
interface NotificationMessage {
    text: string;
    data: any;
}
interface NotificationError {
    error: string;
    status: number;
}
interface UserSettings {
    email_setting: number;
    site_setting: number;
}
declare class NotificationPromise {
    public __successCallback: any;
    public __errorCallback: any;
    public __id: string;
    public __error: NotificationError;
    public __nm: NotificationsManager;
    public __toCancel: boolean;
    constructor(nm: NotificationsManager);
    public success(callback: (id: string) => void): NotificationPromise;
    public error(callback: (error: NotificationError) => void): NotificationPromise;
    public cancel(): void;
    public getId(): string;
    public callSuccess(id: string): void;
    public callError(error: NotificationError): void;
}
interface sendNotificationPromiseList {
    [token: string]: NotificationPromise;
}
interface SendNotificationParameters {
    key: string;
    msg: NotificationMessage;
    recipient?: string;
    delay?: number;
    noNotification?: boolean;
}
declare class NotificationsManager {
    static version: number;
    public gameSession: GameSession;
    public service: ServiceRequester;
    public requestHandler: RequestHandler;
    public tokenFactory: SessionToken;
    public notificationPromises: sendNotificationPromiseList;
    public currentUser: string;
    public keys: string[];
    public ready: boolean;
    public userSettings: any;
    public notificationKeys: any;
    public handlers: any;
    public _validateKey(params: SendNotificationParameters): string;
    public _validateMsg(params: SendNotificationParameters): NotificationMessage;
    public sendInstantNotification(params: SendNotificationParameters): NotificationPromise;
    public sendDelayedNotification(params: SendNotificationParameters): NotificationPromise;
    public cancelNotificationByID(ident: string): void;
    public cancelNotificationsByKey(key: string): void;
    public cancelAllNotifications(): void;
    public addNotificationListener(key: string, listener): void;
    public removeNotificationListener(key: string, listener): void;
    public onNotificationReceived(data): void;
    public onNotificationSent(data): void;
    public requestUserNotificationSettings(successCallback?: (params: UserSettings) => void, errorCallback?: (error: NotificationError) => void): void;
    public requestGameNotificationKeys(successCallback?: (data: any) => void, errorCallback?: (error: NotificationError) => void): void;
    public onInit(): void;
    static create(requestHandler: RequestHandler, gameSession: GameSession, successCallbackFn?: (nm: NotificationsManager) => void, errorCallbackFn?: (error: NotificationError) => void): NotificationsManager;
}
interface OSDDocument extends Document {
    osdStartLoading();
    osdStartSaving();
    osdStopLoading();
    osdStopSaving();
}
declare class OSD {
    static version: number;
    public topLevelDocument: OSDDocument;
    public startLoading(): void;
    public startSaving(): void;
    public stopLoading(): void;
    public stopSaving(): void;
    static create(): OSD;
}
declare class SessionToken {
    static version: number;
    public randomMax: number;
    public counter: number;
    public randomGenerator: any;
    public bytes: number[];
    public next(): string;
    static create(): SessionToken;
}
interface UserItem {
    amount: number;
}
interface UserItemList {
    [itemKey: string]: UserItem;
}
interface StoreManagerErrorCB {
    (msg: string, status?: number, fn_called?: any, parameters_given?: any[]): void;
}
interface StoreManagerMetaReceivedCB {
    (storeManager: StoreManager): void;
}
interface StoreManagerUserItemsCB {
    (userItems: UserItemList): void;
}
interface StoreManagerBasketUpdatedCB {
    (): void;
}
interface UpdateBasketCallbackList {
    [token: string]: StoreManagerBasketUpdatedCB;
}
declare class StoreManager {
    static version: number;
    public gameSession: GameSession;
    public gameSessionId: string;
    public errorCallbackFn: StoreManagerErrorCB;
    public service: ServiceRequester;
    public requestHandler: RequestHandler;
    public basketUpdateRequestToken: SessionToken;
    public userItemsRequestToken: SessionToken;
    public consumeRequestToken: SessionToken;
    public ready: boolean;
    public currency: string;
    public offerings: StoreOfferingList;
    public resources: StoreResourceList;
    public basket: {
        items: BasketItemList;
    };
    public userItems: UserItemList;
    public updateBasketCallbacks: UpdateBasketCallbackList;
    public onBasketUpdate: (basket: CalculatedBasket) => void;
    public onSitePurchaseConfirmed: () => void;
    public onSitePurchaseRejected: () => void;
    public requestUserItems(callbackFn: StoreManagerUserItemsCB, errorCallbackFn?: StoreManagerErrorCB): void;
    public getUserItems(): UserItemList;
    public getItemsSortedDict(items: StoreItemList): StoreItemList;
    public getOfferings(): StoreOfferingList;
    public getResources(): StoreResourceList;
    public getItems(): any;
    public updateBasket(callback: StoreManagerBasketUpdatedCB): void;
    public addToBasket(key: string, amount: number): boolean;
    public removeFromBasket(key: string, amount: number): boolean;
    public emptyBasket(): void;
    public isBasketEmpty(): boolean;
    public showConfirmPurchase(): boolean;
    public consume(key, consumeAmount, callbackFn, errorCallbackFn): void;
    static create(requestHandler: RequestHandler, gameSession: GameSession, storeMetaReceived?: StoreManagerMetaReceivedCB, errorCallbackFn?: StoreManagerErrorCB): StoreManager;
}
declare class TurbulenzBridge {
    private static _bridge;
    /**
    * Try to find an 'EventEmitter' object on the page and cache it.
    */
    static _initInstance(): void;
    static isInitialised(): boolean;
    static emit(serviceName: string, request?: string, arg?: any): void;
    static on(serviceName: string, cb: (data: string) => void): void;
    static addListener(): void;
    static setListener(eventName: string, listener: (params: string) => void): void;
    /**
    * Message that passes game configuration information from the hosting site
    */
    static setOnReceiveConfig(callback): void;
    static triggerRequestConfig(): void;
    /**
    * Methods to signal the beginning and end of load/save processes.
    * This will display hints to the player and helps the page
    * to prioritize resources.
    */
    static startLoading(): void;
    static startSaving(): void;
    static stopLoading(): void;
    static stopSaving(): void;
    /**
    * These methods tell the gamesite the gameSession so it can
    * emit a heartbeat for the message server to detect.
    * gameSessionId - A string for identifying the current game session
    */
    static createdGameSession(gameSessionId): void;
    static destroyedGameSession(gameSessionId): void;
    static setGameSessionStatus(gameSessionId, status): void;
    static setGameSessionInfo(info): void;
    /**
    * Update a userbadge. Used by the BadgeManager
    */
    static updateUserBadge(badge): void;
    /**
    * Update a leaderboard. Used by the LeaderboardManager
    */
    static updateLeaderBoard(scoreData): void;
    /**
    * Handle multiplayer join events
    */
    static setOnMultiplayerSessionToJoin(callback): void;
    static triggerJoinedMultiplayerSession(session): void;
    static triggerLeaveMultiplayerSession(sessionId): void;
    static triggerMultiplayerSessionMakePublic(sessionId): void;
    /**
    * Handle store basket events
    */
    static setOnBasketUpdate(callback): void;
    static triggerBasketUpdate(basket?): void;
    static triggerUserStoreUpdate(items): void;
    static setOnPurchaseConfirmed(callback): void;
    static setOnPurchaseRejected(callback): void;
    static triggerShowConfirmPurchase(): void;
    static triggerFetchStoreMeta(): void;
    static setOnStoreMeta(callback): void;
    /**
    * Handle in-game notification events
    */
    static triggerSendInstantNotification(notification): void;
    static triggerSendDelayedNotification(notification): void;
    static setOnNotificationSent(callback): void;
    static triggerCancelNotificationByID(params): void;
    static triggerCancelNotificationsByKey(params): void;
    static triggerCancelAllNotifications(params): void;
    static triggerInitNotificationManager(params): void;
    static setOnReceiveNotification(callback): void;
    /**
    * Methods to signal changes of the viewport's aspect ratio to the page.
    */
    static changeAspectRatio(ratio): void;
    /**
    * Methods to set callbacks to react to events happening on the page.
    */
    static setOnViewportHide(callback): void;
    static setOnViewportShow(callback): void;
    static setOnFullscreenOn(callback): void;
    static setOnFullscreenOff(callback): void;
    static setOnMenuStateChange(callback): void;
    static setOnUserStateChange(callback): void;
    /**
    * Methods to send trigger event-emission on the page. These
    * prompt the page to trigger the aforementioned corresponding
    * onXXXX methods.
    */
    static triggerOnFullscreen(): void;
    static triggerOnViewportVisibility(): void;
    static triggerOnMenuStateChange(): void;
    static triggerOnUserStateChange(): void;
    /**
    * Methods to send requests for information to the page. These
    * methods can be used to send state-queries. They take a callback
    * function and prompt the page to call it.
    */
    /**
    * callback - a function that takes a single boolean value that
    * will be set to 'true' if the viewport is in fullscreen.
    */
    static queryFullscreen(callback): void;
    /**
    * callback - a function that takes a single boolean value that
    * will be set to 'true' if the viewport is visible.
    */
    static queryViewportVisibility(callback): void;
    /**
    * callback - a function that takes an object-representation of
    * the current menu-state.
    */
    static queryMenuState(callback): void;
    /**
    * callback - a function that takes an object-representation of
    * the current state of the user's settings.
    */
    static queryUserState(callback): void;
}
interface UserProfile {
    username: string;
    displayname: string;
    language: string;
    country: string;
    age: number;
    anonymous: boolean;
    guest: boolean;
}
interface UserProfileReceivedCB {
    (userProfile: UserProfile): void;
}
interface UserUpgradeCB {
    (): void;
}
declare class CustomMetricEvent {
    public key: string;
    public value: any;
    public timeOffset: number;
    static create(): CustomMetricEvent;
}
declare class CustomMetricEventBatch {
    public events: CustomMetricEvent[];
    public push(key: string, value: any): void;
    public length(): number;
    public clear(): void;
    static create(): CustomMetricEventBatch;
}
interface ServiceResponse {
    ok: boolean;
    msg: string;
    data: any;
}
interface ServiceRequestParams {
    url: string;
    method: string;
    data?: any;
    callback: (response: ServiceResponse, status: number) => void;
    requestHandler: RequestHandler;
    neverDiscard?: boolean;
}
interface ServiceErrorCB {
    (errorMsg: string, httpStatus?: number): void;
}
declare class ServiceRequester {
    public running: boolean;
    public discardRequests: boolean;
    public serviceStatusObserver: Observer;
    public serviceName: string;
    public onServiceUnavailable: (service: ServiceRequester, callCtx?: any) => void;
    public onServiceAvailable: (service: ServiceRequester, callCtx?: any) => void;
    public request(params): boolean;
    static create(serviceName: string, params?): ServiceRequester;
}
declare class TurbulenzServices {
    static multiplayerJoinRequestQueue: {
        argsQueue: any[];
        handler: () => void;
        context: any;
        paused: boolean;
        onEvent: (handler: any, context: any) => void;
        push: (sessionId: any) => void;
        shift: () => any;
        clear: () => void;
        pause: () => void;
        resume: () => void;
    };
    static bridgeServices: boolean;
    static mode: string;
    static available(): boolean;
    static responseHandlers: any[];
    static responseIndex: number;
    static addBridgeEvents(): void;
    static callOnBridge(event, data, callback): void;
    static addSignature(data, url);
    static routeResponse(jsondata): void;
    static defaultErrorCallback: ServiceErrorCB;
    static onServiceUnavailable(serviceName: string, callContext?): void;
    static onServiceAvailable(serviceName: string, callContext?): void;
    static createGameSession(requestHandler, sessionCreatedFn, errorCallbackFn?): GameSession;
    static createMappingTable(requestHandler, gameSession, tableReceivedFn, defaultMappingSettings?, errorCallbackFn?): MappingTable;
    static createLeaderboardManager(requestHandler, gameSession, leaderboardMetaReceived?, errorCallbackFn?): LeaderboardManager;
    static createBadgeManager(requestHandler, gameSession): BadgeManager;
    static createStoreManager(requestHandler, gameSession, storeMetaReceived?, errorCallbackFn?): StoreManager;
    static createNotificationsManager(requestHandler, gameSession, successCallbackFn, errorCallbackFn): NotificationsManager;
    static createMultiplayerSessionManager(requestHandler, gameSession): MultiPlayerSessionManager;
    static createUserProfile(requestHandler: RequestHandler, profileReceivedFn?: UserProfileReceivedCB, errorCallbackFn?): UserProfile;
    static upgradeAnonymousUser(upgradeCB: UserUpgradeCB): void;
    static sendCustomMetricEvent(eventKey: string, eventValue: any, requestHandler: RequestHandler, gameSession: GameSession, errorCallbackFn?): void;
    static sendCustomMetricEventBatch(eventBatch: CustomMetricEventBatch, requestHandler: RequestHandler, gameSession: GameSession, errorCallbackFn?): void;
    static services: {};
    static waitingServices: {};
    static pollingServiceStatus: boolean;
    static defaultPollInterval: number;
    static getService(serviceName): ServiceRequester;
    static serviceUnavailable(service, callContext): void;
}
interface UserDataManagerDataSpec {
    gameSessionId: string;
    value?: any;
    key?: string;
}
interface UserDataErrorFn {
    (msg: string, status?: number, fn?: any, cb?: any[]): void;
}
declare class UserDataManager {
    static version: number;
    public keyValidate: RegExp;
    public requestHandler: RequestHandler;
    public errorCallbackFn: UserDataErrorFn;
    public gameSessionId: string;
    public service: ServiceRequester;
    public validateKey(key): boolean;
    public getKeys(callbackFn, errorCallbackFn): void;
    public exists(key, callbackFn, errorCallbackFn): void;
    public get(key, callbackFn, errorCallbackFn): void;
    public set(key, value, callbackFn, errorCallbackFn): void;
    public remove(key, callbackFn, errorCallbackFn?): void;
    public removeAll(callbackFn, errorCallbackFn): void;
    static create(requestHandler: RequestHandler, gameSession: GameSession, errorCallbackFn: UserDataErrorFn): UserDataManager;
}
