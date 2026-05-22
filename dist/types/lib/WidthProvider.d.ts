import { PropType, DefineComponent } from 'vue';
import { Kv } from './type';
export default function WidthProvideRG(ComposedComponent: DefineComponent): DefineComponent<import("vue").ExtractPropTypes<{
    /** Measure width before first render to avoid layout shift (recommended for SSR) */
    measureBeforeMount: {
        type: PropType<boolean>;
        default: boolean;
    };
    /** Additional CSS class for the container */
    class: {
        type: PropType<string>;
        default: string;
    };
    /** Container style object */
    style: {
        type: PropType<Kv>;
        default: () => {};
    };
}>, () => any, {}, {}, {}, import("vue").ComponentOptionsMixin, import("vue").ComponentOptionsMixin, {}, string, import("vue").PublicProps, Readonly<import("vue").ExtractPropTypes<{
    /** Measure width before first render to avoid layout shift (recommended for SSR) */
    measureBeforeMount: {
        type: PropType<boolean>;
        default: boolean;
    };
    /** Additional CSS class for the container */
    class: {
        type: PropType<string>;
        default: string;
    };
    /** Container style object */
    style: {
        type: PropType<Kv>;
        default: () => {};
    };
}>> & Readonly<{}>, {
    class: string;
    style: Kv;
    measureBeforeMount: boolean;
}, {}, {}, {}, string, import("vue").ComponentProvideOptions, true, {}, any>;
