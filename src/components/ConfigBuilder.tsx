import * as React from 'react';
import { createGlobalStyle } from 'styled-components';
import PropConfigBuilder from './PropConfigBuilder';
import { Icon, RunButton } from './controls';
import { Columns } from './layout';
import SavedConfigDrawer from './SavedConfigDrawer';
import { DEFAULT_CONFIG } from '../config';

const GlobalStyles = createGlobalStyle(
    props => `
        :root {
            background-color: ${props.hasActivePropConfigs ? null : 'white'};
        }
    `,
);

const FALLBACK_PLUGIN_STATE = {
    config: DEFAULT_CONFIG,
    savedConfigs: [],
    activeRoute: 'randomizer',
};

const getSafePluginState = pluginState => {
    const safeState =
        pluginState !== null && typeof pluginState === 'object'
            ? pluginState
            : {};

    const config =
        safeState.config && typeof safeState.config === 'object'
            ? safeState.config
            : DEFAULT_CONFIG;

    return {
        ...FALLBACK_PLUGIN_STATE,
        ...safeState,
        config,
        savedConfigs: Array.isArray(safeState.savedConfigs)
            ? safeState.savedConfigs
            : FALLBACK_PLUGIN_STATE.savedConfigs,
    };
};

const ConfigBuilder = ({ pluginState, sendMessage, onUpdateState }) => {
    const safePluginState = getSafePluginState(pluginState);
    const { config } = safePluginState;
    const propNames = Object.keys(config);
    const namesOfActivePropConfigs = propNames.filter(
        propName => config[propName].isActive,
    );

    const handleSubmit = evt => {
        evt.preventDefault();
        sendMessage({
            type: 'run',
            params: safePluginState,
        });
    };

    return (
        <>
            <GlobalStyles
                hasActivePropConfigs={namesOfActivePropConfigs.length >= 1}
            />
            <form onSubmit={handleSubmit}>
                {propNames.map(propName => (
                    <PropConfigBuilder
                        key={propName}
                        config={config}
                        name={propName}
                        onUpdateState={onUpdateState}
                    />
                ))}
                <RunButton title="Make it happen, capt'n!" type="submit">
                    <Columns justify="center" spacing="tight">
                        <span>Run Randomization</span>
                        <Icon color="white" name="randomize" />
                    </Columns>
                </RunButton>
                <SavedConfigDrawer
                    pluginState={safePluginState}
                    onUpdateState={onUpdateState}
                />
            </form>
        </>
    );
};
export default React.memo(ConfigBuilder);
