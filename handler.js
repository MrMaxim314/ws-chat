const { onConnect } = require('./chat-logic/connect');
const { disConnect } = require('./chat-logic/disconnect');
const { onMessage } = require('./chat-logic/message');

module.exports.handler = async (event) => {
    const { routeKey } = event.requestContext;
    const connectionId = event.requestContext.connectionId;

    if (routeKey === '$connect') {
        await onConnect(connectionId);
    } else if (routeKey === '$disconnect') {
        await disConnect(connectionId);
    } else if (routeKey === '$default') {
        onMessage(event, connectionId);
    }

    return { statusCode: 200 };
};
