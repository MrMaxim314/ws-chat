const { DynamoDBClient } = require('@aws-sdk/client-dynamodb');
const {
    DynamoDBDocumentClient,
    DeleteCommand,
} = require('@aws-sdk/lib-dynamodb');

const client = new DynamoDBClient({ region: 'us-east-1' });
const docClient = DynamoDBDocumentClient.from(client);

module.exports.disConnect = async (connectionId) => {
    const input = new DeleteCommand({
        TableName: process.env.DYNAMODB_TABLE,
        Key: {
            connectionId: connectionId,
        },
    });

    try {
        const response = await docClient.send(input);
        console.log(response);

        return { statusCode: 200, body: JSON.stringify('disconnected') };
    } catch (err) {
        return {
            statusCode: 500,
            body: 'Failed: ' + JSON.stringify(err),
        };
    }
};
