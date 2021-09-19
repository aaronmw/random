import * as React from 'react';
import styled from 'styled-components';
import compact from 'lodash/compact';
import FadedOverflow from './FadedOverflow';
import { BUTTON_HEIGHT, IconButton, Textarea } from './controls';
import { COLOR_TEXT_LIGHT, Columns, FlexBox } from './layout';
import { LIST_DELIMETER, MAX_LIST_TEXTAREA_ROWS } from '../config';

const isColor = strColor => {
    return strColor.match(/^#([a-f0-9]{3}|[a-f0-9]{6})$/);
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

const ListItemContainer = styled.div`
    display: flex;
    align-items: center;
    min-height: ${BUTTON_HEIGHT};
`;

const ListItem = ({ item, onDelete, onEdit, onToggleDisabled }) => {
    const isDisabled = item.includes('[disabled]');
    const printableItem = isDisabled
        ? item.replace(/\s*\[disabled]\s*/, '')
        : item;
    const isItemAColor = isColor(printableItem);

    return (
        <ListItemContainer>
            <Columns
                title="Click to Edit"
                onClick={onEdit}
                style={{ cursor: 'pointer' }}
            >
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
                        showOnHover={ListItemContainer}
                        onClick={onDelete}
                    />
                    <IconButton
                        iconName={isDisabled ? 'eye-closed' : 'eye-open'}
                        isFaded={isDisabled}
                        showOnHover={isDisabled ? null : ListItemContainer}
                        onClick={onToggleDisabled}
                    />
                    <IconButton
                        iconName="pencil"
                        label="Edit List"
                        style={{
                            visibility: 'hidden',
                            pointerEvents: 'none',
                        }}
                    />
                </FlexBox>
            </Columns>
        </ListItemContainer>
    );
};

const EditButton = styled(IconButton).attrs({
    iconName: 'pencil',
    label: 'Edit List',
})`
    position: absolute;
    top: 0;
    right: 0;
    z-index: 99;
`;

const ListBuilder = ({ propName, list, onUpdateState }) => {
    const [isEditing, setIsEditing] = React.useState(false);
    const [uncommittedList, setUncomittedList] = React.useState('');
    const renderableList = React.useMemo(
        () => list.split(LIST_DELIMETER),
        [list],
    );

    const updateListInState = React.useCallback(newList => {
        onUpdateState({
            path: ['config', propName, 'list'],
            newValue: newList,
        });
    }, []);

    const handleClickSave = React.useCallback(() => {
        const cleanedOfEmpties = compact(
            uncommittedList.split(LIST_DELIMETER),
        ).join(LIST_DELIMETER);
        updateListInState(cleanedOfEmpties);
        setUncomittedList('');
        setIsEditing(false);
    }, [uncommittedList]);

    const handleChange = React.useCallback(evt => {
        setUncomittedList(evt.currentTarget.value);
    }, []);

    const handleToggleIsDisabled = React.useCallback(
        (targetIndex, evt) => {
            evt.stopPropagation();
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
        },
        [renderableList],
    );

    const handleClickDelete = React.useCallback(
        (targetIndex, evt) => {
            evt.stopPropagation();
            updateListInState(
                renderableList
                    .filter((listItem, index) => index !== targetIndex)
                    .join(LIST_DELIMETER),
            );
        },
        [renderableList],
    );

    const handleClickEdit = React.useCallback(() => {
        setUncomittedList(list);
        setIsEditing(true);
    }, [list]);

    const handleClickCancel = React.useCallback(() => {
        setUncomittedList('');
        setIsEditing(false);
    }, []);

    const handleKeyDown = React.useCallback(
        evt => {
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
        },
        [handleClickCancel, handleClickSave],
    );

    if (isEditing) {
        return (
            <ListItemContainer>
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
            </ListItemContainer>
        );
    }

    const hasItems = compact(renderableList).length >= 1;

    return (
        <div
            style={{ cursor: 'pointer', position: 'relative' }}
            onClick={handleClickEdit}
        >
            <EditButton />
            <FadedOverflow maxHeight={300}>
                {!hasItems && (
                    <ListItemContainer style={{ color: COLOR_TEXT_LIGHT }}>
                        List is empty — click to edit
                    </ListItemContainer>
                )}
                {hasItems &&
                    renderableList.map((item, index) => {
                        return (
                            <ListItem
                                item={item}
                                key={index}
                                onDelete={handleClickDelete.bind(this, index)}
                                onEdit={handleClickEdit.bind(this, index)}
                                onToggleDisabled={handleToggleIsDisabled.bind(
                                    this,
                                    index,
                                )}
                            />
                        );
                    })}
            </FadedOverflow>
        </div>
    );
};

export default React.memo(ListBuilder);
