import * as React from 'react';
import { Field, Radio } from './controls';
import { Columns } from './layout';
import startCase from 'lodash/startCase';

const SortingOptions = ({ propName, sortOrder, onUpdateState }) => {
    const updateSortOrder = newValue => {
        onUpdateState({
            path: ['config', propName, 'sortOrder'],
            newValue,
        });
    };

    return (
        <Field label="Sort Order" justify="space-between">
            <Columns>
                {['asc', 'desc', 'random'].map(option => {
                    return (
                        <Field
                            key={option}
                            label={startCase(option)}
                            labelOnRight
                            onClick={updateSortOrder.bind(this, option)}
                        >
                            <Radio checked={sortOrder === option} />
                        </Field>
                    );
                })}
            </Columns>
        </Field>
    );
};

export default SortingOptions;
