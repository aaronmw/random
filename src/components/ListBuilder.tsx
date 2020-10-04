import * as React from 'react';
import { IconButton, Input } from './controls';
import { Columns, Row } from './layout';

const EMPTY_ITEM = {
    value: '',
    isDisabled: false,
};

const ListBuilder = ({ propName, list, listFieldType, onUpdateState }) => {
    const [listBeingRendered, setListBeingRendered] = React.useState(list);

    React.useEffect(() => {
        const newLabelInput = document.getElementsByClassName(
            'is-new-label-input',
        );

        if (newLabelInput.length) {
            (newLabelInput[0] as any).focus();
        }
    }, [listBeingRendered]);

    const updateListInState = newList => {
        onUpdateState({
            path: ['config', propName, 'list'],
            newValue: newList.sort((a, b) =>
                `${a}`.localeCompare(b, undefined, { numeric: true }),
            ),
        });
        setListBeingRendered(newList);
    };

    const getListWithUpdatedItem = (targetList, targetIndex, key, value) => {
        return targetList.map((listItem, index) => {
            if (index === targetIndex) {
                return {
                    ...listItem,
                    [key]: value,
                };
            }
            return listItem;
        });
    };

    const handleBlur = () => {
        updateListInState(
            listBeingRendered.filter(listItem => listItem.value.trim() !== ''),
        );
    };

    const handleChange = (targetIndex, evt) => {
        const target = evt.currentTarget;
        const newValue =
            listFieldType === 'number' ? parseInt(target.value) : target.value;

        setListBeingRendered(
            getListWithUpdatedItem(
                listBeingRendered,
                targetIndex,
                'value',
                newValue,
            ),
        );
    };

    const handleToggleIsDisabled = targetIndex => {
        updateListInState(
            getListWithUpdatedItem(
                listBeingRendered,
                targetIndex,
                'isDisabled',
                !listBeingRendered[targetIndex].isDisabled,
            ),
        );
    };

    const handleClickDelete = targetIndex => {
        updateListInState(
            listBeingRendered.filter(
                (item, itemIndex) => itemIndex !== targetIndex,
            ),
        );
    };

    const handleClickPlus = () => {
        setListBeingRendered(listBeingRendered.concat(EMPTY_ITEM));
    };

    const handleFocus = (targetIndex, evt) => {
        const target = evt.target;
        target.dataset.valueUponFocus = target.value;
    };

    const handleKeyDown = (targetIndex, evt) => {
        const targetElement = evt.target;

        switch (evt.key) {
            case 'Enter':
                targetElement.blur();
                break;
            case 'Escape':
                const { valueUponFocus } = targetElement.dataset;
                if (valueUponFocus === '') {
                    handleClickDelete(targetIndex);
                } else {
                    targetElement.value = valueUponFocus;
                }
                break;
        }
    };

    const defaultValue = listFieldType === 'number' ? 0 : '';
    const isOnlyItem = listBeingRendered.length <= 1;
    const show = {};
    const hide = {
        visibility: 'hidden',
        pointerEvents: 'none',
    };

    return listBeingRendered.map((item, index) => {
        const isLastItem = index === listBeingRendered.length - 1;
        const { value, isDisabled } = item;

        return (
            <Row key={index}>
                <Columns>
                    <Input
                        className={value === '' ? 'is-new-label-input' : null}
                        disabled={isDisabled}
                        type={listFieldType}
                        value={value || defaultValue}
                        onBlur={handleBlur.bind(this, index)}
                        onChange={handleChange.bind(this, index)}
                        onFocus={handleFocus.bind(this, index)}
                        onKeyDown={handleKeyDown.bind(this, index)}
                    />
                    <Columns noSpacing>
                        <IconButton
                            iconName={isDisabled ? 'eye-closed' : 'eye-open'}
                            isFaded={isDisabled}
                            style={isOnlyItem ? hide : show}
                            onClick={handleToggleIsDisabled.bind(this, index)}
                        />
                        <IconButton
                            iconName="times"
                            style={isOnlyItem ? hide : show}
                            onClick={handleClickDelete.bind(this, index)}
                        />
                        <IconButton
                            iconName="plus"
                            style={isLastItem ? show : hide}
                            onClick={handleClickPlus}
                        />
                    </Columns>
                </Columns>
            </Row>
        );
    });
};

export default ListBuilder;
