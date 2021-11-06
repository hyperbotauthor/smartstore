export declare class SmartStore {
  dbName: string;
  dbVersion: number;
  collName: string;
  collKey: string;
  db: any;
  constructor(propsOpt?: any);
  open(): any;
}
