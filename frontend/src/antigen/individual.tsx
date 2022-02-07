import { Card, CardContent, Stack, Typography } from "@mui/material";
import { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import { getAPI, LoadingPaper, FailedRetrievalPaper } from "../utils/api";
import { Antigen, AntigenInfo } from "./utils";


export default function AntigenView() {
    let params = useParams();

    const [antigen, setAntigen] = useState<Antigen | null>(null);
    const [response, setResponse] = useState<Response | null>(null);

    useEffect(() => {
        const fetchAntigen = async () => {
            const response = await getAPI(`antigen/${params.uuid}`);
            setResponse(response);
            if (response.ok) {
                const antigen: Antigen = await response.json();
                setAntigen(antigen);
            };
        };
        fetchAntigen();
    }, [params]);

    if (!response) {
        return <LoadingPaper text="Retrieving antigen from database." />
    }

    if (!antigen) {
        let text = `Could not retrieve entry for ${window.location.href.split("/").pop()}`
        return <FailedRetrievalPaper text={text} />
    }

    return (
        <Card>
            <CardContent>
                <Stack>
                    <Typography variant="h4">{antigen.name}</Typography>
                    <AntigenInfo antigen={antigen} />
                </Stack>
            </CardContent>
        </Card>
    );
};