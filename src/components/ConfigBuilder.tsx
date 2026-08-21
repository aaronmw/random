import * as React from 'react';
import styled, { createGlobalStyle } from 'styled-components';
import PropConfigBuilder from './PropConfigBuilder';
import { BUTTON_HEIGHT, Icon, RunButton } from './controls';
import { Columns } from './layout';
import SavedConfigDrawer from './SavedConfigDrawer';
import { RESIZE_HANDLE_HEIGHT } from '../config';
import { sanitizePluginState } from '../pluginState';

const GlobalStyles = createGlobalStyle(
    props => `
        :root {
            background-color: ${props.hasActivePropConfigs ? null : 'white'};
        }
    `,
);

const BottomChromeSpacer = styled.div`
    height: calc(${BUTTON_HEIGHT} + ${RESIZE_HANDLE_HEIGHT}px);
`;

const ConfigBuilder = ({ pluginState, sendMessage, onUpdateState }) => {
    const safePluginState = sanitizePluginState(pluginState);
    const { config } = safePluginState;
    const propNames = Object.keys(config);
    const namesOfActivePropConfigs = propNames.filter(
        propName => config[propName]?.isActive === true,
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
                <BottomChromeSpacer aria-hidden="true" />
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
