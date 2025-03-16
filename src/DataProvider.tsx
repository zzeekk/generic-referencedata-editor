import { ReactElement } from "react";
import { compareMultiFunc } from "./util/helpers";

export const RECORD_ID = "_id";

export abstract class DataProvider {
    abstract getLoginForm(params: {}, setProvider: (DataProvider) => void, showError: (string) => void): ReactElement;
    abstract getData(): Promise<[]>;
    abstract getSchema(): Promise<any>;
    abstract getName(): string;
    abstract getDataName(): Promise<string>;
    abstract saveData(msg?: string): Promise<void>;
    abstract canSaveData(): boolean;
    abstract canSaveMsg(): boolean;
    calcDataId(): Promise<void> {
      return Promise.all([this.getSchema(),this.getData()])
      .then(([schema,data]) => {
        const idCols: string[] = this.getMetadata(schema, "idCols");
        return data.forEach((e: any, idx) => this.addDataIdProperty(e, idCols.map(c => e[c]).join("-")));
      })
    }
    addDataIdProperty(e: any, id: string) {
      // Object.defineProperty is used to create a property with enumerable: false, so that the artifical RECORD_ID property is not exported on save.
      Object.defineProperty(e, RECORD_ID, {value: id, writable: true, enumerable: false})
    }
    getEntry(id: string): Promise<any> {
      return this.getData().then(d => d.find(e => e[RECORD_ID] == id));
    }
    getMetadata(schema: any, key: string, errorIfMissing: boolean = true): any {
      if (!schema["$metadata"]) throw new Error("key '$metadata' not found in schema");
      const v = schema["$metadata"][key];
      if (!v && errorIfMissing) throw new Error(key + " not found in '$metadata' of schema");
      return v;
    }

    overwriteRecord(id: string, entry: any) {
      this.getData().then((d: any) => {
        // add id to entry
        this.addDataIdProperty(entry, id);
        // find and overwrite entry in array
        const idx = d.findIndex(e => e[RECORD_ID] == id);
        d[idx] = entry;
        this.changedRecords.push(id); // set changed records
      })
    }
    changedRecords: string[] = [];
    changed(): boolean {
      return this.changedRecords.length > 0;
    };

    stringifyData(d: []): Promise<string> {
      return this.getSchema().then(schema => {        
        const idCols = this.getMetadata(schema, "idCols");
        const dSorted = Object.assign([], d).sort(compareMultiFunc(idCols))
        return JSON.stringify(dSorted,undefined,2)
      });
    }
    
    /**
     * Download data array as file in browser
     */
    downloadData() {
      this.getData().then(d => {
        this.stringifyData(d).then(dStr => {
          const blob = new Blob([dStr], {type: 'application/json'});
          var csvURL = window.URL.createObjectURL(blob);
          const tempLink = document.createElement('a');
          tempLink.href = csvURL;
          this.getDataName().then(name => {
            tempLink.setAttribute('download', name+'.json');
            tempLink.click();
            this.changedRecords = []; // reset changed records  
          })
        })
      });
    };    
}