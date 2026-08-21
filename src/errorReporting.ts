export type ErrorReportSource = 'plugin' | 'ui' | 'ui-startup';

export type ErrorReport = {
    id: string;
    timestamp: string;
    version: string;
    source: ErrorReportSource;
    name: string;
    message: string;
    stack: string | null;
    context: Record<string, unknown>;
};

declare const __PLUGIN_VERSION__: string;

const createErrorId = () => {
    const timestamp = Date.now().toString(36).toUpperCase();
    const randomSuffix = Math.random().toString(36).slice(2, 7).toUpperCase();
    return `PR-${timestamp}-${randomSuffix}`;
};

const safelyStringifyValue = (value: unknown, fallback = 'Unknown error') => {
    try {
        return String(value ?? fallback);
    } catch (_error) {
        return fallback;
    }
};

const normalizeError = (error: unknown) => {
    if (error instanceof Error) {
        return {
            name: error.name || 'Error',
            message: error.message || 'Unknown error',
            stack: error.stack || null,
        };
    }

    if (error !== null && typeof error === 'object') {
        const possibleError = error as {
            name?: unknown;
            message?: unknown;
            stack?: unknown;
        };

        return {
            name:
                typeof possibleError.name === 'string'
                    ? possibleError.name
                    : 'Error',
            message:
                typeof possibleError.message === 'string'
                    ? possibleError.message
                    : safelyStringifyValue(error),
            stack:
                typeof possibleError.stack === 'string'
                    ? possibleError.stack
                    : null,
        };
    }

    return {
        name: 'Error',
        message: safelyStringifyValue(error),
        stack: null,
    };
};

export const createErrorReport = ({
    source,
    error,
    context = {},
}: {
    source: ErrorReportSource;
    error: unknown;
    context?: Record<string, unknown>;
}): ErrorReport => {
    return {
        id: createErrorId(),
        timestamp: new Date().toISOString(),
        version: __PLUGIN_VERSION__,
        source,
        ...normalizeError(error),
        context,
    };
};

export const formatErrorReport = (report: ErrorReport) => {
    let serializedReport: string;

    try {
        serializedReport = JSON.stringify(report, null, 2);
    } catch (error) {
        serializedReport = JSON.stringify(
            {
                id: report?.id || 'Unknown',
                message: report?.message || 'Could not serialize error report',
                serializationError: safelyStringifyValue(error),
            },
            null,
            2,
        );
    }

    return ['Property Randomizer error report', '', serializedReport].join(
        '\n',
    );
};
