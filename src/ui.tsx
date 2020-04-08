import * as React from 'react';
import * as ReactDOM from 'react-dom';
import styled, { createGlobalStyle } from 'styled-components';
import get from 'lodash/get';
import setWith from 'lodash/setWith';
import clone from 'lodash/clone';

/* TODO:
    - Dance 👯
 */

const COLOR_BLUE = '#18a0fb';
const COLOR_TEXT = '#333333';
const COLOR_TEXT_LIGHT = '#b3b3b3';
const FONT_WEIGHT_BOLD = 600;

const STRING = {
    listFieldType: 'text',
    method: 'list',
    groupThousands: true,
    prefix: '',
    suffix: '',
    calc: {
        operator: 'add',
        decimalPlaces: 0,
        add: {
            min: -50,
            max: 50,
        },
        multiply: {
            min: 0.5,
            max: 1.5,
        },
    },
    range: {
        min: 50,
        max: 200,
    },
    list: ['John Doe', 'Jane Smith', 'Randy Randomson'],
};

const INTEGER = {
    listFieldType: 'number',
    method: 'range',
    calc: {
        operator: 'add',
        add: {
            min: -50,
            max: 50,
        },
        multiply: {
            min: 0.5,
            max: 1.5,
        },
    },
    range: {
        min: 50,
        max: 200,
    },
    list: [50, 100, 200],
};

const DEGREES = {
    listFieldType: 'number',
    method: 'range',
    range: {
        min: 0,
        max: 360,
    },
    list: [0, 45, 90, 135, 180, 225, 270, 315, 360],
};

const PERCENTAGE = {
    listFieldType: 'number',
    method: 'range',
    range: {
        min: 0,
        max: 100,
    },
    list: [0, 25, 50, 75, 100],
};

const COLOR = {
    listFieldType: 'text',
    method: 'list',
    list: ['#000000', '#FF0000', '#00FF00', '#0000FF'],
};

const DEFAULT_PROP_DEFINITIONS = {
    text: { ...STRING },
    width: { ...INTEGER, preserveAspectRatio: false },
    height: { ...INTEGER, preserveAspectRatio: false },
    x: { ...INTEGER },
    y: { ...INTEGER },
    opacity: { ...PERCENTAGE },
    rotation: { ...DEGREES },
    fillColor: { ...COLOR },
    fillOpacity: { ...PERCENTAGE },
    strokeColor: { ...COLOR },
    strokeOpacity: { ...PERCENTAGE },
    strokeWeight: { ...INTEGER },
    layerBlur: { ...INTEGER },
    arcStartingAngle: { ...DEGREES },
    arcEndingAngle: { ...DEGREES },
};

const GlobalStyles = createGlobalStyle`
    * {
        margin: 0;
        padding: 0;
        box-sizing: border-box;
        outline: none;
        background-color: inherit;
        border: none;
        font-size: 1rem;
        line-height: 1rem;
    }
    :root {
        font-family: Inter, sans-serif;
        font-size: 11px;
        letter-spacing: 0.5;
        background: radial-gradient(white, hsl(0, 0%, 95%));
        user-select: none;
        color: ${COLOR_TEXT};
        -webkit-font-smoothing: subpixel-antialiased;
        padding-bottom: 30px;
    }
`;

const StyledAppContainer = styled.div``;

const commonStyles = `
    display: block;
    height: 30px;
    width: 100%;
    text-align: center;
    background-color: white;
`;

const StyledInput = styled.input`
    ${commonStyles}
    border: 1px solid #e1e1e1;
    border-radius: 3px;

    &:focus {
        border: 2px solid ${COLOR_BLUE};
    }
`;

const ColorSwatch = styled.div`
    position: relative;
    width: 100%;
    &:before {
        content: '';
        position: absolute;
        left: 4px;
        top: 4px;
        width: 22px;
        height: 22px;
        background-color: ${props => props.color};
        border-radius: 2px;
    }
`;

const Input = props => {
    const { value } = props;
    const isColor = `${value}`.trim().match(/^#[0-9a-f]{3,6}$/i);
    const InputEl = <StyledInput {...props} />;
    return isColor ? (
        <ColorSwatch color={value}>{InputEl}</ColorSwatch>
    ) : (
        InputEl
    );
};

const Label = styled.label`
    display: flex;
    white-space: nowrap;
    margin-top: 8px;
    align-items: center;

    & > :first-child {
        margin-right: 4px;
    }
    & > [type='radio'] {
        position: relative;
        top: -1px;
    }
    & + & {
        margin-left: 15px !important;
    }
`;

const InputLabel = styled.span`
    display: inline-block;
    flex-shrink: 0;
    flex-grow: 1;
    width: 35px;
    text-align: right;
`;

const RunButton = styled.button`
    ${commonStyles}
    position: fixed;
    bottom: 0;
    left: 0;
    right: 0;
    background: ${COLOR_BLUE};
    color: white;
    border: 2px solid transparent;
    line-height: 0;

    &:active {
        background: #1170ae;
    }
    &:focus {
        border: 2px solid #1170ae;
    }
`;

const PropContainer = styled.div`
    background-color: white;
    padding: 15px;

    &.is-active {
        &:not(:first-child) {
            border-top: 1px solid #dfdfdf;
        }
        border-bottom: 1px solid #dfdfdf;

        & + .is-active {
            border-top: 0;
        }
    }
`;

const PropHeader = styled.div`
    display: flex;
    justify-content: space-between;
    align-items: center;
    font-weight: 400;
    color: ${COLOR_BLUE};
    cursor: pointer;

    &.is-active {
        font-weight: ${FONT_WEIGHT_BOLD};
        color: ${COLOR_TEXT};
    }
`;

const PropBody = styled.div`
    margin-top: 8px;
`;

const PropMethodTabs = styled.div`
    display: flex;
    justify-content: flex-end;
    align-items: center;
`;

const PropMethodTab = styled.button`
    display: flex;
    justify-content: center;
    align-items: center;
    padding: 0 8px;
    padding-bottom: 2px;
    border-radius: 100px;
    cursor: pointer;
    font-weight: 400;
    background-color: white;
    color: ${COLOR_BLUE};
    border: 2px solid transparent;

    &.is-active {
        font-weight: ${FONT_WEIGHT_BOLD};
        background-color: ${COLOR_BLUE};
        color: white;
    }

    &:focus {
        border: 2px solid ${COLOR_BLUE};
    }
`;

const Columns = styled.div`
    display: flex;
    align-items: center;
    justify-content: flex- ${props => (props.align ? props.align : 'end')};

    & + * {
        margin-top: 8px;
    }
    & > * {
        margin-left: 8px;

        &:first-child {
            margin-left: 0;
        }
    }
`;

const Rows = styled.div`
    display: flex;
    flex-direction: column;
    align-items: stretch;
    justify-content: center;

    & + * {
        margin-top: 8px;
    }
    & > * {
        margin-top: 4px;

        &:first-child {
            margin-top: 0;
        }
    }
`;

const ToggleSwitch = styled.div`
    border: 2px solid
        ${props => (props.isActive ? COLOR_BLUE : COLOR_TEXT_LIGHT)};
    border-radius: 100px;
    width: 30px;
    height: 17px;
    padding: 2px;
    display: flex;
    justify-content: ${props => (props.isActive ? 'flex-end' : 'flex-start')};
    margin-left: 8px;

    &:before {
        content: '';
        display: block;
        width: 9px;
        height: 9px;
        border-radius: 100px;
        background-color: ${props =>
            props.isActive ? COLOR_BLUE : COLOR_TEXT_LIGHT};
    }
`;

const PlusIcon = () => (
    <svg
        width="11"
        height="11"
        viewBox="0 0 11 11"
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
    >
        <path d="M5 0H6V11H5V0Z" fill="#18A0FB" />
        <path d="M11 5V6L0 6L4.37113e-08 5L11 5Z" fill="#18A0FB" />
    </svg>
);

const StyledPlusButton = styled.button`
    width: 30px;
    height: 30px;
    display: flex;
    align-items: center;
    justify-content: center;
    cursor: pointer;

    &:focus {
        border: 2px solid ${COLOR_BLUE};
    }
`;

const PlusButton = ({ onClick = e => null, ...otherProps }) => (
    <StyledPlusButton
        onClick={evt => {
            evt.preventDefault();
            onClick(evt);
        }}
        {...otherProps}
    >
        <PlusIcon />
    </StyledPlusButton>
);

const DeleteButton = styled(PlusButton)`
    & > * {
        transform: rotate(45deg);
    }
`;

const PrefixSuffixBuilder = ({ prefix, suffix, onUpdateState }) => {
    const handleChange = (evt, prefixOrSuffix) => {
        const newValue = evt.currentTarget.value;
        onUpdateState({
            path: ['propDefinitions', 'text', prefixOrSuffix],
            newValue,
        });
    };

    return (
        <Columns>
            <InputLabel>prefix:</InputLabel>
            <Input
                type="text"
                value={prefix}
                onChange={evt => handleChange(evt, 'prefix')}
            />
            <InputLabel>suffix:</InputLabel>
            <Input
                type="text"
                value={suffix}
                onChange={evt => handleChange(evt, 'suffix')}
            />
        </Columns>
    );
};

const FormatOptions = ({ groupThousands, decimalPlaces, onUpdateState }) => {
    const updateGroupThousands = () => {
        onUpdateState({
            path: ['propDefinitions', 'text', 'groupThousands'],
            newValue: !groupThousands,
        });
    };

    const updateDecimalPlaces = evt => {
        onUpdateState({
            path: ['propDefinitions', 'text', 'calc', 'decimalPlaces'],
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

const ResizeOptions = ({ propName, preserveAspectRatio, onUpdateState }) => {
    const updatePreserveAspectRatio = () => {
        onUpdateState({
            path: ['propDefinitions', propName, 'preserveAspectRatio'],
            newValue: !preserveAspectRatio,
        });
    };

    return (
        <Label>
            <input
                type="checkbox"
                checked={preserveAspectRatio}
                onChange={updatePreserveAspectRatio}
            />{' '}
            <span>Preserve Aspect Ratio</span>
        </Label>
    );
};

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

const RangeBuilder = ({ propName, min, max, onUpdateState }) => {
    const handleChange = evt => {
        const target = evt.currentTarget;
        const minOrMax = target.dataset.name;
        onUpdateState({
            path: ['propDefinitions', propName, 'range', minOrMax],
            newValue: target.value,
        });
    };

    return (
        <Columns>
            <InputLabel>min:</InputLabel>
            <Input
                data-name="min"
                type="number"
                value={min}
                onChange={handleChange}
            />
            <InputLabel>max:</InputLabel>
            <Input
                data-name="max"
                type="number"
                value={max}
                onChange={handleChange}
            />
        </Columns>
    );
};

const CalcBuilder = ({ propName, operator, min, max, onUpdateState }) => {
    const updateMinOrMax = evt => {
        const target = evt.currentTarget;
        const minOrMax = target.dataset.name;
        onUpdateState({
            path: ['propDefinitions', propName, 'calc', operator, minOrMax],
            newValue: target.value,
        });
    };

    const updateOperator = evt => {
        onUpdateState({
            path: ['propDefinitions', propName, 'calc', 'operator'],
            newValue: evt.currentTarget.value,
        });
    };

    return (
        <>
            <Columns>
                <InputLabel>min:</InputLabel>
                <Input
                    data-name="min"
                    type="number"
                    value={min}
                    onChange={updateMinOrMax}
                />
                <InputLabel>max:</InputLabel>
                <Input
                    data-name="max"
                    type="number"
                    value={max}
                    onChange={updateMinOrMax}
                />
            </Columns>
            <Columns align="start">
                <Label>
                    <input
                        name={`${propName}-operator`}
                        type="radio"
                        checked={operator === 'add'}
                        value="add"
                        onChange={updateOperator}
                    />{' '}
                    <span>Add</span>
                </Label>
                <Label>
                    <input
                        name={`${propName}-operator`}
                        type="radio"
                        checked={operator === 'multiply'}
                        value="multiply"
                        onChange={updateOperator}
                    />{' '}
                    <span>Multiply</span>
                </Label>
            </Columns>
        </>
    );
};

const Prop = ({
    definition = {
        listFieldType: '',
        isActive: false,
        method: '',
        range: { min: -1, max: 1 },
        list: [],
        calc: {
            operator: '',
            decimalPlaces: 0,
            add: { min: 0, max: 0 },
            multiply: { min: 0, max: 0 },
        },
        prefix: '',
        suffix: '',
        groupThousands: null,
        preserveAspectRatio: null,
    },
    name,
    onUpdateState,
}) => {
    const listFieldType = get(definition, 'listFieldType');
    const isActive = get(definition, 'isActive');
    const groupThousands = get(definition, 'groupThousands');
    const preserveAspectRatio = get(
        definition,
        'preserveAspectRatio',
        undefined,
    );
    const list = get(definition, 'list');
    const method = get(definition, 'method');
    const operator = get(definition, ['calc', 'operator']);
    const calcMin = get(definition, ['calc', operator, 'min']);
    const calcMax = get(definition, ['calc', operator, 'max']);
    const prefix = get(definition, 'prefix');
    const rangeMin = get(definition, ['range', 'min']);
    const rangeMax = get(definition, ['range', 'max']);
    const suffix = get(definition, 'suffix');

    const handlePropHeaderClick = () => {
        onUpdateState({
            path: ['propDefinitions', name, 'isActive'],
            newValue: !isActive,
        });
    };

    const handleMethodTabClick = ({ methodName }) => {
        onUpdateState({
            path: ['propDefinitions', name, 'method'],
            newValue: methodName,
        });
    };

    const commonProps = {
        className: isActive ? 'is-active' : '',
    };

    return (
        <PropContainer {...commonProps}>
            <PropHeader onClick={handlePropHeaderClick} {...commonProps}>
                {name}
                <PropMethodTabs>
                    {isActive &&
                        ['calc', 'list', 'range'].map(methodName => {
                            if (definition[methodName]) {
                                const isTabActive = methodName === method;

                                return (
                                    <PropMethodTab
                                        key={methodName}
                                        className={
                                            isTabActive ? 'is-active' : ''
                                        }
                                        isActive={isTabActive}
                                        onClick={evt => {
                                            evt.stopPropagation();
                                            evt.preventDefault();
                                            handleMethodTabClick({
                                                methodName,
                                            });
                                        }}
                                    >
                                        {methodName}
                                    </PropMethodTab>
                                );
                            }
                        })}
                    <ToggleSwitch isActive={isActive} />
                </PropMethodTabs>
            </PropHeader>

            {isActive && (
                <PropBody>
                    {method === 'list' ? (
                        <ListBuilder
                            propName={name}
                            list={list}
                            listFieldType={listFieldType}
                            onUpdateState={onUpdateState}
                        />
                    ) : method === 'range' ? (
                        <RangeBuilder
                            propName={name}
                            min={rangeMin}
                            max={rangeMax}
                            onUpdateState={onUpdateState}
                        />
                    ) : (
                        <CalcBuilder
                            propName={name}
                            operator={operator}
                            min={calcMin}
                            max={calcMax}
                            onUpdateState={onUpdateState}
                        />
                    )}
                    {preserveAspectRatio !== undefined && (
                        <ResizeOptions
                            propName={name}
                            preserveAspectRatio={preserveAspectRatio}
                            onUpdateState={onUpdateState}
                        />
                    )}
                    {name === 'text' && method === 'calc' && (
                        <FormatOptions
                            decimalPlaces={get(
                                definition,
                                ['calc', 'decimalPlaces'],
                                0,
                            )}
                            groupThousands={groupThousands}
                            onUpdateState={onUpdateState}
                        />
                    )}
                    {name === 'text' && (
                        <PrefixSuffixBuilder
                            prefix={prefix}
                            suffix={suffix}
                            onUpdateState={onUpdateState}
                        />
                    )}
                </PropBody>
            )}
        </PropContainer>
    );
};

const sendMessage = payload => {
    parent.postMessage(
        {
            pluginMessage: {
                ...JSON.parse(JSON.stringify(payload)),
            },
        },
        '*',
    );
};

const INITIAL_STATE = {
    propDefinitions: DEFAULT_PROP_DEFINITIONS,
};

const App = () => {
    const [isLoaded, setIsLoaded] = React.useState(false);
    const [pluginState, setPluginState] = React.useState(null);
    const initialFocusRef = { current: null };

    onmessage = message => {
        const savedState = message.data.pluginMessage;

        setPluginState({
            ...INITIAL_STATE,
            ...savedState,
        });

        if (!isLoaded) {
            setIsLoaded(true);
        }
    };

    React.useEffect(() => {
        sendMessage({
            type: 'init',
            initialState: INITIAL_STATE,
        });
    }, []);

    React.useEffect(() => {
        sendMessage({
            type: 'saveState',
            params: pluginState,
        });
    }, [pluginState]);

    React.useEffect(() => {
        if (isLoaded) {
            // initialFocusRef.current.focus();
        }
    }, [isLoaded]);

    const handleSubmit = evt => {
        evt.preventDefault();
        sendMessage({
            type: 'run',
            params: pluginState,
        });
    };

    const handleKeyDown = evt => {
        if (evt.key === 'Escape') {
            sendMessage({ type: 'close' });
        }
    };

    const onUpdateState = ({ path, newValue }) => {
        setPluginState(pluginState =>
            setWith(clone(pluginState), path, newValue, clone),
        );
    };

    return (
        <StyledAppContainer onKeyDown={handleKeyDown}>
            <GlobalStyles />
            {isLoaded && (
                <form onSubmit={handleSubmit}>
                    {Object.keys(pluginState.propDefinitions).map(propName => (
                        <Prop
                            key={propName}
                            definition={pluginState.propDefinitions[propName]}
                            name={propName}
                            onUpdateState={onUpdateState}
                        />
                    ))}
                    <RunButton type="submit">Randomize</RunButton>
                </form>
            )}
        </StyledAppContainer>
    );
};

ReactDOM.render(<App />, document.getElementById('react-page'));
