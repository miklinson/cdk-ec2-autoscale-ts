import * as cdk from '@aws-cdk/core';
import * as ec2 from '@aws-cdk/aws-ec2';
import * as iam from '@aws-cdk/aws-iam';
import * as elbv2 from '@aws-cdk/aws-elasticloadbalancingv2';
import * as autoscaling from '@aws-cdk/aws-autoscaling';

//fs access
import * as fs from 'fs';

export class Ec2AutoscalingStack extends cdk.Stack {
  constructor(scope: cdk.Construct, id: string, props?: cdk.StackProps) {
    super(scope, id, props);

    // -- Variables --
    const vpcId = this.node.tryGetContext('vpc').id;
    const maxCapacity = this.node.tryGetContext('asg').maxCapacity;
    const desiredCapacity = this.node.tryGetContext('asg').desiredCapacity;
    const liveVpc = ec2.Vpc.fromLookup(this, 'getVPC', {
      isDefault: false,
      vpcId: vpcId
    });

    // -- Permission --
    const instanceRole = new iam.Role(this, 'instanceRole', {
      assumedBy: new iam.ServicePrincipal('ec2.amazonaws.com')
    });
    instanceRole.addManagedPolicy(iam.ManagedPolicy.fromAwsManagedPolicyName('service-role/AmazonEC2RoleforSSM'));

    // -- Security Group --
    const lbSg = new ec2.SecurityGroup(this, 'lbSg', {
      vpc: liveVpc,
      allowAllOutbound: true,
      description: 'Load Balancer Security Group'
    });
    lbSg.addIngressRule(ec2.Peer.anyIpv4(), ec2.Port.tcp(80));

    const instanceSg = new ec2.SecurityGroup(this, 'instanceSg', {
      vpc: liveVpc,
      allowAllOutbound: true,
      description: 'Instance Security Group'
    });
    instanceSg.addIngressRule(lbSg, ec2.Port.tcp(80));

    //-- Auto Scaling Group --
    const webAsg = new autoscaling.AutoScalingGroup(this, 'webAsg', {
      vpc: liveVpc,
      instanceType: ec2.InstanceType.of(ec2.InstanceClass.T3, ec2.InstanceSize.MICRO),
      machineImage: new ec2.AmazonLinuxImage({
        generation: ec2.AmazonLinuxGeneration.AMAZON_LINUX_2
      }),
      maxCapacity: maxCapacity,
      minCapacity: 1,
      desiredCapacity: desiredCapacity,
      role: instanceRole
    });

    //-- Add user_data.sh ---
    var bootscript:string;
    // conversion to utf-8 needed
    bootscript = fs.readFileSync('scripts/user_data.sh', 'utf-8');
    webAsg.addUserData(bootscript);

    // Add Security Group to Auto Scaling Group
    webAsg.addSecurityGroup(instanceSg);

    // -- Application Load Balancer --
    const webLb = new elbv2.ApplicationLoadBalancer(this, 'webLb', {
      vpc: liveVpc,
      internetFacing: true,
      securityGroup: lbSg,
      vpcSubnets: {
        subnetType: ec2.SubnetType.PRIVATE, onePerAz: true
      }
    });
    const webListener = webLb.addListener('webListener', {
      port: 80,
      open: true
    });
    webListener.addTargets('webServer', {
      port: 80,
      protocol: elbv2.ApplicationProtocol.HTTP,
      targets: [webAsg]
    });

    // -- CloudFormation Outputs --
    new cdk.CfnOutput(this, 'LbDns', {
      value: webLb.loadBalancerDnsName!
    })
    
  }
}
