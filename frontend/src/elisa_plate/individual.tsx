import { Card, CardContent, Stack, Typography } from "@mui/material";
import { useEffect } from "react";
import { useDispatch, useSelector } from "react-redux";
import { useParams } from "react-router-dom";
import { LoadingPaper, FailedRetrievalPaper } from "../utils/api";
import { getElisaPlate, selectElisaPlate, selectLoadingElisaPlate } from "./slice";
import { ElisaPlateInfo } from "./utils";
import { ElisaWellMapElement } from "./well_map";

export default function ElisaPlateView() {
    let { uuid } = useParams<{ uuid: string }>() as { uuid: string };
    const dispatch = useDispatch();
    const elisaPlate = useSelector(selectElisaPlate(uuid));
    const loading = useSelector(selectLoadingElisaPlate);

    useEffect(() => {
        dispatch(getElisaPlate(uuid));
    }, [dispatch, uuid]);

    if (loading) return <LoadingPaper text="Retrieving elisa plate from database." />
    if (!elisaPlate) return <FailedRetrievalPaper text={`Could not retrieve entry for ${window.location.href.split("/").pop()}`} />

    return (
        <Card>
            <CardContent>
                <Stack>
                    <Typography variant="h4">{elisaPlate.uuid}</Typography>
                    <ElisaPlateInfo uuid={elisaPlate.uuid} />
                    <ElisaWellMapElement wellKeys={elisaPlate.plate_elisa_wells.map((location) => ({ plate: elisaPlate.uuid, location }))} />
                </Stack>
            </CardContent>
        </Card>
    );
};