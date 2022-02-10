import { Paper, Stack, Typography, Grid, Popover } from "@mui/material";
import { useState } from "react";
import { Antigen } from "../antigen/utils";
import { DetailedElisaWell, locationToCoords } from "../elisa_well/utils";
import { Nanobody } from "../nanobody/utils";

function uuidToColor(uuid: string) {
    const hue = Number("0x".concat(uuid.substring(0, 2)))
    return `hsl(${hue}, 50%, 50%)`;
}


function AntigenSemicircle(params: { antigen: Antigen | null }) {
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

function NanobodySemiCircle(params: { nanobody: Nanobody | null }) {
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

function ElisaWellElement(params: { well: DetailedElisaWell | null }) {
    return (
        <Stack direction="row">
            <AntigenSemicircle antigen={params.well ? params.well.antigen : null} />
            <NanobodySemiCircle nanobody={params.well ? params.well.nanobody : null} />
        </Stack>
    )
};


export function ElisaWellMapElement(params: { wells: DetailedElisaWell[] }) {
    const wellGrid: Array<Array<(DetailedElisaWell | null)>> = new Array(8).fill(undefined).map((val, idx) => new Array(12).fill(null));

    params.wells.forEach((well, idx) => {
        const [row, col] = locationToCoords(well.location);
        wellGrid[row][col] = well;
    })

    return (
        <Grid container spacing={2} columns={13}>
            <Grid item xs={1} key={0} />
            {
                Array.from({ length: 12 }, (_, idx) => (
                    <Grid item xs={1} key={idx + 1}>
                        <Typography>{idx + 1}</Typography>
                    </Grid>
                ))
            }
            {
                wellGrid.map((wellRow, row_idx) => {
                    return [
                        <Grid item xs={1} key={(row_idx + 1) * 13}>
                            <Typography>{String.fromCharCode(row_idx + 65)}</Typography>
                        </Grid>,
                        wellRow.map((well, col_idx) => (
                            <Grid item xs={1} key={(row_idx + 1) * 13 + col_idx}>
                                <ElisaWellElement well={well} />
                            </Grid>
                        ))
                    ]
                })
            }
        </Grid>
    )
}