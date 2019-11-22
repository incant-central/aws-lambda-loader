'use strict';

const AWS = require('aws-sdk');

const isPlainObj = v =>
    Object.prototype.toString.call(v) === '[object Object]';

const mergeWithDefault = (v, d) =>
    d == null                     ? JSON.stringify(v)
  : [ d, v ].every(Array.isArray) ? [ ...d, ...v ]
  : [ d, v ].every(isPlainObj)    ? { ...d, ...v }
  :                                 v;

function parsePath(data, path) {
    const [ key, ...nextPath ] = path;
    try {
        const result = JSON.parse(data[key]);
        return nextPath.length
            ? parsePath(result, nextPath)
            : result;
    } catch (e) {
        return data;
    }
}

async function AwsLambdaLoader({
        spec,
        input:Payload = {}
    }) {
    const {
        FunctionName,
        InvocationType = 'RequestResponse',
        apiVersion = '2015-03-31',
        region = 'us-east-1'
    } = typeof spec === 'string'
        ? {
            FunctionName: spec
          }
        : spec;

    if (typeof FunctionName !== 'string') throw new Error('invalid lambda function');

    const lambda = new AWS.Lambda({ apiVersion, region });

    function awsLambdaTask(payload = {}) {
        Payload = JSON.stringify(mergeWithDefault(payload, Payload));
        return new Promise((resolve, reject) =>

            lambda.invoke({
                FunctionName,
                InvocationType,
                Payload
            }, (err, data) => {
                if (err) return reject(err)
                resolve(parsePath(data, [ 'Payload', 'body' ]));
            }));
    }

    return awsLambdaTask;
}

AwsLambdaLoader.study = () => [
    'FunctionName',
    'InvocationType',
    'region',
    'apiVersion'
];

module.exports = AwsLambdaLoader;
