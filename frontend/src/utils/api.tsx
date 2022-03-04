import { LinearProgress, Paper, Typography } from "@mui/material";

export async function getAPI<Type>(uriFrag: string): Promise<Type> {
  return fetch(`http://127.0.0.1:8000/api/${uriFrag}/?format=json`).then(
    async (response) => {
      if (!response.ok) {
        return Promise.reject(response);
      }
      return await response.json();
    }
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
      ? response.json().then((object) => object)
      : Promise.reject(response)
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
  }).then(async (response) => {
    if (!response.ok) {
      return Promise.reject(response);
    }
    return await response.json();
  });
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
