'use strict';

const AWS = require('aws-sdk');

function AwsLambdaLoader(main = {}) {
    const spec = typeof main === 'string'
        ? { fn: main }
        : main.spec || {};

    const {
        fn,
        region = 'us-east-1',
        type = 'RequestResponse'
    } = spec;

    if (typeof fn !== 'string') throw new Error('Invalid AWS lambda resource identifier');

    function awsLambdaTask(payload = {}, { name:cmdPath }) {
        const lambda = new AWS.Lambda({
            apiVersion: '2015-03-31',
            region
        });
        return new Promise((resolve, reject) => lambda.invoke({
            FunctionName: fn,
            InvocationType: type,
            Payload: JSON.stringify(payload)
        }, (err, data) => {
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
            return err
                ? reject(err)
                : resolve(body);
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
