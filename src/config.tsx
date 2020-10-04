export const STRING = {
    listFieldType: 'text',
    method: 'list',
    sortOrder: 'random',
    groupThousands: true,
    prefix: '',
    suffix: '',
    calc: {
        operator: 'add',
        decimalPlaces: 0,
        add: {
            min: -50,
            max: 50,
        },
        multiply: {
            min: 0.5,
            max: 1.5,
        },
    },
    range: {
        min: 50,
        max: 200,
        sortOrder: 'random',
    },
    list: [
        { value: 'John Doe', isDisabled: false },
        { value: 'Jane Smith', isDisabled: false },
        { value: 'Randy Randomson', isDisabled: false },
    ],
};

export const INTEGER = {
    listFieldType: 'number',
    method: 'range',
    sortOrder: 'random',
    calc: {
        operator: 'add',
        add: {
            min: -50,
            max: 50,
        },
        multiply: {
            min: 0.5,
            max: 1.5,
        },
    },
    range: {
        min: 50,
        max: 200,
    },
    list: [
        { value: 50, isDisabled: false },
        { value: 100, isDisabled: false },
        { value: 200, isDisabled: false },
    ],
};

export const DEGREES = {
    listFieldType: 'number',
    method: 'range',
    sortOrder: 'random',
    range: {
        min: 0,
        max: 360,
    },
    list: [
        { value: 0, isDisabled: false },
        { value: 45, isDisabled: false },
        { value: 90, isDisabled: false },
        { value: 135, isDisabled: false },
        { value: 180, isDisabled: false },
        { value: 225, isDisabled: false },
        { value: 270, isDisabled: false },
        { value: 315, isDisabled: false },
        { value: 360, isDisabled: false },
    ],
};

export const PERCENTAGE = {
    listFieldType: 'number',
    method: 'range',
    sortOrder: 'random',
    range: {
        min: 0,
        max: 100,
    },
    list: [
        { value: 0, isDisabled: false },
        { value: 25, isDisabled: false },
        { value: 50, isDisabled: false },
        { value: 75, isDisabled: false },
        { value: 100, isDisabled: false },
    ],
};

export const COLOR = {
    listFieldType: 'text',
    method: 'list',
    sortOrder: 'random',
    list: [
        { value: '#f23b27', isDisabled: false },
        { value: '#fd605b', isDisabled: false },
        { value: '#9851f9', isDisabled: false },
        { value: '#1ab7fa', isDisabled: false },
        { value: '#1bca7c', isDisabled: false },
    ],
};

export const DEFAULT_CONFIG = {
    text: { ...STRING, sortOrder: 'random' },
    width: {
        ...INTEGER,
        preserveAspectRatio: false,
        selectedOrigin: 'middle-center',
    },
    height: {
        ...INTEGER,
        preserveAspectRatio: false,
        selectedOrigin: 'middle-center',
    },
    x: INTEGER,
    y: INTEGER,
    opacity: PERCENTAGE,
    rotation: DEGREES,
    fillColor: COLOR,
    fillOpacity: PERCENTAGE,
    strokeColor: COLOR,
    strokeOpacity: PERCENTAGE,
    strokeWeight: INTEGER,
    layerBlur: { ...INTEGER, range: { min: 0, max: 10 } },
    arcStartingAngle: DEGREES,
    arcEndingAngle: DEGREES,
};
