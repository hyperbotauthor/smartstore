import _ from "lodash";

export class IndexedDb {
  dbName: string;
  dbVersion: number;
  collName: string;
  collKey: string;
  db: any;

  constructor(propsOpt?: any) {
    const props = propsOpt || {};
    this.dbName = props.dbName || "indexeddb";
    this.dbVersion = props.dbVersion || 1;
    this.collName = props.collName || "localstorage";
    this.collKey = props.collKey || "key";
    this.db = undefined;
  }

  setItem(key: string, value: any): any {
    return new Promise((resolve: any, reject: any) => {
      if (this.db === undefined) {
        console.error(`error setting ${key} no db`);
        reject();
        return;
      }

      const coll: any = this.db
        .transaction([this.collName], "readwrite")
        .objectStore(this.collName);
      const obj: any = {};
      obj[this.collKey] = key;
      obj.value = value;
      const requestUpdate = coll.put(obj);

      requestUpdate.onsuccess = function (event: any) {
        resolve();
      };

      requestUpdate.onerror = function (event: any) {
        console.error(`error failed to set item ${key}`, event);
        reject();
      };
    });
  }

  removeItem(key: string): any {
    return new Promise((resolve: any, reject: any) => {
      if (this.db === undefined) {
        console.error(`error removing ${key} no db`);
        reject();
        return;
      }

      const coll: any = this.db
        .transaction([this.collName], "readwrite")
        .objectStore(this.collName);
      const requestDelete = coll.delete(key);

      requestDelete.onsuccess = function (event: any) {
        resolve();
      };

      requestDelete.onerror = function (event: any) {
        console.error(`error failed to remove item ${key}`, event);
        reject();
      };
    });
  }

  getItem(key: string, def: any): any {
    return new Promise((resolve: any, reject: any) => {
      if (this.db === undefined) {
        console.error(`error getting ${key} no db`);
        //reject();
        resolve(def);
        return;
      }

      const transaction = this.db.transaction([this.collName]);
      const coll = transaction.objectStore(this.collName);
      const requestGet = coll.get(key);

      requestGet.onsuccess = function (event: any) {
        const result = requestGet.result;
        //console.info("idb get result for", key, result, event);
        if (result === undefined) {
          resolve(def);
          return;
        }
        resolve(result.value);
      };

      requestGet.onerror = function (event: any) {
        console.error(`error failed to get item ${key}`, event);
        //reject();
        resolve(def);
      };
    });
  }

  open(): any {
    return new Promise((resolve: any, reject: any) => {
      console.info(`opening <${this.dbName}:${this.dbVersion}>`);

      let req = window.indexedDB.open(this.dbName, this.dbVersion);

      req.onerror = (event: any) => {
        console.error(
          `error: could not open <${this.dbName}:${this.dbVersion}>`,
          event
        );

        reject();
      };

      req.onsuccess = (event: any) => {
        console.info(`opened <${this.dbName}:${this.dbVersion}> ok`);

        this.db = event.target.result;

        resolve();
      };

      req.onupgradeneeded = (event: any) => {
        console.info(`upgrading <${this.dbName}:${this.dbVersion}>`);

        this.db = event.target.result;

        try {
          this.db.createObjectStore(this.collName, { keyPath: this.collKey });

          console.info(
            `created collection {${this.collName}} key path [${this.collKey}] ok`
          );
        } catch (err) {
          console.error(
            `error failed to create collection {${this.collName}} key path [${this.collKey}]`,
            err
          );
        }
      };
    });
  }
}

export class MongoDb {
  async setItem(key: string, value: any): Promise<any> {
    let resp: any = undefined;

    try {
      resp = await fetch("/.netlify/functions/netlifyindex", {
        method: "POST",
        body: JSON.stringify({
          LICHESS_TOKEN: localStorage.getItem("LICHESS_TOKEN"),
          ACTION: "set",
          DOCUMENT_ID: key,
          DOCUMENT: JSON.stringify(value),
        }),
      });
    } catch (err) {
      console.error("error setting mongodb item", key, err);
      //return Promise.reject();
      return Promise.resolve(undefined);
    }

    const status = resp.status;

    if (status !== 200) {
      console.error("error setting mongodb item", key, "status", status);
      //return Promise.reject();
      return Promise.resolve(undefined);
    }

    let json: any = undefined;

    try {
      json = await resp.json();
    } catch (err) {
      console.error("parsing mongodb setitem response json failed", err);
      //return Promise.reject();
      return Promise.resolve(undefined);
    }

    return Promise.resolve(json);
  }

  async getItem(key: string, def: any): Promise<any> {
    let resp: any = undefined;

    try {
      resp = await fetch("/.netlify/functions/netlifyindex", {
        method: "POST",
        body: JSON.stringify({
          LICHESS_TOKEN: localStorage.getItem("LICHESS_TOKEN"),
          ACTION: "get",
          DOCUMENT_ID: key,
        }),
      });
    } catch (err) {
      console.error("get item from mongodb failed", key, err);
      //return Promise.reject()
      return Promise.resolve(def);
    }

    const status = resp.status;

    if (status !== 200) {
      console.error("get item from mongodb failed", key, "status", status);
      //return Promise.reject()
      return Promise.resolve(def);
    }

    let json: any = undefined;

    try {
      json = await resp.json();
    } catch (err) {
      console.error("parsing mongodb getitem response json failed", err);
      //return Promise.reject();
      return Promise.resolve(def);
    }

    if (json === null || json === undefined) {
      return Promise.resolve(def);
    }

    if (typeof json.content === "undefined") {
      return Promise.resolve(def);
    }

    return Promise.resolve(JSON.parse(json.content));
  }

  async bulkWrite(cache: any): Promise<any> {
    const bulk = Object.entries(cache).map((entry) => ({
      updateOne: {
        filter: {
          _id: entry[0],
        },
        update: {
          $set: {
            content: JSON.stringify(entry[1]),
          },
        },
        upsert: true,
      },
    }));

    console.log("bulk", bulk);

    let resp: any = undefined;

    try {
      resp = await fetch("/.netlify/functions/netlifyindex", {
        method: "POST",
        body: JSON.stringify({
          ACTION: "bulkwrite",
          DOCUMENT: JSON.stringify(bulk),
          LICHESS_TOKEN: localStorage.getItem("LICHESS_TOKEN"),
        }),
      });
    } catch (err) {
      console.error("bulkwrite mongodb failed", err);
      //return Promise.reject()
      return Promise.resolve(undefined);
    }

    const status = resp.status;

    if (status !== 200) {
      console.error("bulkwrite mongodb failed, status", status);
      //return Promise.reject();
      return Promise.resolve(undefined);
    }

    let json: any = undefined;

    try {
      json = await resp.json();
    } catch (err) {
      console.error("parsing mongodb bulkwrite response json failed", err);
      //return Promise.reject();
      return Promise.resolve(undefined);
    }

    return Promise.resolve(json);
  }
}

export class SmartStore {
  cache: any;
  writeCache: any;
  idb: IndexedDb;
  mdb: MongoDb;
  debounceWrite: any;

  constructor() {
    this.cache = {};
    this.writeCache = {};
    this.idb = new IndexedDb();
    this.mdb = new MongoDb();
    this.debounceWrite = _.debounce(this.flush.bind(this), 5000, {
      maxWait: 20000,
    });
  }

  open(): Promise<any> {
    return this.idb.open();
  }

  async flush() {
    console.log("flush");

    const result = await this.mdb.bulkWrite(this.writeCache);

    if (result !== undefined) {
      this.writeCache = {};
      console.log("flush done");
    } else {
      console.error("flush failed");
    }
  }

  setItem(key: string, value: any) {
    this.idb.setItem(key, value);

    this.cache[key] = value;
    this.writeCache[key] = value;

    //console.info("written", key, value);

    this.debounceWrite();
  }

  async getItemRemote(key: string, def: any): Promise<any> {
    //console.info("getting remote", key);

    const getResult = await this.mdb.getItem(key, def);

    //console.info("got remote", getResult);

    this.cache[key] = getResult;
    this.idb.setItem(key, getResult);

    return Promise.resolve(getResult);
  }

  async getItemLocal(key: string, def: any): Promise<any> {
    //console.info("getting local", key);

    let getResult = await this.idb.getItem(key, undefined);

    if (getResult === undefined) {
      //console.info(key, "not found locally, getting from remote");

      return this.getItemRemote(key, def);
    }

    this.cache[key] = getResult;

    setTimeout(() => {
      //console.info("get remote timeout", key);

      this.getItemRemote(key, getResult);
    }, 1000);

    return Promise.resolve(getResult);
  }

  async getItem(key: string, def: any): Promise<any> {
    if (typeof this.cache[key] !== "undefined") {
      const cached = this.cache[key];

      //console.info("return from cache", key, cached);

      return Promise.resolve(cached);
    }

    return this.getItemLocal(key, def);
  }
}

export async function test() {
  const idb = new IndexedDb();

  await idb.open();

  await idb.setItem("foo", {
    foo: "bar",
  });

  const setResult = await idb.getItem("foo", undefined);

  console.log(setResult);

  await idb.removeItem("foo");

  const getResult = await idb.getItem("foo", { foo: "default" });

  console.log(getResult);
}

export async function mongotest() {
  const mdb = new MongoDb();

  const setResult = await mdb.setItem("test", { foo: "bar" });

  console.log(setResult);

  const getResultExistingKey = await mdb.getItem("test", "default");

  console.log(getResultExistingKey);

  const getResultNonExistingKey = await mdb.getItem(
    "nonexistingkey",
    "defaultnonexisting"
  );

  console.log(getResultNonExistingKey);
}

export async function bulkwritetest() {
  const mdb = new MongoDb();

  const bulkwriteResult = await mdb.bulkWrite({
    foo: "bar",
    beep: "boop",
  });

  console.log(bulkwriteResult);

  const getResultExistingKey = await mdb.getItem("beep", "defaultbeep");

  console.log(getResultExistingKey);
}

export async function pause(ms: number): Promise<any> {
  return new Promise((resolve: any) => {
    setTimeout(() => {
      resolve();
    }, ms);
  });
}

export async function smartstoreflushtest() {
  const sm = new SmartStore();

  await sm.open();

  for (let i = 0; i < 15; i++) {
    console.log(i);

    sm.setItem("foo", "bar");

    await pause(2000);
  }
}

export async function smartstoretest() {
  const sm = new SmartStore();

  await sm.open();

  const getResultOld = await sm.idb.getItem("foo", "defold");

  console.log("old", getResultOld);

  sm.mdb.setItem("foo", "remotebar");

  await pause(6000);

  const getResultRemoteFirst = await sm.getItem("foo", "defremotefirst");

  console.log("remote first", getResultRemoteFirst);

  await pause(6000);

  const getResultRemoteSecond = await sm.getItem("foo", "defremotesecond");

  console.log("remote second", getResultRemoteSecond);

  sm.setItem("foo", "bar");
}

export async function alltests() {
  await test();
  await mongotest();
  await bulkwritetest();
  await smartstoreflushtest();
  await smartstoretest();
}

//alltests()
