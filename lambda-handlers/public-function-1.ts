import { Handler } from "aws-lambda";
//import * as utils from '/opt/utils';
import { logger, tracer, metrics } from "../lambda-layer/utilities";
import middy from "@middy/core";
import { captureLambdaHandler, Tracer } from "@aws-lambda-powertools/tracer";
import { injectLambdaContext } from "@aws-lambda-powertools/logger";
import { logMetrics, MetricUnits } from "@aws-lambda-powertools/metrics";

const lambdaHandler: Handler = async (event, context) => {
  return new Promise<string>(async (resolve, reject) => {
    try {
      // Lambda handler code goes here

      const data = {
        name: "thilanga",
      };

      logger.info("Products retrieved", { data });
      metrics.addMetric("productsRetrieved", MetricUnits.Count, 1);

      tracer.putAnnotation('awsRequestId', context.awsRequestId)
      tracer.putMetadata('eventPayload', event)

      return resolve("This is a Public Function");
    } catch (error) {
      logger.error("Products retrieved", { error });
      reject();
    }
  });
};

const handler = middy(lambdaHandler)
  .use(captureLambdaHandler(tracer))
  .use(logMetrics(metrics, { captureColdStartMetric: true }))
  .use(injectLambdaContext(logger, { clearState: true }));

export { handler };
// export const handler = middy(lambdaHandler).use(
//   injectLambdaContext(logger, { logEvent: true })
// );
