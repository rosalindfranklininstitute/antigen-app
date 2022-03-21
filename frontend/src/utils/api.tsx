import { LinearProgress, Paper, Typography } from "@mui/material";
import { NotificationType } from "./notifications";
import { stringify } from "querystring";

export type APIRejection = Pick<Response, "status" | "statusText"> & {
  payload: { detail: string };
};

export const GetAPIRejection = async (
  response: Response
): Promise<APIRejection> => ({
  status: response.status,
  statusText: response.statusText,
  payload: await response.json(),
});

export async function getAPI<Type>(
  uriFrag: string,
  params: object
): Promise<Type> {
  const query = stringify({ ...params, format: "json" });
  return fetch(`http://127.0.0.1:8000/api/${uriFrag}/?${query}`).then(
    async (response) =>
      response.ok
        ? await response.json()
        : Promise.reject(await GetAPIRejection(response))
  );
}

export async function postAPI<Post, Response>(
  uriFrag: string,
  post: Post
): Promise<Response> {
  return fetch(`http://127.0.0.1:8000/api/${uriFrag}/`, {
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

export async function putAPI<Put, Response>(
  uriFrag: string,
  put: Put
): Promise<Response> {
  return fetch(`http://127.0.0.1:8000/api/${uriFrag}/`, {
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

export const LoadingPaper = (params: { text: string }) => {
  return (
    <Paper>
      <Typography>{params.text}</Typography>
      <LinearProgress />
    </Paper>
  );
};

export const FailedRetrievalPaper = (params: { text: string }) => {
  return (
    <Paper>
      <Typography variant="h5">{params.text}</Typography>
    </Paper>
  );
};

export const SnackifyAPIRejection = (
  response: APIRejection
): NotificationType => [
  `${response.status}: ${response.statusText}\n${response.payload.detail}`,
  {
    variant: "error",
    style: { whiteSpace: "pre-line" },
  },
];
