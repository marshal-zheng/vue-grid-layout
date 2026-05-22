import type { Position } from "./utils";
import { Kv } from './type';
import type { GridRenderPrecision } from "./grid-height";
export type PositionParams = {
    margin: number[];
    containerPadding: number[];
    containerWidth: number;
    cols: number;
    rowHeight: number;
    maxRows: number;
    renderPrecision?: GridRenderPrecision;
};
export declare function calcGridColWidth(positionParams: PositionParams): number;
export declare function calcGridItemWHPx(gridUnits: number, colOrRowSize: number, marginPx: number, renderPrecision?: GridRenderPrecision): number;
export declare function applyRenderPrecision(value: number, precision?: GridRenderPrecision): number;
/**
 * Return position on the page given an x, y, w, h.
 * left, top, width, height are all in pixels.
 * @param  {PositionParams} positionParams  Parameters of grid needed for coordinates calculations.
 * @param  {Number}  x                      X coordinate in grid units.
 * @param  {Number}  y                      Y coordinate in grid units.
 * @param  {Number}  w                      W coordinate in grid units.
 * @param  {Number}  h                      H coordinate in grid units.
 * @return {Position}                       Object containing coords.
 */
export declare function calcGridItemPosition(positionParams: PositionParams, x: number, y: number, w: number, h: number, state?: Kv): Position;
/**
 * Translate x and y coordinates from pixels to grid units.
 * @param  {PositionParams} positionParams  Parameters of grid needed for coordinates calculations.
 * @param  {Number} top                     Top position (relative to parent) in pixels.
 * @param  {Number} left                    Left position (relative to parent) in pixels.
 * @param  {Number} w                       W coordinate in grid units.
 * @param  {Number} h                       H coordinate in grid units.
 * @return {Object}                         x and y in grid units.
 */
export declare function calcXY(positionParams: PositionParams, top: number, left: number, w: number, h: number): {
    x: number;
    y: number;
};
/**
 * Given a height and width in pixel values, calculate grid units.
 * @param  {PositionParams} positionParams  Parameters of grid needed for coordinates calcluations.
 * @param  {Number} height                  Height in pixels.
 * @param  {Number} width                   Width in pixels.
 * @param  {Number} x                       X coordinate in grid units.
 * @param  {Number} y                       Y coordinate in grid units.
 * @param {String} handle Resize Handle.
 * @return {Object}                         w, h as grid units.
 */
export declare function calcWH(positionParams: PositionParams, width: number, height: number, x: number, y: number, handle: string): {
    w: number;
    h: number;
};
export declare function clamp(num: number, lowerBound: number, upperBound: number): number;
