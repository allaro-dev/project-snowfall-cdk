
import * as cdk from 'aws-cdk-lib';
import { Construct } from 'constructs'

import * as lambda from 'aws-cdk-lib/aws-lambda'

export class PublicLambda extends Construct {
    
    public readonly fn: lambda.Function
    public readonly functionUrl: lambda.FunctionUrl
    
    constructor(scope: Construct, id: string, props: any = {}) {
        
        super(scope, id)
        
        this.fn = new lambda.Function(this, 'fn', {
            code: lambda.Code.fromAsset(props.pathToCode),
            handler: 'app.handler',
            runtime: lambda.Runtime.PYTHON_3_9,
            environment: props.environment,
            timeout: cdk.Duration.minutes(1)
        })
        
        this.functionUrl = new lambda.FunctionUrl(this, 'functionUrl', {
            function: this.fn,
            authType: lambda.FunctionUrlAuthType.NONE
        })
    }
}