import { type PropType } from "vue";
import { basicProps as gridLayoutProps } from "../VueGridLayoutPropTypes";
import { createGridLayoutComponent } from "../grid-layout/createGridLayoutComponent";
import type {
  GridLayoutPersistenceController,
  GridLayoutPersistenceProp
} from "../persistence";
import type { Layout } from "../utils";
import type { GridEditorProp } from "./types";
import { createEditorGridRuntimeExtension } from "./gridRuntimeExtension";

export const editorGridLayoutProps = {
  ...gridLayoutProps,
  editor: {
    type: [Boolean, Object] as PropType<false | GridEditorProp>,
    default: false
  },
  persistence: {
    type: [Boolean, Object] as PropType<false | GridLayoutPersistenceProp | GridLayoutPersistenceController<Layout>>,
    default: false
  }
};

const EditorGridLayout = createGridLayoutComponent({
  name: "EditorGridLayout",
  props: editorGridLayoutProps,
  createRuntimeExtension: createEditorGridRuntimeExtension
});

export default EditorGridLayout;
