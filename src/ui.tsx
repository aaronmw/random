import * as React from 'react';
import * as ReactDOM from 'react-dom';
import clone from 'lodash/clone';
import setWith from 'lodash/setWith';
import About from './components/About';
import { Icon, RunButton } from './components/controls';
import { GlobalStyles, StyledAppContainer } from './components/layout';
import { NavBar } from './components/Navigation';
import { PropConfigurator } from './components/PropConfigurator';
import SavedConfigs from './components/SavedConfigs';
import { DEFAULT_CONFIG } from './config';

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

    const handleSubmit = evt => {
        evt.preventDefault();
        sendMessage({
            type: 'run',
            params: pluginState,
        });
    };

    const handleKeyDown = evt => {
        if (
            evt.target.tagName.toLowerCase() !== 'input' &&
            evt.key === 'Escape'
        ) {
            sendMessage({ type: 'close' });
        }
    };

    const onUpdateState = ({ path, newValue }) => {
        setPluginState(pluginState =>
            setWith(clone(pluginState), path, newValue, clone),
        );
    };

    const config = pluginState.config;
    const activeRoute = pluginState.activeRoute;

    const propNames = Object.keys(config);
    const namesOfActivePropConfigs = propNames.filter(
        propName => config[propName].isActive,
    );
    const namesOfInactivePropConfigs = propNames.filter(
        propName => !config[propName].isActive,
    );
    const sortedPropNames = namesOfActivePropConfigs.concat(
        namesOfInactivePropConfigs,
    );

    return (
        <StyledAppContainer onKeyDown={handleKeyDown}>
            <GlobalStyles
                hasActivePropConfigs={namesOfActivePropConfigs.length >= 1}
            />
            <NavBar activeRoute={activeRoute} onUpdateState={onUpdateState} />
            {activeRoute === 'randomizer' && isLoaded && (
                <form onSubmit={handleSubmit}>
                    {sortedPropNames.map(propName => (
                        <PropConfigurator
                            key={propName}
                            config={config}
                            name={propName}
                            onUpdateState={onUpdateState}
                        />
                    ))}
                    <RunButton type="submit">
                        <Icon color="white" name="randomize" />
                        Randomize
                    </RunButton>
                </form>
            )}
            {activeRoute === 'saved-configs' && (
                <SavedConfigs
                    pluginState={pluginState}
                    onUpdateState={onUpdateState}
                />
            )}
            {activeRoute === 'about' && <About />}
        </StyledAppContainer>
    );
};

ReactDOM.render(<App />, document.getElementById('react-page'));
