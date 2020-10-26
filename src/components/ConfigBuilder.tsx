import * as React from 'react';
import { createGlobalStyle } from 'styled-components';
import PropConfigBuilder from './PropConfigBuilder';
import { Icon, RunButton } from './controls';
import { Columns } from './layout';
import SavedConfigDrawer from './SavedConfigDrawer';

const GlobalStyles = createGlobalStyle(
    props => `
        :root {
            background-color: ${props.hasActivePropConfigs ? null : 'white'};
        }
    `,
);

const ConfigBuilder = ({ pluginState, sendMessage, onUpdateState }) => {
    const { config } = pluginState;
    const propNames = Object.keys(config);
    const namesOfActivePropConfigs = propNames.filter(
        propName => config[propName].isActive,
    );

    const handleSubmit = evt => {
        evt.preventDefault();
        sendMessage({
            type: 'run',
            params: pluginState,
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
                    pluginState={pluginState}
                    onUpdateState={onUpdateState}
                />
            </form>
        </>
    );
};
export default React.memo(ConfigBuilder);
