import { createRedisClient, IRedisClient } from '../lib/redis'

export type KeyValue<ValueType> = {
  key: string;
  value: ValueType;
};

export interface IDatabaseModel<DocType> {
  findOne(key: string): Promise<DocType | null>;
  findMany(query: string): Promise<DocType[]>;
  create(key: string, value: any): Promise<any>;
  update(key: string, value: any): Promise<any>;
  delete(key: string): Promise<void>;
}

export interface IKeyValueStorage {
  get(key: string): Promise<string | null>;
  set(key: string, value: any): Promise<void>;
  del(key: string): Promise<void>;
  getRecords(query: string): Promise<{ key: string; value: string }[]>;
}

