import * as React from 'react';
import styled from 'styled-components';
import { Button, Icon, IconButton, TextInput } from './controls';
import {
    COLOR_BLUE,
    COLOR_TEXT,
    COLOR_TEXT_LIGHT,
    Columns,
    FlexBox,
    SPACING,
} from './layout';
import { PageContainer } from './Navigation';
import migrateData from '../migrateData';

const EmptyMessage = styled(Columns).attrs({
    align: 'center',
})`
    padding: 15px;
    color: ${COLOR_TEXT_LIGHT};
`;

const SaveCurrentConfigButton = styled(Button)`
    margin-top: 15px;
`;

const ButtonBar = styled(FlexBox)`
    position: absolute;
    right: 0;
    width: 30px;
    overflow: hidden;
    transition: all 0.2s ease-in-out;
    transition-delay: 0.5s;
    transition-property: background padding;
    background-color: transparent;
    justify-content: flex-end;

    &:hover {
        width: auto;
        background-color: white;

        ${IconButton} {
            &:not(.neverHide) {
                opacity: 1;
                transition-delay: 0.5s;
            }
        }
    }

    ${IconButton} {
        &:not(.neverHide) {
            opacity: 0;
            transition: opacity 0.2s ease-in-out;
        }
    }
`;

const StyledSavedConfig = styled(Columns).attrs({
    align: 'space-between',
})`
    position: relative;
    height: 30px;
    padding-right: 45px;
    cursor: pointer;

    &:hover ${ButtonBar} {
        opacity: 1;
    }
`;

const SAVE_CONFIRMATION_DURATION = 750;

const SaveStatusIcon = styled(Icon).attrs({
    name: 'floppy-disc',
})`
    transition: all 0.2s ease-in-out;
    transform: ${props =>
        props.isFlashing ? 'scale(2) rotate(-25deg)' : 'none'};

    & > path {
        fill: ${props => (props.isFlashing ? COLOR_BLUE : COLOR_TEXT)};
    }
`;

const SavedConfigs = ({ pluginState, onUpdateState }) => {
    const [isEditingConfigId, setIsEditingConfigId] = React.useState(null);
    const [lastSavedConfigId, setLastSavedConfigId] = React.useState(null);
    const [tempNewLabel, setTempNewLabel] = React.useState('Untitled Config');
    const savedConfigs = pluginState.savedConfigs;
    const hasSavedConfigs = savedConfigs.length >= 1;

    React.useEffect(() => {
        if (isEditingConfigId) {
            const newLabelInput = document.getElementById('js-new-label-input');
            newLabelInput.focus();
            (newLabelInput as any).select();
        }
    }, [isEditingConfigId]);

    React.useEffect(() => {
        if (lastSavedConfigId !== null) {
            setTimeout(
                () => setLastSavedConfigId(null),
                SAVE_CONFIRMATION_DURATION,
            );
        }
    }, [lastSavedConfigId]);

    const goToRandomizer = () =>
        onUpdateState({
            path: ['activeRoute'],
            newValue: 'randomizer',
        });

    const handleClickDelete = ({ id, label }, evt) => {
        evt.stopPropagation();

        if (
            isEditingConfigId === id ||
            !confirm(
                `Are you sure you want to delete "${label}" from your saved configs? 🤔`,
            )
        ) {
            return;
        }

        onUpdateState({
            path: ['savedConfigs'],
            newValue: savedConfigs.filter(
                savedPropDefinition => savedPropDefinition.id !== id,
            ),
        });
    };

    const updateSavedConfig = updatedPropDefinition =>
        onUpdateState({
            path: ['savedConfigs'],
            newValue: savedConfigs.map(savedConfig =>
                savedConfig.id === updatedPropDefinition.id
                    ? updatedPropDefinition
                    : savedConfig,
            ),
        });

    const handleClickEdit = ({ id, label }, evt) => {
        evt.stopPropagation();
        setIsEditingConfigId(id);
        setTempNewLabel(label);
    };

    const handleNewLabelKeyDown = (savedConfig, evt) => {
        evt.stopPropagation();

        switch (evt.key) {
            case 'Enter':
                handleClickSaveNewLabel(savedConfig, evt);
                break;
            case 'Escape':
                setIsEditingConfigId(null);
                break;
        }
    };

    const handleClickSaveNewLabel = (savedConfig, evt) => {
        evt.stopPropagation();

        const newLabel = tempNewLabel.trim();

        updateSavedConfig({
            ...savedConfig,
            label: newLabel.length ? newLabel : savedConfig.label,
        });

        setIsEditingConfigId(null);
        setLastSavedConfigId(savedConfig.id);
    };

    const handleClickReSave = (savedConfig, evt) => {
        evt.stopPropagation();
        updateSavedConfig({
            ...savedConfig,
            data: pluginState.config,
        });
        setLastSavedConfigId(savedConfig.id);
    };

    const handleClickRandomize = savedConfig => {
        onUpdateState({
            path: ['config'],
            newValue: migrateData(savedConfig.data),
        });
        goToRandomizer();
    };

    const handleClickSaveCurrentConfig = () => {
        const id = Date.now();

        onUpdateState({
            path: ['savedConfigs'],
            newValue: [
                ...savedConfigs,
                {
                    id: id,
                    label: 'Untitled',
                    data: pluginState.config,
                },
            ],
        });

        setIsEditingConfigId(id);
    };

    return (
        <PageContainer>
            {!hasSavedConfigs && (
                <EmptyMessage>
                    Save your configs for easy re-use in any document 🤓
                </EmptyMessage>
            )}
            {hasSavedConfigs &&
                pluginState.savedConfigs.map(savedConfig => {
                    const { id, label } = savedConfig;

                    const restoreSavedConfig = () =>
                        handleClickRandomize(savedConfig);

                    return (
                        <StyledSavedConfig
                            key={id}
                            title="Click to load this config"
                            onClick={
                                isEditingConfigId === null
                                    ? restoreSavedConfig
                                    : null
                            }
                        >
                            <FlexBox justify="flex-start">
                                <SaveStatusIcon
                                    isFlashing={lastSavedConfigId === id}
                                    style={{ marginRight: SPACING.tight }}
                                />
                                {isEditingConfigId === id ? (
                                    <TextInput
                                        id="js-new-label-input"
                                        value={tempNewLabel}
                                        onChange={evt =>
                                            setTempNewLabel(evt.target.value)
                                        }
                                        onKeyDown={handleNewLabelKeyDown.bind(
                                            this,
                                            savedConfig,
                                        )}
                                    />
                                ) : (
                                    <span>{label}</span>
                                )}
                            </FlexBox>
                            <ButtonBar>
                                {isEditingConfigId === id ? (
                                    <IconButton
                                        className="neverHide"
                                        iconName="check"
                                        onClick={handleClickSaveNewLabel.bind(
                                            this,
                                            savedConfig,
                                        )}
                                    />
                                ) : (
                                    <>
                                        <IconButton
                                            iconName="trash"
                                            onMouseDown={handleClickDelete.bind(
                                                this,
                                                savedConfig,
                                            )}
                                        />
                                        <IconButton
                                            iconName="pencil"
                                            onClick={handleClickEdit.bind(
                                                this,
                                                savedConfig,
                                            )}
                                        />
                                        <IconButton
                                            iconName="sync"
                                            onClick={handleClickReSave.bind(
                                                this,
                                                savedConfig,
                                            )}
                                        />
                                        <IconButton
                                            className="neverHide"
                                            iconName="reply"
                                        />
                                    </>
                                )}
                            </ButtonBar>
                        </StyledSavedConfig>
                    );
                })}
            <SaveCurrentConfigButton onClick={handleClickSaveCurrentConfig}>
                Save Current Config
            </SaveCurrentConfigButton>
        </PageContainer>
    );
};

export default SavedConfigs;
