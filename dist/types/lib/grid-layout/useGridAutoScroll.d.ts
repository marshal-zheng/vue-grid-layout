type AutoScrollConfig = boolean | {
    margin?: number;
    speed?: number;
} | undefined;
type UseGridAutoScrollOptions = {
    getConfig: () => AutoScrollConfig;
    rootClassName: string;
};
export declare function useGridAutoScroll({ getConfig, rootClassName }: UseGridAutoScrollOptions): {
    init: (node: HTMLElement) => void;
    maybeScroll: (event: Event, node: HTMLElement) => void;
    reset: () => void;
};
export {};
