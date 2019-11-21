'use strict';

const AWS = require('aws-sdk');

function AwsLambdaLoader({ spec } = {}) {

    const {
        resource:FunctionName,
        apiVersion = '2015-03-31',
        region = 'us-east-1',
        type:InvocationType = 'RequestResponse'
    } = spec;

    if (typeof FunctionName !== 'string') throw new Error('invalid lambda function');

    const lambda = new AWS.Lambda({
        apiVersion
        region
    });

    function awsLambdaTask(payload = {}) {
        const Payload = JSON.stringify(payload);

        return new Promise((resolve, reject) =>
            lambda.invoke({
                FunctionName,
                InvocationType,
                Payload
            }, (err, data) => {
                if (err) return reject(err)
                let response;
                let body;
                try {
                    response = JSON.parse(data.Payload);
                    try {
                        body = JSON.parse(response.body);
                    } catch {
                        body = response;
                    }
                } catch (e) {
                    return reject(e);
                }
                return resolve(body);
            }));
    }

    return awsLambdaTask;
}

AwsLambdaLoader.study = () => [
    'fn',
    'region',
    'type'
];

module.exports = AwsLambdaLoader;
