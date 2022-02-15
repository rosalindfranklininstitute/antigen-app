import { Card, CardContent, Stack, Typography } from "@mui/material";
import { useEffect } from "react";
import { useDispatch, useSelector } from "react-redux";
import { useParams } from "react-router-dom";
import { LoadingPaper, FailedRetrievalPaper } from "../utils/api";
import { getDetailedElisaPlate, selectDetailedElisaPlate, selectLoadingDetailedElisaPlate } from "./slice";
import { ElisaPlateInfo } from "./utils";
import { ElisaWellMapElement } from "./well_map";

export default function ElisaPlateView() {
    let { uuid } = useParams<{ uuid: string }>() as { uuid: string };
    const dispatch = useDispatch();
    const detailedElisaPlate = useSelector(selectDetailedElisaPlate(uuid));
    const loading = useSelector(selectLoadingDetailedElisaPlate);

    useEffect(() => {
        dispatch(getDetailedElisaPlate(uuid));
    }, [dispatch, uuid]);

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