#!/bin/bash -xe
yum -y update
yum install -y httpd
systemctl start httpd
yum install curl
usermod -a -G apache ec2-user
chown -R ec2-user:apache /var/www
INSTANCE_ID=$(sudo curl -H "X-aws-ec2-metadata-token: $TOKEN" -v http://169.254.169.254/latest/meta-data/instance-id)
echo 'ec2-instance-id': $INSTANCE_ID > /var/www/html/index.html