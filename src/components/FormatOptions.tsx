import * as React from 'react';
import { Input, Label } from './controls';
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
            <Label>
                <span>Decimal Places:</span>{' '}
                <Input value={decimalPlaces} onChange={updateDecimalPlaces} />
            </Label>
            <Label>
                <input
                    type="checkbox"
                    value="true"
                    checked={groupThousands}
                    onChange={updateGroupThousands}
                />{' '}
                <span>Format with Commas</span>
            </Label>
        </Columns>
    );
};

export default FormatOptions;