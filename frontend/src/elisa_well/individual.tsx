import { Card, CardContent, Stack, Typography } from "@mui/material";
import { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import { getAPI, LoadingPaper, FailedRetrievalPaper } from "../utils/api";
import { ElisaWell, ElisaWellInfo } from "./utils";


export default function ElisaWellView() {
    let params = useParams();

    const [elisaWell, setElisaWell] = useState<ElisaWell | null>(null);
    const [response, setResponse] = useState<Response | null>(null);

    useEffect(() => {
        const fetchElisaWell = async () => {
            const response = await getAPI(`elisa_well/${params.uuid}`);
            setResponse(response);
            if (response.ok) {
                const elisaWell: ElisaWell = await response.json();
                setElisaWell(elisaWell);
            };
        };
        fetchElisaWell();
    }, [params]);

    if (!response) {
        return <LoadingPaper text="Retrieving elisa well from database." />
    }

    if (!elisaWell) {
        let text = `Could not retrieve entry for ${window.location.href.split("/").pop()}`
        return <FailedRetrievalPaper text={text} />
    }

    return (
        <Card>
            <CardContent>
                <Stack>
                    <Typography variant="h4">{elisaWell.antigen} + {elisaWell.nanobody}</Typography>
                    <ElisaWellInfo elisaWell={elisaWell} />
                </Stack>
            </CardContent>
        </Card>
    );
};