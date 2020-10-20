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

const migrateData = configObj =>
    mapValues(configObj, propDefinition =>
        mapValues(propDefinition, (value, key) =>
            key !== 'list' ? value : migrateListData(value),
        ),
    );

export default migrateData;
