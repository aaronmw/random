import * as React from 'react';
import * as ReactDOM from 'react-dom';
import styled, { createGlobalStyle } from 'styled-components';
import clamp from 'lodash/clamp';
import setWith from 'lodash/setWith';
import clone from 'lodash/clone';

const INTEGER = {
    format: (value) => parseInt(value),
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
    format: (value) => parseFloat(value),
    method: 'range',
    range: {
        min: 0,
        max: 360,
    },
    set: [0, 45, 90, 135, 180, 225, 270, 315, 360],
};

const PERCENTAGE = {
    format: (value) => clamp(value, 0, 100),
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
    width: { ...INTEGER, isActive: true },
    height: { ...INTEGER },
    x: { ...INTEGER },
    y: { ...INTEGER },
    rotation: { ...DEGREES },
    opacity: { ...PERCENTAGE },
    strokeWidth: { ...INTEGER },
    strokeColor: { ...COLOR },
    fillColor: { ...COLOR },
    fillOpacity: { ...PERCENTAGE },
    fontSize: { ...INTEGER },
    layerBlur: { ...INTEGER },
};

const GlobalStyles = createGlobalStyle`
    * {
        margin: 0;
        padding: 0;
        box-sizing: border-box;
        outline: none;
    }
    :root {
        font-family: Inter, sans-serif;
        font-size: 11px;
        letter-spacing: 0.5;
        background: radial-gradient(white, hsl(0, 0%, 95%));
    }
`;

const StyledAppContainer = styled.div``;

const commonStyles = `
    display: block;
    height: 30px;
    margin-bottom: 8px;
    width: 100%;
    text-align: center;
    background-color: white;
`;

const StyledInput = styled.input`
    ${commonStyles}
    border: 1px solid #e1e1e1;
    border-radius: 3px;

    &:focus {
        border: 2px solid #18a0fb;
    }
`;

const Input = (props) => <StyledInput {...props} />;

const Button = styled.button`
    ${commonStyles}
    background: #18a0fb;
    color: white;
    border-radius: 8px;
    border: 0;

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
    border-bottom: 1px solid #dfdfdf;
`;

const PropHeader = styled.div`
    display: flex;
    justify-content: space-between;
    font-weight: ${(props) => (props.isActive ? 600 : 400)};
    color: ${(props) => (props.isActive ? 'black' : '#18a0fb')};
`;

const PropMethodTabs = styled.div`
    display: flex;
    justify-content: flex-end;
    align-items: center;
`;

const PropMethodTab = styled.div`
    display: flex;
    justify-content: center;
    align-items: center;
    padding: 0 8px;
    border-radius: 100px;
    cursor: pointer;
    background-color: ${(props) => (props.isActive ? '#18a0fb' : 'white')};
    color: ${(props) => (props.isActive ? 'white' : 'black')};
`;

const PropMethodTabContents = styled.div`
    display: flex;
    margin-top: 8px;

    & > * {
        margin-left: 8px;

        &:first-child {
            margin-left: 0;
        }
    }
`;

const Prop = ({
    definition = {
        isActive: false,
        format: (v) => v,
        method: '',
        range: { min: -1, max: 1 },
        set: [],
        multiplier: { min: -1, max: 1 },
    },
    name,
    onUpdateState,
}) => {
    const { isActive, format, method, range, set, multiplier } = definition;

    const handleMethodTabClick = ({ methodName }) => {
        onUpdateState({
            path: ['propDefinitions', name, 'method'],
            newValue: methodName,
        });
    };

    return (
        <PropContainer>
            <PropHeader isActive={isActive}>
                {name}
                {isActive && (
                    <PropMethodTabs>
                        {['range', 'set', 'multiplier'].map((methodName) => {
                            if (definition[methodName]) {
                                return (
                                    <PropMethodTab
                                        key={methodName}
                                        isActive={methodName === method}
                                        onClick={() => {
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
                <>
                    {method === 'set' && (
                        <PropMethodTabContents>Set</PropMethodTabContents>
                    )}
                    {method === 'range' && (
                        <PropMethodTabContents>
                            <Input
                                id={`${name}-min`}
                                placeholder="min"
                                type="number"
                                value={range.min}
                                onChange={(evt) => {
                                    onUpdateState({
                                        path: [
                                            'propDefinitions',
                                            name,
                                            'range',
                                            'min',
                                        ],
                                        newValue: evt.target.value,
                                    });
                                }}
                            />
                            <Input
                                id={`${name}-max`}
                                placeholder="max"
                                type="number"
                                value={range.max}
                                onChange={(evt) => {
                                    onUpdateState({
                                        path: [
                                            'propDefinitions',
                                            name,
                                            'range',
                                            'max',
                                        ],
                                        newValue: evt.target.value,
                                    });
                                }}
                            />
                        </PropMethodTabContents>
                    )}
                    {method === 'multiplier' && (
                        <PropMethodTabContents>
                            Multiplier
                        </PropMethodTabContents>
                    )}
                </>
            )}
        </PropContainer>
    );
};

const sendMessage = (payload) => {
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

    onmessage = (message) => {
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

    const handleSubmit = () => {
        sendMessage({
            type: 'run',
            params: pluginState,
        });
    };

    const handleKeyDown = (evt) => {
        if (evt.key === 'Escape') {
            sendMessage({ type: 'close' });
        }
    };

    const onUpdateState = ({ path, newValue }) => {
        setPluginState((pluginState) =>
            setWith(clone(pluginState), path, newValue, clone),
        );
    };

    return (
        <StyledAppContainer onKeyDown={handleKeyDown}>
            <GlobalStyles />
            {isLoaded && (
                <form onSubmit={handleSubmit}>
                    {Object.keys(pluginState.propDefinitions).map(
                        (propName) => (
                            <Prop
                                key={propName}
                                definition={
                                    pluginState.propDefinitions[propName]
                                }
                                name={propName}
                                onUpdateState={onUpdateState}
                            />
                        ),
                    )}
                    <Button type="submit">Run</Button>
                </form>
            )}
        </StyledAppContainer>
    );
};

ReactDOM.render(<App />, document.getElementById('react-page'));
