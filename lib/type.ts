import { Ref } from 'vue'
type PrimaryKey = string | number | symbol
// eslint-disable-next-line @typescript-eslint/no-explicit-any
export type Kv<T = any> = Record<PrimaryKey, T>;
export type VueRef<T extends HTMLElement> = Ref<T | null>;