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

const toColor = hex => {
    const result = /^#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i.exec(hex);
    return result
        ? {
              r: parseInt(result[1], 16) / 255,
              g: parseInt(result[2], 16) / 255,
              b: parseInt(result[3], 16) / 255,
          }
        : null;
};
const toDegrees = degrees => {
    // const safeDegrees = clamp(degrees, 0, 360);
    // const degreesAsPercentage = safeDegrees / 360;
    return (Math.PI / 180) * degrees;
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

        case 'fillColor':
            const fillsForColor = cloneDeep(node.fills);
            fillsForColor[0].color = toColor(newPropValue);
            node.fills = fillsForColor;
            break;

        case 'strokeColor':
            const strokesForColor = cloneDeep(node.strokes);
            strokesForColor[0].color = toColor(newPropValue);
            node.strokes = strokesForColor;
            break;

        case 'fillOpacity':
            const fillsForOpacity = cloneDeep(node.fills);
            fillsForOpacity[0].opacity = toPercentage(newPropValue);
            node.fills = fillsForOpacity;
            break;

        case 'strokeOpacity':
            const strokesForOpacity = cloneDeep(node.strokes);
            strokesForOpacity[0].opacity = toPercentage(newPropValue);
            node.strokes = strokesForOpacity;
            break;

        case 'arcStartingAngle':
            const arcDataForStartingAngle = cloneDeep(node.arcData);
            arcDataForStartingAngle.startingAngle = toDegrees(newPropValue);
            node.arcData = arcDataForStartingAngle;
            console.log(arcDataForStartingAngle);
            break;

        case 'arcEndingAngle':
            const arcDataForEndingAngle = cloneDeep(node.arcData);
            arcDataForEndingAngle.endingAngle = toDegrees(newPropValue);
            node.arcData = arcDataForEndingAngle;
            console.log(arcDataForEndingAngle);
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
        await resetState();
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
