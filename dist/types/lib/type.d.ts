import { Ref } from 'vue';
type PrimaryKey = string | number | symbol;
export type Kv<T = any> = Record<PrimaryKey, T>;
export type VueRef<T extends HTMLElement> = Ref<T | null>;
export {};
