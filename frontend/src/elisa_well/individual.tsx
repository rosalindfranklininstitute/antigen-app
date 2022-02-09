import { Card, CardContent, Stack, Typography } from "@mui/material";
import { useEffect, useState } from "react";
import { useParams } from "react-router";
import { FailedRetrievalPaper, LoadingPaper } from "../utils/api";
import { DetailedElisaWell, ElisaWellInfo, fetchDetailedElisaWell } from "./utils";


export default function DetailedElisaWellView() {
    const { uuid } = useParams<{ uuid: string }>();
    const [detailedElisaWell, setDetailedElisaWell] = useState<DetailedElisaWell | null>(null);
    const [loading, setLoading] = useState<boolean>(true);

    useEffect(() => {
        if (!uuid) {
            setLoading(false);
            return;
        };
        fetchDetailedElisaWell(uuid).then(
            (elisaWell) => {
                setDetailedElisaWell(elisaWell)
                setLoading(false)
            },
            () => setLoading(false)
        );
    }, [uuid]);

    if (loading) return <LoadingPaper text="Retrieving elisa well from database." />
    if (!detailedElisaWell) return <FailedRetrievalPaper text={`Could not retrieve entry for ${uuid}`} />

    return (
        <Card>
            <CardContent>
                <Stack>
                    <Typography variant="h4">{detailedElisaWell.antigen.name} + {detailedElisaWell.nanobody.name}</Typography>
                    <ElisaWellInfo elisaWell={detailedElisaWell} />
                </Stack>
            </CardContent>
        </Card>
    );
};