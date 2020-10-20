import * as React from 'react';
import styled from 'styled-components';
import compact from 'lodash/compact';
import { IconButton, Textarea } from './controls';
import { Columns, FlexBox } from './layout';
import { LIST_DELIMETER, MAX_LIST_TEXTAREA_ROWS } from '../config';

const isColor = strColor => {
    const s = new Option().style;
    s.color = strColor;
    return s.color !== '';
};

const Swatch = ({ color }) => (
    <FlexBox justify="flex-start">
        <div
            style={{
                width: '24px',
                height: '24px',
                backgroundColor: color,
                marginRight: '6px',
                boxShadow: '0 0 3px rgba(0, 0, 0, 0.2) inset',
                borderRadius: '2px',
            }}
        />
        {color}
    </FlexBox>
);

const StyledListItem = styled.div`
    & + & {
        margin-top: 0;
    }
`;

const ListBuilder = ({ propName, list, onUpdateState }) => {
    const [isEditing, setIsEditing] = React.useState(false);
    const [uncommittedList, setUncomittedList] = React.useState('');
    const renderableList = list.split(LIST_DELIMETER);

    const updateListInState = newList => {
        onUpdateState({
            path: ['config', propName, 'list'],
            newValue: newList,
        });
    };

    const handleClickSave = () => {
        const cleanedOfEmpties = compact(
            uncommittedList.split(LIST_DELIMETER),
        ).join(LIST_DELIMETER);
        updateListInState(cleanedOfEmpties);
        setUncomittedList('');
        setIsEditing(false);
    };

    const handleChange = evt => {
        setUncomittedList(evt.currentTarget.value);
    };

    const handleToggleIsDisabled = targetIndex => {
        updateListInState(
            renderableList
                .map((listItem, index) =>
                    index !== targetIndex
                        ? listItem
                        : listItem.includes('[disabled]')
                        ? listItem.replace(/\s*\[disabled]\s*/, '')
                        : `${listItem} [disabled]`,
                )
                .join(LIST_DELIMETER),
        );
    };

    const handleClickDelete = targetIndex => {
        updateListInState(
            renderableList
                .filter((listItem, index) => index !== targetIndex)
                .join(LIST_DELIMETER),
        );
    };

    const handleClickEdit = () => {
        setUncomittedList(list);
        setIsEditing(true);
    };

    const handleClickCancel = () => {
        setUncomittedList('');
        setIsEditing(false);
    };

    const handleKeyDown = evt => {
        evt.stopPropagation();

        switch (evt.key) {
            case 'Enter':
                if (evt.metaKey) {
                    handleClickSave();
                }
                break;
            case 'Escape':
                handleClickCancel();
                break;
        }
    };

    if (isEditing) {
        return (
            <StyledListItem>
                <Columns style={{ alignItems: 'flex-end' }}>
                    <Textarea
                        rows={Math.min(
                            MAX_LIST_TEXTAREA_ROWS,
                            uncommittedList.split(LIST_DELIMETER).length,
                        )}
                        value={uncommittedList}
                        onChange={handleChange}
                        onKeyDown={handleKeyDown}
                    />
                    <FlexBox>
                        <IconButton
                            iconName="times"
                            onClick={handleClickCancel}
                        />
                        <IconButton
                            iconName="check"
                            onClick={handleClickSave}
                        />
                    </FlexBox>
                </Columns>
            </StyledListItem>
        );
    }

    return renderableList.map((item, index) => {
        const isFirstItem = index === 0;
        const isDisabled = item.includes('[disabled]');
        const printableItem = isDisabled
            ? item.replace(/\s*\[disabled]\s*/, '')
            : item;
        const isItemAColor = isColor(printableItem);

        return (
            <StyledListItem key={index}>
                <Columns onDoubleClick={handleClickEdit}>
                    <div
                        style={{
                            opacity: isDisabled ? 0.5 : 1,
                        }}
                    >
                        {isItemAColor ? (
                            <Swatch color={printableItem} />
                        ) : (
                            printableItem
                        )}
                    </div>
                    <FlexBox>
                        <IconButton
                            iconName="trash"
                            isFaded={isDisabled}
                            showOnHover={StyledListItem}
                            onClick={handleClickDelete.bind(this, index)}
                        />
                        <IconButton
                            iconName={isDisabled ? 'eye-closed' : 'eye-open'}
                            isFaded={isDisabled}
                            showOnHover={isDisabled ? null : StyledListItem}
                            onClick={handleToggleIsDisabled.bind(this, index)}
                        />
                        <IconButton
                            iconName="pencil"
                            label="Edit List"
                            style={
                                isFirstItem
                                    ? null
                                    : {
                                          visibility: 'hidden',
                                          pointerEvents: 'none',
                                      }
                            }
                            onClick={handleClickEdit}
                        />
                    </FlexBox>
                </Columns>
            </StyledListItem>
        );
    });
};

export default ListBuilder;
