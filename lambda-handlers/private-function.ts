import { Handler } from 'aws-lambda';

export const handler: Handler = async (event, context) => {
  return new Promise<string>(async (resolve, reject) => {
    try {
      // Lambda handler code goes here
      //utils.logInfo('This is a Private Function');
      return resolve('This is a Private Function');
    } catch (error) {
      //utils.logError(error);
      reject();
    }
  });
};
