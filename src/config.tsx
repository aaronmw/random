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
    list: ['John Doe', 'Jane Smith', 'Randy Randomson'],
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
    list: [50, 100, 200],
};

export const DEGREES = {
    listFieldType: 'number',
    method: 'range',
    sortOrder: 'random',
    range: {
        min: 0,
        max: 360,
    },
    list: [0, 45, 90, 135, 180, 225, 270, 315, 360],
};

export const PERCENTAGE = {
    listFieldType: 'number',
    method: 'range',
    sortOrder: 'random',
    range: {
        min: 0,
        max: 100,
    },
    list: [0, 25, 50, 75, 100],
};

export const COLOR = {
    listFieldType: 'text',
    method: 'list',
    sortOrder: 'random',
    list: ['#f23b27', '#fd605b', '#9851f9', '#1ab7fa', '#1bca7c'],
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
