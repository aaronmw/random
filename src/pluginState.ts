import cloneDeep from 'lodash/cloneDeep';
import {
    DEFAULT_CONFIG,
    DEFAULT_UI_HEIGHT,
    MAX_UI_HEIGHT,
    MIN_UI_HEIGHT,
} from './config';
import migrateData from './migrateData';

const VALID_ACTIVE_ROUTES = ['randomizer', 'about'];
const VALID_METHODS = ['calc', 'list', 'range'];
const VALID_OPERATORS = ['add', 'multiply'];
const VALID_SORT_ORDERS = ['asc', 'desc', 'random'];
const VALID_ORIGINS = [
    'top-left',
    'top-center',
    'top-right',
    'middle-left',
    'middle-center',
    'middle-right',
    'bottom-left',
    'bottom-center',
    'bottom-right',
];

export const INITIAL_PLUGIN_STATE = {
    config: DEFAULT_CONFIG,
    savedConfigs: [],
    activeRoute: 'randomizer',
    uiHeight: DEFAULT_UI_HEIGHT,
};

export const isPlainObject = value =>
    value !== null && typeof value === 'object' && !Array.isArray(value);

export const toUiHeight = value => {
    if (!Number.isFinite(value)) {
        return DEFAULT_UI_HEIGHT;
    }

    return Math.round(Math.max(MIN_UI_HEIGHT, Math.min(MAX_UI_HEIGHT, value)));
};

const sanitizeValue = (value, fallback) => {
    if (isPlainObject(fallback)) {
        const source = isPlainObject(value) ? value : {};

        return Object.keys(fallback).reduce((result, key) => {
            result[key] = sanitizeValue(source[key], fallback[key]);
            return result;
        }, {});
    }

    if (typeof fallback === 'number') {
        if (typeof value === 'string') {
            return value;
        }

        return typeof value === 'number' && Number.isFinite(value)
            ? value
            : fallback;
    }

    return typeof value === typeof fallback ? value : cloneDeep(fallback);
};

const hasValidOption = (options, value) =>
    typeof value === 'string' && options.includes(value);

const sanitizePropConfig = (value, fallback) => {
    const source = isPlainObject(value) ? value : {};
    const result = sanitizeValue(source, fallback);

    result.isActive = source.isActive === true;

    if ('method' in fallback) {
        const availableMethods = VALID_METHODS.filter(
            method =>
                (method === 'list' && typeof fallback.list === 'string') ||
                isPlainObject(fallback[method]),
        );
        result.method = hasValidOption(availableMethods, source.method)
            ? source.method
            : fallback.method;
    }

    if ('sortOrder' in fallback) {
        result.sortOrder = hasValidOption(VALID_SORT_ORDERS, source.sortOrder)
            ? source.sortOrder
            : fallback.sortOrder;
    }

    if ('selectedOrigin' in fallback) {
        result.selectedOrigin = hasValidOption(
            VALID_ORIGINS,
            source.selectedOrigin,
        )
            ? source.selectedOrigin
            : fallback.selectedOrigin;
    }

    if (isPlainObject(fallback.calc)) {
        result.calc.operator = hasValidOption(
            VALID_OPERATORS,
            source.calc?.operator,
        )
            ? source.calc.operator
            : fallback.calc.operator;
    }

    return result;
};

export const sanitizePluginConfig = value => {
    const migratedConfig = isPlainObject(value) ? migrateData(value) : {};

    return Object.keys(DEFAULT_CONFIG).reduce((result, propName) => {
        result[propName] = sanitizePropConfig(
            migratedConfig[propName],
            DEFAULT_CONFIG[propName],
        );
        return result;
    }, {});
};

const sanitizeSavedConfigs = value => {
    if (!Array.isArray(value)) {
        return [];
    }

    const usedIds = new Set();

    return value.reduce((result, savedConfig, index) => {
        if (!isPlainObject(savedConfig) || !isPlainObject(savedConfig.data)) {
            return result;
        }

        const candidateId =
            (typeof savedConfig.id === 'number' &&
                Number.isFinite(savedConfig.id)) ||
            (typeof savedConfig.id === 'string' && savedConfig.id.length > 0)
                ? savedConfig.id
                : `recovered-preset-${index + 1}`;
        let id = candidateId;
        let recoveryAttempt = 0;

        if (usedIds.has(id)) {
            do {
                recoveryAttempt += 1;
                id = `recovered-preset-${index + 1}-${recoveryAttempt}`;
            } while (usedIds.has(id));
        }
        usedIds.add(id);

        result.push({
            id,
            label:
                typeof savedConfig.label === 'string'
                    ? savedConfig.label
                    : 'Untitled',
            data: sanitizePluginConfig(savedConfig.data),
        });

        return result;
    }, []);
};

export const sanitizePluginState = value => {
    const state = isPlainObject(value) ? value : {};

    return {
        config: sanitizePluginConfig(state.config),
        savedConfigs: sanitizeSavedConfigs(state.savedConfigs),
        activeRoute: hasValidOption(VALID_ACTIVE_ROUTES, state.activeRoute)
            ? state.activeRoute
            : INITIAL_PLUGIN_STATE.activeRoute,
        uiHeight: toUiHeight(state.uiHeight),
    };
};
