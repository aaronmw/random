import * as React from 'react';
import throttle from 'lodash/throttle';

const sharedIndicatorStyles = {
    position: 'absolute',
    right: 0,
    left: 0,
    height: '50px',
    pointerEvents: 'none',
    transition: 'opacity 0.2s ease-in-out',
};

const FadedOverflow = ({ children, height = null, maxHeight = null }) => {
    const [scrollTop, setScrollTop] = React.useState(0);
    const [elementHeight, setElementHeight] = React.useState(0);
    const [scrollHeight, setScrollHeight] = React.useState(0);
    const scrollingElementRef = React.useRef(null);

    React.useEffect(() => {
        const currentEl = scrollingElementRef.current;
        const throttledSetScrollTop = throttle(evt => {
            setScrollTop(evt.target.scrollTop);
        }, 50);

        if (currentEl) {
            setScrollHeight(currentEl.scrollHeight);
            setElementHeight(currentEl.offsetHeight);
            scrollingElementRef.current.addEventListener(
                'scroll',
                throttledSetScrollTop,
            );
        }

        return () => {
            scrollingElementRef.current.removeEventListener(
                'scroll',
                throttledSetScrollTop,
            );
        };
    }, [scrollingElementRef.current]);

    const isScrolledToTop = scrollTop === 0;
    const isScrolledToBottom =
        scrollHeight === elementHeight ||
        (scrollTop > 0 && scrollTop + elementHeight === scrollHeight);

    return (
        <div
            style={{
                position: 'relative',
            }}
        >
            <div
                // @ts-ignore
                style={{
                    ...sharedIndicatorStyles,
                    opacity: isScrolledToTop ? 0 : 1,
                    top: 0,
                    background:
                        'linear-gradient(white, rgba(255, 255, 255, 0))',
                }}
            />
            <div
                // @ts-ignore
                style={{
                    ...sharedIndicatorStyles,
                    opacity: isScrolledToBottom ? 0 : 1,
                    bottom: 0,
                    background:
                        'linear-gradient(rgba(255, 255, 255, 0), white)',
                }}
            />
            <div
                ref={scrollingElementRef}
                style={{
                    height,
                    maxHeight,
                    overflow: 'auto',
                }}
            >
                {children}
            </div>
        </div>
    );
};

export default FadedOverflow;
