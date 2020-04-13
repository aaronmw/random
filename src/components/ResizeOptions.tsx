import * as React from 'react';
import styled from 'styled-components';
import { Label } from './controls';
import { COLOR_TEXT, COLOR_TEXT_LIGHT, Columns } from './layout';

const StyledResizeOriginContainer = styled.div`
    display: flex;
    flex-direction: column;
    justify-content: space-between;
    width: 30px;
    height: 30px;
`;

const StyledResizeOriginRow = styled.div`
    display: flex;
    justify-content: space-between;
`;

const StyledResizeOrigin = styled.div`
    ${({ isActive, isSelectable }) => `
        width: 10px;
        height: 10px;
        display: block;
        justify-content: center;
        align-items: center;
        cursor: ${!isActive && isSelectable ? 'pointer' : 'default'};
    
        &:before {
            content: '';
            display: block;
            width: 4px;
            height: 4px;
            border: 1px solid
                ${isActive ? COLOR_TEXT : COLOR_TEXT_LIGHT};
            background-color: ${
                isSelectable
                    ? isActive
                        ? COLOR_TEXT
                        : 'transparent'
                    : COLOR_TEXT_LIGHT
            };
            opacity: ${isSelectable ? 1 : 0.25};
            transition: all 0.2s ease-in-out;
        }
        
        ${
            isSelectable &&
            !isActive &&
            `
        &:hover:before {
            transform: scale(1.5);
        }`
        }
    `}
`;

const ResizeOriginSelector = ({
    preserveAspectRatio,
    propName,
    selectedOrigin,
    onUpdateState,
}) => {
    const isWidth = propName === 'width';
    const isHeight = propName === 'height';
    const verticalOriginNames = ['top', 'middle', 'bottom'];
    const horizontalOriginNames = ['left', 'center', 'right'];

    const handleSaveTransformOrigin = originName => {
        onUpdateState({
            path: ['config', propName, 'selectedOrigin'],
            newValue: originName,
        });
    };

    return (
        <StyledResizeOriginContainer>
            {verticalOriginNames.map(verticalOriginName => (
                <StyledResizeOriginRow key={verticalOriginName}>
                    {horizontalOriginNames.map(horizontalOriginName => {
                        const originName = `${verticalOriginName}-${horizontalOriginName}`;
                        const isSelectable =
                            (isWidth && verticalOriginName === 'middle') ||
                            (isHeight && horizontalOriginName === 'center') ||
                            preserveAspectRatio ||
                            (verticalOriginName === 'middle' &&
                                horizontalOriginName === 'center');

                        return (
                            <StyledResizeOrigin
                                key={horizontalOriginName}
                                isActive={selectedOrigin === originName}
                                isSelectable={isSelectable}
                                onClick={
                                    isSelectable
                                        ? handleSaveTransformOrigin.bind(
                                              this,
                                              originName,
                                          )
                                        : null
                                }
                            />
                        );
                    })}
                </StyledResizeOriginRow>
            ))}
        </StyledResizeOriginContainer>
    );
};

const ResizeOptions = ({
    propName,
    preserveAspectRatio,
    selectedOrigin,
    onUpdateState,
}) => {
    const updatePreserveAspectRatio = () => {
        const newPreserveAspectRatio = !preserveAspectRatio;
        const [verticalOriginName, horizontalOriginName] = selectedOrigin.split(
            '-',
        );
        const newVerticalOriginName =
            !newPreserveAspectRatio &&
            propName === 'width' &&
            ['top', 'bottom'].indexOf(verticalOriginName) !== -1
                ? 'middle'
                : verticalOriginName;
        const newHorizontalOriginName =
            !newPreserveAspectRatio &&
            propName === 'height' &&
            ['left', 'right'].indexOf(horizontalOriginName) !== -1
                ? 'center'
                : horizontalOriginName;
        const newSelectedOrigin = `${newVerticalOriginName}-${newHorizontalOriginName}`;
        const oppositePropName = propName === 'width' ? 'height' : 'width';

        onUpdateState({
            path: ['config', propName, 'preserveAspectRatio'],
            newValue: newPreserveAspectRatio,
        });

        if (newSelectedOrigin !== selectedOrigin) {
            onUpdateState({
                path: ['config', propName, 'selectedOrigin'],
                newValue: newSelectedOrigin,
            });
        }

        if (newPreserveAspectRatio === true) {
            onUpdateState({
                path: ['config', oppositePropName, 'isActive'],
                newValue: false,
            });
        }
    };

    return (
        <Columns align="space-between">
            <Label>
                <input
                    type="checkbox"
                    checked={preserveAspectRatio}
                    onChange={updatePreserveAspectRatio}
                />{' '}
                <span>Preserve Aspect Ratio</span>
            </Label>
            <Label>
                <span
                    style={{
                        marginRight: '15px',
                    }}
                >
                    Anchor:
                </span>
                <ResizeOriginSelector
                    preserveAspectRatio={preserveAspectRatio}
                    propName={propName}
                    selectedOrigin={selectedOrigin}
                    onUpdateState={onUpdateState}
                />
            </Label>
        </Columns>
    );
};

export default ResizeOptions;
