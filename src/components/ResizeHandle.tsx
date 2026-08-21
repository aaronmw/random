import * as React from 'react';
import styled from 'styled-components';
import {
    DEFAULT_UI_HEIGHT,
    MAX_UI_HEIGHT,
    MIN_UI_HEIGHT,
    RESIZE_HANDLE_HEIGHT,
    UI_WIDTH,
} from '../config';
import { sendMessage } from '../pluginMessage';
import { COLOR_BG, COLOR_BLUE, COLOR_BORDER, COLOR_TEXT_LIGHT } from './layout';

const KEYBOARD_RESIZE_STEP = 40;

const clampUiHeight = height =>
    Math.round(Math.max(MIN_UI_HEIGHT, Math.min(MAX_UI_HEIGHT, height)));

const readWindowHeight = () =>
    clampUiHeight(
        window.visualViewport?.height ||
            window.innerHeight ||
            document.documentElement.clientHeight ||
            DEFAULT_UI_HEIGHT,
    );

const postResize = (height, persist) => {
    sendMessage({
        type: 'ui-resize',
        width: UI_WIDTH,
        height,
        persist,
    });
};

const StyledResizeHandle = styled.div`
    position: fixed;
    left: 0;
    right: 0;
    bottom: 0;
    z-index: 103;
    height: ${RESIZE_HANDLE_HEIGHT}px;
    margin: 0;
    padding: 0;
    border: 0;
    border-top: 1px solid ${COLOR_BORDER};
    border-bottom: 1px solid rgba(0, 0, 0, 0.05);
    background: ${COLOR_BG};
    cursor: ns-resize;
    display: flex;
    align-items: center;
    justify-content: center;
    touch-action: none;

    &:before {
        content: '';
        width: 36px;
        height: 3px;
        border-radius: 999px;
        background: ${COLOR_TEXT_LIGHT};
        opacity: 0.75;
        transition:
            background 0.15s ease-in-out,
            opacity 0.15s ease-in-out;
    }

    &:hover,
    &:focus {
        background: white;
        outline: none;
    }

    &:hover:before,
    &:focus:before,
    &[data-dragging='true']:before {
        opacity: 1;
        background: ${COLOR_BLUE};
    }

    &[data-dragging='true'] {
        background: white;
    }
`;

const ResizeHandle = ({ onResizeHeight }) => {
    const [isDragging, setIsDragging] = React.useState(false);
    const startRef = React.useRef(null);
    const pendingHeightRef = React.useRef(null);
    const lastSentHeightRef = React.useRef(null);
    const frameRef = React.useRef(null);
    const handleElementRef = React.useRef(null);
    const pointerIdRef = React.useRef(null);

    const flushResize = React.useCallback(
        persist => {
            const nextHeight = pendingHeightRef.current;

            if (nextHeight === null) {
                return;
            }

            if (persist || lastSentHeightRef.current !== nextHeight) {
                postResize(nextHeight, persist);
                lastSentHeightRef.current = nextHeight;
            }

            if (persist) {
                onResizeHeight(nextHeight);
            }
        },
        [onResizeHeight],
    );

    const scheduleResize = React.useCallback(() => {
        if (frameRef.current !== null) {
            return;
        }

        frameRef.current = window.requestAnimationFrame(() => {
            frameRef.current = null;
            flushResize(false);
        });
    }, [flushResize]);

    const handlePointerMove = React.useCallback(
        evt => {
            const start = startRef.current;

            if (start === null) {
                return;
            }

            pendingHeightRef.current = clampUiHeight(
                start.height + evt.clientY - start.y,
            );
            scheduleResize();
        },
        [scheduleResize],
    );

    const releasePointerCapture = React.useCallback(() => {
        if (
            handleElementRef.current === null ||
            pointerIdRef.current === null
        ) {
            return;
        }

        try {
            handleElementRef.current.releasePointerCapture(
                pointerIdRef.current,
            );
        } catch (_error) {
            // Pointer capture may already be released by the browser.
        }
    }, []);

    const handlePointerUp = React.useCallback(() => {
        if (frameRef.current !== null) {
            window.cancelAnimationFrame(frameRef.current);
            frameRef.current = null;
        }

        flushResize(true);
        releasePointerCapture();
        startRef.current = null;
        pendingHeightRef.current = null;
        handleElementRef.current = null;
        pointerIdRef.current = null;
        setIsDragging(false);
    }, [flushResize, releasePointerCapture]);

    React.useEffect(() => {
        if (!isDragging) {
            return undefined;
        }

        document.addEventListener('pointermove', handlePointerMove);
        document.addEventListener('pointerup', handlePointerUp);
        document.addEventListener('pointercancel', handlePointerUp);

        return () => {
            document.removeEventListener('pointermove', handlePointerMove);
            document.removeEventListener('pointerup', handlePointerUp);
            document.removeEventListener('pointercancel', handlePointerUp);
        };
    }, [handlePointerMove, handlePointerUp, isDragging]);

    React.useEffect(() => {
        return () => {
            if (frameRef.current !== null) {
                window.cancelAnimationFrame(frameRef.current);
            }
        };
    }, []);

    const handlePointerDown = React.useCallback(evt => {
        evt.preventDefault();

        try {
            evt.currentTarget.setPointerCapture(evt.pointerId);
        } catch (_error) {
            // Document-level listeners still allow resizing without capture.
        }

        const currentHeight = readWindowHeight();
        startRef.current = { y: evt.clientY, height: currentHeight };
        pendingHeightRef.current = currentHeight;
        lastSentHeightRef.current = currentHeight;
        handleElementRef.current = evt.currentTarget;
        pointerIdRef.current = evt.pointerId;
        setIsDragging(true);
    }, []);

    const handleKeyDown = React.useCallback(
        evt => {
            if (evt.key !== 'ArrowUp' && evt.key !== 'ArrowDown') {
                return;
            }

            evt.preventDefault();

            const direction = evt.key === 'ArrowDown' ? 1 : -1;
            const nextHeight = clampUiHeight(
                readWindowHeight() + direction * KEYBOARD_RESIZE_STEP,
            );

            postResize(nextHeight, true);
            onResizeHeight(nextHeight);
        },
        [onResizeHeight],
    );

    return (
        <StyledResizeHandle
            aria-label="Resize plugin"
            aria-orientation="horizontal"
            data-dragging={isDragging}
            role="separator"
            tabIndex={0}
            title="Drag to resize the plugin panel"
            onKeyDown={handleKeyDown}
            onPointerDown={handlePointerDown}
        />
    );
};

export default ResizeHandle;
