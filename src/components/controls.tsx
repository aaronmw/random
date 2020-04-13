import * as React from 'react';
import styled from 'styled-components';
import {
    COLOR_BLUE,
    COLOR_HOVER_BG,
    COLOR_TEXT,
    COLOR_TEXT_LIGHT,
} from './layout';

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
    width: 100%;

    &:focus {
        border: 2px solid ${COLOR_BLUE};
    }
`;

const ColorSwatch = styled.div`
    position: relative;
    width: 100%;

    ${props =>
        props.color !== null &&
        `
        text-transform: uppercase;
        
        &:before {
            content: '';
            position: absolute;
            left: 6px;
            top: 5px;
            width: 18px;
            height: 18px;
            background-color: ${props.color};
            border: 1px solid ${COLOR_HOVER_BG};
        }
    `}
`;

export const Input = props => {
    const { value } = props;
    const isColor = `${value}`.trim().match(/^#[0-9a-f]{6}?$/i);
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

export const Button = styled.button`
    ${commonStyles}
    background: ${COLOR_BLUE};
    color: white;
    border: 2px solid transparent;
    line-height: 0;
    cursor: pointer;

    &:active {
        background: #1170ae;
    }
    &:focus {
        border: 2px solid #1170ae;
    }
`;

export const RunButton = styled(Button)`
    position: fixed;
    bottom: 0;
    left: 0;
    right: 0;
`;

const TOGGLE_WIDTH = 25;
const TOGGLE_HEIGHT = 11;
const TOGGLE_BORDER_WIDTH = 1;

export const ToggleSwitch = styled.div`
    ${props => `
        border: ${TOGGLE_BORDER_WIDTH}px solid
            ${props.isActive ? COLOR_TEXT : COLOR_TEXT_LIGHT};
        border-radius: 100px;
        width: ${TOGGLE_WIDTH}px;
        height: ${TOGGLE_HEIGHT}px;
        padding: ${TOGGLE_BORDER_WIDTH}px;
        display: flex;
        justify-content: ${props.isActive ? 'flex-end' : 'flex-start'};
        margin-left: 8px;
    
        &:before {
            content: '';
            display: block;
            width: ${TOGGLE_HEIGHT - TOGGLE_BORDER_WIDTH * 4}px;
            height: ${TOGGLE_HEIGHT - TOGGLE_BORDER_WIDTH * 4}px;
            border-radius: 100px;
            background-color: ${props.isActive ? COLOR_TEXT : COLOR_TEXT_LIGHT};
        }
    `}
`;

const ICON_SIZE = 14;
const ICON_COLOR = COLOR_TEXT;
const ICON_MAP = {
    check: {
        data:
            'M413.505 91.951L133.49 371.966l-98.995-98.995c-4.686-4.686-12.284-4.686-16.971 0L6.211 284.284c-4.686 4.686-4.686 12.284 0 16.971l118.794 118.794c4.686 4.686 12.284 4.686 16.971 0l299.813-299.813c4.686-4.686 4.686-12.284 0-16.971l-11.314-11.314c-4.686-4.686-12.284-4.686-16.97 0z',
        label: 'Save (Esc to Cancel)',
    },
    envelope: {
        data:
            'M464 64H48C21.5 64 0 85.5 0 112v288c0 26.5 21.5 48 48 48h416c26.5 0 48-21.5 48-48V112c0-26.5-21.5-48-48-48zM48 96h416c8.8 0 16 7.2 16 16v41.4c-21.9 18.5-53.2 44-150.6 121.3-16.9 13.4-50.2 45.7-73.4 45.3-23.2.4-56.6-31.9-73.4-45.3C85.2 197.4 53.9 171.9 32 153.4V112c0-8.8 7.2-16 16-16zm416 320H48c-8.8 0-16-7.2-16-16V195c22.8 18.7 58.8 47.6 130.7 104.7 20.5 16.4 56.7 52.5 93.3 52.3 36.4.3 72.3-35.5 93.3-52.3 71.9-57.1 107.9-86 130.7-104.7v205c0 8.8-7.2 16-16 16z',
        label: 'Email Me',
    },
    'floppy-disc': {
        data:
            'M433.941 129.941l-83.882-83.882A48 48 0 0 0 316.118 32H48C21.49 32 0 53.49 0 80v352c0 26.51 21.49 48 48 48h352c26.51 0 48-21.49 48-48V163.882a48 48 0 0 0-14.059-33.941zM288 64v96H96V64h192zm128 368c0 8.822-7.178 16-16 16H48c-8.822 0-16-7.178-16-16V80c0-8.822 7.178-16 16-16h16v104c0 13.255 10.745 24 24 24h208c13.255 0 24-10.745 24-24V64.491a15.888 15.888 0 0 1 7.432 4.195l83.882 83.882A15.895 15.895 0 0 1 416 163.882V432zM224 232c-48.523 0-88 39.477-88 88s39.477 88 88 88 88-39.477 88-88-39.477-88-88-88zm0 144c-30.879 0-56-25.121-56-56s25.121-56 56-56 56 25.121 56 56-25.121 56-56 56z',
        label: 'Saved Config',
    },
    instagram: {
        data:
            'M224.1 141c-63.6 0-114.9 51.3-114.9 114.9s51.3 114.9 114.9 114.9S339 319.5 339 255.9 287.7 141 224.1 141zm0 189.6c-41.1 0-74.7-33.5-74.7-74.7s33.5-74.7 74.7-74.7 74.7 33.5 74.7 74.7-33.6 74.7-74.7 74.7zm146.4-194.3c0 14.9-12 26.8-26.8 26.8-14.9 0-26.8-12-26.8-26.8s12-26.8 26.8-26.8 26.8 12 26.8 26.8zm76.1 27.2c-1.7-35.9-9.9-67.7-36.2-93.9-26.2-26.2-58-34.4-93.9-36.2-37-2.1-147.9-2.1-184.9 0-35.8 1.7-67.6 9.9-93.9 36.1s-34.4 58-36.2 93.9c-2.1 37-2.1 147.9 0 184.9 1.7 35.9 9.9 67.7 36.2 93.9s58 34.4 93.9 36.2c37 2.1 147.9 2.1 184.9 0 35.9-1.7 67.7-9.9 93.9-36.2 26.2-26.2 34.4-58 36.2-93.9 2.1-37 2.1-147.8 0-184.8zM398.8 388c-7.8 19.6-22.9 34.7-42.6 42.6-29.5 11.7-99.5 9-132.1 9s-102.7 2.6-132.1-9c-19.6-7.8-34.7-22.9-42.6-42.6-11.7-29.5-9-99.5-9-132.1s-2.6-102.7 9-132.1c7.8-19.6 22.9-34.7 42.6-42.6 29.5-11.7 99.5-9 132.1-9s102.7-2.6 132.1 9c19.6 7.8 34.7 22.9 42.6 42.6 11.7 29.5 9 99.5 9 132.1s2.7 102.7-9 132.1z',
        label: 'Creep my Instagram',
    },
    'linked-in': {
        data:
            'M100.28 448H7.4V148.9h92.88zM53.79 108.1C24.09 108.1 0 83.5 0 53.8a53.79 53.79 0 0 1 107.58 0c0 29.7-24.1 54.3-53.79 54.3zM447.9 448h-92.68V302.4c0-34.7-.7-79.2-48.29-79.2-48.29 0-55.69 37.7-55.69 76.7V448h-92.78V148.9h89.08v40.8h1.3c12.4-23.5 42.69-48.3 87.88-48.3 94 0 111.28 61.9 111.28 142.3V448z',
        label: 'Peruse my LinkedIn',
    },
    pencil: {
        data:
            'M493.255 56.236l-37.49-37.49c-24.993-24.993-65.515-24.994-90.51 0L12.838 371.162.151 485.346c-1.698 15.286 11.22 28.203 26.504 26.504l114.184-12.687 352.417-352.417c24.992-24.994 24.992-65.517-.001-90.51zm-95.196 140.45L174 420.745V386h-48v-48H91.255l224.059-224.059 82.745 82.745zM126.147 468.598l-58.995 6.555-30.305-30.305 6.555-58.995L63.255 366H98v48h48v34.745l-19.853 19.853zm344.48-344.48l-49.941 49.941-82.745-82.745 49.941-49.941c12.505-12.505 32.748-12.507 45.255 0l37.49 37.49c12.506 12.506 12.507 32.747 0 45.255z',
        label: 'Rename',
    },
    plus: {
        data:
            'M376 232H216V72c0-4.42-3.58-8-8-8h-32c-4.42 0-8 3.58-8 8v160H8c-4.42 0-8 3.58-8 8v32c0 4.42 3.58 8 8 8h160v160c0 4.42 3.58 8 8 8h32c4.42 0 8-3.58 8-8V280h160c4.42 0 8-3.58 8-8v-32c0-4.42-3.58-8-8-8z',
        label: 'Add',
        viewBoxWidth: 384,
    },
    randomize: {
        data:
            'M0 128v-8c0-6.6 5.4-12 12-12h105.8c3.3 0 6.5 1.4 8.8 3.9l89.7 97-21.8 23.6L109 140H12c-6.6 0-12-5.4-12-12zm502.6 278.6l-64 64c-20.1 20.1-54.6 5.8-54.6-22.6v-44h-25.7c-3.3 0-6.5-1.4-8.8-3.9l-89.7-97 21.8-23.6L367 372h17v-52c0-28.5 34.5-42.7 54.6-22.6l64 64c12.5 12.5 12.5 32.7 0 45.2zm-19.8-25.4l-64-64c-2.5-2.5-6.8-.7-6.8 2.8v128c0 3.6 4.3 5.4 6.8 2.8l64-64c1.6-1.5 1.6-4.1 0-5.6zm19.8-230.6l-64 64c-20.1 20.1-54.6 5.8-54.6-22.6v-52h-17L126.6 400.1c-2.3 2.5-5.5 3.9-8.8 3.9H12c-6.6 0-12-5.4-12-12v-8c0-6.6 5.4-12 12-12h97l240.4-260.1c2.3-2.5 5.5-3.9 8.8-3.9H384V64c0-28.5 34.5-42.7 54.6-22.6l64 64c12.5 12.5 12.5 32.7 0 45.2zm-19.8-25.4l-64-64c-2.5-2.5-6.8-.7-6.8 2.8v128c0 3.6 4.3 5.4 6.8 2.8l64-64c1.6-1.5 1.6-4.1 0-5.6z',
        label: 'Go',
    },
    sync: {
        data:
            'M492 8h-10c-6.627 0-12 5.373-12 12v110.627C426.929 57.261 347.224 8 256 8 123.228 8 14.824 112.338 8.31 243.493 7.971 250.311 13.475 256 20.301 256h10.016c6.353 0 11.646-4.949 11.977-11.293C48.157 132.216 141.097 42 256 42c82.862 0 154.737 47.077 190.289 116H332c-6.627 0-12 5.373-12 12v10c0 6.627 5.373 12 12 12h160c6.627 0 12-5.373 12-12V20c0-6.627-5.373-12-12-12zm-.301 248h-10.015c-6.352 0-11.647 4.949-11.977 11.293C463.841 380.158 370.546 470 256 470c-82.608 0-154.672-46.952-190.299-116H180c6.627 0 12-5.373 12-12v-10c0-6.627-5.373-12-12-12H20c-6.627 0-12 5.373-12 12v160c0 6.627 5.373 12 12 12h10c6.627 0 12-5.373 12-12V381.373C85.071 454.739 164.777 504 256 504c132.773 0 241.176-104.338 247.69-235.493.339-6.818-5.165-12.507-11.991-12.507z',
        label: 'Re-Save with Current Config',
    },
    times: {
        data:
            'M193.94 256L296.5 153.44l21.15-21.15c3.12-3.12 3.12-8.19 0-11.31l-22.63-22.63c-3.12-3.12-8.19-3.12-11.31 0L160 222.06 36.29 98.34c-3.12-3.12-8.19-3.12-11.31 0L2.34 120.97c-3.12 3.12-3.12 8.19 0 11.31L126.06 256 2.34 379.71c-3.12 3.12-3.12 8.19 0 11.31l22.63 22.63c3.12 3.12 8.19 3.12 11.31 0L160 289.94 262.56 392.5l21.15 21.15c3.12 3.12 8.19 3.12 11.31 0l22.63-22.63c3.12-3.12 3.12-8.19 0-11.31L193.94 256z',
        label: 'Delete',
        viewBoxWidth: 320,
    },
    twitter: {
        data:
            'M459.37 151.716c.325 4.548.325 9.097.325 13.645 0 138.72-105.583 298.558-298.558 298.558-59.452 0-114.68-17.219-161.137-47.106 8.447.974 16.568 1.299 25.34 1.299 49.055 0 94.213-16.568 130.274-44.832-46.132-.975-84.792-31.188-98.112-72.772 6.498.974 12.995 1.624 19.818 1.624 9.421 0 18.843-1.3 27.614-3.573-48.081-9.747-84.143-51.98-84.143-102.985v-1.299c13.969 7.797 30.214 12.67 47.431 13.319-28.264-18.843-46.781-51.005-46.781-87.391 0-19.492 5.197-37.36 14.294-52.954 51.655 63.675 129.3 105.258 216.365 109.807-1.624-7.797-2.599-15.918-2.599-24.04 0-57.828 46.782-104.934 104.934-104.934 30.213 0 57.502 12.67 76.67 33.137 23.715-4.548 46.456-13.32 66.599-25.34-7.798 24.366-24.366 44.833-46.132 57.827 21.117-2.273 41.584-8.122 60.426-16.243-14.292 20.791-32.161 39.308-52.628 54.253z',
        label: 'Stalk me on Twitter',
    },
};

export const Icon = ({ name, className = '' }) => (
    <svg
        className={className}
        width={ICON_SIZE}
        height={ICON_SIZE}
        viewBox={`0 0 ${ICON_MAP[name].viewBoxWidth || 512} 512`}
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
    >
        <path fill={ICON_COLOR} d={ICON_MAP[name].data} />
    </svg>
);

const iconButtonStyles = `
    width: 30px;
    height: 30px;
    display: flex;
    flex-shrink: 0;
    flex-grow: 0;
    align-items: center;
    justify-content: center;

    &:hover {
        cursor: pointer;
        background-color: ${COLOR_HOVER_BG};
    }
    &:focus {
        border: 2px solid ${COLOR_BLUE};
    }
`;

const StyledIconButton = styled.button`
    ${iconButtonStyles}
`;

export const IconButton = styled(
    ({ iconName, title = null, onClick = e => null, ...otherProps }) => {
        return (
            <StyledIconButton
                title={ICON_MAP[iconName].label}
                onClick={evt => {
                    evt.preventDefault();
                    onClick(evt);
                }}
                {...otherProps}
            >
                <Icon name={iconName} />
            </StyledIconButton>
        );
    },
)``;

const StyledIconLink = styled.a`
    ${iconButtonStyles}
`;

export const IconLink = ({ iconName, ...otherProps }) => (
    <StyledIconLink
        target="_blank"
        title={ICON_MAP[iconName].label}
        {...otherProps}
    >
        <Icon name={iconName} />
    </StyledIconLink>
);
