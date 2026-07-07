import isArray from 'lodash/isArray';
import mapValues from 'lodash/mapValues';

const migrateListData = list => {
    if (!isArray(list)) {
        return list;
    }
    return list
        .map(listItem =>
            typeof listItem === 'object' ? listItem.value : listItem,
        )
        .join('\n');
};

const migrateData = configObj => {
    if (!configObj || typeof configObj !== 'object') {
        return configObj;
    }

    return mapValues(configObj, propDefinition =>
        mapValues(propDefinition, (value, key) =>
            key !== 'list' ? value : migrateListData(value),
        ),
    );
};

export default migrateData;
