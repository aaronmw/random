import * as React from 'react';
import * as ReactDOM from 'react-dom';
import clone from 'lodash/clone';
import setWith from 'lodash/setWith';
import About from './components/About';
import { GlobalStyles, StyledAppContainer } from './components/layout';
import { NavBar } from './components/Navigation';
import SavedConfigs from './components/SavedConfigs';
import { DEFAULT_CONFIG } from './config';
import ConfigBuilder from './components/ConfigBuilder';

export const sendMessage = payload => {
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
    config: DEFAULT_CONFIG,
    savedConfigs: [],
    activeRoute: 'randomizer',
};

const App = () => {
    const [isLoaded, setIsLoaded] = React.useState(false);
    const [pluginState, setPluginState] = React.useState(INITIAL_STATE);

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

    const onUpdateState = ({ path, newValue }) => {
        setPluginState(pluginState =>
            setWith(clone(pluginState), path, newValue, clone),
        );
    };

    const activeRoute = pluginState.activeRoute;

    return (
        <StyledAppContainer>
            <GlobalStyles />
            <NavBar activeRoute={activeRoute} onUpdateState={onUpdateState} />
            {activeRoute === 'randomizer' && isLoaded && (
                <ConfigBuilder
                    pluginState={pluginState}
                    sendMessage={sendMessage}
                    onUpdateState={onUpdateState}
                />
            )}
            {activeRoute === 'about' && <About />}
        </StyledAppContainer>
    );
};

ReactDOM.render(<App />, document.getElementById('react-page'));
