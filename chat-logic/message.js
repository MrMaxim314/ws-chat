const AWS = require('aws-sdk');
const { DynamoDBClient } = require('@aws-sdk/client-dynamodb');
const {
    DynamoDBDocumentClient,
    ScanCommand,
    DeleteCommand,
} = require('@aws-sdk/lib-dynamodb');

const client = new DynamoDBClient({});
const docClient = DynamoDBDocumentClient.from(client);

module.exports.onMessage = async (event, connectionId) => {
    let connectionData;

    try {
        const scanCommand = new ScanCommand({
            TableName: process.env.DYNAMODB_TABLE,
            FilterExpression: '#DYNOBASE_connectionId = :connectionId',
            ExpressionAttributeNames: {
                '#DYNOBASE_connectionId': 'connectionId',
            },
            ExpressionAttributeValues: {
                ':connectionId': connectionId,
            },
        });
        connectionData = await docClient.send(scanCommand);
    } catch (e) {
        return { statusCode: 500, body: e.stack };
    }

    const apigwManagementApi = new AWS.ApiGatewayManagementApi({
        apiVersion: '2018-11-29',
        endpoint:
            event.requestContext.domainName + '/' + event.requestContext.stage,
    });

    const postData = JSON.parse(event.body).message;

    const postCalls = connectionData.Items.map(async ({ connectionId }) => {
        try {
            await apigwManagementApi
                .postToConnection({
                    ConnectionId: connectionId,
                    Data: postData,
                })
                .promise();
        } catch (e) {
            if (e.statusCode === 410) {
                const deleteCommand = new DeleteCommand({
                    TableName: process.env.DYNAMODB_TABLE,
                    Key: {
                        connectionId: connectionId,
                    },
                });
                console.log(`Found stale connection, deleting ${connectionId}`);
                await docClient.send(deleteCommand);
            } else {
                throw e;
            }
        }
    });

    try {
        await Promise.all(postCalls);
    } catch (e) {
        console.log(e);
        return { statusCode: 500, body: e.stack };
    }

    return { statusCode: 200, body: 'Data sent.' };
};
