import { LinearProgress, Paper, Typography } from "@mui/material"

export function getAPI(uriFrag: string) {
    return fetch(`http://127.0.0.1:8000/api/${uriFrag}/?format=json`)
}

export function postAPI(uriFrag: string, post: object) {
    return fetch(
        `http://127.0.0.1:8000/api/${uriFrag}/`,
        {
            method: 'POST',
            mode: 'cors',
            cache: 'no-cache',
            credentials: 'same-origin',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify(post)
        }
    )
}

export const LoadingPaper = (params: { text: string }) => {
    return (
        <Paper>
            <Typography>{params.text}</Typography>
            <LinearProgress />
        </Paper>
    )
}

export const FailedRetrievalPaper = (params: { text: string }) => {
    return (
        <Paper>
            <Typography variant="h5">{params.text}</Typography>
        </Paper>
    )
}