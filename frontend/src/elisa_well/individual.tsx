import { Card, CardContent, Stack, Typography } from "@mui/material";
import { useEffect } from "react";
import { useDispatch, useSelector } from "react-redux";
import { useParams } from "react-router";
import { getAntigen, selectAntigen } from "../antigen/slice";
import { getNanobody, selectNanobody } from "../nanobody/slice";
import { FailedRetrievalPaper, LoadingPaper } from "../utils/api";
import { getElisaWell, selectElisaWell, selectLoadingElisaWell } from "./slice";
import { ElisaWellInfo, ElisaWellKey } from "./utils";

type StrElisaWellKey = { [K in keyof ElisaWellKey]: string }

export default function ElisaWellView() {
    const { plate, location: str_location } = useParams<StrElisaWellKey>() as StrElisaWellKey;
    const location = parseInt(str_location);
    console.log(`Plate: ${plate} Location: ${location}`);
    const dispatch = useDispatch();
    const elisaWell = useSelector(selectElisaWell({ plate, location }));
    const antigen = useSelector(elisaWell ? selectAntigen(elisaWell.antigen) : () => undefined);
    const nanobody = useSelector(elisaWell ? selectNanobody(elisaWell.nanobody) : () => undefined);
    const loading = useSelector(selectLoadingElisaWell);

    useEffect(() => {
        dispatch(getElisaWell({ plate, location }));
    }, [dispatch, plate, location]);
    useEffect(() => {
        if (elisaWell) {
            dispatch(getAntigen(elisaWell.antigen));
            dispatch(getNanobody(elisaWell.nanobody));
        }
    }, [dispatch, elisaWell])

    if (loading) return <LoadingPaper text="Retrieving elisa well from database." />
    if (!elisaWell) return <FailedRetrievalPaper text={`Could not retrieve entry for ${plate}:${location}`} />

    return (
        <Card>
            <CardContent>
                <Stack>
                    <Typography variant="h4">
                        {antigen ? antigen.name : null} + {nanobody ? nanobody.name : null}
                    </Typography>
                    <ElisaWellInfo plate={elisaWell.plate} location={elisaWell.location} />
                </Stack>
            </CardContent>
        </Card>
    );
};