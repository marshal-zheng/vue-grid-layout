import { e as t } from "./core-BdZsEnSu.mjs";
function s(e) {
  try {
    return {
      id: e.id,
      result: t(e.request)
    };
  } catch (r) {
    return {
      id: e.id,
      error: {
        message: r instanceof Error ? r.message : String(r),
        cause: r
      }
    };
  }
}
typeof self != "undefined" && self.addEventListener && self.postMessage && self.addEventListener("message", (e) => {
  var r;
  !e.data || e.data.type !== "layout-engine-request" || (r = self.postMessage) == null || r.call(self, s(e.data));
});
export {
  s as runLayoutWorkerRequest
};
