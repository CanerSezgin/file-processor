export interface IKeyValueStorage {
  get(key: string): Promise<string | null>;
  set(key: string, value: any): Promise<void>;
  del(key: string): Promise<void>;
  getRecords(query: string): Promise<{ key: string; value: string }[]>;
}
