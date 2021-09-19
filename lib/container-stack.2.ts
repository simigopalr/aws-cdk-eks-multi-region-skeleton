import * as cdk from '@aws-cdk/core';
import { readYamlFromDir } from '../utils/read-file';
import * as eks from '@aws-cdk/aws-eks';

export class ContainerStack2 extends cdk.Stack {
  constructor(scope: cdk.Construct, id: string, props: cdk.StackProps) {
    super(scope, id, props);

   // const cluster = props.cluster;
    const cluster =  eks.Cluster.fromClusterAttributes(this, 'ExistingCluster', {
      clusterName: 'demoeks',
      kubectlRoleArn: 'arn:aws:iam::117134819170:role/ClusterStackDemoEks-us-we-AdminRoleDemoEks78FEFB8A-MC82JQSSWV5V',
      //clusterEndpoint: '',
    });
    //const commonFolder = './yaml-common/';
    const testfolder = `./yaml-test2/`;
    //const petclincFolder = './pet-clinic-app/';
    
    readYamlFromDir(testfolder, cluster);
   // readYamlFromDir(regionFolder, cluster);
   // readYamlFromDir(petclincFolder, cluster);
    
    // cluster.addHelmChart(`flux`, {
    //   repository: 'https://charts.fluxcd.io',
    //   chart: 'flux',
    //   release: 'flux',
    //   values: {
    //     'git.url':'git@github.com:org/repo'
    //   }
    // });
    
    // cluster.addHelmChart(`SpringBoot`, {
    //   repository: 'https://platform9-community.github.io/helm-charts',
    //   chart: 'spring-petclinic-cloud',
    //   release: 'spring-petclinic-cloud'
    // });
    
  }

}


