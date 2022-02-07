import { Card, CardContent, Stack, Typography } from "@mui/material";
import { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import { getAPI, LoadingPaper, FailedRetrievalPaper } from "../utils/api";
import { Nanobody, NanobodyInfo } from "./utils";


export default function NanobodyView() {
    let params = useParams();

    const [nanobody, setNanobody] = useState<Nanobody | null>(null);
    const [response, setResponse] = useState<Response | null>(null);

    useEffect(() => {
        const fetchNanobody = async () => {
            const response = await getAPI(`nanobody/${params.uuid}`);
            setResponse(response);
            if (response.ok) {
                const nanobody: Nanobody = await response.json();
                setNanobody(nanobody);
            };
        };
        fetchNanobody();
    }, [params]);

    if (!response) {
        return <LoadingPaper text="Retrieving nanobody from database." />
    }

    if (!nanobody) {
        let text = `Could not retrieve entry for ${window.location.href.split("/").pop()}`
        return <FailedRetrievalPaper text={text} />
    }

    return (
        <Card>
            <CardContent>
                <Stack>
                    <Typography variant="h4">{nanobody.name}</Typography>
                    <NanobodyInfo nanobody={nanobody} />
                </Stack>
            </CardContent>
        </Card>
    );
};