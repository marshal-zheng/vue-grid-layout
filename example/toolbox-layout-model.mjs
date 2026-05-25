const cloneLayoutItem = item => {
  const nextItem = { ...item };
  if (Array.isArray(item.resizeHandles)) nextItem.resizeHandles = [...item.resizeHandles];
  return nextItem;
};

const cloneLayout = layout => (layout || []).map(cloneLayoutItem);

const cloneLayoutsMap = layouts => {
  return Object.keys(layouts || {}).reduce((nextLayouts, breakpoint) => {
    nextLayouts[breakpoint] = cloneLayout(layouts[breakpoint]);
    return nextLayouts;
  }, {});
};

const appendMissingOrder = (order, layout) => {
  const seen = new Set(order || []);
  const nextOrder = [...(order || [])];
  for (const item of layout || []) {
    if (seen.has(item.i)) continue;
    seen.add(item.i);
    nextOrder.push(item.i);
  }
  return nextOrder;
};

const orderedLayout = (layoutOrder, layout) => {
  const order = layoutOrder || layout.map(({ i }) => i);
  const orderById = new Map(order.map((id, index) => [id, index]));
  return [...layout].sort((a, b) => {
    const aIndex = orderById.has(a.i) ? orderById.get(a.i) : order.length;
    const bIndex = orderById.has(b.i) ? orderById.get(b.i) : order.length;
    return aIndex - bIndex;
  });
};

const getToolboxIds = (model, breakpoint) =>
  new Set((model.toolbox[breakpoint] || []).map(({ i }) => i));

const getVisibleLayout = (model, breakpoint) => {
  const toolboxIds = getToolboxIds(model, breakpoint);
  return orderedLayout(
    model.layoutOrder[breakpoint],
    cloneLayout(model.fullLayouts[breakpoint]).filter(({ i }) => !toolboxIds.has(i))
  );
};

const withVisibleLayouts = model => {
  const breakpoints = new Set([
    ...Object.keys(model.fullLayouts || {}),
    ...Object.keys(model.visibleLayouts || {})
  ]);
  const visibleLayouts = {};
  for (const breakpoint of breakpoints) {
    visibleLayouts[breakpoint] = getVisibleLayout(model, breakpoint);
  }
  return {
    ...model,
    visibleLayouts
  };
};

const mergeFullLayout = (existingFullLayout, visibleLayout, toolboxIds) => {
  const visibleById = new Map(cloneLayout(visibleLayout).map(item => [item.i, item]));
  const nextFullLayout = [];
  const seen = new Set();

  for (const item of existingFullLayout || []) {
    const nextItem = toolboxIds.has(item.i)
      ? cloneLayoutItem(item)
      : visibleById.get(item.i);
    if (!nextItem) continue;
    nextFullLayout.push(cloneLayoutItem(nextItem));
    seen.add(item.i);
  }

  for (const item of visibleById.values()) {
    if (seen.has(item.i)) continue;
    nextFullLayout.push(cloneLayoutItem(item));
  }

  return nextFullLayout;
};

const upsertFullLayoutItem = (existingFullLayout, item) => {
  let found = false;
  const nextFullLayout = (existingFullLayout || []).map(existingItem => {
    if (existingItem.i !== item.i) return cloneLayoutItem(existingItem);
    found = true;
    return cloneLayoutItem(item);
  });
  if (!found) nextFullLayout.push(cloneLayoutItem(item));
  return nextFullLayout;
};

const ensureBreakpoint = (model, breakpoint, layout = []) => {
  if (model.fullLayouts[breakpoint]) return model;

  const fullLayout = cloneLayout(layout);
  return withVisibleLayouts({
    ...model,
    toolbox: {
      ...model.toolbox,
      [breakpoint]: []
    },
    fullLayouts: {
      ...model.fullLayouts,
      [breakpoint]: fullLayout
    },
    layoutOrder: {
      ...model.layoutOrder,
      [breakpoint]: fullLayout.map(({ i }) => i)
    }
  });
};

const resetLayout = (model, breakpoint, layout) => {
  const fullLayout = cloneLayout(layout);
  return withVisibleLayouts({
    ...model,
    toolbox: {
      ...model.toolbox,
      [breakpoint]: []
    },
    fullLayouts: {
      ...model.fullLayouts,
      [breakpoint]: fullLayout
    },
    layoutOrder: {
      ...model.layoutOrder,
      [breakpoint]: fullLayout.map(({ i }) => i)
    }
  });
};

const syncLayouts = (model, layouts) => {
  let nextModel = model;

  for (const breakpoint of Object.keys(layouts || {})) {
    nextModel = ensureBreakpoint(nextModel, breakpoint, layouts[breakpoint]);
    const toolboxIds = getToolboxIds(nextModel, breakpoint);
    const fullLayout = mergeFullLayout(
      nextModel.fullLayouts[breakpoint],
      layouts[breakpoint],
      toolboxIds
    );
    nextModel = {
      ...nextModel,
      fullLayouts: {
        ...nextModel.fullLayouts,
        [breakpoint]: fullLayout
      },
      layoutOrder: {
        ...nextModel.layoutOrder,
        [breakpoint]: appendMissingOrder(nextModel.layoutOrder[breakpoint], fullLayout)
      }
    };
  }

  return withVisibleLayouts(nextModel);
};

const putItem = (model, breakpoint, item) => {
  if (item.static) return model;
  const nextModel = ensureBreakpoint(model, breakpoint, [item]);
  const currentToolbox = nextModel.toolbox[breakpoint] || [];
  const fullLayout = upsertFullLayoutItem(nextModel.fullLayouts[breakpoint], item);

  return withVisibleLayouts({
    ...nextModel,
    toolbox: {
      ...nextModel.toolbox,
      [breakpoint]: currentToolbox.some(({ i }) => i === item.i)
        ? currentToolbox
        : [...currentToolbox, cloneLayoutItem(item)]
    },
    fullLayouts: {
      ...nextModel.fullLayouts,
      [breakpoint]: fullLayout
    },
    layoutOrder: {
      ...nextModel.layoutOrder,
      [breakpoint]: appendMissingOrder(nextModel.layoutOrder[breakpoint], fullLayout)
    }
  });
};

const takeItem = (model, breakpoint, item) => {
  const nextModel = ensureBreakpoint(model, breakpoint, [item]);
  return withVisibleLayouts({
    ...nextModel,
    toolbox: {
      ...nextModel.toolbox,
      [breakpoint]: (nextModel.toolbox[breakpoint] || []).filter(({ i }) => i !== item.i)
    }
  });
};

export const createToolboxLayoutModel = layouts => {
  const fullLayouts = cloneLayoutsMap(layouts);
  const layoutOrder = Object.keys(fullLayouts).reduce((nextOrder, breakpoint) => {
    nextOrder[breakpoint] = fullLayouts[breakpoint].map(({ i }) => i);
    return nextOrder;
  }, {});

  return withVisibleLayouts({
    toolbox: Object.keys(fullLayouts).reduce((nextToolbox, breakpoint) => {
      nextToolbox[breakpoint] = [];
      return nextToolbox;
    }, {}),
    fullLayouts,
    layoutOrder,
    visibleLayouts: {}
  });
};

export const getToolboxLayoutView = (model, breakpoint) => ({
  layout: model.visibleLayouts[breakpoint] || [],
  toolbox: model.toolbox[breakpoint] || []
});

export const reduceToolboxLayoutModel = (model, action) => {
  if (action.type === "ensureBreakpoint") {
    return ensureBreakpoint(model, action.breakpoint, action.layout);
  }
  if (action.type === "resetLayout") {
    return resetLayout(model, action.breakpoint, action.layout);
  }
  if (action.type === "syncLayouts") {
    return syncLayouts(model, action.layouts);
  }
  if (action.type === "putItem") {
    return putItem(model, action.breakpoint, action.item);
  }
  if (action.type === "takeItem") {
    return takeItem(model, action.breakpoint, action.item);
  }
  return model;
};
