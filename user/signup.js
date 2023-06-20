const AWS = require('aws-sdk');

const cognito = new AWS.CognitoIdentityServiceProvider();

const poolData = {
    UserPoolId: process.env.USER_POOL_ID,
    ClientId: process.env.CLIENT_ID,
};

module.exports.handler = async (event) => {
    const { email, name, password } = JSON.parse(event.body);
    const params = {
        UserPoolId: poolData.UserPoolId,
        Username: email,
        UserAttributes: [
            {
                Name: 'email',
                Value: email,
            },
            {
                Name: 'name',
                Value: name,
            },
        ],
    };

    const response = await cognito.adminCreateUser(params).promise();

    if (response.User) {
        const paramsForSetPass = {
            Password: password,
            UserPoolId: poolData.UserPoolId,
            Username: email,
            Permanent: true,
        };
        await cognito.adminSetUserPassword(paramsForSetPass).promise();
    }

    return {
        statusCode: 200,
        body: JSON.stringify(response),
    };
};
