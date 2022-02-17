import { Card, CardContent, Stack, Typography } from "@mui/material";
import { useEffect } from "react";
import { useDispatch, useSelector } from "react-redux";
import { useParams } from "react-router";
import { getAntigen, selectAntigen } from "../antigen/slice";
import { getNanobody, selectNanobody } from "../nanobody/slice";
import { FailedRetrievalPaper, LoadingPaper } from "../utils/api";
import { getElisaWell, selectElisaWell, selectLoadingElisaWell } from "./slice";
import { ElisaWellInfo } from "./utils";


export default function DetailedElisaWellView() {
    const { uuid } = useParams<{ uuid: string }>() as { uuid: string };
    const dispatch = useDispatch();
    const elisaWell = useSelector(selectElisaWell(uuid));
    const antigen = useSelector(elisaWell ? selectAntigen(elisaWell.antigen) : () => undefined);
    const nanobody = useSelector(elisaWell ? selectNanobody(elisaWell.nanobody) : () => undefined);
    const loading = useSelector(selectLoadingElisaWell);

    useEffect(() => {
        dispatch(getElisaWell(uuid));
    }, [dispatch, uuid]);
    useEffect(() => {
        if (elisaWell) {
            dispatch(getAntigen(elisaWell.antigen));
            dispatch(getNanobody(elisaWell.nanobody));
        }
    }, [dispatch, elisaWell])

    if (loading) return <LoadingPaper text="Retrieving elisa well from database." />
    if (!elisaWell) return <FailedRetrievalPaper text={`Could not retrieve entry for ${uuid}`} />

    return (
        <Card>
            <CardContent>
                <Stack>
                    <Typography variant="h4">
                        {antigen ? antigen.name : null} + {nanobody ? nanobody.name : null}
                    </Typography>
                    <ElisaWellInfo uuid={elisaWell.uuid} />
                </Stack>
            </CardContent>
        </Card>
    );
};