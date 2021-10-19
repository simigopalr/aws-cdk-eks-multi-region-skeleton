import * as cdk from '@aws-cdk/core';
import codecommit = require('@aws-cdk/aws-codecommit');
import ecr = require('@aws-cdk/aws-ecr');
import codepipeline = require('@aws-cdk/aws-codepipeline');
import pipelineAction = require('@aws-cdk/aws-codepipeline-actions');
import { codeToECRspec, deployToEKSspec } from '../utils/buildspecs.2';
import * as eks from '@aws-cdk/aws-eks';
import * as iam from '@aws-cdk/aws-iam';
import { PhysicalName } from '@aws-cdk/core';

export class ExtCicdStack extends cdk.Stack {

    constructor(scope: cdk.Construct, id: string, props: cdk.StackProps) {
        super(scope, id, props);

        const primaryRegion = 'us-west-2';
        //const secondaryRegion = 'us-west-2';
        
        const petClinicRepo = new codecommit.Repository(this, 'pet-clinic-for-ext-eks', {
            repositoryName: `ext-pet-clinic-${cdk.Stack.of(this).region}`
        });
        
        new cdk.CfnOutput(this, `ext-codecommit-uri`, {
            exportName: 'ExtCodeCommitURL',
            value: petClinicRepo.repositoryCloneUrlHttp
        });
        
        const ecrForMainRegion = new ecr.Repository(this, `ecr-for-ext-pet-clinic`);
        
        const buildForECR = codeToECRspec(this, ecrForMainRegion.repositoryUri);
        ecrForMainRegion.grantPullPush(buildForECR.role!);
        
        const cluster =  eks.Cluster.fromClusterAttributes(this, 'existing-cluster', {
            clusterName: 'SGReks',
            kubectlRoleArn: 'arn:aws:iam::117134819170:role/ClusterStackDemoEks-us-we-AdminRoleDemoEks78FEFB8A-4QM1PO6JYIZE',
            //clusterEndpoint: '',
        });
        
        
        const roleArnForDeploy = iam.Role.fromRoleArn(this, 'Role', 'arn:aws:iam::117134819170:role/ClusterStackDemoEks-us-west-2-for1stregionDC87AA9A-1BCPJKO1TM31R', {
          // Set 'mutable' to 'false' to use the role as-is and prevent adding new
          // policies to it. The default is 'true', which means the role may be
          // modified as part of the deployment.
          //mutable: false,
        });
        
        const deployToMainCluster = deployToEKSspec(this, primaryRegion, cluster, ecrForMainRegion, roleArnForDeploy);
        
        const sourceOutput = new codepipeline.Artifact();

        new codepipeline.Pipeline(this, 'ext-eks-dep', {
            stages: [ {
                    stageName: 'Source',
                    actions: [ new pipelineAction.CodeCommitSourceAction({
                            actionName: 'CatchSourcefromCode',
                            repository: petClinicRepo,
                            output: sourceOutput,
                        })]
                },{
                    stageName: 'Build',
                    actions: [ new pipelineAction.CodeBuildAction({
                        actionName: 'BuildAndPushtoECR',
                        input: sourceOutput,
                        project: buildForECR
                    })]
                },
                {
                    stageName: 'DeployToMainEKScluster',
                    actions: [ new pipelineAction.CodeBuildAction({
                        actionName: 'DeployToMainEKScluster',
                        input: sourceOutput,
                        project: deployToMainCluster
                    })]
                }
                
            ]
        });
    }
}


