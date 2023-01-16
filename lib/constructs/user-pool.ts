
import { Construct } from 'constructs'

import * as cognito from 'aws-cdk-lib/aws-cognito'
import { IdentityPool, UserPoolAuthenticationProvider } from '@aws-cdk/aws-cognito-identitypool-alpha'

export class UserPool extends Construct {
    
    public readonly userPool: cognito.UserPool
    public readonly userPoolClient: cognito.UserPoolClient
    public readonly identityPool: IdentityPool
    
    constructor(scope: Construct, id: string, props: any = {}) {
        super(scope, id)
        
        this.userPool = new cognito.UserPool(this, 'userPool', {
            passwordPolicy: {
                minLength: 8,
                requireDigits: false,
                requireUppercase: false,
                requireSymbols: false
            },
            selfSignUpEnabled: true
        })
        
        this.userPoolClient = new cognito.UserPoolClient(this, 'userPoolClient', {
            userPool: this.userPool,
            authFlows: {
                userPassword: true,
                userSrp: true
            }
        })
        
        this.identityPool = new IdentityPool(this, 'identityPool', {
            authenticationProviders: {
                userPools: [
                    new UserPoolAuthenticationProvider({
                        userPool: this.userPool,
                        userPoolClient: this.userPoolClient
                    })
                ]
            }
        })
    }
}

