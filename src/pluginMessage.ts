export const sendMessage = payload => {
    parent.postMessage(
        {
            pluginMessage: payload,
        },
        '*',
    );
};
