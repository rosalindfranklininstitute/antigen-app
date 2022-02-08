import { Card, CardContent, Stack, Typography } from "@mui/material";
import { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import { Antigen } from "../antigen/utils";
import { DetailedElisaWell, ElisaWell } from "../elisa_well/utils";
import { Nanobody } from "../nanobody/utils";
import { getAPI, LoadingPaper, FailedRetrievalPaper } from "../utils/api";
import { DetailedElisaPlate, ElisaPlate, ElisaPlateInfo } from "./utils";

export default function ElisaPlateView() {
    let params = useParams();

    const [elisaPlate, setElisaPlate] = useState<DetailedElisaPlate | null>(null);
    const [response, setResponse] = useState<Response | null>(null);

    useEffect(() => {
        const fetchElisaPlate = async () => {
            const response = await getAPI(`elisa_plate/${params.uuid}`);
            setResponse(response);
            if (!response.ok) {
                return
            };
            const elisaPlate: ElisaPlate = await response.json();

            const detailedElisaWells = (await Promise.all(
                elisaPlate.plate_elisa_wells.map(async (wellUUID, idx) => {
                    const elisaWell: ElisaWell = await (await getAPI(`elisa_well/${wellUUID}`)).json();
                    const antigen: Antigen = await (await getAPI(`antigen/${elisaWell.antigen}`)).json();
                    const nanobody: Nanobody = await (await getAPI(`nanobody/${elisaWell.nanobody}`)).json();

                    const detailedElisaWell: DetailedElisaWell = {
                        uuid: elisaWell.uuid,
                        plate: elisaWell.plate,
                        location: elisaWell.location,
                        antigen: antigen,
                        nanobody: nanobody,
                        optical_density: elisaWell.optical_density,
                        functional: elisaWell.functional
                    }
                    return detailedElisaWell;
                })
            ));

            const detailedElisaPlate: DetailedElisaPlate = {
                uuid: elisaPlate.uuid,
                threshold: elisaPlate.threshold,
                plate_elisa_wells: detailedElisaWells,
                creation_time: elisaPlate.creation_time
            }
            setElisaPlate(detailedElisaPlate);
        };
        fetchElisaPlate();
    }, [params]);

    if (!response) {
        return <LoadingPaper text="Retrieving elisa plate from database." />
    }

    if (!elisaPlate) {
        let text = `Could not retrieve entry for ${window.location.href.split("/").pop()}`
        return <FailedRetrievalPaper text={text} />
    }

    return (
        <Card>
            <CardContent>
                <Stack>
                    <Typography variant="h4">{elisaPlate.uuid}</Typography>
                    <ElisaPlateInfo elisaPlate={elisaPlate} />
                </Stack>
            </CardContent>
        </Card>
    );
};