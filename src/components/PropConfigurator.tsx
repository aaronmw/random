import * as React from 'react';
import styled from 'styled-components';
import get from 'lodash/get';
import { ToggleSwitch } from './controls';
import CalcBuilder from './CalcBuilder';
import FormatOptions from './FormatOptions';
import ListBuilder from './ListBuilder';
import PrefixSuffixBuilder from './PrefixSuffixBuilder';
import RangeBuilder from './RangeBuilder';
import ResizeOptions from './ResizeOptions';
import SortingOptions from './SortingOptions';
import {
    COLOR_BLUE,
    COLOR_BORDER,
    COLOR_TEXT,
    COLOR_TEXT_LIGHT,
    Columns,
    FONT_WEIGHT_BOLD,
    Row,
} from './layout';

const METHOD_DESCRIPTIONS = {
    calc: 'Changes the current value by a random amount',
    list: 'Picks a random value from a list',
    range: 'Picks a random value between two numbers',
};

const PropContainer = styled.div`
    background-color: white;
    padding: 6px 15px;
    border-top: 1px solid transparent;
    border-bottom: 1px solid transparent;
    transition: padding 0.125s linear;

    &.is-active {
        padding: 15px;
        border-color: ${COLOR_BORDER};

        &:first-child {
            border-top-color: transparent;
        }
        & + .is-active {
            border-top: 0;
        }
    }
`;

const PropHeader = styled.div`
    display: flex;
    justify-content: space-between;
    align-items: center;
    font-weight: 400;
    cursor: pointer;
    color: ${COLOR_TEXT_LIGHT};

    &.is-active {
        color: ${COLOR_TEXT};
        font-weight: ${FONT_WEIGHT_BOLD};
    }
`;

const PropBody = styled.div`
    margin-top: 8px;
`;

const PropMethodTab = styled.button`
    display: flex;
    padding: 2px 6px;
    justify-content: center;
    align-items: center;
    cursor: pointer;
    font-weight: ${FONT_WEIGHT_BOLD};
    color: ${COLOR_TEXT_LIGHT};

    &:focus,
    &.is-active {
        color: ${COLOR_TEXT};
    }
`;

export const PropConfigurator = ({ name, config, onUpdateState }) => {
    const propConfig = config[name];
    const operator = get(propConfig, ['calc', 'operator']);

    const calcMax = get(propConfig, ['calc', operator, 'max']);
    const calcMin = get(propConfig, ['calc', operator, 'min']);
    const groupThousands = get(propConfig, 'groupThousands');
    const isActive = get(propConfig, 'isActive');
    const list = get(propConfig, 'list', []);
    const listFieldType = get(propConfig, 'listFieldType');
    const method = get(propConfig, 'method');
    const prefix = get(propConfig, 'prefix');
    const preserveAspectRatio = get(
        propConfig,
        'preserveAspectRatio',
        undefined,
    );
    const rangeMax = get(propConfig, ['range', 'max']);
    const rangeMin = get(propConfig, ['range', 'min']);
    const selectedOrigin = get(propConfig, 'selectedOrigin');
    const sortOrder = get(propConfig, 'sortOrder');
    const suffix = get(propConfig, 'suffix');

    const handlePropHeaderClick = () => {
        const newIsActive = !isActive;

        if (['height', 'width'].indexOf(name) !== -1) {
            const oppositePropName = name === 'width' ? 'height' : 'width';
            const oppositeIsPreservingAspectRatio =
                config[oppositePropName].preserveAspectRatio === true;

            if (oppositeIsPreservingAspectRatio) {
                onUpdateState({
                    path: ['config', oppositePropName, 'preserveAspectRatio'],
                    newValue: false,
                });
            } else if (preserveAspectRatio) {
                onUpdateState({
                    path: ['config', oppositePropName, 'isActive'],
                    newValue: false,
                });
            }
        }

        onUpdateState({
            path: ['config', name, 'isActive'],
            newValue: newIsActive,
        });
    };

    const handleMethodTabClick = ({ methodName }) => {
        onUpdateState({
            path: ['config', name, 'method'],
            newValue: methodName,
        });
    };

    const commonProps = {
        className: isActive ? 'is-active' : '',
    };

    return (
        <PropContainer {...commonProps}>
            <PropHeader onClick={handlePropHeaderClick} {...commonProps}>
                {name}
                <Columns noSpacing>
                    {isActive &&
                        ['calc', 'list', 'range'].map(methodName => {
                            if (propConfig[methodName]) {
                                const isTabActive = methodName === method;

                                return (
                                    <PropMethodTab
                                        key={methodName}
                                        className={
                                            isTabActive ? 'is-active' : ''
                                        }
                                        isActive={isTabActive}
                                        title={METHOD_DESCRIPTIONS[methodName]}
                                        onClick={evt => {
                                            evt.stopPropagation();
                                            evt.preventDefault();
                                            handleMethodTabClick({
                                                methodName,
                                            });
                                        }}
                                    >
                                        {methodName}
                                    </PropMethodTab>
                                );
                            }
                        })}
                    <ToggleSwitch
                        isActive={isActive}
                        title={
                            isActive
                                ? `Disable randomization of ${name}`
                                : `Enable randomization of ${name}`
                        }
                    />
                </Columns>
            </PropHeader>

            {isActive && (
                <PropBody>
                    <Row>
                        {method === 'list' ? (
                            <ListBuilder
                                propName={name}
                                list={list}
                                listFieldType={listFieldType}
                                onUpdateState={onUpdateState}
                            />
                        ) : method === 'range' ? (
                            <RangeBuilder
                                propName={name}
                                min={rangeMin}
                                max={rangeMax}
                                onUpdateState={onUpdateState}
                            />
                        ) : (
                            <CalcBuilder
                                propName={name}
                                operator={operator}
                                min={calcMin}
                                max={calcMax}
                                onUpdateState={onUpdateState}
                            />
                        )}
                    </Row>
                    {preserveAspectRatio !== undefined && (
                        <Row>
                            <ResizeOptions
                                propName={name}
                                preserveAspectRatio={preserveAspectRatio}
                                selectedOrigin={selectedOrigin}
                                onUpdateState={onUpdateState}
                            />
                        </Row>
                    )}
                    {name === 'text' && method === 'calc' && (
                        <Row>
                            <FormatOptions
                                decimalPlaces={get(
                                    propConfig,
                                    ['calc', 'decimalPlaces'],
                                    0,
                                )}
                                groupThousands={groupThousands}
                                onUpdateState={onUpdateState}
                            />
                        </Row>
                    )}
                    {name === 'text' && (
                        <Row>
                            <PrefixSuffixBuilder
                                prefix={prefix}
                                suffix={suffix}
                                onUpdateState={onUpdateState}
                            />
                        </Row>
                    )}
                    <Row>
                        <SortingOptions
                            propName={name}
                            sortOrder={sortOrder}
                            onUpdateState={onUpdateState}
                        />
                    </Row>
                </PropBody>
            )}
        </PropContainer>
    );
};
