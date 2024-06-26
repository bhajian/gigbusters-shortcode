import {Construct} from "constructs";
import {GenericDynamoTable} from "../generic/GenericDynamoTable";
import {GenericApi} from "../generic/GenericApi";
import {NodejsFunction} from "aws-cdk-lib/aws-lambda-nodejs";
import {putShortcodeSchema} from "./shortcode-schema";
import {CognitoUserPoolsAuthorizer, IResource} from "aws-cdk-lib/aws-apigateway";
import {AuthorizationType} from "@aws-cdk/aws-apigateway";
import config from "../../config/config";
import {Table} from "aws-cdk-lib/aws-dynamodb";
import {UserPool} from "aws-cdk-lib/aws-cognito";
import {AccountPrincipal, PolicyDocument, PolicyStatement} from "aws-cdk-lib/aws-iam";



export interface ApiProps {
    dynamoDBTable: GenericDynamoTable
    account: string
}

export interface AuthorizerProps {
    id: string
    authorizerName: string
    identitySource: string
    userPoolArn: string
}

export interface ShortcodeApiProps {
    table: Table
    authorizer: CognitoUserPoolsAuthorizer
    rootResource: IResource
    idResource: IResource
    account: string
}

export class ShortcodeApis extends GenericApi {
    private getApi: NodejsFunction
    private putApi: NodejsFunction

    public constructor(scope: Construct, id: string, props: ApiProps) {
        super(scope, id)
        this.initializeApis(props);
        this.initializeDomainName({
            certificateArn: config.apiDomainCertificateArn,
            apiSubdomain: config.apiSubdomain,
            domainNameId: 'domainNameId',
            rootDomain: config.rootDomain,
            ARecordId: 'ARecordId',
            basePath: config.basePath,
            envName: config.envName,
        })
    }

    private initializeApis(props: ApiProps){
        const authorizer = this.createAuthorizer({
            id: 'userAuthorizerId',
            authorizerName: 'userAuthorizer',
            identitySource: 'method.request.header.Authorization',
            userPoolArn: config.userPoolArn
        })

        const idResource = this.api.root.addResource('{shortcode}')
        this.initializeShortcodeApis({
            authorizer: authorizer,
            idResource: idResource,
            rootResource: this.api.root,
            table: props.dynamoDBTable.table,
            account: props.account
        })
    }

    private initializeShortcodeApis(props: ShortcodeApiProps){
        this.getApi = this.addMethod({
            functionName: 'shortcode-get',
            handlerName: 'shortcode-get-handler.ts',
            verb: 'GET',
            resource: props.idResource,
            environment: {
                TABLE: props.table.tableName
            },
            validateRequestBody: false,
            // authorizationType: AuthorizationType.NONE,
            // authorizer: props.authorizer
        })

        this.putApi = this.addMethod({
            functionName: 'shortcode-put',
            handlerName: 'shortcode-put-handler.ts',
            verb: 'PUT',
            resource: props.rootResource,
            environment: {
                TABLE: props.table.tableName
            },
            validateRequestBody: false,
            // bodySchema: putShortcodeSchema,
            // authorizationType: AuthorizationType.NONE,
            // authorizer: props.authorizer
        })

        props.table.grantFullAccess(this.getApi.grantPrincipal)
        props.table.grantFullAccess(this.putApi.grantPrincipal)

    }

    protected createAuthorizer(props: AuthorizerProps): CognitoUserPoolsAuthorizer{
        const userPool = UserPool.fromUserPoolArn(this,'userPoolId', props.userPoolArn)
        const authorizer = new CognitoUserPoolsAuthorizer(
            this,
            props.id,
            {
                cognitoUserPools: [userPool],
                authorizerName: props.authorizerName,
                identitySource: props.identitySource
            });
        authorizer._attachToApi(this.api)
        return authorizer
    }

}
