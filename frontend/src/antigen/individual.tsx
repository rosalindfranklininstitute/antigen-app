import { Card, CardContent, Stack, Typography } from "@mui/material";
import { useEffect } from "react";
import { useDispatch, useSelector } from "react-redux";
import { useParams } from "react-router-dom";
import { LoadingPaper, FailedRetrievalPaper } from "../utils/api";
import { getAntigen, selectAntigen, selectLoadingAntigen } from "./slice";
import { AntigenInfo } from "./utils";


export default function AntigenView() {
    const { uuid } = useParams<{ uuid: string }>() as { uuid: string };
    const dispatch = useDispatch();
    const antigen = useSelector(selectAntigen(uuid));
    const loading = useSelector(selectLoadingAntigen);

    useEffect(() => {
        dispatch(getAntigen(uuid));
    }, [dispatch, uuid]);

    if (loading) return <LoadingPaper text="Retrieving antigen from database." />
    if (!antigen) return <FailedRetrievalPaper text={`Could not retrieve entry for ${uuid}`} />

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