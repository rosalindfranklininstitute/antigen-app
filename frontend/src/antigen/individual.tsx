import { Card, CardContent, Stack, Typography } from "@mui/material";
import { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import { LoadingPaper, FailedRetrievalPaper } from "../utils/api";
import { Antigen, AntigenInfo, fetchAntigen } from "./utils";


export default function AntigenView() {
    let { uuid } = useParams<{ uuid: string }>();
    const [antigen, setAntigen] = useState<Antigen | null>(null);
    const [loading, setLoading] = useState<boolean>(true);

    useEffect(() => {
        if (!uuid) {
            setLoading(false);
            return;
        };
        fetchAntigen(uuid).then(
            (antigen) => {
                setAntigen(antigen);
                setLoading(false);
            },
            () => setLoading(false)
        );
    }, [uuid]);

    if (loading) {
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