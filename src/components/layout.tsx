import styled, { createGlobalStyle } from 'styled-components';

export const COLOR_BLUE = '#18a0fb';
export const COLOR_TEXT = '#333333';
export const COLOR_TEXT_LIGHT = '#b3b3b3';
export const COLOR_BORDER = '#dfdfdf';
export const COLOR_HOVER_BG = '#f2f2f2';
export const COLOR_BG = '#f0f0f0';
export const FONT_WEIGHT_BOLD = 600;

export const SPACING = {
    tight: '6px',
    normal: '12px',
};

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
        font-feature-settings: 'liga' on,'calt' on;
        letter-spacing: inherit;
        text-transform: inherit;
    }
    :root {
        line-height: 1.1rem;
        font-size: 11px;
        letter-spacing: 0.5;
        background: ${COLOR_BG};
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

export const FlexBox = styled.div(
    props => `
        display: flex;
        flex-direction: ${props.direction || 'row'};
        align-items: center;
        justify-content: ${props.justify || 'space-between'};
    `,
);

export const Columns = styled(FlexBox)(
    props => `
        flex-shrink: 1;
        flex-grow: 1;
        
        & > * + * {
            margin-${props.direction === 'row-reverse' ? 'right' : 'left'}: ${
        SPACING[props.spacing || 'normal']
    };
        }
    `,
);

export const Row = styled.div`
    & + & {
        margin-top: 12px;
    }
`;
