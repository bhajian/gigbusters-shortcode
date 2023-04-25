#!/usr/bin/env node
import 'source-map-support/register';
import * as cdk from 'aws-cdk-lib';
import { ShortcodeApiStack } from '../stack/shortcode-api-stack';
import {ShortcodeStatefulStack} from "../stack/shortcode-stateful-stack";

const app = new cdk.App();

const statefulStack = new ShortcodeStatefulStack(app, 'ShortcodeStatefulStack', {
    env: {
        account: process.env.CDK_DEFAULT_ACCOUNT,
        region: process.env.CDK_DEFAULT_REGION
    }})
new ShortcodeApiStack(app, 'ShortcodeApiStack', {
    shortcodeApiStatefulStack: statefulStack,
}, {
    env: {
        account: process.env.CDK_DEFAULT_ACCOUNT,
        region: process.env.CDK_DEFAULT_REGION
    }
});
