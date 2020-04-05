var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : new P(function (resolve) { resolve(result.value); }).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
import { isTextNode, getAllFonts } from '@figma-plugin/helpers';
figma.showUI(__html__);
const storeClientData = (key, val) => __awaiter(this, void 0, void 0, function* () {
    yield figma.clientStorage.setAsync(key, val);
});
const retrieveClientData = (key) => __awaiter(this, void 0, void 0, function* () {
    return yield figma.clientStorage.getAsync(key);
});
const getTextNodes = nodes => nodes.reduce((acc, node) => {
    if (isTextNode(node)) {
        acc.push(node);
    }
    return acc;
}, []);
figma.ui.onmessage = (msg) => __awaiter(this, void 0, void 0, function* () {
    if (msg.type === 'saveShouldKeepOpenStatus') {
        yield storeClientData('shouldKeepOpen', msg.shouldKeepOpen);
    }
    if (msg.type === 'loadInitialState') {
        const nodes = figma.currentPage.children;
        const textNodes = getTextNodes(nodes);
        const fontNames = getAllFonts(textNodes);
        const shouldKeepOpen = yield retrieveClientData('shouldKeepOpen');
        figma.ui.postMessage({
            fontNames,
            shouldKeepOpen
        });
    }
    if (msg.type === 'applyFont') {
        const selectedTextNodes = getTextNodes(figma.currentPage.selection);
        if (selectedTextNodes.length === 0) {
            // No idea why I need to cast this...
            figma.notify('Select some text objects first!');
            return;
        }
        const { family, style } = msg.fontName;
        yield figma.loadFontAsync({
            family,
            style,
        });
        selectedTextNodes.map(textNode => {
            textNode.fontName = {
                family,
                style,
            };
        });
        if (!msg.shouldKeepOpen) {
            figma.closePlugin();
        }
    }
    if (msg.type === 'close') {
        figma.closePlugin();
    }
});
