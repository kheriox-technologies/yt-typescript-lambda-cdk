import { Handler } from 'aws-lambda';

export const handler: Handler = async (event, context) => {
  return new Promise<string>(async (resolve, reject) => {
    try {
      // Lambda handler code goes here

      return resolve('This is a Private Function');
    } catch (error) {
      reject();
    }
  });
};
