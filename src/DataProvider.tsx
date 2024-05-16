import { ReactElement } from "react";

export const RECORD_ID = "_id";

export abstract class DataProvider {
    abstract getLoginForm(params: {}, setProvider: (DataProvider) => void): ReactElement;
    abstract getData(): Promise<[]>;
    abstract getSchema(): Promise<any>;
    abstract getName(): string;
    abstract getDataName(): string;  
    abstract saveData(msg: string): void;
    abstract canSaveData(): boolean;
    calcDataId(): void {    
      this.getSchema().then(schema => {
        const idCols: [] = this.getMetadata(schema, "idCols");
        this.getData().then(data => data.forEach((e: any,idx) => e[RECORD_ID] = idCols.map(c => e[c]).join("-")))
      });
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
        // find and overwrite entry in array
        const idx = d.findIndex(e => e[RECORD_ID] == id);
        d[idx] = entry;
        this.changed = true; // set changed flag
      })
    }
    changed: boolean = false;

    /**
     * Download data array as file in browser
     */
    downloadData() {
      this.getData().then(d => {
        const blob = new Blob([JSON.stringify(d)], {type: 'application/json'});
        var csvURL = window.URL.createObjectURL(blob);
        const tempLink = document.createElement('a');
        tempLink.href = csvURL;
        tempLink.setAttribute('download', this.getDataName()+'.json');
        tempLink.click();
        this.changed = false; // reset changed flag
      });
    };    
}