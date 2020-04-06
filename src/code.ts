import clamp from 'lodash/clamp';
import cloneDeep from 'lodash/cloneDeep';
import random from 'lodash/random';
import sample from 'lodash/sample';

const WINDOW_WIDTH = 290;
const WINDOW_HEIGHT = 600;

figma.showUI(__html__, {
    width: WINDOW_WIDTH,
    height: WINDOW_HEIGHT,
});

const storeClientData = async (key, val) => {
    await figma.clientStorage.setAsync(key, val);
};

const retrieveClientData = async key => {
    return await figma.clientStorage.getAsync(key);
};

const resetState = async () => {
    await storeClientData('pluginState', {});
};

const toFloat = val => parseFloat(val);
const toInteger = val => parseInt(val);
const toPercentage = val => clamp(toFloat(val) / 100, 0, 1);

const transformProp = ({ node, propDefinition, propName }) => {
    const { method } = propDefinition;
    const currentPropValue = node[propName];
    const randomValue =
        ['range', 'multiplier'].indexOf(method) !== -1
            ? random(propDefinition[method].min, propDefinition[method].max)
            : sample(propDefinition[method]);
    const newPropValue =
        ['set', 'range'].indexOf(method) !== -1
            ? randomValue
            : currentPropValue * randomValue;

    switch (propName) {
        case 'width':
            node.resize(toInteger(newPropValue), node.height);
            break;

        case 'height':
            node.resize(node.width, toInteger(newPropValue));
            break;

        case 'fillOpacity':
            const fills = cloneDeep(node.fills);
            fills[0].opacity = toPercentage(newPropValue);
            node.fills = fills;
            break;

        case 'x':
        case 'y':
        case 'rotation':
        case 'strokeWeight':
            node[propName] = toInteger(newPropValue);
            break;

        case 'opacity':
            node[propName] = toPercentage(newPropValue);
            break;
    }
};

figma.ui.onmessage = async msg => {
    if (msg.type === 'init') {
        // await resetState();
        const savedState = await retrieveClientData('pluginState');
        figma.ui.postMessage(savedState);
    }

    if (msg.type === 'saveState') {
        await storeClientData('pluginState', msg.params);
    }

    if (msg.type === 'run') {
        const selectedNodes = figma.currentPage.selection;
        const { propDefinitions } = msg.params;

        Object.keys(propDefinitions).map(propName => {
            const propDefinition = propDefinitions[propName];
            if (propDefinition.isActive) {
                selectedNodes.map(node => {
                    transformProp({
                        node,
                        propDefinition,
                        propName,
                    });
                });
            }
        });
    }

    if (msg.type === 'close') {
        figma.closePlugin();
    }
};
