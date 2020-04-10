import * as React from 'react';
import { Input, InputLabel } from './controls';
import { Columns } from './layout';

const RangeBuilder = ({ propName, min, max, onUpdateState }) => {
    const handleChange = evt => {
        const target = evt.currentTarget;
        const minOrMax = target.dataset.name;
        onUpdateState({
            path: ['propDefinitions', propName, 'range', minOrMax],
            newValue: target.value,
        });
    };

    return (
        <Columns>
            <InputLabel>min:</InputLabel>
            <Input
                data-name="min"
                type="number"
                value={min}
                onChange={handleChange}
            />
            <InputLabel>max:</InputLabel>
            <Input
                data-name="max"
                type="number"
                value={max}
                onChange={handleChange}
            />
        </Columns>
    );
};

export default RangeBuilder;
