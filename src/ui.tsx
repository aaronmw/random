import * as React from 'react';
import * as ReactDOM from 'react-dom';
import setWith from 'lodash/setWith';
import clone from 'lodash/clone';
import { RunButton } from './components/controls';
import { GlobalStyles, StyledAppContainer } from './components/layout';
import { PropConfigurator } from './components/PropConfigurator';
import { DEFAULT_PROP_DEFINITIONS } from './prop-definitions';

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
    const [pluginState, setPluginState] = React.useState(INITIAL_STATE);
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

    const propDefinitions = pluginState.propDefinitions;

    return (
        <StyledAppContainer onKeyDown={handleKeyDown}>
            <GlobalStyles />
            {isLoaded && (
                <form onSubmit={handleSubmit}>
                    {Object.keys(propDefinitions).map(propName => (
                        <PropConfigurator
                            key={propName}
                            propDefinitions={propDefinitions}
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
