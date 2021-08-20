"""



"""

import os

import boto3
import botocore.exceptions


def download_from_s3(s3_bucket_name: str, s3_fname: str, target_path: str):
    s3 = boto3.resource('s3')
    s3_bucket = s3.Bucket(s3_bucket_name)
    dirname = os.path.dirname(target_path)
    if dirname != '':
        os.makedirs(dirname, exist_ok=True)
    try:
        s3_bucket.download_file(s3_fname, target_path)
    except botocore.exceptions.ClientError as e:
        if e.response['Error']['Code'] == "404":
            # print(f'Missing {s3_fname}')
            return None
        else:
            raise e