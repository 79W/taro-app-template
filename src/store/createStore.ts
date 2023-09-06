import { StoreApi, create } from "zustand";
import { persist, createJSONStorage, StateStorage } from "zustand/middleware";

import {
  getStorageSync,
  setStorageSync,
  removeStorageSync,
} from "@tarojs/taro";

const storage: StateStorage = {
  getItem: async (name: string): Promise<string | null> => {
    console.log("storage[getItem]:", name, "has been retrieved");
    return (await getStorageSync(name)) || null;
  },
  setItem: async (name: string, value: string): Promise<void> => {
    console.log(
      "storage[setItem]:",
      name,
      "with value",
      value,
      "has been saved"
    );
    await setStorageSync(name, value);
  },
  removeItem: async (name: string): Promise<void> => {
    console.log("storage[removeItem]:", name, "has been deleted");
    await removeStorageSync(name);
  },
};

interface Options {
  name: string;
  lasting?: Array<string> | boolean;
}

type SetState<T> = StoreApi<T>["setState"];
type GetState<T> = StoreApi<T>["getState"];
type InitStore<T> = (set: SetState<T>, get: GetState<T>) => T;

export default function createStore<T = { [key: string]: any }>(
  initStore: InitStore<T>,
  options: Options
) {
  const { name, lasting = true } = options;

  return create<T>()(
    persist(initStore, {
      name: `${name}_storage`,
      storage: createJSONStorage(() => storage),
      partialize: (state: T) => {
        if (!lasting) return null;
        if (Array.isArray(lasting) && lasting.length > 0) {
          const result = lasting.reduce((obj, key: string) => {
            const { [key as keyof T]: deleted, ...rest } = obj;
            return rest;
          }, state);
          return { ...result };
        }
        // 这里可以进一步优化 比如屏蔽掉具体的参数
        return state;
      },
      version: 1,
    })
  );
}
