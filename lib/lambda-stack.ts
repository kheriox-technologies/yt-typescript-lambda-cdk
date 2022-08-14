import { Stack, StackProps, RemovalPolicy } from 'aws-cdk-lib';
import { Construct } from 'constructs';
import { CDKContext } from '../types';

import * as iam from 'aws-cdk-lib/aws-iam';
import * as ec2 from 'aws-cdk-lib/aws-ec2';
import * as lambda from 'aws-cdk-lib/aws-lambda';
import { NodejsFunction } from 'aws-cdk-lib/aws-lambda-nodejs';
import * as cwLogs from 'aws-cdk-lib/aws-logs';

import { getLambdaDefinitions, getFunctionProps } from './lambda-config';
import { SubnetType } from 'aws-cdk-lib/aws-ec2';

export class LambdaStack extends Stack {
  constructor(scope: Construct, id: string, props: StackProps, context: CDKContext) {
    super(scope, id, props);

    // Lambda Role
    const lambdaRole = new iam.Role(this, 'lambdaRole', {
      roleName: `${context.appName}-lambda-role-${context.environment}`,
      description: `Lambda role for ${context.appName}`,
      assumedBy: new iam.ServicePrincipal('lambda.amazonaws.com'),
      managedPolicies: [iam.ManagedPolicy.fromAwsManagedPolicyName('ReadOnlyAccess'),
      iam.ManagedPolicy.fromManagedPolicyArn(
        this,
        'lambdaVPCAccessPolicy',
        'arn:aws:iam::aws:policy/service-role/AWSLambdaVPCAccessExecutionRole'
      ),],
    });

    // Attach inline policies to Lambda role
    lambdaRole.attachInlinePolicy(
      new iam.Policy(this, 'lambdaExecutionAccess', {
        policyName: 'lambdaExecutionAccess',
        statements: [
          new iam.PolicyStatement({
            effect: iam.Effect.ALLOW,
            resources: ['*'],
            actions: [
              'logs:CreateLogGroup',
              'logs:CreateLogStream',
              'logs:DescribeLogGroups',
              'logs:DescribeLogStreams',
              'logs:PutLogEvents',
            ],
          }),
        ],
      })
    );

    // Lambda VPC
    const vpc = new ec2.Vpc(this, 'my-cdk-vpc', {
      natGatewayProvider: ec2.NatProvider.instance({
        instanceType: new ec2.InstanceType('t2.micro'),
      }),
      cidr: '10.0.0.0/16',
      natGateways: 1,
      maxAzs: 3,
      subnetConfiguration: [
        {
          name: 'private-subnet-1',
          subnetType: ec2.SubnetType.PRIVATE_WITH_NAT,
          cidrMask: 24,
        },
        {
          name: 'public-subnet-1',
          subnetType: ec2.SubnetType.PUBLIC,
          cidrMask: 24,
        },
        {
          name: 'isolated-subnet-1',
          subnetType: ec2.SubnetType.PRIVATE_ISOLATED,
          cidrMask: 28,
        },
      ],
    });

    // Import privateSubnets
    const privateSubnets = vpc.selectSubnets({subnetType: SubnetType.PRIVATE_ISOLATED}).subnets

    // Lambda Security Group
    const lambdaSG = new ec2.SecurityGroup(this, 'lambdaSG', {
      vpc,
      allowAllOutbound: true,
      securityGroupName: `${context.appName}-lambda-security-group-${context.environment}`,
    });
    lambdaSG.addIngressRule(ec2.Peer.ipv4(vpc.vpcCidrBlock), ec2.Port.allTcp(), 'Allow internal VPC traffic');

    // Lambda Layer
    const lambdaLayer = new lambda.LayerVersion(this, 'lambdaLayer', {
      code: lambda.Code.fromAsset('lambda-layer'),
      compatibleRuntimes: [lambda.Runtime.NODEJS_14_X],
      description: `Lambda Layer for ${context.appName}`,
    });

    // Get Lambda definitions
    const lambdaDefinitions = getLambdaDefinitions(context);

    // Loop through the definitions and create lambda functions
    for (const lambdaDefinition of lambdaDefinitions) {
      // Get function props based on lambda definition
      let functionProps = getFunctionProps(lambdaDefinition, lambdaRole, lambdaLayer, context);

      // Check if function is private and add VPC, SG and Subnets
      if (lambdaDefinition.isPrivate) {
        functionProps = {
          ...functionProps,
          vpc: vpc,
          securityGroups: [lambdaSG],
          vpcSubnets: {
            subnets: privateSubnets,
          },
        };
      }

      // Lambda Function
      new NodejsFunction(this, `${lambdaDefinition.name}-function`, functionProps);

      // Create corresponding Log Group with one month retention
      new cwLogs.LogGroup(this, `fn-${lambdaDefinition.name}-log-group`, {
        logGroupName: `/aws/lambda/${context.appName}-${lambdaDefinition.name}-${context.environment}`,
        retention: cwLogs.RetentionDays.ONE_MONTH,
        removalPolicy: RemovalPolicy.DESTROY,
      });
    }
  }
}
