# Deploy Typescript based Lambda functions using AWS CDK

This is a companion repo for my youtube video explaining the process of developing, testing and deploying Typescript based Lambda functions using AWS CDK

You can find all the command and related links I used in the video

Youtube Video: https://youtu.be/DUNEuhOQ1k4

## URLs

Multi Env CDK Youtube Video: https://youtu.be/H7Ynxkk_jss

Git Repo: https://github.com/kheriox-technologies/yt-typescript-lambda-cdk

AWS Profile NPM Package: https://www.npmjs.com/package/awsprofile

Git Branch NPM Package: https://www.npmjs.com/package/git-branch

AWS CDK Documentation: https://docs.aws.amazon.com/cdk/api/v2/docs/aws-construct-library.html

## Commands

### Git Branch Install

```
npm i git-branch
npm i -D @types/git-branch
```

### CDK

```
cdk list
cdk synth ts-lambda-stack-develop --no-staging > template.yaml
cd deploy
```

### SAM

```
sam local invoke <functionID> --no-event
sam local invoke <functionID> --event <pathToEventFile.json>
```
