import * as React from 'react';
import { createRoot } from 'react-dom/client';
import clone from 'lodash/clone';
import setWith from 'lodash/setWith';
import About from './components/About';
import { GlobalStyles, StyledAppContainer } from './components/layout';
import { NavBar } from './components/Navigation';
import {
    INITIAL_PLUGIN_STATE,
    sanitizePluginState,
    toUiHeight,
} from './pluginState';
import ConfigBuilder from './components/ConfigBuilder';
import ResizeHandle from './components/ResizeHandle';
import { sendMessage } from './pluginMessage';
import {
    createErrorReport,
    ErrorReport,
    formatErrorReport,
} from './errorReporting';

const INITIAL_STATE = INITIAL_PLUGIN_STATE;

const copyText = async (text: string) => {
    if (navigator.clipboard && navigator.clipboard.writeText) {
        try {
            await navigator.clipboard.writeText(text);
            return true;
        } catch (error) {
            console.warn('Clipboard API failed; trying fallback copy.', error);
        }
    }

    const textarea = document.createElement('textarea');
    textarea.value = text;
    textarea.style.position = 'fixed';
    textarea.style.opacity = '0';
    document.body.appendChild(textarea);
    textarea.select();

    try {
        return document.execCommand('copy');
    } finally {
        textarea.remove();
    }
};

const ErrorScreen = ({ report }: { report: ErrorReport }) => {
    const [copyButtonLabel, setCopyButtonLabel] =
        React.useState('Copy error report');

    const handleCopy = async () => {
        let didCopy = false;

        try {
            didCopy = await copyText(formatErrorReport(report));
        } catch (error) {
            console.error('Could not copy the error report.', error);
        }

        setCopyButtonLabel(didCopy ? 'Copied' : 'Copy failed');
    };

    return (
        <div
            style={{
                boxSizing: 'border-box',
                display: 'flex',
                flexDirection: 'column',
                gap: 12,
                minHeight: '100vh',
                padding: 20,
                background: '#fff',
                color: '#222',
                fontFamily:
                    'Inter, -apple-system, BlinkMacSystemFont, sans-serif',
                fontSize: 12,
                lineHeight: 1.45,
            }}
        >
            <strong style={{ fontSize: 14 }}>
                Property Randomizer hit an error
            </strong>
            <span>
                Copy this report and include it when you reach out. It contains
                the error message, stack trace, plugin version, and reference
                ID. For plugin actions, it may also include the selected layer's
                name and ID.
            </span>
            <code
                style={{
                    padding: 10,
                    borderRadius: 4,
                    background: '#f2f2f2',
                    userSelect: 'text',
                    wordBreak: 'break-word',
                }}
            >
                {report.id}: {report.message}
            </code>
            <div style={{ display: 'flex', gap: 8 }}>
                <button
                    type="button"
                    onClick={handleCopy}
                    style={{
                        border: 0,
                        borderRadius: 4,
                        padding: '8px 10px',
                        background: '#0d99ff',
                        color: '#fff',
                        cursor: 'pointer',
                    }}
                >
                    {copyButtonLabel}
                </button>
                <button
                    type="button"
                    onClick={() => window.location.reload()}
                    style={{
                        border: '1px solid #ddd',
                        borderRadius: 4,
                        padding: '8px 10px',
                        background: '#fff',
                        color: '#222',
                        cursor: 'pointer',
                    }}
                >
                    Reload plugin UI
                </button>
            </div>
        </div>
    );
};

const publishUiError = (report: ErrorReport) => {
    console.error(`[Property Randomizer ${report.id}]`, report);

    try {
        sendMessage({
            type: 'uiError',
            report,
        });
    } catch (error) {
        console.error('Could not send UI error report to the plugin.', error);
    }
};

class UiErrorBoundary extends React.Component<
    React.PropsWithChildren,
    { report: ErrorReport | null }
> {
    state = {
        report: null,
    };

    static getDerivedStateFromError(error: unknown) {
        return {
            report: createErrorReport({
                source: 'ui',
                error,
                context: {
                    path: window.location.href,
                    userAgent: navigator.userAgent,
                },
            }),
        };
    }

    componentDidMount() {
        const startupReady = (window as any).__propertyRandomizerStartupReady;
        if (typeof startupReady === 'function') {
            startupReady();
        }

        window.addEventListener('error', this.handleWindowError);
        window.addEventListener(
            'unhandledrejection',
            this.handleUnhandledRejection,
        );
    }

    componentDidCatch(_error: unknown, errorInfo: React.ErrorInfo) {
        const report = {
            ...(this.state.report ||
                createErrorReport({ source: 'ui', error: _error })),
            context: {
                ...(this.state.report?.context || {}),
                componentStack: errorInfo.componentStack || null,
            },
        };

        this.setState({ report });
        publishUiError(report);
    }

    componentWillUnmount() {
        window.removeEventListener('error', this.handleWindowError);
        window.removeEventListener(
            'unhandledrejection',
            this.handleUnhandledRejection,
        );
    }

    handleWindowError = (event: ErrorEvent) => {
        const report = createErrorReport({
            source: 'ui',
            error: event.error || event.message,
            context: {
                filename: event.filename || null,
                line: event.lineno || null,
                column: event.colno || null,
                path: window.location.href,
                userAgent: navigator.userAgent,
            },
        });

        this.setState({ report });
        publishUiError(report);
    };

    handleUnhandledRejection = (event: PromiseRejectionEvent) => {
        const report = createErrorReport({
            source: 'ui',
            error: event.reason,
            context: {
                path: window.location.href,
                userAgent: navigator.userAgent,
            },
        });

        this.setState({ report });
        publishUiError(report);
    };

    render() {
        if (this.state.report) {
            return <ErrorScreen report={this.state.report} />;
        }

        return this.props.children;
    }
}

export const App = () => {
    const [isLoaded, setIsLoaded] = React.useState(false);
    const [pluginState, setPluginState] = React.useState(() =>
        sanitizePluginState(INITIAL_STATE),
    );
    const [pluginError, setPluginError] = React.useState<ErrorReport | null>(
        null,
    );

    React.useEffect(() => {
        let hasReceivedInitialState = false;

        const requestInitialState = () => {
            sendMessage({
                type: 'init',
                initialState: INITIAL_STATE,
            });
        };

        const handleMessage = message => {
            const pluginMessage = message.data && message.data.pluginMessage;

            if (!pluginMessage) {
                return;
            }

            if (pluginMessage.type === 'pluginError' && pluginMessage.report) {
                console.error(
                    `[Property Randomizer ${pluginMessage.report.id}]`,
                    pluginMessage.report,
                );
                setPluginError(pluginMessage.report);
                return;
            }

            hasReceivedInitialState = true;

            setPluginState(sanitizePluginState(pluginMessage));
            setIsLoaded(true);
        };

        window.addEventListener('message', handleMessage);
        requestInitialState();

        const retryTimeout = window.setTimeout(() => {
            if (!hasReceivedInitialState) {
                requestInitialState();
            }
        }, 750);

        return () => {
            window.clearTimeout(retryTimeout);
            window.removeEventListener('message', handleMessage);
        };
    }, []);

    React.useEffect(() => {
        if (!isLoaded) {
            return;
        }

        sendMessage({
            type: 'saveState',
            params: pluginState,
        });
    }, [isLoaded, pluginState]);

    const onUpdateState = React.useCallback(({ path, newValue }) => {
        setPluginState(pluginState =>
            setWith(clone(pluginState), path, newValue, clone),
        );
    }, []);

    const handleResizeHeight = React.useCallback(
        height => {
            onUpdateState({
                path: ['uiHeight'],
                newValue: toUiHeight(height),
            });
        },
        [onUpdateState],
    );

    const activeRoute = pluginState.activeRoute;

    if (pluginError) {
        return <ErrorScreen report={pluginError} />;
    }

    return (
        <StyledAppContainer>
            <GlobalStyles />
            <NavBar activeRoute={activeRoute} onUpdateState={onUpdateState} />
            {activeRoute === 'randomizer' && (
                <ConfigBuilder
                    pluginState={pluginState}
                    sendMessage={sendMessage}
                    onUpdateState={onUpdateState}
                />
            )}
            {activeRoute === 'about' && <About />}
            <ResizeHandle onResizeHeight={handleResizeHeight} />
        </StyledAppContainer>
    );
};

const mountApp = () => {
    const rootElement = document.getElementById('react-page');

    if (rootElement) {
        createRoot(rootElement).render(
            <UiErrorBoundary>
                <App />
            </UiErrorBoundary>,
        );
        return true;
    }

    const error = new Error('The plugin UI root element is missing.');
    const showStartupError = (window as any)
        .__propertyRandomizerShowStartupError;

    if (typeof showStartupError === 'function') {
        showStartupError(error, 'mount');
    } else {
        console.error(error);
    }

    return false;
};

if (!mountApp() && document.readyState === 'loading') {
    window.addEventListener('DOMContentLoaded', mountApp, { once: true });
}
