#!/usr/bin/env node
import 'source-map-support/register';
import * as cdk from '@aws-cdk/core';
import { Ec2AutoscalingStack } from '../lib/ec2-autoscaling-stack';

const app = new cdk.App();
new Ec2AutoscalingStack(app, 'Ec2AutoscalingStack', {
  
  /* Uncomment the next line to specialize this stack for the AWS Account
   * and Region that are implied by the current CLI configuration. */
  // env: { account: process.env.CDK_DEFAULT_ACCOUNT, region: process.env.CDK_DEFAULT_REGION },

  // -- use this for lookup to work --
  env: {
    account: process.env.CDK_DEPLOY_ACCOUNT || process.env.CDK_DEFAULT_ACCOUNT,
    region: process.env.CDK_DEPLOY_REGION || process.env.CDK_DEFAULT_REGION, 
   },

  /* For more information, see https://docs.aws.amazon.com/cdk/latest/guide/environments.html */
});
