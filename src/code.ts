import naturalSort from 'javascript-natural-sort';
import clamp from 'lodash/clamp';
import cloneDeep from 'lodash/cloneDeep';
import get from 'lodash/get';
import isArray from 'lodash/isArray';
import mergeWith from 'lodash/mergeWith';
import random from 'lodash/random';
import range from 'lodash/range';
import sample from 'lodash/sample';
import { LIST_DELIMETER } from './config';
import parseCSSColor from './css-color-parser';
import rotateOriginXY from './helpers';
import migrateData from './migrateData';

const WINDOW_WIDTH = 290;
const WINDOW_HEIGHT = 600;

const RANDOM_THINGS = [
    'a camera 📸',
    'a chequebook 🤑',
    'a blanket 🥶',
    'some deodorant 💩🧼',
    'some teddies 🧸🧸',
    'a radio 📻',
    'some video games 🎮',
    'some sand paper 🌵',
    'a book 📙',
    'a tree 🌲',
    'a ring 💍',
    'a toe ring 💍',
    'a clamp 🗜',
    'some toothpaste 🦷',
    'some perfume 💩🧼',
    'some beef 🐄',
    'a bottle 🍾',
    'some yarn 🧶',
    'a car 🚗',
    'a sailboat ⛵️',
    'a spring 🤖',
    'a pool stick 🎱',
    'some tooth picks 🦷',
    'a new sponge 🧽',
    'some tweezers 👃😳',
    'some money 💰',
    'a sharpie ✍️',
    'a charger 🔌',
    'a USB drive 💾',
    'a purse 👛',
    'a thermostat 🥶',
    'some coasters 🥃',
    'a sponge 🧽',
    'an outlet 🔌',
    'a bottle cap 🍺',
    'a balloon 🎈',
    'a bed 🛏',
    'some pants 👖',
    'some fake flowers 💐',
    'a puddle ☔️',
    'a pencil ✏️',
    'some shoes 👟👟',
    'a hair tie 🎀',
    'some face wash 🧼',
    'a plastic fork 🍔🍟',
    'some food 🌽',
    'some leg warmers 🔥🦵🦵',
    'a thread 🧵',
    'a bookmark 📖',
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
    'a cork 🍾',
    'a desk 🖥',
    'a keyboard ⌨️',
    'some glasses 🤓',
    'a rusty nail 🔨',
    'a cup 🍵',
    'a door 🚪',
    'some white out 🙅',
    'some paper 🧻',
    'some broccoli 🥦',
    'a box 📦',
    'a vase 🏺',
    'a watch ⌚️',
    'a model car 🚕',
    'a wagon 🎠',
    'some clothes 🧢👕👖🧦',
    'a cell phone ☎️',
    'a rug 📜',
    'a nail file 💅',
    'a slipper 🥿',
    'a clay pot 🚽',
    'a pretzel 🥨',
    'an MP3 player 📱',
    'a dumpling 🥟',
    'a sketch pad 📓',
    'some conditioner 🧼',
    'a zipper 🤐',
    'a CD 💿',
    'some stockings 🦵🦵',
    'some flowers 🌸🌺🌼',
    'a bow 🏹',
    'a bracelet ⌚️',
    'a couch 🛋',
    'an iPod 📱',
    'a boom box 🔊',
    'a blouse 👚',
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
    const clientData = await figma.clientStorage.getAsync(key);
    clientData.config = migrateData(clientData.config);
    return clientData;
};

const resetState = async () => {
    await storeClientData('pluginState', {});
};

const anyColorStringToRGB = color => {
    const colorAsRGBAArray = parseCSSColor(color);
    if (isArray(colorAsRGBAArray)) {
        const [r, g, b] = colorAsRGBAArray;
        return {
            r: r / 255,
            g: g / 255,
            b: b / 255,
        };
    }
    return false;
};

const toDegrees = degrees => {
    return (Math.PI / 180) * degrees;
};

const toFloat = val => parseFloat(val);
const toInteger = val => parseInt(val);
const toPercentage = val => clamp(toFloat(val) / 100, 0, 1);
const toThousandsGroupedNumber = val =>
    val.toString().replace(/\B(?<!\.\d*)(?=(\d{3})+(?!\d))/g, ',');

const generateRandomValue = ({ node, propConfig, propName }) => {
    const { method } = propConfig;

    let randomValue, newPropValue;

    switch (method) {
        case 'range':
            const { min: rangeMin, max: rangeMax } = propConfig['range'];
            randomValue = random(rangeMin, rangeMax);
            newPropValue = randomValue;
            break;

        case 'calc':
            const operator = propConfig['calc'].operator;
            const { min: calcMin, max: calcMax } = propConfig['calc'][operator];
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
                    propConfig['calc'].decimalPlaces,
                );
            }
            break;

        case 'list':
            const enabledItems = propConfig['list']
                .split(LIST_DELIMETER)
                .filter(listItem => !listItem.includes('[disabled]'));
            randomValue = sample(enabledItems);
            newPropValue = randomValue;
            break;
    }

    return newPropValue;
};

const fontNameLoadHistory = {};

const notificationHandler = {
    current: null,
};

const showMessage = message => {
    if (notificationHandler.current !== null) {
        notificationHandler.current.cancel();
        notificationHandler.current = null;
    }

    notificationHandler.current = (figma as any).notify(message);
};

const hasStrokeOrFill = (arr, type) => {
    if (arr.length === 0) {
        showMessage(
            `🤔️ At least one of your selected elements doesn't have a ${type} to change...`,
        );
        return false;
    }
    return true;
};

const isSupportedColor = color => {
    if (!color) {
        showMessage(
            `🤔️ "${color}" doesn't look a color, so we'll just ignore that one...`,
        );
        return false;
    }
    return true;
};

const transformProp = async ({ node, propConfig, propName, newPropValue }) => {
    switch (propName) {
        case 'text':
            const chars = node.characters;

            if (!chars) {
                showMessage(
                    `Heads-up: At least one of the elements you've selected is NOT text 🤦`,
                );
                break;
            }

            const numChars = chars.length;
            const { prefix, suffix } = propConfig;
            const valueToPrint = propConfig.groupThousands
                ? toThousandsGroupedNumber(newPropValue)
                : newPropValue;

            for (let i = 0; i < numChars; i++) {
                const fontName = await node.getRangeFontName(i, i + 1);
                const cacheKey = `${fontName.family}-${fontName.style}`;
                const isLoaded = fontNameLoadHistory[cacheKey];

                if (!isLoaded) {
                    await figma.loadFontAsync(fontName);
                    fontNameLoadHistory[cacheKey] = true;
                }
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
                propConfig.preserveAspectRatio === true
                    ? currentOppositeValue * scaleFactor
                    : currentOppositeValue;
            const [verticalOriginName, horizontalOriginName] =
                propConfig.selectedOrigin.split('-');
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

        case 'cornerRadius':
        case 'topLeftRadius':
        case 'topRightRadius':
        case 'bottomRightRadius':
        case 'bottomLeftRadius':
            node[propName] = toInteger(newPropValue);
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
            const colorAsRGB = anyColorStringToRGB(newPropValue);
            if (!hasStrokeOrFill(fillsForColor, 'fill')) break;
            if (!isSupportedColor(colorAsRGB)) break;
            fillsForColor[0].color = colorAsRGB;
            node.fills = fillsForColor;
            break;

        case 'strokeColor':
            const strokesForColor = cloneDeep(node.strokes);
            if (!hasStrokeOrFill(strokesForColor, 'stroke')) break;
            strokesForColor[0].color = anyColorStringToRGB(newPropValue);
            node.strokes = strokesForColor;
            break;

        case 'fillOpacity':
            const fillsForOpacity = cloneDeep(node.fills);
            if (!hasStrokeOrFill(fillsForOpacity, 'fill')) break;
            fillsForOpacity[0].opacity = toPercentage(newPropValue);
            node.fills = fillsForOpacity;
            break;

        case 'strokeOpacity':
            const strokesForOpacity = cloneDeep(node.strokes);
            if (!hasStrokeOrFill(strokesForOpacity, 'stroke')) break;
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

        case 'rotation':
            rotateOriginXY([node], Number(newPropValue), 0.5, 0.5, '%', '%');
            break;

        case 'x':
        case 'y':
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
            showMessage(
                `You have nothing selected, but here's a random thing anyway: ${sample(
                    RANDOM_THINGS,
                )}`,
            );
            return;
        }

        const { config } = msg.params;

        Object.keys(config).map(propName => {
            const propConfig = config[propName];
            if (propConfig.isActive) {
                const randomValues = selectedNodes.map(node => {
                    return generateRandomValue({
                        node,
                        propConfig,
                        propName,
                    });
                });

                if (propConfig.sortOrder && propConfig.sortOrder !== 'random') {
                    randomValues.sort(naturalSort);

                    if (propConfig.sortOrder === 'desc') {
                        randomValues.reverse();
                    }
                }

                selectedNodes.map(async (node, index) => {
                    await transformProp({
                        node,
                        propConfig,
                        propName,
                        newPropValue: randomValues[index],
                    });
                });
            }
        });
    }

    if (msg.type === 'close') {
        figma.closePlugin();
    }
};
