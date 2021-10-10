import * as cdk from '@aws-cdk/core';
import { readYamlFromDir } from '../utils/read-file';
import { EksProps } from './cluster-stack';

export class ContainerStack extends cdk.Stack {
  constructor(scope: cdk.Construct, id: string, props: EksProps) {
    super(scope, id, props);

    const cluster = props.cluster;
    //const devNamespace = './yaml-common/';
    const stageNamespace = './yaml-common-stage/';
    const qaNamespace = './yaml-common-qa/';
    const regionFolder = `./yaml-${cdk.Stack.of(this).region}/`;
    
    //readYamlFromDir(devNamespace, cluster);
    readYamlFromDir(stageNamespace, cluster);
    readYamlFromDir(qaNamespace, cluster);
    readYamlFromDir(regionFolder, cluster);
    
    cluster.addHelmChart(`flux`, {
      repository: 'https://charts.fluxcd.io',
      chart: 'flux',
      release: 'flux',
      values: {
        'git.url':'git@github.com:org/repo'
      }
    });

  }

}


