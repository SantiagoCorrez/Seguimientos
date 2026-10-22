import {
  inflate_1
} from "./chunk-G57J6JGT.js";
import {
  BaseDecoder
} from "./chunk-SMQZRSHN.js";
import "./chunk-V4F5PRXT.js";

// node_modules/geotiff/dist-module/compression/deflate.js
var DeflateDecoder = class extends BaseDecoder {
  decodeBlock(buffer) {
    return inflate_1(new Uint8Array(buffer)).buffer;
  }
};
export {
  DeflateDecoder as default
};
//# sourceMappingURL=chunk-NTNQWVNA.js.map
