import { LinearProgress, Paper, Typography } from "@mui/material";
import { NotificationType } from "./notifications";
import { stringify } from "querystring";

export type APIRejection = Pick<Response, "status" | "statusText"> & {
  payload: { detail: string };
};

/**
 *
 * Deserializes the response of an API request to obtain the status, statusText
 * and a payload object from json
 *
 * @param response The response of an API request
 * @returns An APIRejection object comprising of the status, statusText and a
 * payload object
 */
export async function GetAPIRejection(
  response: Response
): Promise<APIRejection> {
  return {
    status: response.status,
    statusText: response.statusText,
    payload: await response.json(),
  };
}

/**
 *
 * Sends a get request to the rest API with a URI fragment pointing to the
 * target resource and HTTP query from params, once a response is obtained the
 * body is deserailized and returned as an object
 *
 * @param uriFrag The URI fragment of the target resource
 * @param params An object to be serialized into an HTTP query
 * @returns A promise of a deserialized object, obtained from the rest API or
 * an APIRejection
 */
export async function getAPI<Type>(
  uriFrag: string,
  params: object
): Promise<Type> {
  const query = stringify({ ...params, format: "json" });
  return fetch(`/api/${uriFrag}/?${query}`).then(async (response) =>
    response.ok
      ? await response.json()
      : Promise.reject(await GetAPIRejection(response))
  );
}

/**
 *
 * Sends a post request to the rest API with a URI fragment pointing to the
 * target resource with a request containing a json serialization of the post
 * object, once a response is obtained the body is deserialized and returned as
 * an object
 *
 * @param uriFrag The URI fragment of the target resource
 * @param post An object to be serialized and sent to the rest API
 * @returns A promise of a deserialized object, obtained from the rest API or
 * an APIRejection
 */
export async function postAPI<Post, Response>(
  uriFrag: string,
  post: Post
): Promise<Response> {
  return fetch(`/api/${uriFrag}/`, {
    method: "POST",
    mode: "cors",
    cache: "no-cache",
    credentials: "same-origin",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify(post),
  }).then(async (response) =>
    response.ok
      ? await response.json()
      : Promise.reject(await GetAPIRejection(response))
  );
}

/**
 *
 * Sends a put request to the rest API with a URI fragment pointing to the
 * target resource with a request containing a json serialization of the put
 * object, once a response is obtained the body is deserialized and returned as
 * an object
 *
 * @param uriFrag The URI fragment of the target resource
 * @param put An object to be serialized and sent to the rest API
 * @returns A promise of a deserialized object, obtained from the rest API or
 * an APIRejection
 */
export async function putAPI<Put, Response>(
  uriFrag: string,
  put: Put
): Promise<Response> {
  return fetch(`/api/${uriFrag}/`, {
    method: "PUT",
    mode: "cors",
    cache: "no-cache",
    credentials: "same-origin",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify(put),
  }).then(async (response) =>
    response.ok
      ? await response.json()
      : Promise.reject(await GetAPIRejection(response))
  );
}

/**
 *
 * Sends a post request to the rest API with a URI fragment pointing to the
 * right end point and a form containing files such as elisa plate CSV files.
 *
 * @param uriFrag URI fragment of the target resource
 * @param data A form to be sent to the rest API
 * @returns A promise of a deserialized object, obtained from the rest API or
 * an APIRejection
 */
export async function postFormAPI<Response>(
  uriFrag: string,
  data: FormData
): Promise<Response> {
  return fetch(`/api/${uriFrag}/`, {
    method: "POST",
    mode: "cors",
    cache: "no-cache",
    credentials: "same-origin",
    headers: {},
    body: data,
  }).then(async (response) =>
    response.ok
      ? await response.json()
      : Promise.reject(await GetAPIRejection(response))
  );
}

/**
 *
 * A MUI Paper element showing a linear progress bar with corresponding loading
 * message
 *
 * @param params The loading message to be displayed
 * @param params.text The loading message text
 * @returns A MUI Paper element with linear progress bar and message
 */
export function LoadingPaper(params: { text: string }): JSX.Element {
  return (
    <Paper>
      <Typography>{params.text}</Typography>
      <LinearProgress />
    </Paper>
  );
}

/**
 *
 * A MUI Paper element showing a failed reteieval message
 *
 * @param params The failed reteieval message to be displayed
 * @param params.text The failed reteieval message text
 * @returns A MUI Paper element with message
 */
export function FailedRetrievalPaper(params: { text: string }): JSX.Element {
  return (
    <Paper>
      <Typography variant="h5">{params.text}</Typography>
    </Paper>
  );
}

/**
 *
 * Produces a standard format snackbar message and options object for an API
 * rejection object
 *
 * @param response The API rejection information
 * @returns A snackbar message and options object
 */
export function SnackifyAPIRejection(response: APIRejection): NotificationType {
  let msg: string = "";
  if (response.payload !== undefined) {
    // For now, use the first field in the response payload as the error message
    for (let prop in response.payload) {
      if (response.payload.hasOwnProperty(prop)) {
        msg = String(response.payload[prop as keyof typeof response.payload]);
        break;
      }
    }
  }
  return [
    `${response.status}: ${response.statusText}\n${msg}`,
    {
      variant: "error",
      style: { whiteSpace: "pre-line" },
    },
  ];
}
