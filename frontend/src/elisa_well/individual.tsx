import { Card, CardContent, Stack, Typography } from "@mui/material";
import { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import { Antigen } from "../antigen/utils";
import { Nanobody } from "../nanobody/utils";
import { getAPI, FailedRetrievalPaper } from "../utils/api";
import { DetailedElisaWell, ElisaWell, ElisaWellInfo } from "./utils";


export default function ElisaWellView() {
    let params = useParams();

    const [elisaWell, setElisaWell] = useState<DetailedElisaWell | null>(null);

    useEffect(() => {
        const fetchElisaWell = async () => {
            const elisaWell: ElisaWell = await (await getAPI(`elisa_well/${params.uuid}`)).json();
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
            setElisaWell(detailedElisaWell);
        };
        fetchElisaWell();
    }, [params]);

    if (!elisaWell) {
        let text = `Could not retrieve entry for ${window.location.href.split("/").pop()}`
        return <FailedRetrievalPaper text={text} />
    }

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