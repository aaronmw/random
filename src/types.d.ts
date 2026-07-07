/// <reference path="../node_modules/@figma/plugin-typings/index.d.ts" />

declare module './css-color-parser' {
    export default function parseCSSColor(color: string): number[] | null;
}
