import * as cdk from 'aws-cdk-lib';
import { Construct } from 'constructs';

import * as path from 'path'

import { PublicLambda } from './constructs/public-lambda'
import { UserPool } from './constructs/user-pool'

export class SnowfallStack extends cdk.Stack {
  constructor(scope: Construct, id: string, props?: cdk.StackProps) {
    super(scope, id, props);

    const userPool = new UserPool(this, 'userPool', {})
    
    const signUpLambda = new PublicLambda(this, 'signUpLambda', {
      environment: {
        CLIENT_ID: userPool.userPoolClient.userPoolClientId
      },
      pathToCode: path.join(__dirname, '..', 'lambda-source', 'auth', 'sign-up')
    })
    
    const loginLambda = new PublicLambda(this, 'loginLambda', {
      environment: {
        CLIENT_ID: userPool.userPoolClient.userPoolClientId,
        IDENTITY_POOL_ID: userPool.identityPool.identityPoolId,
        REGION: userPool.identityPool.env.region,
        USER_POOL_ID: userPool.userPool.userPoolId
      },
      pathToCode: path.join(__dirname, '..', 'lambda-source', 'auth', 'login')
    })
    
    new cdk.CfnOutput(this, 'signUpLambdaUrl', {
      value: signUpLambda.functionUrl.url
    })
    new cdk.CfnOutput(this, 'loginLambdaUrl', {
      value: loginLambda.functionUrl.url
    })
  }
}
