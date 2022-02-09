import { Card, CardContent, Stack, Typography } from "@mui/material";
import { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import { LoadingPaper, FailedRetrievalPaper } from "../utils/api";
import { fetchNanobody, Nanobody, NanobodyInfo } from "./utils";


export default function NanobodyView() {
    const { uuid } = useParams<{ uuid: string }>();
    const [nanobody, setNanobody] = useState<Nanobody | null>(null);
    const [loading, setLoading] = useState<boolean>(true);

    useEffect(() => {
        if (!uuid) {
            setLoading(false);
            return;
        };
        fetchNanobody(uuid).then(
            (nanobody) => {
                setNanobody(nanobody);
                setLoading(false);
            },
            () => setLoading(false)
        );
    }, [uuid]);

    if (loading) return <LoadingPaper text="Retrieving nanobody from database." />
    if (!nanobody) return <FailedRetrievalPaper text={`Could not retrieve entry for ${uuid}`} />

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