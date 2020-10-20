import * as React from 'react';
import { Field, TextInput } from './controls';
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
        <Columns title="Character(s) to insert before and / or after the random value">
            <Field label="Prefix">
                <TextInput
                    type="text"
                    value={prefix}
                    placeholder="none"
                    onChange={evt => handleChange(evt, 'prefix')}
                />
            </Field>
            <Field label="Suffix">
                <TextInput
                    type="text"
                    value={suffix}
                    placeholder="none"
                    onChange={evt => handleChange(evt, 'suffix')}
                />
            </Field>
        </Columns>
    );
};

export default PrefixSuffixBuilder;
