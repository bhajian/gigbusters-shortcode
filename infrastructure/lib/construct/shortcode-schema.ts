import {JsonSchemaType} from "aws-cdk-lib/aws-apigateway";

export const putShortcodeSchema = {
    type: JsonSchemaType.OBJECT,
    required: [
        "uri"
    ],
    properties: {
        uri: {
            type: JsonSchemaType.STRING
        },
        type: {
            type: JsonSchemaType.STRING
        },
    },
}
