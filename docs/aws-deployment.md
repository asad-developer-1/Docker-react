# Deploy to AWS Elastic Beanstalk

The workflow in `.github/workflows/deploy.yml` tests the app and builds its production Docker image on pull requests and pushes to `master`. After successful verification, pushes to `master` deploy to the GitHub `production` environment. You can also use **Actions → Test and deploy to Elastic Beanstalk → Run workflow** on `master`.

## 1. Prepare AWS resources

Create an Elastic Beanstalk application and a **Standard web server environment using Docker on Amazon Linux 2023**. Configure its service role and EC2 instance profile. Start with the sample application and wait until the environment is healthy. This workflow updates an existing environment; it does not provision infrastructure.

Use an existing private S3 deployment bucket in the same AWS region (the environment's Elastic Beanstalk bucket is suitable). Ensure the environment's EC2 instance profile can read application bundles from that bucket. Do not select a Docker Compose or ECS managed platform for this workflow.

The workflow uploads only `Dockerfile`, `.dockerignore`, `package.json`, `src/`, and `public/`, with the Dockerfile at the ZIP root. Elastic Beanstalk builds the image and routes requests to Nginx on container port 80. The development Compose file and its test service are excluded.

## 2. Configure GitHub OIDC authentication

In AWS IAM, add an OpenID Connect provider with URL `https://token.actions.githubusercontent.com` and audience `sts.amazonaws.com`. Create a deployment role trusted by that provider. A trust policy for repositories using the original subject format is:

```json
{
  "Version": "2012-10-17",
  "Statement": [{
    "Effect": "Allow",
    "Principal": {
      "Federated": "arn:aws:iam::<ACCOUNT_ID>:oidc-provider/token.actions.githubusercontent.com"
    },
    "Action": "sts:AssumeRoleWithWebIdentity",
    "Condition": {
      "StringEquals": {
        "token.actions.githubusercontent.com:aud": "sts.amazonaws.com",
        "token.actions.githubusercontent.com:sub": "repo:asad-developer-1/Docker-react:environment:production"
      }
    }
  }]
}
```

Replace `<ACCOUNT_ID>`. Repositories created after July 15, 2026, or opted into immutable subjects, include owner and repository IDs: `repo:OWNER@OWNER_ID/REPO@REPO_ID:environment:production`. Match your repository's actual subject format; see [GitHub's AWS OIDC guide](https://docs.github.com/en/actions/how-tos/secure-your-work/security-harden-deployments/oidc-in-aws).

Grant the deployment role permission to create application versions, update the selected environment, and read deployment status/events. It also needs S3 upload/read and bucket metadata permissions for the selected deployment bucket. Scope permissions to the application, environment, and bucket; consult the [official deploy action's IAM setup](https://github.com/aws-actions/aws-elasticbeanstalk-deploy#step-2-attach-required-permissions) for the required policies and service interactions. No AWS access keys are needed in GitHub.

## 3. Set GitHub environment variables

Under **Settings → Environments**, create `production`, restrict deployment branches to `master`, and add these **environment variables**:

| Variable | Example / meaning |
| --- | --- |
| `AWS_REGION` | `us-east-1`; region containing your resources |
| `AWS_ROLE_ARN` | `arn:aws:iam::123456789012:role/github-actions-deploy` |
| `EB_APPLICATION_NAME` | Existing Elastic Beanstalk application name |
| `EB_ENVIRONMENT_NAME` | Existing environment name |
| `EB_S3_BUCKET` | Existing deployment bucket name, without `s3://` |

These are identifiers, not credentials. The workflow checks that all five are set before authenticating. If you rename the deployment branch, update both workflow branch filters, its deployment condition, and the environment branch restriction.

## 4. Verify and deploy

Before pushing, run:

```sh
CI=true npm test -- --watchAll=false --runInBand
CI=true npm run build
docker build --tag docker-frontend:local .
docker run --rm -p 8080:80 docker-frontend:local
```

Open `http://localhost:8080`, then push to `master` and watch the Actions run. Deployment waits for Elastic Beanstalk completion and health recovery. Each run uses a unique version label; concurrent production deployments are serialized. To roll back, deploy an earlier application version from the Elastic Beanstalk console.

Dependencies currently use `npm install` because no lockfile is tracked, so CI and AWS resolve dependencies separately. For reproducible builds, commit a lockfile, switch installation steps to `npm ci`, and include that lockfile in the deployment ZIP and Dockerfile dependency copy step.

Keep secrets out of React source and `REACT_APP_*` variables: frontend build values are public. Runtime Elastic Beanstalk variables do not configure an already compiled React bundle.
