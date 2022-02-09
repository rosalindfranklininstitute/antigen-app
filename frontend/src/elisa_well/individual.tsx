import { Card, CardContent, Stack, Typography } from "@mui/material";
import { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import { Antigen } from "../antigen/utils";
import { Nanobody } from "../nanobody/utils";
import { getAPI, FailedRetrievalPaper, LoadingPaper } from "../utils/api";
import { DetailedElisaWell, ElisaWell, ElisaWellInfo } from "./utils";


export default function ElisaWellView() {
    let params = useParams();

    const [elisaWell, setElisaWell] = useState<DetailedElisaWell | null>(null);
    const [responses, setResponses] = useState<[Response | null, Response | null, Response | null]>([null, null, null]);

    useEffect(() => {
        const fetchElisaWell = async () => {
            const elisaWellResponse = await getAPI(`elisa_well/${params.uuid}`);
            setResponses([elisaWellResponse, null, null]);
            if (!elisaWellResponse.ok) return;
            const elisaWell: ElisaWell = await elisaWellResponse.json();

            const antigenResponse = await getAPI(`antigen/${elisaWell.antigen}`);
            setResponses([elisaWellResponse, antigenResponse, null]);
            if (!antigenResponse.ok) return;
            const antigen: Antigen = await antigenResponse.json();

            const nanobodyResponse = await getAPI(`nanobody/${elisaWell.nanobody}`);
            setResponses([elisaWellResponse, antigenResponse, nanobodyResponse]);
            if (!nanobodyResponse.ok) return;
            const nanobody: Nanobody = await nanobodyResponse.json();

            const detailedElisaWell: DetailedElisaWell = {
                uuid: elisaWell.uuid,
                plate: elisaWell.plate,
                location: elisaWell.location,
                antigen: antigen,
                nanobody: nanobody,
                optical_density: elisaWell.optical_density,
                functional: elisaWell.functional
            }
            setElisaWell(detailedElisaWell);
        };
        fetchElisaWell();
    }, [params]);

    if (!responses.every((response) => response && response.ok)) return <LoadingPaper text="Retrieving elisa well from database." />
    if (!elisaWell) return <FailedRetrievalPaper text={`Could not retrieve entry for ${window.location.href.split("/").pop()}`} />

    return (
        <Card>
            <CardContent>
                <Stack>
                    <Typography variant="h4">{elisaWell.antigen.name} + {elisaWell.nanobody.name}</Typography>
                    <ElisaWellInfo elisaWell={elisaWell} />
                </Stack>
            </CardContent>
        </Card>
    );
};