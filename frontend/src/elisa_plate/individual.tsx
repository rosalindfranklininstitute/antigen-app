import { Card, CardContent, Stack, Typography } from "@mui/material";
import { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import { getAPI, LoadingPaper, FailedRetrievalPaper } from "../utils/api";
import { ElisaPlate, ElisaPlateInfo } from "./utils";


export default function ElisaPlateView() {
    let params = useParams();

    const [elisaPlate, setElisaPlate] = useState<ElisaPlate | null>(null);
    const [response, setResponse] = useState<Response | null>(null);

    useEffect(() => {
        const fetchElisaPlate = async () => {
            const response = await getAPI(`elisa_plate/${params.uuid}`);
            setResponse(response);
            if (response.ok) {
                const elisaPlate: ElisaPlate = await response.json();
                setElisaPlate(elisaPlate);
            };
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