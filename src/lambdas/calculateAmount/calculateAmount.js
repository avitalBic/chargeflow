{
    "Comment": "A description of my state machine",
    "StartAt": "calculateAmount",
    "States": {
    "calculateAmount": {
        "Type": "Task",
            "Resource": "arn:aws:states:::lambda:invoke",
            "OutputPath": "$.Payload",
            "Parameters": {
            "Payload.$": "$",
                "FunctionName": "arn:aws:lambda:us-east-1:728435501085:function:Z_calculateAmount:$LATEST"
        },
        "Retry": [
            {
                "ErrorEquals": [
                    "Lambda.ServiceException",
                    "Lambda.AWSLambdaException",
                    "Lambda.SdkClientException",
                    "Lambda.TooManyRequestsException"
                ],
                "IntervalSeconds": 1,
                "MaxAttempts": 3,
                "BackoffRate": 2
            }
        ],
            "Next": "invokeBilling3Party"
    },
    "invokeBilling3Party": {
        "Type": "Task",
            "Resource": "arn:aws:states:::lambda:invoke",
            "OutputPath": "$.Payload",
            "Parameters": {
            "Payload.$": "$",
                "FunctionName": "arn:aws:lambda:us-east-1:728435501085:function:z_invokeBilling3Party:$LATEST"
        },
        "Retry": [
            {
                "ErrorEquals": [
                    "Lambda.ServiceException",
                    "Lambda.AWSLambdaException",
                    "Lambda.SdkClientException",
                    "Lambda.TooManyRequestsException"
                ],
                "MaxAttempts": 3,
                "BackoffRate": 2,
                "IntervalSeconds": 30
            }
        ],
            "Next": "Parallel",
            "Catch": [
            {
                "ErrorEquals": [
                    "States.TaskFailed"
                ]
            }
        ]
    },
    "Parallel": {
        "Type": "Parallel",
            "Branches": [
            {
                "StartAt": "sendInvoice",
                "States": {
                    "sendInvoice": {
                        "Type": "Task",
                        "Resource": "arn:aws:states:::lambda:invoke",
                        "OutputPath": "$.Payload",
                        "Parameters": {
                            "Payload.$": "$",
                            "FunctionName": "arn:aws:lambda:us-east-1:728435501085:function:z_sendInvoice:$LATEST"
                        },
                        "Retry": [
                            {
                                "ErrorEquals": [
                                    "Lambda.ServiceException",
                                    "Lambda.AWSLambdaException",
                                    "Lambda.SdkClientException",
                                    "Lambda.TooManyRequestsException"
                                ],
                                "IntervalSeconds": 1,
                                "MaxAttempts": 3,
                                "BackoffRate": 2
                            }
                        ],
                        "Next": "SendEmail"
                    },
                    "SendEmail": {
                        "Type": "Task",
                        "Parameters": {
                            "Destination": {},
                            "Message": {
                                "Body": {},
                                "Subject": {
                                    "Data": "MyData"
                                }
                            },
                            "Source": "MyData"
                        },
                        "Resource": "arn:aws:states:::aws-sdk:ses:sendEmail",
                        "End": true
                    }
                }
            },
            {
                "StartAt": "updateDB",
                "States": {
                    "updateDB": {
                        "Type": "Task",
                        "Resource": "arn:aws:states:::lambda:invoke",
                        "OutputPath": "$.Payload",
                        "Parameters": {
                            "Payload.$": "$"
                        },
                        "Retry": [
                            {
                                "ErrorEquals": [
                                    "Lambda.ServiceException",
                                    "Lambda.AWSLambdaException",
                                    "Lambda.SdkClientException",
                                    "Lambda.TooManyRequestsException"
                                ],
                                "IntervalSeconds": 1,
                                "MaxAttempts": 3,
                                "BackoffRate": 2,
                                "Comment": "if fail"
                            }
                        ],
                        "Next": "DynamoDB PutItem"
                    },
                    "DynamoDB PutItem": {
                        "Type": "Task",
                        "Resource": "arn:aws:states:::dynamodb:putItem",
                        "Parameters": {
                            "TableName": "MyDynamoDBTable",
                            "Item": {
                                "Column": {
                                    "S": "MyEntry"
                                }
                            }
                        },
                        "End": true
                    }
                }
            },
            {
                "StartAt": "sensSnsForShipment3party",
                "States": {
                    "sensSnsForShipment3party": {
                        "Type": "Task",
                        "Resource": "arn:aws:states:::lambda:invoke",
                        "OutputPath": "$.Payload",
                        "Parameters": {
                            "Payload.$": "$"
                        },
                        "Retry": [
                            {
                                "ErrorEquals": [
                                    "Lambda.ServiceException",
                                    "Lambda.AWSLambdaException",
                                    "Lambda.SdkClientException",
                                    "Lambda.TooManyRequestsException"
                                ],
                                "IntervalSeconds": 1,
                                "MaxAttempts": 3,
                                "BackoffRate": 2
                            }
                        ],
                        "Next": "CreateTopic"
                    },
                    "CreateTopic": {
                        "Type": "Task",
                        "Parameters": {
                            "Name": "MyData"
                        },
                        "Resource": "arn:aws:states:::aws-sdk:sns:createTopic",
                        "Next": "SendMessageBatch"
                    },
                    "SendMessageBatch": {
                        "Type": "Task",
                        "End": true,
                        "Parameters": {
                            "Entries": [
                                {
                                    "Id": "MyData",
                                    "MessageBody": "MyData"
                                }
                            ],
                            "QueueUrl": "MyData"
                        },
                        "Resource": "arn:aws:states:::aws-sdk:sqs:sendMessageBatch"
                    }
                }
            }
        ],
            "Next": "Choice"
    },
    "Choice": {
        "Type": "Choice",
            "Choices": [
            {
                "Next": "Success"
            }
        ],
            "Default": "handelFailure"
    },
    "Success": {
        "Type": "Succeed"
    },
    "handelFailure": {
        "Type": "Fail"
    }
}
}
