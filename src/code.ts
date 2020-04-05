import random from 'lodash/random';

const WINDOW_WIDTH = 290;
const WINDOW_HEIGHT = 600;

figma.showUI(__html__, {
    width: WINDOW_WIDTH,
    height: WINDOW_HEIGHT,
});

const storeClientData = async (key, val) => {
    await figma.clientStorage.setAsync(key, val);
};

const retrieveClientData = async (key) => {
    return await figma.clientStorage.getAsync(key);
};

const resetState = async () => {
    await storeClientData('pluginState', {});
};

figma.ui.onmessage = async (msg) => {
    if (msg.type === 'init') {
        const savedState = await retrieveClientData('pluginState');
        figma.ui.postMessage(savedState);
    }

    if (msg.type === 'saveState') {
        await storeClientData('pluginState', msg.params);
    }

    if (msg.type === 'run') {
        const selectedNodes = figma.currentPage.selection;
        selectedNodes.map((node) => {});

        figma.closePlugin();
    }

    if (msg.type === 'close') {
        figma.closePlugin();
    }
};
