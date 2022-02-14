import { Card, CardContent, Stack, Typography } from "@mui/material";
import { useEffect } from "react";
import { useDispatch, useSelector } from "react-redux";
import { useParams } from "react-router-dom";
import { LoadingPaper, FailedRetrievalPaper } from "../utils/api";
import { antigenSelector, getAntigen } from "./slice";
import { AntigenInfo } from "./utils";


export default function AntigenView() {
    const { uuid } = useParams<{ uuid: string }>();
    const dispatch = useDispatch();
    const { antigens, loading } = useSelector(antigenSelector);

    useEffect(() => {
        if (uuid) dispatch(getAntigen(uuid))
    }, [dispatch, uuid]);

    if (loading) return <LoadingPaper text="Retrieving antigen from database." />

    const antigen = antigens.find((antigen) => antigen.uuid === uuid);

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