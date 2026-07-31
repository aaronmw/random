import * as React from 'react';
import { createRoot } from 'react-dom/client';
import clone from 'lodash/clone';
import setWith from 'lodash/setWith';
import About from './components/About';
import { GlobalStyles, StyledAppContainer } from './components/layout';
import { NavBar } from './components/Navigation';
import {
    DEFAULT_CONFIG,
    DEFAULT_UI_HEIGHT,
    MAX_UI_HEIGHT,
    MIN_UI_HEIGHT,
} from './config';
import ConfigBuilder from './components/ConfigBuilder';
import ResizeHandle from './components/ResizeHandle';
import { sendMessage } from './pluginMessage';

const INITIAL_STATE = {
    config: DEFAULT_CONFIG,
    savedConfigs: [],
    activeRoute: 'randomizer',
    uiHeight: DEFAULT_UI_HEIGHT,
};

const VALID_ACTIVE_ROUTES = ['randomizer', 'about'];

const toUiHeight = value => {
    if (!Number.isFinite(value)) {
        return INITIAL_STATE.uiHeight;
    }

    return Math.round(Math.max(MIN_UI_HEIGHT, Math.min(MAX_UI_HEIGHT, value)));
};

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

    nextState.uiHeight = toUiHeight(nextState.uiHeight);

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

    const onUpdateState = React.useCallback(({ path, newValue }) => {
        setPluginState(pluginState =>
            setWith(clone(pluginState), path, newValue, clone),
        );
    }, []);

    const handleResizeHeight = React.useCallback(
        height => {
            onUpdateState({
                path: ['uiHeight'],
                newValue: toUiHeight(height),
            });
        },
        [onUpdateState],
    );

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
            <ResizeHandle onResizeHeight={handleResizeHeight} />
        </StyledAppContainer>
    );
};

const mountApp = () => {
    const rootElement = document.getElementById('react-page');

    if (rootElement) {
        createRoot(rootElement).render(<App />);
        return true;
    }

    return false;
};

if (!mountApp() && document.readyState === 'loading') {
    window.addEventListener('DOMContentLoaded', mountApp, { once: true });
}
