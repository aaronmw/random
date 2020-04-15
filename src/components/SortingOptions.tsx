import * as React from 'react';
import { Label } from './controls';
import { Columns } from './layout';

const SortingOptions = ({ propName, sortOrder, onUpdateState }) => {
    const updateSortOrder = newValue => {
        onUpdateState({
            path: ['config', propName, 'sortOrder'],
            newValue,
        });
    };

    return (
        <Columns>
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
                        <span>{option}</span>
                    </Label>
                );
            })}
        </Columns>
    );
};

export default SortingOptions;
