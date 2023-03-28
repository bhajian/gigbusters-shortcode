import * as cdk from 'aws-cdk-lib';
import {Fn, Stack} from 'aws-cdk-lib';
import {Construct} from 'constructs';
import {GenericDynamoTable} from "../lib/generic/GenericDynamoTable";
import {AttributeType} from "aws-cdk-lib/aws-dynamodb";
import config from "../config/config";

export class ShortcodeStatefulStack extends Stack {
    public dynamodbTable: GenericDynamoTable
    private suffix: string;

    constructor(scope: Construct, id: string, props?: cdk.StackProps) {
        super(scope, id, props);
        this.initializeSuffix()
        this.initializeDynamoDBTable()
    }

    private initializeSuffix() {
        const shortStackId = Fn.select(2, Fn.split('/', this.stackId));
        const Suffix = Fn.select(4, Fn.split('-', shortStackId));
        this.suffix = Suffix;
    }

    private initializeDynamoDBTable() {
        this.dynamodbTable = new GenericDynamoTable(this, 'ShortcodeDynamoDBTable', {
            tableName: `Shortcode-${config.envName}-${this.suffix}`,
            primaryKey: 'shortcode',
            // stream: StreamViewType.NEW_AND_OLD_IMAGES,
            keyType: AttributeType.STRING,
        })
    }

}
