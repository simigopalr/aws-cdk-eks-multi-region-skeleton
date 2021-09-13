#!/usr/bin/env node
import 'source-map-support/register';
import * as cdk from '@aws-cdk/core';
import { ClusterStack } from '../lib/cluster-stack';
import { ContainerStack } from '../lib/container-stack';
import { CicdStack } from '../lib/cicd-stack';

const app = new cdk.App();

const account = app.node.tryGetContext('account') || process.env.CDK_INTEG_ACCOUNT || process.env.CDK_DEFAULT_ACCOUNT;
const primaryRegion = {account: account, region: 'us-west-2'};
//const secondaryRegion = {account: account, region: 'us-west-2'};

const primaryCluster = new ClusterStack(app, `ClusterStackDemoEks-${primaryRegion.region}`, {env: primaryRegion})

new ContainerStack(app, `ContainerStackDemoEks-${primaryRegion.region}`, {env: primaryRegion, cluster: primaryCluster.cluster });

new CicdStack(app, `CicdStackDemoEks`, {env: primaryRegion, firstRegionCluster: primaryCluster.cluster ,
                                    firstRegionRole: primaryCluster.firstRegionRole});