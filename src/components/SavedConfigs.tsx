import * as React from 'react';
import styled from 'styled-components';
import { Button, Icon, IconButton, Input } from './controls';
import { COLOR_TEXT_LIGHT, Columns } from './layout';
import { Route } from './Navigation';

const EmptyMessage = styled(Columns).attrs({
    align: 'center',
})`
    padding: 15px;
    color: ${COLOR_TEXT_LIGHT};
`;

const SaveCurrentConfigButton = styled(Button)`
    margin-top: 15px;
`;

const StyledSavedConfig = styled(Columns).attrs({
    align: 'space-between',
})`
    position: relative;
    height: 30px;
    padding-right: 45px;
    cursor: pointer;
`;

const ButtonBar = styled(Columns)`
    position: absolute;
    right: 0;
    width: 30px;
    overflow: hidden;
    transition: all 0.2s ease-in-out;
    transition-delay: 0.5s;
    transition-property: background padding;
    background-color: transparent;

    &:hover {
        width: auto;
        background-color: white;
        padding-left: 15px;

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

const SavedConfigs = ({ pluginState, onUpdateState }) => {
    const [isEditingPropId, setIsEditingPropId] = React.useState(null);
    const [tempNewLabel, setTempNewLabel] = React.useState('Untitled Config');
    const savedPropDefinitions = pluginState.savedPropDefinitions;
    const hasSavedConfigs = savedPropDefinitions.length >= 1;

    React.useEffect(() => {
        if (isEditingPropId) {
            const newLabelInput = document.getElementById('js-new-label-input');
            newLabelInput.focus();
            (newLabelInput as any).select();
        }
    }, [isEditingPropId]);

    const goToRandomizer = () =>
        onUpdateState({
            path: ['activeRoute'],
            newValue: 'randomizer',
        });

    const handleClickDelete = ({ id, label }, evt) => {
        evt.stopPropagation();

        if (
            isEditingPropId === id ||
            !confirm(
                `Are you sure you want to delete "${label}" from your saved configs? 🤔`,
            )
        ) {
            return;
        }

        onUpdateState({
            path: ['savedPropDefinitions'],
            newValue: savedPropDefinitions.filter(
                savedPropDefinition => savedPropDefinition.id !== id,
            ),
        });
    };

    const updateSavedPropDefinition = updatedPropDefinition =>
        onUpdateState({
            path: ['savedPropDefinitions'],
            newValue: savedPropDefinitions.map(propDefinition =>
                propDefinition.id === updatedPropDefinition.id
                    ? updatedPropDefinition
                    : propDefinition,
            ),
        });

    const handleClickEdit = ({ id, label }, evt) => {
        evt.stopPropagation();
        setIsEditingPropId(id);
        setTempNewLabel(label);
    };

    const handleNewLabelKeyDown = (propDefinition, evt) => {
        evt.stopPropagation();

        switch (evt.key) {
            case 'Enter':
                handleClickSaveNewLabel(propDefinition, evt);
                break;
            case 'Escape':
                setIsEditingPropId(null);
                break;
        }
    };

    const handleClickSaveNewLabel = (propDefinition, evt) => {
        evt.stopPropagation();

        const newLabel = tempNewLabel.trim();

        updateSavedPropDefinition({
            ...propDefinition,
            label: newLabel.length ? newLabel : propDefinition.label,
        });

        setIsEditingPropId(null);
    };

    const handleClickUpdate = (propDefinition, evt) => {
        evt.stopPropagation();
        updateSavedPropDefinition({
            ...propDefinition,
            data: pluginState.propDefinitions,
        });
        goToRandomizer();
    };

    const handleClickRandomize = propDefinition => {
        onUpdateState({
            path: ['propDefinitions'],
            newValue: propDefinition.data,
        });
        goToRandomizer();
    };

    const handleClickSaveCurrentConfig = () => {
        const id = Date.now();

        onUpdateState({
            path: ['savedPropDefinitions'],
            newValue: [
                ...savedPropDefinitions,
                {
                    id: id,
                    label: 'Untitled',
                    data: pluginState.propDefinitions,
                },
            ],
        });

        setIsEditingPropId(id);
    };

    return (
        <Route>
            {!hasSavedConfigs && (
                <EmptyMessage>
                    Save your configs for easy re-use later 🤓
                </EmptyMessage>
            )}
            {hasSavedConfigs &&
                pluginState.savedPropDefinitions.map(propDefinition => {
                    const { id, label } = propDefinition;

                    const applyPropDefinition = () =>
                        isEditingPropId === null &&
                        handleClickRandomize(propDefinition);

                    return (
                        <StyledSavedConfig
                            key={id}
                            onClick={applyPropDefinition}
                        >
                            <Columns align="flex-start">
                                <Icon name="floppy-disc" />{' '}
                                {isEditingPropId === id ? (
                                    <Input
                                        id="js-new-label-input"
                                        value={tempNewLabel}
                                        onChange={evt =>
                                            setTempNewLabel(evt.target.value)
                                        }
                                        onKeyDown={handleNewLabelKeyDown.bind(
                                            this,
                                            propDefinition,
                                        )}
                                    />
                                ) : (
                                    <span>{label}</span>
                                )}
                            </Columns>
                            <ButtonBar>
                                {isEditingPropId === id ? (
                                    <IconButton
                                        className="neverHide"
                                        iconName="check"
                                        onClick={handleClickSaveNewLabel.bind(
                                            this,
                                            propDefinition,
                                        )}
                                    />
                                ) : (
                                    <>
                                        <IconButton
                                            iconName="times"
                                            onMouseDown={handleClickDelete.bind(
                                                this,
                                                propDefinition,
                                            )}
                                        />
                                        <IconButton
                                            iconName="pencil"
                                            onClick={handleClickEdit.bind(
                                                this,
                                                propDefinition,
                                            )}
                                        />
                                        <IconButton
                                            iconName="sync"
                                            onClick={handleClickUpdate.bind(
                                                this,
                                                propDefinition,
                                            )}
                                        />
                                        <IconButton
                                            className="neverHide"
                                            iconName="randomize"
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
        </Route>
    );
};

export default SavedConfigs;
