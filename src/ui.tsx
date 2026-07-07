import * as React from 'react';
import { createRoot } from 'react-dom/client';
import clone from 'lodash/clone';
import setWith from 'lodash/setWith';
import About from './components/About';
import { GlobalStyles, StyledAppContainer } from './components/layout';
import { NavBar } from './components/Navigation';
import { DEFAULT_CONFIG } from './config';
import ConfigBuilder from './components/ConfigBuilder';
import { sendMessage } from './pluginMessage';

const INITIAL_STATE = {
    config: DEFAULT_CONFIG,
    savedConfigs: [],
    activeRoute: 'randomizer',
};

const VALID_ACTIVE_ROUTES = ['randomizer', 'about'];

const sanitizePluginState = state => {
    const safeState =
        state !== null && typeof state === 'object' ? state : {};
    const nextState = {
        ...INITIAL_STATE,
        ...safeState,
    };

    if (!VALID_ACTIVE_ROUTES.includes(nextState.activeRoute)) {
        nextState.activeRoute = INITIAL_STATE.activeRoute;
    }

    if (!nextState.config || typeof nextState.config !== 'object') {
        nextState.config = INITIAL_STATE.config;
    }

    if (!Array.isArray(nextState.savedConfigs)) {
        nextState.savedConfigs = INITIAL_STATE.savedConfigs;
    }

    return nextState;
};

export const App = () => {
    const [isLoaded, setIsLoaded] = React.useState(false);
    const [pluginState, setPluginState] = React.useState(INITIAL_STATE);

    React.useEffect(() => {
        let hasReceivedInitialState = false;

        const requestInitialState = () => {
            sendMessage({
                type: 'init',
                initialState: INITIAL_STATE,
            });
        };

        const handleMessage = message => {
            const savedState = message.data && message.data.pluginMessage;

            if (!savedState) {
                return;
            }

            hasReceivedInitialState = true;

            setPluginState(sanitizePluginState(savedState));
            setIsLoaded(true);
        };

        window.addEventListener('message', handleMessage);
        requestInitialState();

        const retryTimeout = window.setTimeout(() => {
            if (!hasReceivedInitialState) {
                requestInitialState();
            }
        }, 750);

        return () => {
            window.clearTimeout(retryTimeout);
            window.removeEventListener('message', handleMessage);
        };
    }, []);

    React.useEffect(() => {
        if (!isLoaded) {
            return;
        }

        sendMessage({
            type: 'saveState',
            params: pluginState,
        });
    }, [isLoaded, pluginState]);

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
            {activeRoute === 'randomizer' && (
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

const rootElement = document.getElementById('react-page');

if (rootElement) {
    createRoot(rootElement).render(<App />);
}
