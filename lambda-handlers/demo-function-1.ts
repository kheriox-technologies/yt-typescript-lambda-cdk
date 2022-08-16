import { Handler } from "aws-lambda";
//import * as utils from '/opt/utils';
import { logger, tracer, metrics } from "../lambda-layer/utilities";
import middy from "@middy/core";
import { captureLambdaHandler, Tracer } from "@aws-lambda-powertools/tracer";
import { injectLambdaContext } from "@aws-lambda-powertools/logger";
import { logMetrics, MetricUnits } from "@aws-lambda-powertools/metrics";

const lambdaHandler: Handler = async (event, context) => {

  logger.info('Incoming Request:', { event });

  // if (event.requestContext !== "GET") {
  //   throw new Error(
  //     `This endpoint only accepts GET method, you tried: ${event.httpMethod}`
  //   );
  // }

  return new Promise<string>(async (resolve, reject) => {
    try {
      const data = {
        name: "thilanga",
      };

      logger.debug("Data retrieved", { data });

      return resolve("This is a Public Function");
    } catch (error) {
      tracer.addErrorAsMetadata(error as Error);
      logger.error("Error reading data. " + error);

      reject();
    }
  });
};

const handler = middy(lambdaHandler)
  .use(captureLambdaHandler(tracer))
  .use(logMetrics(metrics))
  .use(injectLambdaContext(logger));

export { handler };
