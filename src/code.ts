import clamp from 'lodash/clamp';
import cloneDeep from 'lodash/cloneDeep';
import get from 'lodash/get';
import isArray from 'lodash/isArray';
import merge from 'lodash/merge';
import mergeWith from 'lodash/mergeWith';
import random from 'lodash/random';
import sample from 'lodash/sample';

const WINDOW_WIDTH = 290;
const WINDOW_HEIGHT = 600;

const RANDOM_THINGS = [
    'a camera 📸',
    'a checkbook',
    'a blanket 🥶',
    'some deodorant 💩🧼',
    'some teddies 🧸🧸',
    'a radio 📻',
    'some video games 🎮',
    'some sand paper',
    'a book 📙',
    'a tree 🌲',
    'a ring 💍',
    'a toe ring 💍',
    'a clamp 🗜',
    'some toothpaste 🦷',
    'some perfume 💩🧼',
    'some beef 🐄',
    'a bottle 🍾',
    'a window',
    'a car 🚗',
    'a sailboat ⛵️',
    'a spring',
    'a pool stick',
    'some tooth picks 🦷',
    'the floor',
    'some tweezers 👃😳',
    'some money 💰',
    'a sharpie ',
    'a charger 🔌',
    'a USB drive',
    'a purse 👛',
    'a thermostat 🥶',
    'some coasters',
    'a sponge 🧽',
    'an outlet 🔌',
    'a bottle cap',
    'a balloon 🎈',
    'a bed 🛏',
    'some pants 👖',
    'some fake flowers 💐',
    'a puddle',
    'a pencil ✏️',
    'some shoes 👟👟',
    'a hair tie',
    'some face wash 🧼',
    'a plastic fork 🍔🍟',
    'some food 🌽',
    'some leg warmers 🔥🦵🦵',
    'a thread 🧵',
    'a bookmark',
    'a doll 🎎',
    'an air freshener 🕯',
    'a monitor 🖥',
    'a tomato 🍅',
    'some milk 🥛',
    'a water bottle 💦',
    'some socks 🧦',
    'a towel 🏖',
    'some lip gloss ✨👄✨',
    'some speakers 🔈🔈',
    'some headphones 🎧',
    'a cork',
    'a desk',
    'a keyboard ⌨️',
    'some glasses 🤓',
    'a rusty nail',
    'a cup 🍵',
    'a door 🚪',
    'some white out',
    'some paper 🧻',
    'some broccoli 🥦',
    'a box 📦',
    'a vase 🏺',
    'a watch ⌚️',
    'a model car 🚕',
    'a wagon 🎠',
    'some clothes 🧢👕👖🧦',
    'a cell phone ☎️',
    'a rug',
    'a nail file',
    'a slipper 🥿',
    'a clay pot 🚽',
    'a rubber band',
    'an MP3 player',
    'a mirror',
    'a sketch pad 📓',
    'some conditioner',
    'a zipper 🤐',
    'a CD 💿',
    'some stockings 🦵🦵',
    'some flowers 🌸🌺🌼',
    'a bow 🏹',
    'a bracelet ⌚️',
    'a couch 🛋',
    'an iPod 📱',
    'a boom box 🔊',
    'a blouse',
    'a key chain 🔑',
    'a playing card 🃏',
    'some grid paper 📈',
    'some nail clippers 💅',
];

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
            const currentPropValue =
                propName === 'text'
                    ? toInteger(
                          get(
                              node.characters.match(/[0-9,]+(\.[0-9]+)?/),
                              '0',
                              0,
                          ).replace(/,/g, ''),
                      )
                    : node[propName];

            randomValue = random(calcMin, calcMax);
            newPropValue =
                currentPropValue === undefined
                    ? randomValue
                    : operator === 'add'
                    ? currentPropValue + randomValue
                    : currentPropValue * randomValue;

            if (propName === 'text') {
                newPropValue = newPropValue.toFixed(
                    propDefinition['calc'].decimalPlaces,
                );
            }
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
        case 'height':
            const oppositeDimension = propName === 'width' ? 'height' : 'width';
            const currentValue = node[propName];
            const currentOppositeValue = node[oppositeDimension];
            const newValue = toInteger(newPropValue);
            const scaleFactor = newValue / currentValue;
            const newOppositeValue =
                propDefinition.preserveAspectRatio === true
                    ? currentOppositeValue * scaleFactor
                    : currentOppositeValue;
            const [
                verticalOriginName,
                horizontalOriginName,
            ] = propDefinition.selectedOrigin.split('-');
            const currentWidth = node.width;
            const currentHeight = node.height;
            const newWidth = propName === 'width' ? newValue : newOppositeValue;
            const newHeight =
                propName === 'width' ? newOppositeValue : newValue;

            node.resize(newWidth, newHeight);

            node.x =
                horizontalOriginName === 'center'
                    ? node.x + (newWidth - currentWidth) / -2
                    : horizontalOriginName === 'right'
                    ? node.x + (newWidth - currentWidth) / -1
                    : node.x;

            node.y =
                verticalOriginName === 'middle'
                    ? node.y + (newHeight - currentHeight) / -2
                    : verticalOriginName === 'bottom'
                    ? node.y + (newHeight - currentHeight) / -1
                    : node.y;
            break;

        case 'layerBlur':
            const effects = cloneDeep(node.effects);
            effects[0] = {
                type: 'LAYER_BLUR',
                radius: toInteger(newPropValue),
                visible: true,
            };
            node.effects = effects;
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
        const newState = {};
        const savedState = await retrieveClientData('pluginState');
        mergeWith(
            newState,
            msg.initialState,
            savedState,
            (objValue, srcValue) => {
                if (isArray(objValue) && isArray(srcValue)) {
                    return srcValue;
                }
            },
        );
        figma.ui.postMessage(newState);
    }

    if (msg.type === 'saveState') {
        await storeClientData('pluginState', msg.params);
    }

    if (msg.type === 'run') {
        const selectedNodes = figma.currentPage.selection;

        if (selectedNodes.length === 0) {
            // STILL no idea why I need to cast this...
            (figma as any).notify(
                `You have nothing selected, but here's a random thing anyway: ${sample(
                    RANDOM_THINGS,
                )}`,
            );
            return;
        }

        const { config } = msg.params;

        Object.keys(config).map(propName => {
            const propDefinition = config[propName];
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
