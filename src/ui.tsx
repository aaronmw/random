import * as React from 'react';
import * as ReactDOM from 'react-dom';
import styled, { createGlobalStyle } from 'styled-components';
import setWith from 'lodash/setWith';
import clone from 'lodash/clone';

const COLOR_BLUE = '#18a0fb';
const COLOR_TEXT = '#333333';
const COLOR_TEXT_LIGHT = '#b3b3b3';
const FONT_WEIGHT_BOLD = 600;

const INTEGER = {
    method: 'range',
    multiplier: {
        min: 0.1,
        max: 2,
    },
    range: {
        min: 50,
        max: 200,
    },
    set: [50, 100, 200],
};

const DEGREES = {
    method: 'range',
    range: {
        min: 0,
        max: 360,
    },
    set: [0, 45, 90, 135, 180, 225, 270, 315, 360],
};

const PERCENTAGE = {
    method: 'range',
    range: {
        min: 0,
        max: 100,
    },
    set: [0, 25, 50, 75, 100],
};

const COLOR = {
    method: 'set',
    set: ['#000000', '#FF0000', '#00FF00', '#0000FF'],
};

const DEFAULT_PROP_DEFINITIONS = {
    width: { ...INTEGER },
    height: { ...INTEGER },
    x: { ...INTEGER },
    y: { ...INTEGER },
    rotation: { ...DEGREES },
    opacity: { ...PERCENTAGE },
    strokeWeight: { ...INTEGER },
    fillOpacity: { ...PERCENTAGE },
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

const Input = props => <StyledInput {...props} />;

const RunButton = styled.button`
    ${commonStyles}
    position: fixed;
    bottom: 0;
    left: 0;
    right: 0;
    background: ${COLOR_BLUE};
    color: white;
    border: 2px solid transparent;

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

    & > * {
        margin-top: 4px;

        &:first-child {
            margin-top: 0;
        }
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

const SetBuilder = ({ propName, set, onUpdateState }) => {
    const updateSet = newValue => {
        onUpdateState({
            path: ['propDefinitions', propName, 'set'],
            newValue,
        });
    };

    const handleBlur = () => {
        updateSet(
            set
                .filter(item => item !== '')
                .sort((a, b) =>
                    `${a}`.localeCompare(b, undefined, { numeric: true }),
                ),
        );
    };

    const handleChange = evt => {
        const target = evt.currentTarget;
        const indexToUpdate = parseInt(target.dataset.index);
        console.log(target, indexToUpdate);
        updateSet(
            set.map((item, index) =>
                index === indexToUpdate ? target.value : item,
            ),
        );
    };

    const handleClickDelete = evt => {
        const indexToDelete = parseInt(evt.currentTarget.dataset.index);
        updateSet(set.filter((item, itemIndex) => itemIndex !== indexToDelete));
    };

    const handleClickPlus = () => {
        updateSet(set.concat('new'));
    };

    return (
        <Rows>
            {set.map((item, index) => (
                <Columns key={index}>
                    <Input
                        data-index={index}
                        type="text"
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
                                index !== set.length - 1 ? 'hidden' : 'visible',
                            pointerEvents:
                                index !== set.length - 1 ? 'none' : 'all',
                        }}
                        onClick={handleClickPlus}
                    />
                </Columns>
            ))}
        </Rows>
    );
};

const RangeBuilder = ({ propName, methodName, min, max, onUpdateState }) => {
    const handleChange = evt => {
        const target = evt.currentTarget;
        const rangeSide = target.dataset.name;
        onUpdateState({
            path: ['propDefinitions', propName, methodName, rangeSide],
            newValue: target.value,
        });
    };

    return (
        <Columns>
            <Input
                data-name="min"
                placeholder="min"
                type="number"
                value={min}
                onChange={handleChange}
            />
            <Input
                data-name="max"
                placeholder="max"
                type="number"
                value={max}
                onChange={handleChange}
            />
        </Columns>
    );
};

const Prop = ({
    definition = {
        isActive: false,
        method: '',
        range: { min: -1, max: 1 },
        set: [],
        multiplier: { min: -1, max: 1 },
    },
    name,
    onUpdateState,
}) => {
    const { isActive, method, range, set, multiplier } = definition;

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
                {!isActive && <PlusIcon />}
                {isActive && (
                    <PropMethodTabs>
                        {['multiplier', 'set', 'range'].map(methodName => {
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
                    </PropMethodTabs>
                )}
            </PropHeader>

            {isActive && (
                <PropBody>
                    {method === 'set' ? (
                        <SetBuilder
                            propName={name}
                            set={set}
                            onUpdateState={onUpdateState}
                        />
                    ) : (
                        <RangeBuilder
                            propName={name}
                            methodName={method}
                            min={definition[method].min}
                            max={definition[method].max}
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
                    <RunButton type="submit">Get Randy</RunButton>
                </form>
            )}
        </StyledAppContainer>
    );
};

ReactDOM.render(<App />, document.getElementById('react-page'));
