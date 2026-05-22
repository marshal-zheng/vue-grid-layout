import { basicProps as gridLayoutProps } from "./VueGridLayoutPropTypes";
import { createGridLayoutComponent } from "./grid-layout/createGridLayoutComponent";

const VueGridLayout = createGridLayoutComponent({
  name: "VueGridLayout",
  props: gridLayoutProps
});

export default VueGridLayout;
