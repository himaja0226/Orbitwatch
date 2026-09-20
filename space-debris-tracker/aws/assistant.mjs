import {
  BedrockRuntimeClient,
  ConverseCommand
} from "@aws-sdk/client-bedrock-runtime";


const client =
  new BedrockRuntimeClient({

    region:
      process.env.AWS_REGION ||
      "us-east-1"

  });


const MODEL_ID =
  process.env.BEDROCK_MODEL_ID ||
  "amazon.nova-lite-v1:0";


const headers = {

  "Content-Type":
    "application/json",

  "Access-Control-Allow-Origin":
    "*",

  "Access-Control-Allow-Headers":
    "content-type",

  "Access-Control-Allow-Methods":
    "POST,OPTIONS"

};


export const handler =
  async event => {

    const method =
      event?.requestContext?.http?.method ||
      event?.httpMethod ||
      "POST";


    if (
      method ===
      "OPTIONS"
    ) {

      return {

        statusCode: 204,

        headers,

        body: ""

      };

    }


    try {

      const body =
        typeof event.body === "string"

          ? JSON.parse(
              event.body || "{}"
            )

          : (
              event.body || {}
            );


      const question =
        String(
          body.question || ""
        ).trim();


      if (!question) {

        return {

          statusCode: 400,

          headers,

          body:
            JSON.stringify({
              error:
                "question is required"
            })

        };

      }


      const command =
        new ConverseCommand({

          modelId:
            MODEL_ID,


          system: [

            {

              text:
                "You are OrbitWatch AI Space Assistant. " +

                "Explain satellites, orbital mechanics, " +

                "TLEs, SGP4, space debris, conjunction " +

                "screening, planets and spacecraft accurately " +

                "and briefly. Use beginner-friendly language. " +

                "Never claim that an instantaneous distance " +

                "screen proves a collision. Explain uncertainty " +

                "when relevant."

            }

          ],


          messages: [

            {

              role:
                "user",

              content: [

                {

                  text:
                    question

                }

              ]

            }

          ],


          inferenceConfig: {

            maxTokens:
              500,

            temperature:
              0.4

          }

        });


      const response =
        await client.send(
          command
        );


      const answer =
        response.output
          ?.message
          ?.content
          ?.find(
            item => item.text
          )
          ?.text ||

        "No answer was returned.";


      return {

        statusCode: 200,

        headers,

        body:
          JSON.stringify({
            answer
          })

      };

    }

    catch (error) {

      console.error(
        "Bedrock error:",
        error
      );


      return {

        statusCode: 500,

        headers,

        body:
          JSON.stringify({

            error:
              "AI service failed"

          })

      };

    }

  };