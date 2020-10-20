import * as React from 'react';
import { Field, TextInput } from './controls';
import { Columns } from './layout';

const RangeBuilder = ({ propName, min, max, onUpdateState }) => {
    const handleChange = evt => {
        const target = evt.currentTarget;
        const minOrMax = target.dataset.name;
        onUpdateState({
            path: ['config', propName, 'range', minOrMax],
            newValue: target.value,
        });
    };

    return (
        <Columns>
            <Field label="Min">
                <TextInput
                    data-name="min"
                    type="number"
                    value={min}
                    onChange={handleChange}
                />
            </Field>
            <Field label="Max">
                <TextInput
                    data-name="max"
                    type="number"
                    value={max}
                    onChange={handleChange}
                />
            </Field>
        </Columns>
    );
};

export default RangeBuilder;
