import { Card, CardContent, Stack, Typography } from "@mui/material";
import { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import { LoadingPaper, FailedRetrievalPaper } from "../utils/api";
import { DetailedElisaPlate, ElisaPlateInfo, fetchDetailedElisaPlate } from "./utils";
import { ElisaWellMapElement } from "./well_map";

export default function ElisaPlateView() {
    let { uuid } = useParams<{ uuid: string }>();

    const [detailedElisaPlate, setDetailedElisaPlate] = useState<DetailedElisaPlate | null>(null);
    const [loading, setLoading] = useState<boolean>(true);

    useEffect(() => {
        if (!uuid) {
            setLoading(false);
            return;
        };
        fetchDetailedElisaPlate(uuid).then(
            (detailedElisaPlate) => {
                setDetailedElisaPlate(detailedElisaPlate);
                setLoading(false);
            },
            () => setLoading(false)
        )
    }, [uuid]);

    if (loading) return <LoadingPaper text="Retrieving elisa plate from database." />

    if (!detailedElisaPlate) return <FailedRetrievalPaper text={`Could not retrieve entry for ${window.location.href.split("/").pop()}`} />

    return (
        <Card>
            <CardContent>
                <Stack>
                    <Typography variant="h4">{detailedElisaPlate.uuid}</Typography>
                    <ElisaPlateInfo elisaPlate={detailedElisaPlate} />
                    <ElisaWellMapElement wells={detailedElisaPlate.plate_elisa_wells} />
                </Stack>
            </CardContent>
        </Card>
    );
};