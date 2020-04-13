import styled, { createGlobalStyle } from 'styled-components';

export const COLOR_BLUE = '#18a0fb';
export const COLOR_BORDER = '#dfdfdf';
export const COLOR_TEXT = '#333333';
export const COLOR_TEXT_LIGHT = '#b3b3b3';
export const COLOR_HOVER_BG = '#f2f2f2';
export const FONT_WEIGHT_BOLD = 600;

export const GlobalStyles = createGlobalStyle`
    * {
        margin: 0;
        padding: 0;
        box-sizing: border-box;
        outline: none;
        background-color: inherit;
        border: none;
        font-size: 1rem;
        font-family: Inter, sans-serif;
        text-transform: inherit;
    }
    :root {
        line-height: 1.1rem;
        font-size: 11px;
        letter-spacing: 0.5;
        background: radial-gradient(white, hsl(0, 0%, 95%));
        user-select: none;
        color: ${COLOR_TEXT};
        -webkit-font-smoothing: subpixel-antialiased;
        padding-bottom: 30px;
    }
    strong {
        font-weight: ${FONT_WEIGHT_BOLD};
    }
`;

export const StyledAppContainer = styled.div``;

export const Columns = styled.div`
    flex-shrink: 1;
    flex-grow: 1;
    display: flex;
    align-items: center;
    justify-content: ${props => (props.align ? props.align : 'flex-end')};

    & > * {
        margin-left: 8px;

        &:first-child {
            margin-left: 0;
        }
    }
`;

export const Row = styled.div`
    & + & {
        margin-top: 8px;
    }
`;
