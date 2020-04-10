import * as React from 'react';
import styled from 'styled-components';
import { COLOR_BLUE, COLOR_TEXT_LIGHT } from './layout';

const commonStyles = `
    display: block;
    height: 30px;
    width: 100%;
    text-align: center;
    background-color: white;
`;

const StyledInput = styled.input`
    ${commonStyles}
    border: 1px solid #e1e1e1;
    border-radius: 3px;

    &:focus {
        border: 2px solid ${COLOR_BLUE};
    }
`;

const ColorSwatch = styled.div`
    position: relative;
    width: 100%;
    &:before {
        content: '';
        position: absolute;
        left: 4px;
        top: 4px;
        width: 22px;
        height: 22px;
        background-color: ${props => props.color};
        border-radius: 2px;
    }
`;

export const Input = props => {
    const { value } = props;
    const isColor = `${value}`.trim().match(/^#[0-9a-f]{3,6}?$/i);
    const InputEl = <StyledInput {...props} />;
    return <ColorSwatch color={isColor ? value : null}>{InputEl}</ColorSwatch>;
};

export const Label = styled.label`
    display: flex;
    white-space: nowrap;
    margin-top: 8px;
    align-items: center;

    & > :first-child {
        margin-right: 4px;
    }
    & > [type='radio'] {
        position: relative;
        top: -1px;
    }
    & + & {
        margin-left: 15px !important;
    }
`;

export const InputLabel = styled.span`
    display: inline-block;
    flex-shrink: 0;
    flex-grow: 1;
    width: 35px;
    text-align: right;
`;

export const RunButton = styled.button`
    ${commonStyles}
    position: fixed;
    bottom: 0;
    left: 0;
    right: 0;
    background: ${COLOR_BLUE};
    color: white;
    border: 2px solid transparent;
    line-height: 0;

    &:active {
        background: #1170ae;
    }
    &:focus {
        border: 2px solid #1170ae;
    }
`;

export const ToggleSwitch = styled.div`
    border: 2px solid
        ${props => (props.isActive ? COLOR_BLUE : COLOR_TEXT_LIGHT)};
    border-radius: 100px;
    width: 30px;
    height: 17px;
    padding: 2px;
    display: flex;
    justify-content: ${props => (props.isActive ? 'flex-end' : 'flex-start')};
    margin-left: 8px;

    &:before {
        content: '';
        display: block;
        width: 9px;
        height: 9px;
        border-radius: 100px;
        background-color: ${props =>
            props.isActive ? COLOR_BLUE : COLOR_TEXT_LIGHT};
    }
`;

const PlusIcon = () => (
    <svg
        width="11"
        height="11"
        viewBox="0 0 11 11"
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
    >
        <path d="M5 0H6V11H5V0Z" fill="#18A0FB" />
        <path d="M11 5V6L0 6L4.37113e-08 5L11 5Z" fill="#18A0FB" />
    </svg>
);

const StyledPlusButton = styled.button`
    width: 30px;
    height: 30px;
    display: flex;
    align-items: center;
    justify-content: center;
    cursor: pointer;

    &:focus {
        border: 2px solid ${COLOR_BLUE};
    }
`;

export const PlusButton = ({ onClick = e => null, ...otherProps }) => (
    <StyledPlusButton
        onClick={evt => {
            evt.preventDefault();
            onClick(evt);
        }}
        {...otherProps}
    >
        <PlusIcon />
    </StyledPlusButton>
);

export const DeleteButton = styled(PlusButton)`
    & > * {
        transform: rotate(45deg);
    }
`;
