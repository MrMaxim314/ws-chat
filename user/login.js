const AWS = require('aws-sdk');
const { createHmac } = require('crypto');

const cognito = new AWS.CognitoIdentityServiceProvider();

const poolData = {
    UserPoolId: process.env.USER_POOL_ID,
    ClientId: process.env.CLIENT_ID,
    ClientSecret: process.env.CLIENT_SECRET,
};

module.exports.handler = async (event) => {
    const { email, password } = JSON.parse(event.body);
    const secretHash = createHmac('sha256', poolData.ClientSecret)
        .update(`${email}${poolData.ClientId}`)
        .digest('base64');

    const params = {
        AuthFlow: 'ADMIN_NO_SRP_AUTH',
        UserPoolId: poolData.UserPoolId,
        ClientId: poolData.ClientId,
        AuthParameters: {
            USERNAME: email,
            PASSWORD: password,
            SECRET_HASH: secretHash,
        },
    };

    const response = await cognito.adminInitiateAuth(params).promise();

    return {
        status: 200,
        body: JSON.stringify(response.AuthenticationResult),
    };
};
