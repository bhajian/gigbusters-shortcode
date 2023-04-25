import * as cdk from 'aws-cdk-lib';
import {Construct} from 'constructs';
import {Stack} from "aws-cdk-lib";
import {ShortcodeApis} from "../lib/construct/shortcode-apis";
import {ShortcodeStatefulStack} from "./shortcode-stateful-stack";

export interface ShortcodeApiStackProps {
    shortcodeApiStatefulStack: ShortcodeStatefulStack
}

export class ShortcodeApiStack extends Stack {

    public shortcodeApis: ShortcodeApis

    constructor(scope: Construct, id: string, shortcodeApiProps: ShortcodeApiStackProps, props?: cdk.StackProps) {
        super(scope, id, props);
        this.shortcodeApis = new ShortcodeApis(this, id, {
            dynamoDBTable: shortcodeApiProps.shortcodeApiStatefulStack.dynamodbTable,
            account: this.account
        })
    }


}
