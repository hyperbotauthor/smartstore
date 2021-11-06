export declare class IndexedDb {
    dbName: string;
    dbVersion: number;
    collName: string;
    collKey: string;
    db: any;
    constructor(propsOpt?: any);
    setItem(key: string, value: any): any;
    removeItem(key: string): any;
    getItem(key: string, def: any): any;
    open(): any;
}
export declare class MongoDb {
    setItem(key: string, value: any): Promise<any>;
    getItem(key: string, def: any): Promise<any>;
    bulkWrite(cache: any): Promise<any>;
}
export declare class SmartStore {
    cache: any;
    writeCache: any;
    idb: IndexedDb;
    mdb: MongoDb;
    debounceWrite: any;
    constructor();
    open(): Promise<any>;
    flush(): Promise<void>;
    setItem(key: string, value: any): void;
    getItemRemote(key: string, def: any): Promise<any>;
    getItemLocal(key: string, def: any): Promise<any>;
    getItem(key: string, def: any): Promise<any>;
}
export declare function test(): Promise<void>;
export declare function mongotest(): Promise<void>;
export declare function bulkwritetest(): Promise<void>;
export declare function pause(ms: number): Promise<any>;
export declare function smartstoreflushtest(): Promise<void>;
export declare function smartstoretest(): Promise<void>;
export declare function alltests(): Promise<void>;
