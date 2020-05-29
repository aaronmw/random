import * as React from 'react';
import { Label } from './controls';
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
        <Columns align="flex-start">
            <span>Sort Order:</span>
            {['asc', 'desc', 'random'].map(option => {
                return (
                    <Label key={option}>
                        <input
                            type="radio"
                            name={`${propName}-sort-order`}
                            value={option}
                            checked={sortOrder === option}
                            onChange={updateSortOrder.bind(this, option)}
                        />{' '}
                        <span>{startCase(option)}</span>
                    </Label>
                );
            })}
        </Columns>
    );
};

export default SortingOptions;
