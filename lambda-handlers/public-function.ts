import { Handler } from 'aws-lambda';
import * as utils from '/opt/utils';

export const handler: Handler = async (event, context) => {
  return new Promise<string>(async (resolve, reject) => {
    try {
      // Lambda handler code goes here
      utils.logInfo('This is a Public Function');
      return resolve('This is a Public Function');
    } catch (error) {
      utils.logError(error);
      reject();
    }
  });
};
