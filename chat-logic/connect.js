const { DynamoDBClient } = require('@aws-sdk/client-dynamodb');
const { DynamoDBDocumentClient, PutCommand } = require('@aws-sdk/lib-dynamodb');

const client = new DynamoDBClient({ region: 'us-east-1' });
const docClient = DynamoDBDocumentClient.from(client);

module.exports.onConnect = async (connectionId) => {
    const input = new PutCommand({
        TableName: process.env.DYNAMODB_TABLE,
        Item: {
            connectionId: connectionId,
            status: 'ONLINE',
        },
    });

    try {
        const response = await docClient.send(input);
        console.log(response);
    } catch (err) {
        return {
            statusCode: 500,
            body: 'Failed: ' + JSON.stringify(err),
        };
    }

    return { statusCode: 200, body: JSON.stringify('Ok') };
};
