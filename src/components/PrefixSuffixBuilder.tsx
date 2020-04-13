import * as React from 'react';
import { Input, InputLabel } from './controls';
import { Columns } from './layout';

const PrefixSuffixBuilder = ({ prefix, suffix, onUpdateState }) => {
    const handleChange = (evt, prefixOrSuffix) => {
        const newValue = evt.currentTarget.value;
        onUpdateState({
            path: ['config', 'text', prefixOrSuffix],
            newValue,
        });
    };

    return (
        <Columns>
            <InputLabel>prefix:</InputLabel>
            <Input
                type="text"
                value={prefix}
                onChange={evt => handleChange(evt, 'prefix')}
            />
            <InputLabel>suffix:</InputLabel>
            <Input
                type="text"
                value={suffix}
                onChange={evt => handleChange(evt, 'suffix')}
            />
        </Columns>
    );
};

export default PrefixSuffixBuilder;
