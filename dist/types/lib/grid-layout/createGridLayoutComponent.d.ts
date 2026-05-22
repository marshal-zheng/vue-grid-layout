import { type ComponentObjectPropsOptions } from 'vue';
import type { GridLayoutRuntimeExtension, GridLayoutRuntimeExtensionContext } from "./runtimeExtension";
type GridLayoutComponentOptions = {
    name: string;
    props: ComponentObjectPropsOptions;
    createRuntimeExtension?: (context: GridLayoutRuntimeExtensionContext) => GridLayoutRuntimeExtension;
};
export declare const createGridLayoutComponent: ({ name, props: propsDefinition, createRuntimeExtension }: GridLayoutComponentOptions) => import("vue").DefineComponent<{}, () => any, {}, {}, {}, import("vue").ComponentOptionsMixin, import("vue").ComponentOptionsMixin, string[], string, import("vue").PublicProps, Readonly<{}> & Readonly<{
    [x: `on${Capitalize<string>}`]: ((...args: any[]) => any) | undefined;
}>, {}, {}, {}, {}, string, import("vue").ComponentProvideOptions, true, {}, any>;
export {};
