
import json, os
import boto3

CLIENT_ID = os.getenv('CLIENT_ID')
USER_POOL_ID = os.getenv('USER_POOL_ID')

cognito_idp_client = boto3.client('cognito-idp')

def handler(event, context):
    
    body = json.loads(event['body'])
    
    username = body['username']
    password = body['password']
    
    try:
        
        sign_up_resp = cognito_idp_client.sign_up(
            ClientId=CLIENT_ID,
            Username=username,
            Password=password
        )
        
        user_sub = sign_up_resp['UserSub']
        
        print(f"New user signed up with sub: {user_sub}")
        
        confirm_resp = cognito_idp_client.admin_confirm_sign_up(
            UserPoolId=USER_POOL_ID,
            Username=username
        )
        
        return {
            'success': True
        }
        
    except Exception as e:
        return {
            'success': False,
            'message': str(e)
        }
    
    