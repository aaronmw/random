import * as React from 'react';
import { IconButton, Input } from './controls';
import { Columns, Row } from './layout';

const ListBuilder = ({ propName, list, listFieldType, onUpdateState }) => {
    const [sortedList, setSortedList] = React.useState(list);

    React.useEffect(() => {
        setSortedList(
            list.sort((a, b) =>
                `${a}`.localeCompare(b, undefined, { numeric: true }),
            ),
        );
    }, [list]);

    React.useEffect(() => {
        const newLabelInput = document.getElementsByClassName(
            'is-new-label-input',
        );

        if (newLabelInput.length) {
            (newLabelInput[0] as any).focus();
        }
    }, [sortedList]);

    const updateList = newValue => {
        onUpdateState({
            path: ['config', propName, 'list'],
            newValue,
        });
    };

    const handleBlur = () => {
        updateList(sortedList.filter(item => item !== ''));
    };

    const handleChange = (targetIndex, evt) => {
        const target = evt.currentTarget;

        setSortedList(
            sortedList.map((item, index) =>
                index === targetIndex ? target.value : item,
            ),
        );
    };

    const handleClickDelete = targetIndex => {
        updateList(list.filter((item, itemIndex) => itemIndex !== targetIndex));
    };

    const handleClickPlus = () => {
        setSortedList(sortedList.concat(''));
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

    return sortedList.map((item, index) => (
        <Row key={index}>
            <Columns>
                <Input
                    className={item === '' ? 'is-new-label-input' : null}
                    type={listFieldType}
                    value={item}
                    onBlur={handleBlur.bind(this, index)}
                    onChange={handleChange.bind(this, index)}
                    onFocus={handleFocus.bind(this, index)}
                    onKeyDown={handleKeyDown.bind(this, index)}
                />
                <IconButton
                    iconName="times"
                    onClick={handleClickDelete.bind(this, index)}
                />
                <IconButton
                    iconName="plus"
                    style={
                        index !== sortedList.length - 1
                            ? {
                                  visibility: 'hidden',
                                  pointerEvents: 'none',
                              }
                            : null
                    }
                    onClick={handleClickPlus}
                />
            </Columns>
        </Row>
    ));
};

export default ListBuilder;
