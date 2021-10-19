import * as cdk from '@aws-cdk/core';
import * as iam from '@aws-cdk/aws-iam';
import * as eks from '@aws-cdk/aws-eks';
import * as ec2 from '@aws-cdk/aws-ec2';
import { PhysicalName } from '@aws-cdk/core';

export class ClusterStack extends cdk.Stack {
  public readonly cluster: eks.Cluster;
  public readonly firstRegionRole: iam.Role;

  constructor(scope: cdk.Construct, id: string, props?: cdk.StackProps) {
    super(scope, id, props);

    const primaryRegion = 'us-west-2';
    
    const clusterAdmin = new iam.Role(this, 'AdminRoleDemoEks', {
      assumedBy: new iam.AccountRootPrincipal()
      });

    const cluster = new eks.Cluster(this, 'SGR-eks-cluster', {
        clusterName: `SGReks`,
        mastersRole: clusterAdmin,
        version: eks.KubernetesVersion.V1_18
        //defaultCapacity: 2
    });

    cluster.addAutoScalingGroupCapacity('ec2-group', {
      instanceType: new ec2.InstanceType('t2.micro'),
      minCapacity: 3,
      vpcSubnets: { subnetType: ec2.SubnetType.PUBLIC }
    });
    
    this.cluster = cluster;
    
    if (cdk.Stack.of(this).region==primaryRegion) {
      this.firstRegionRole = createDeployRole(this, `for-1st-region`, cluster);
    }


  }
}

function createDeployRole(scope: cdk.Construct, id: string, cluster: eks.Cluster): iam.Role {
  const role = new iam.Role(scope, id, {
    roleName: PhysicalName.GENERATE_IF_NEEDED,
    assumedBy: new iam.AccountRootPrincipal()
  });
  
  role.addToPolicy(new iam.PolicyStatement({
    resources: ['*'],
    actions: ['securityhub:*'],
  }));
  
  cluster.awsAuth.addMastersRole(role);

  return role;
}

export interface EksProps extends cdk.StackProps{
  cluster: eks.Cluster
}

export interface CicdProps extends cdk.StackProps {
  firstRegionCluster: eks.Cluster,
  firstRegionRole: iam.Role
}