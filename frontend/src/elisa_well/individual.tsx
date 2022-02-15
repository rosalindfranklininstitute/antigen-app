import { Card, CardContent, Stack, Typography } from "@mui/material";
import { useEffect } from "react";
import { useDispatch, useSelector } from "react-redux";
import { useParams } from "react-router";
import { FailedRetrievalPaper, LoadingPaper } from "../utils/api";
import { getDetailedElisaWell, selectDetailedElisaWell, selectLoadingElisaWell } from "./slice";
import { ElisaWellInfo } from "./utils";


export default function DetailedElisaWellView() {
    const { uuid } = useParams<{ uuid: string }>() as { uuid: string };
    const dispatch = useDispatch();
    const detailedElisaWell = useSelector(selectDetailedElisaWell(uuid));
    const loading = useSelector(selectLoadingElisaWell);

    useEffect(() => {
        dispatch(getDetailedElisaWell(uuid));
    }, [dispatch, uuid]);

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