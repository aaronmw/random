import * as React from 'react';
import { DeleteButton, Input, PlusButton } from './controls';
import { Columns, Rows } from './layout';

const ListBuilder = ({ propName, list, listFieldType, onUpdateState }) => {
    const updateList = newValue => {
        onUpdateState({
            path: ['propDefinitions', propName, 'list'],
            newValue,
        });
    };

    const handleBlur = () => {
        updateList(
            list
                .filter(item => item !== '')
                .sort((a, b) =>
                    `${a}`.localeCompare(b, undefined, { numeric: true }),
                ),
        );
    };

    const handleChange = evt => {
        const target = evt.currentTarget;
        const indexToUpdate = parseInt(target.dataset.index);
        updateList(
            list.map((item, index) =>
                index === indexToUpdate ? target.value : item,
            ),
        );
    };

    const handleClickDelete = evt => {
        const indexToDelete = parseInt(evt.currentTarget.dataset.index);
        updateList(
            list.filter((item, itemIndex) => itemIndex !== indexToDelete),
        );
    };

    const handleClickPlus = () => {
        updateList(list.concat('new'));
    };

    return (
        <Rows>
            {list.map((item, index) => (
                <Columns key={index}>
                    <Input
                        data-index={index}
                        type={listFieldType}
                        value={item}
                        onBlur={handleBlur}
                        onChange={handleChange}
                    />
                    <DeleteButton
                        data-index={index}
                        onClick={handleClickDelete}
                    />
                    <PlusButton
                        style={{
                            visibility:
                                index !== list.length - 1
                                    ? 'hidden'
                                    : 'visible',
                            pointerEvents:
                                index !== list.length - 1 ? 'none' : 'all',
                        }}
                        onClick={handleClickPlus}
                    />
                </Columns>
            ))}
        </Rows>
    );
};

export default ListBuilder;