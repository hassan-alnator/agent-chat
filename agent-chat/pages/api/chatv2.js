// Next.js API route support: https://nextjs.org/docs/api-routes/introduction
import Cors from 'cors'
const AssistantV1 = require('ibm-watson/assistant/v1');
const AssistantV2 = require('ibm-watson/assistant/v2');
const { IamAuthenticator } = require('ibm-watson/auth');

const API_KEY = '06yVeF4AtLNCWvoI3JaLekHCnZgEfoyYZoathGzB1J_1'//'nl4WrsWMrpRyGNKLfto9A5YB0vOGGhj6PlIXSCvDL58D';

// old v1
const SERVICE_URL = "https://gateway-lon.watsonplatform.net/assistant/api";

function runMiddleware(req, res, fn) {
  return new Promise((resolve, reject) => {
    fn(req, res, (result) => {
      if (result instanceof Error) {
        return reject(result)
      }

      return resolve(result)
    })
  })
}

const cors = Cors({
  methods: ['GET', 'HEAD', 'POST', 'OPTIONS'],
})

// old V1
// const assistant = new AssistantV1({
//   authenticator: new IamAuthenticator({ apikey: API_KEY }),
//   serviceUrl: SERVICE_URL,
//   version: '2019-02-01',
// });

const assistant = new AssistantV2({
  authenticator: new IamAuthenticator({ apikey: API_KEY }),
  serviceUrl: 'https://gateway.watsonplatform.net/assistant/api/',
  version: '2018-09-19'
});





async function handler(req, res) {
  // Run the middleware
  await runMiddleware(req, res, cors);

  const {
    query: { text },
  } = req


  const session = await assistant.createSession({
    assistantId: 'fc7a0497-057c-4b13-b772-bd31a2bd0509'
  })



  // old v1
  // const response = await assistant.message({
  //   workspaceId: '2345245c-1502-4893-a514-fdaa2d54c1d2',//'21098e59-1fbf-4225-9cb2-a12dc1a6cec1',
  //   input: { text },
  // });

  // const { result } = response;
  //res.setHeader('Content-Type', 'application/text')

  assistant.message(
    {
      input: { text },
      assistantId: 'fc7a0497-057c-4b13-b772-bd31a2bd0509',
      sessionId: session.result.session_id,
    })
    .then(response => {
      console.log(JSON.stringify(response.result, null, 2));
      res.setHeader('Content-Type', 'application/json')
      res.statusCode = 200
      res.json({ text: response.result.output.generic[0].text })
    })
    .catch(err => {
      console.log(err);
    });



}

export default handler;


