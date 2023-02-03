
import * as cdk from 'aws-cdk-lib';
import { Construct } from 'constructs'

import * as s3 from 'aws-cdk-lib/aws-s3'

export class PublicBucket extends Construct {
    
    public readonly bucket: s3.Bucket 
    
    constructor(scope: Construct, id: string, props: any = {}) {
        
        super(scope, id)
        
        this.bucket = new s3.Bucket(this, 'bucket', {})
    }
}