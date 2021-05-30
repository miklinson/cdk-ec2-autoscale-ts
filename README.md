# ALB - ASG - EC2 Stack

The project implements a simple web server that is hosted in Amazon Linux 2 instances that will be in an auto-scaling group behind an Application Load Balancer. The web server will display the instance id of the ec2. By accessing the load balancer, you'll be automatically routed to different instances.

## Deployment steps
Below are the steps to deploy the use case:

```
npm run build

cdk deploy

```

## Deployment Verification
After the stack is deployed successfully, go to the Outputs tab in AWS Cloudformation console of EC2AutoScalingStack, it should show the 'lbDns', Load Balancer DNS.

## Useful commands

 * `npm run build`   compile typescript to js
 * `npm run watch`   watch for changes and compile
 * `npm run test`    perform the jest unit tests
 * `cdk deploy`      deploy this stack to your default AWS account/region
 * `cdk diff`        compare deployed stack with current state
 * `cdk synth`       emits the synthesized CloudFormation template
