import {aws_dynamodb, RemovalPolicy, Stack, StackProps} from "aws-cdk-lib";
import {AttributeType, StreamViewType, Table} from "aws-cdk-lib/aws-dynamodb";
import {Effect, IGrantable, PolicyStatement} from "aws-cdk-lib/aws-iam";
import {Construct} from "constructs";
import config from "../../config/config";

export interface GenericTableProps {
    tableName: string
    primaryKey: string
    keyType: AttributeType
    stream?: StreamViewType
    sortKeyName?: string
    sortKeyType?: AttributeType
}

export interface SecondaryIndexProp {
    indexName: string
    partitionKeyName: string
    partitionKeyType: AttributeType
    sortKeyName?: string
    sortKeyType?: AttributeType
}

export class GenericDynamoTable extends Construct {

    public table: Table;
    private props: GenericTableProps

    public constructor(scope: Construct, id: string, props: GenericTableProps){
        super(scope, id)
        this.props = props

        this.table = new Table(this, id, {
            removalPolicy: RemovalPolicy.DESTROY,
            billingMode: aws_dynamodb.BillingMode.PAY_PER_REQUEST,
            partitionKey: {
                name: this.props.primaryKey,
                type: AttributeType.STRING
            },
            stream: props.stream,
            tableName: this.props.tableName,
            sortKey: (props.sortKeyName && props.sortKeyType)? {
                name: props.sortKeyName,
                type: props.sortKeyType,
            } : undefined
        })
    }

    public addSecondaryIndexes(props: SecondaryIndexProp){
        this.table.addGlobalSecondaryIndex({
            indexName: props.indexName,
            partitionKey: {
                name: props.partitionKeyName,
                type: props.partitionKeyType
            },
            sortKey: (props.sortKeyName && props.sortKeyType)? {
                name: props.sortKeyName,
                type: props.sortKeyType,
            } : undefined
        })
    }

}
