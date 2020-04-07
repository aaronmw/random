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
    return (Math.PI / 180) * degrees;
};
const toFloat = val => parseFloat(val);
const toInteger = val => parseInt(val);
const toPercentage = val => clamp(toFloat(val) / 100, 0, 1);
const toThousandsGroupedNumber = val =>
    val.toString().replace(/\B(?<!\.\d*)(?=(\d{3})+(?!\d))/g, ',');

const transformProp = async ({ node, propDefinition, propName }) => {
    const { method } = propDefinition;
    const currentPropValue = node[propName];

    let randomValue;
    let newPropValue;

    switch (method) {
        case 'range':
            const { min: rangeMin, max: rangeMax } = propDefinition['range'];
            randomValue = random(rangeMin, rangeMax);
            newPropValue = randomValue;
            break;

        case 'calc':
            const operator = propDefinition['calc'].operator;
            const { min: calcMin, max: calcMax } = propDefinition['calc'][
                operator
            ];
            randomValue = random(calcMin, calcMax);
            newPropValue =
                currentPropValue === undefined
                    ? randomValue
                    : operator === 'add'
                    ? currentPropValue + randomValue
                    : currentPropValue * randomValue;
            break;

        case 'list':
            randomValue = sample(propDefinition['list']);
            newPropValue = randomValue;
            break;
    }

    switch (propName) {
        case 'text':
            const chars = node.characters;
            const numChars = chars.length;
            const { prefix, suffix } = propDefinition;
            const valueToPrint = propDefinition.groupThousands
                ? toThousandsGroupedNumber(newPropValue)
                : newPropValue;

            for (let i = 0; i < numChars; i++) {
                await figma.loadFontAsync(node.getRangeFontName(i, i + 1));
            }

            node.characters = `${prefix}${valueToPrint}${suffix}`;
            break;

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
            break;

        case 'arcEndingAngle':
            const arcDataForEndingAngle = cloneDeep(node.arcData);
            arcDataForEndingAngle.endingAngle = toDegrees(newPropValue);
            node.arcData = arcDataForEndingAngle;
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
        if (msg.reset) {
            await resetState();
        }
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
                selectedNodes.map(async node => {
                    await transformProp({
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
