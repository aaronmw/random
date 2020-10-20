import * as React from 'react';
import { Checkbox, Field, TextInput } from './controls';
import { Columns } from './layout';

const FormatOptions = ({ groupThousands, decimalPlaces, onUpdateState }) => {
    const updateGroupThousands = () => {
        onUpdateState({
            path: ['config', 'text', 'groupThousands'],
            newValue: !groupThousands,
        });
    };

    const updateDecimalPlaces = evt => {
        onUpdateState({
            path: ['config', 'text', 'calc', 'decimalPlaces'],
            newValue: evt.currentTarget.value,
        });
    };

    return (
        <Columns>
            <Field label="Decimal Places">
                <TextInput
                    type="number"
                    min={0}
                    value={decimalPlaces}
                    style={{ width: '33px' }}
                    onChange={updateDecimalPlaces}
                />
            </Field>
            <Field
                label="Group Thousands"
                labelOnRight
                title="Add commas to larger numbers: 1000 -> 1,000"
                onClick={updateGroupThousands}
            >
                <Checkbox checked={groupThousands} />
            </Field>
        </Columns>
    );
};

export default FormatOptions;
