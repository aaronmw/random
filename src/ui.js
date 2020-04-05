import * as React from 'react';
import * as ReactDOM from 'react-dom';
import styled, { createGlobalStyle } from 'styled-components';
import './ui.css';
// TODO: missing fonts?
// TODO: handle / prevent blurring
const GlobalStyles = createGlobalStyle `
    * {
        margin: 0;
        padding: 0;
        box-sizing: border-box;
        outline: none;
    }
    :root {
        font-family: Roboto, sans-serif;
        font-size: 12px;
    }
`;
const StyledAppContainer = styled.div ``;
const BaseCard = styled.div `
    background: white;
    padding: 10px 16px;

    & + & {
        border-top: 1px solid #e8e8e8;
    }
`;
const OptionBar = styled(BaseCard) `
    position: fixed;
    bottom: 0;
    left: 0;
    right: 0;
    border-top: 1px solid #e8e8e8;
`;
const FontCard = styled(BaseCard) `
    cursor: pointer;

    &:hover {
        background-color: rgba(0, 186, 255, 0.2);
    }
    &:focus {
        background-color: rgba(0, 186, 255, 1);
        color: white;
    }
`;
const KEY_STEP_MAP = {
    ArrowUp: -1,
    ArrowDown: 1,
};
const sendMessage = (payload) => {
    parent.postMessage({
        pluginMessage: Object.assign({}, payload),
    }, '*');
};
const getUniqueKey = (fontName) => `${fontName.family}-${fontName.style}`;
const App = () => {
    const [fontNames, setFontNames] = React.useState([]);
    const [shouldKeepOpen, setShouldKeepOpen] = React.useState(false);
    const [isLoaded, setIsLoaded] = React.useState(false);
    const fontRefs = {};
    React.useEffect(() => {
        onmessage = (message) => {
            const { fontNames: storedFontNames, shouldKeepOpen: storedShouldKeepOpen, } = message.data.pluginMessage;
            const sortedFontNames = storedFontNames.sort((a, b) => {
                return a.family < b.family ? -1 : b.family < a.family ? 1 : 0;
            });
            setFontNames(sortedFontNames);
            setShouldKeepOpen(storedShouldKeepOpen);
            setIsLoaded(true);
        };
        sendMessage({ type: 'loadInitialState' });
    }, []);
    React.useEffect(() => {
        if (!isLoaded) {
            return;
        }
        const firstFontRef = fontRefs[getUniqueKey(fontNames[0])];
        firstFontRef.focus();
    }, [fontRefs, fontNames, isLoaded]);
    React.useEffect(() => {
        if (isLoaded) {
            sendMessage({
                type: 'saveShouldKeepOpenStatus',
                shouldKeepOpen,
            });
        }
    }, [isLoaded, shouldKeepOpen]);
    const handleClick = (fontName) => {
        sendMessage({ type: 'applyFont', fontName, shouldKeepOpen });
    };
    const handleKeyDown = (evt, fontName) => {
        evt.preventDefault();
        if (evt.key === 'Escape') {
            sendMessage({ type: 'close' });
            return;
        }
        if (evt.key === 'Enter') {
            sendMessage({
                type: 'applyFont',
                fontName,
                shouldKeepOpen,
            });
            return;
        }
        const step = KEY_STEP_MAP[evt.key] || null;
        if (step !== null) {
            const currentIndex = fontNames.indexOf(fontName);
            const nextIndex = (currentIndex + step) % fontNames.length;
            const newIndex = nextIndex >= 0 ? nextIndex : fontNames.length - 1;
            const newFontName = fontNames[newIndex];
            fontRefs[getUniqueKey(newFontName)].focus();
        }
    };
    return (React.createElement(StyledAppContainer, null,
        React.createElement(GlobalStyles, null),
        !isLoaded && React.createElement("div", null, "...loading... "),
        isLoaded && !fontNames.length && React.createElement("div", null, "No text nodes found \uD83E\uDD14"),
        isLoaded && (React.createElement(React.Fragment, null,
            React.createElement(OptionBar, null,
                React.createElement("label", null,
                    React.createElement("input", { type: "checkbox", checked: shouldKeepOpen, onChange: () => setShouldKeepOpen(!shouldKeepOpen) }),
                    ' ',
                    "Keep Open")),
            fontNames.map((fontName) => {
                const key = getUniqueKey(fontName);
                return (React.createElement(FontCard, { key: key, ref: (ref) => (fontRefs[key] = ref), tabIndex: 0, onClick: () => handleClick(fontName), onKeyDown: (evt) => handleKeyDown(evt, fontName) },
                    fontName.family,
                    ' ',
                    fontName.style !== 'Regular' && fontName.style));
            })))));
};
ReactDOM.render(React.createElement(App, null), document.getElementById('react-page'));
