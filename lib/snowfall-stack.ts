import * as cdk from 'aws-cdk-lib';
import { Construct } from 'constructs';

import * as path from 'path'

import * as s3_deployment from 'aws-cdk-lib/aws-s3-deployment'

import { PublicBucket } from './constructs/public-bucket'
import { PublicLambda } from './constructs/public-lambda'
import { UserPool } from './constructs/user-pool'

export class SnowfallStack extends cdk.Stack {
  constructor(scope: Construct, id: string, props?: cdk.StackProps) {
    super(scope, id, props);

    const userPool = new UserPool(this, 'userPool', {})
    
    const signUpLambda = new PublicLambda(this, 'signUpLambda', {
      environment: {
        CLIENT_ID: userPool.userPoolClient.userPoolClientId,
        USER_POOL_ID: userPool.userPool.userPoolId
      },
      pathToCode: path.join(__dirname, '..', 'lambda-source', 'auth', 'sign-up')
    })
    
    // add permissions to call admin_confirm_sign_up to role
    // signUpLambda.fn.role.
    
    signUpLambda.fn.role && userPool.userPool.grant(
      signUpLambda.fn.role, 'cognito-idp:AdminConfirmSignUp')
    
    
    const loginLambda = new PublicLambda(this, 'loginLambda', {
      environment: {
        CLIENT_ID: userPool.userPoolClient.userPoolClientId,
        IDENTITY_POOL_ID: userPool.identityPool.identityPoolId,
        REGION: userPool.identityPool.env.region,
        USER_POOL_ID: userPool.userPool.userPoolId
      },
      pathToCode: path.join(__dirname, '..', 'lambda-source', 'auth', 'login')
    })
    
    const publicConfigBucket = new PublicBucket(this, 'publicConfigBucket')
    
    publicConfigBucket.bucket.grantRead(userPool.identityPool.authenticatedRole)
    
    // deploy json files to public config bucket
    const mainConfigDeployment = new s3_deployment.BucketDeployment(this, 'mainConfigDeployment', {
      sources: [
        s3_deployment.Source.jsonData('mainMenuConfig.json', {
          title: 'Application Menu',
          apps: [{ name: 'TextQuest', active: false }]
        })
      ],
      destinationBucket: publicConfigBucket.bucket
    })
    
    new cdk.CfnOutput(this, 'publicConfigBucketName', {
      value: publicConfigBucket.bucket.bucketName
    })
    new cdk.CfnOutput(this, 'signUpLambdaUrl', {
      value: signUpLambda.functionUrl.url
    })
    new cdk.CfnOutput(this, 'loginLambdaUrl', {
      value: loginLambda.functionUrl.url
    })
  }
}
