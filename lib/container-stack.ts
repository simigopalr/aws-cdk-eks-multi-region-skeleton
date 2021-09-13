import * as cdk from '@aws-cdk/core';
import { readYamlFromDir } from '../utils/read-file';
import { EksProps } from './cluster-stack';

export class ContainerStack extends cdk.Stack {
  constructor(scope: cdk.Construct, id: string, props: EksProps) {
    super(scope, id, props);

    const cluster = props.cluster;
    const commonFolder = './yaml-common/';
    const regionFolder = `./yaml-${cdk.Stack.of(this).region}/`;
    const petclincFolder = './pet-clinic-app/';
    
    readYamlFromDir(commonFolder, cluster);
    readYamlFromDir(regionFolder, cluster);
    readYamlFromDir(petclincFolder, cluster);
    
    cluster.addHelmChart(`flux`, {
      repository: 'https://charts.fluxcd.io',
      chart: 'flux',
      release: 'flux',
      values: {
        'git.url':'git@github.com:org/repo'
      }
    });
    
    // cluster.addHelmChart(`SpringBoot`, {
    //   repository: 'https://platform9-community.github.io/helm-charts',
    //   chart: 'spring-petclinic-cloud',
    //   release: 'spring-petclinic-cloud'
    // });
    
  }

}


