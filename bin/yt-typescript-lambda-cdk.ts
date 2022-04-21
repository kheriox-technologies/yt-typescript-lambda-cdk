#!/usr/bin/env node
import 'source-map-support/register';
import * as cdk from 'aws-cdk-lib';
import { LambdaStack } from '../lib/lambda-stack';
import gitBranch from 'git-branch';
import { CDKContext } from '../types';

// Get CDK Context based on git branch
export const getContext = async (app: cdk.App): Promise<CDKContext> => {
  return new Promise(async (resolve, reject) => {
    try {
      const currentBranch = await gitBranch();

      const environment = app.node.tryGetContext('environments').find((e: any) => e.branchName === currentBranch);

      const globals = app.node.tryGetContext('globals');

      return resolve({ ...globals, ...environment });
    } catch (error) {
      console.error(error);
      return reject();
    }
  });
};

// Create Stacks
const createStacks = async () => {
  try {
    const app = new cdk.App();
    const context = await getContext(app);

    const tags: any = {
      Environment: context.environment,
    };

    const stackProps: cdk.StackProps = {
      env: {
        region: context.region,
        account: context.accountNumber,
      },
      stackName: `${context.appName}-stack-${context.environment}`,
      description: `This is the Stack Description`,
      tags,
    };

    new LambdaStack(app, `${context.appName}-stack-${context.environment}`, stackProps, context);
  } catch (error) {
    console.error(error);
  }
};

createStacks();
