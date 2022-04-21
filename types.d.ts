export type CDKContext = {
  appName: string;
  region: string;
  environment: string;
  branchName: string;
  accountNumber: string;
  vpc: {
    id: string;
    cidr: string;
    privateSubnetIds: string[];
  };
};

export type LambdaDefinition = {
  name: string;
  memoryMB?: number;
  timeoutMins?: number;
  environment?: {
    [key: string]: string;
  };
  isPrivate?: boolean;
};
