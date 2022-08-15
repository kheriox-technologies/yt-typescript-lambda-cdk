import { Handler } from "aws-lambda";
//import * as utils from '/opt/utils';
import { logger, tracer, metrics } from "../lambda-layer/powertools/utilities";
import middy from "@middy/core";
import { captureLambdaHandler } from "@aws-lambda-powertools/tracer";
import { injectLambdaContext } from "@aws-lambda-powertools/logger";
import { logMetrics, MetricUnits } from "@aws-lambda-powertools/metrics";

const lambdaHandler: Handler = async (event, context) => {
  return new Promise<string>(async (resolve, reject) => {
    try {
      // Lambda handler code goes here
      //utils.logInfo('This is a Public Function');

      const data = {
        name: "thilanga",
      };

      logger.info("Products retrieved", { data });
      metrics.addMetric("productsRetrieved", MetricUnits.Count, 1);

      return resolve("This is a Public Function");
    } catch (error) {
      logger.error("Products retrieved", { error });

      //utils.logError(error);
      reject();
    }
  });
};

export const handler = middy(lambdaHandler).use(
  injectLambdaContext(logger, { logEvent: true })
);
