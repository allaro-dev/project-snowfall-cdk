
import json, os
import boto3

CLIENT_ID = os.getenv('CLIENT_ID')
IDENTITY_POOL_ID = os.getenv('IDENTITY_POOL_ID')
REGION = os.getenv('REGION')
USER_POOL_ID = os.getenv('USER_POOL_ID')

cognito_identity_client = boto3.client('cognito-identity')
cognito_idp_client = boto3.client('cognito-idp')

def handler(event, context):
    
    body = json.loads(event['body'])
    
    username = body['username']
    password = body['password']
    
    try:
        auth_resp = cognito_idp_client.initiate_auth(
            ClientId=CLIENT_ID,
            AuthFlow='USER_PASSWORD_AUTH',
            AuthParameters={
                'USERNAME': username,
                'PASSWORD': password
            }
        )
        
        id_token = auth_resp['AuthenticationResult']['IdToken']
        
        identity_resp = cognito_identity_client.get_id(
            IdentityPoolId=IDENTITY_POOL_ID,
            Logins={
                f'cognito-idp.{REGION}.amazonaws.com/{USER_POOL_ID}': id_token
            }
        )
        
        identity_id = identity_resp['IdentityId']
        
        credentials_resp = cognito_identity_client.get_credentials_for_identity(
            IdentityId=identity_id,
            Logins={
                f'cognito-idp.{REGION}.amazonaws.com/{USER_POOL_ID}': id_token
            }
        )
        
        return {
            'success': True,
            'credentials': {
                'accessKeyId': credentials_resp['Credentials']['AccessKeyId'],
                'secretKey': credentials_resp['Credentials']['SecretKey'],
                'sessionToken': credentials_resp['Credentials']['SessionToken']
            }
        }
    
    except Exception as e:
        
        print(e)
        
        return {
            'success': False,
            'message': str(e)
        }
    