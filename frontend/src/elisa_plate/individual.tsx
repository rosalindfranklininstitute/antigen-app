import { Card, CardContent, Paper, Stack, Typography, Grid, Popover } from "@mui/material";
import { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import { Antigen } from "../antigen/utils";
import { DetailedElisaWell, ElisaWell, locationToCoords } from "../elisa_well/utils";
import { Nanobody } from "../nanobody/utils";
import { getAPI, LoadingPaper, FailedRetrievalPaper } from "../utils/api";
import { DetailedElisaPlate, ElisaPlate, ElisaPlateInfo } from "./utils";

function ElisaPlateWell(params: { well: DetailedElisaWell | null }) {

    const uuidToColor = (uuid: string) => {
        const hue = Number("0x".concat(uuid.substring(0, 2)))
        return `hsl(${hue}, 50%, 50%)`;
    }

    const AntigenSemicircle = (params: { antigen: Antigen | null }) => {
        const [anchorEl, setAnchorEl] = useState<null | HTMLElement>(null);
        const hover_open = Boolean(anchorEl) && Boolean(params.antigen);

        return (
            <Paper
                sx={{
                    backgroundColor: params.antigen ? uuidToColor(params.antigen.uuid) : "white",
                    width: "50%",
                    paddingTop: "100%",
                    borderRadius: "1000px 0 0 1000px" // Large absolute units result in equal circular radii
                }}
                onMouseEnter={(evt) => setAnchorEl(evt.currentTarget)}
                onMouseLeave={() => setAnchorEl(null)}
            >
                <Popover
                    open={hover_open}
                    anchorEl={anchorEl}
                    anchorOrigin={{
                        vertical: 'center',
                        horizontal: 'left',
                    }}
                    transformOrigin={{
                        vertical: 'center',
                        horizontal: 'center',
                    }}
                    onClose={() => setAnchorEl(null)}
                    sx={{
                        pointerEvents: 'none',
                    }}
                >
                    {params.antigen?.name}
                </Popover>
            </Paper>
        )
    };
    const NanobodySemiCircle = (params: { nanobody: Nanobody | null }) => {
        const [anchorEl, setAnchorEl] = useState<null | HTMLElement>(null);
        const hover_open = Boolean(anchorEl) && Boolean(params.nanobody);

        return (
            <Paper
                sx={{
                    backgroundColor: params.nanobody ? uuidToColor(params.nanobody.uuid) : "white",
                    width: "50%",
                    paddingTop: "100%",
                    borderRadius: "0 1000px 1000px 0" // Large absolute units result in equal circular radii
                }}
                onMouseEnter={(evt) => setAnchorEl(evt.currentTarget)}
                onMouseLeave={() => setAnchorEl(null)}
            >
                <Popover
                    open={hover_open}
                    anchorEl={anchorEl}
                    anchorOrigin={{
                        vertical: 'center',
                        horizontal: 'right',
                    }}
                    transformOrigin={{
                        vertical: 'center',
                        horizontal: 'center',
                    }}
                    onClose={() => setAnchorEl(null)}
                    sx={{
                        pointerEvents: 'none',
                    }}
                >
                    {params.nanobody?.name}
                </Popover>
            </Paper>
        )
    };

    return (
        <Stack direction="row">
            <AntigenSemicircle antigen={params.well ? params.well.antigen : null} />
            <NanobodySemiCircle nanobody={params.well ? params.well.nanobody : null} />
        </Stack>
    )
}

function ElisaPlateWellsView(params: { wells: DetailedElisaWell[] }) {
    const wellGrid: Array<Array<(DetailedElisaWell | null)>> = new Array(8).fill(undefined).map((val, idx) => new Array(12).fill(null));

    params.wells.forEach((well, idx) => {
        const [row, col] = locationToCoords(well.location);
        wellGrid[row][col] = well;
    })

    return (
        <Grid container spacing={2} columns={13}>
            <Grid item xs={1} />
            {
                Array.from({ length: 12 }, (_, idx) => (
                    <Grid item xs={1}>
                        <Typography>{idx + 1}</Typography>
                    </Grid>
                ))
            }
            {
                wellGrid.map((wellRow, idx) => {
                    return [
                        <Grid item xs={1}>
                            <Typography>{String.fromCharCode(idx + 65)}</Typography>
                        </Grid>,
                        wellRow.map((well, idx) => (
                            <Grid item xs={1}>
                                <ElisaPlateWell well={well} />
                            </Grid>
                        ))
                    ]
                })
            }
        </Grid>
    )
}

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
                    <ElisaPlateWellsView wells={elisaPlate.plate_elisa_wells} />
                </Stack>
            </CardContent>
        </Card>
    );
};