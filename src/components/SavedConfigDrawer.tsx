import * as React from 'react';
import styled from 'styled-components';
import FadedOverflow from './FadedOverflow';
import {
    BUTTON_HEIGHT,
    Icon,
    IconButton,
    DrawerToggleButton,
    TextInput,
} from './controls';
import {
    COLOR_BLUE,
    COLOR_TEXT_LIGHT,
    Columns,
    FlexBox,
    FONT_WEIGHT_BOLD,
} from './layout';
import { sendMessage } from '../ui';
import migrateData from '../migrateData';

const DRAWER_Z_INDEX_BASE = 100;

const WindowShader = styled.div(
    props => `
        position: fixed;
        top: 0;
        right: 0;
        bottom: 0;
        left: 0;
        background: rgba(0, 0, 0, 0.5);
        opacity: ${props.isOpen ? 1 : 0};
        pointer-events: ${props.isOpen ? 'all' : 'none'};
        transition: opacity 0.25s ease-in-out;
        z-index: ${DRAWER_Z_INDEX_BASE};
    `,
);

const DrawerContainer = styled.div(
    props => `
        position: fixed;
        left: 0;
        right: 0;
        top: ${
            props.isOpen
                ? `calc(100% - 30px - ${props.drawerHeight}px)`
                : '100%'
        };
        transition: all 0.25s ease-in-out;
        transition-property: top;
        background-color: white;
        border-bottom: 1px solid white;
        z-index: ${DRAWER_Z_INDEX_BASE + 2};
    `,
);

const DrawerRow = styled(FlexBox)(
    props => `
        height: ${BUTTON_HEIGHT};
        padding: 0 15px;
        
        ${
            props.onClick
                ? `
            &:hover {
                cursor: pointer;
                font-weight: ${FONT_WEIGHT_BOLD};
            }
        `
                : null
        }
    `,
);

const PresetContainer = styled(DrawerRow)`
    position: relative;
`;

const PresetLabel = styled.div`
    width: 100%;
`;

const PresetActionContainer = styled(FlexBox)`
    position: absolute;
    top: 0;
    right: 7px;
    background: transparent;
`;

const SaveConfigButton = props => (
    <Columns
        justify="flex-start"
        spacing="tight"
        style={{ color: COLOR_BLUE, cursor: 'pointer' }}
        {...props}
    >
        <Icon name="plus" color={COLOR_BLUE} />
        <span>Save Current Config</span>
    </Columns>
);

const SavedConfigViewer = ({
    savedConfig,
    onDelete,
    onEdit,
    onLoad,
    onSync,
    ...otherProps
}) => {
    const { label } = savedConfig;

    const handleClick = (actionHandler, evt) => {
        evt.stopPropagation();
        actionHandler(savedConfig);
    };

    return (
        <PresetContainer
            title="Click to load this config"
            onClick={onLoad.bind(this, savedConfig)}
            {...otherProps}
        >
            <PresetLabel>{label}</PresetLabel>
            <PresetActionContainer>
                <IconButton
                    iconName="trash"
                    showOnHover={DrawerRow}
                    onMouseDown={handleClick.bind(this, onDelete)}
                />
                <IconButton
                    iconName="pencil"
                    showOnHover={DrawerRow}
                    onClick={handleClick.bind(this, onEdit)}
                />
                <IconButton
                    iconName="sync"
                    showOnHover={DrawerRow}
                    onClick={handleClick.bind(this, onSync)}
                />
            </PresetActionContainer>
        </PresetContainer>
    );
};

const SavedConfigEditor = ({ savedConfig, onCancel, onSave }) => {
    const [newConfigName, setNewConfigName] = React.useState(
        savedConfig.label || 'Untitled',
    );
    const inputRef = React.useRef(null);

    React.useEffect(() => {
        if (inputRef.current) {
            inputRef.current.focus();
            inputRef.current.select();
        }
    }, []);

    const handleChange = evt => {
        setNewConfigName(evt.target.value);
    };

    const handleKeyDown = evt => {
        evt.stopPropagation();

        switch (evt.key) {
            case 'Enter':
                onSave(newConfigName);
                break;
            case 'Escape':
                onCancel();
                break;
        }
    };

    return (
        <DrawerRow>
            <TextInput
                ref={inputRef}
                value={newConfigName}
                onChange={handleChange}
                onKeyDown={handleKeyDown}
            />
            <FlexBox>
                <IconButton iconName="times" onClick={onCancel} />
                <IconButton
                    iconName="check"
                    onClick={onSave.bind(this, newConfigName)}
                />
            </FlexBox>
        </DrawerRow>
    );
};

const SavedConfigDrawer = ({ pluginState, onUpdateState }) => {
    const [drawerHeight, setDrawerHeight] = React.useState(0);
    const [isCreatingNew, setIsCreatingNew] = React.useState(false);
    const [isEditingConfigId, setIsEditingConfigId] = React.useState(null);
    const [isOpen, setIsOpen] = React.useState(false);
    const drawerElementRef = React.useRef(null);
    const savedConfigs = pluginState.savedConfigs;

    React.useEffect(() => {
        if (drawerElementRef.current) {
            setDrawerHeight(drawerElementRef.current.offsetHeight);
        }
    }, [savedConfigs]);

    React.useEffect(() => {
        const handleKeyDown = evt => {
            evt.stopPropagation();
            if (evt.key === 'Escape') {
                setIsOpen(false);
                return false;
            }
        };

        window.addEventListener('keydown', handleKeyDown);
        return () => window.removeEventListener('keydown', handleKeyDown);
    }, []);

    const patchSavedConfig = (id, patch) =>
        onUpdateState({
            path: ['savedConfigs'],
            newValue: savedConfigs.map(savedConfig =>
                savedConfig.id === id
                    ? { ...savedConfig, ...patch }
                    : savedConfig,
            ),
        });

    const handleToggleOpen = evt => {
        evt.preventDefault();
        setIsOpen(!isOpen);
    };

    const handleClickRandomize = savedConfig => {
        onUpdateState({
            path: ['config'],
            newValue: migrateData(savedConfig.data),
        });
        setIsOpen(false);
    };

    const handleClickDelete = ({ id }) => {
        if (id !== isEditingConfigId && !confirm(`You sure? 🤔`)) {
            return;
        }

        onUpdateState({
            path: ['savedConfigs'],
            newValue: savedConfigs.filter(
                savedPropDefinition => savedPropDefinition.id !== id,
            ),
        });

        setIsEditingConfigId(null);
    };

    const handleClickCancel = () => {
        if (isCreatingNew) {
            handleClickDelete({ id: isEditingConfigId });
            setIsCreatingNew(false);
        }
        setIsEditingConfigId(null);
    };

    const handleClickEdit = ({ id }) => {
        setIsEditingConfigId(id);
    };

    const handleRename = newLabel => {
        patchSavedConfig(isEditingConfigId, {
            label: newLabel,
        });
        setIsEditingConfigId(null);
        setIsCreatingNew(false);
    };

    const handleSync = id => {
        patchSavedConfig(id, {
            data: pluginState.config,
        });
    };

    const handleSaveCurrentConfig = React.useCallback(() => {
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
        setIsCreatingNew(true);
    }, [pluginState, savedConfigs]);

    return (
        <>
            <DrawerToggleButton
                title="Save and re-run your carefully-tweaked settings"
                onClick={handleToggleOpen}
                style={{
                    zIndex: DRAWER_Z_INDEX_BASE + 1,
                }}
            >
                <Icon color="white" name={isOpen ? 'times' : 'folder'} />
            </DrawerToggleButton>
            <DrawerContainer
                isOpen={isOpen}
                drawerHeight={drawerHeight}
                ref={drawerElementRef}
            >
                <DrawerRow>
                    <span style={{ fontWeight: FONT_WEIGHT_BOLD }}>
                        Saved Presets
                    </span>
                </DrawerRow>
                <FadedOverflow maxHeight={300}>
                    {savedConfigs.length === 0 && (
                        <DrawerRow style={{ color: COLOR_TEXT_LIGHT }}>
                            Save your configs to re-use them later.
                        </DrawerRow>
                    )}
                    {savedConfigs.map(savedConfig => {
                        const { id } = savedConfig;

                        return isEditingConfigId === id ? (
                            <SavedConfigEditor
                                key={id}
                                savedConfig={savedConfig}
                                onCancel={handleClickCancel}
                                onSave={handleRename}
                            />
                        ) : (
                            <SavedConfigViewer
                                key={id}
                                savedConfig={savedConfig}
                                onDelete={handleClickDelete}
                                onEdit={handleClickEdit}
                                onLoad={handleClickRandomize}
                                onSync={handleSync}
                            />
                        );
                    })}
                </FadedOverflow>
                <DrawerRow>
                    <SaveConfigButton onClick={handleSaveCurrentConfig} />
                </DrawerRow>
            </DrawerContainer>
            <WindowShader isOpen={isOpen} onClick={handleToggleOpen} />
        </>
    );
};

export default SavedConfigDrawer;
