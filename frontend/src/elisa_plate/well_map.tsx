import { Typography, Grid, Button, Paper, Popover, Stack } from "@mui/material";
import { useState } from "react";
import { DetailedElisaWell, locationToCoords } from "../elisa_well/utils";

function uuidToColor(uuid: string) {
    const hue = Number("0x".concat(uuid.substring(0, 2)))
    return `hsl(${hue}, 50%, 50%)`;
}

function ElisaWellElement(params: { well: DetailedElisaWell | null }) {
    const antigenColor = params.well ? uuidToColor(params.well.antigen.uuid) : "white";
    const nanobodyColor = params.well ? uuidToColor(params.well.nanobody.uuid) : "white";

    const [anchorEl, setAnchorEl] = useState<HTMLElement | null>(null);
    const hoverOpen = Boolean(anchorEl) && Boolean(params.well);

    return (
        <Paper
            sx={{
                background: `linear-gradient(90deg, ${antigenColor} 50%, ${nanobodyColor} 50%)`,
                borderRadius: "50%",
                overflow: "hidden",
            }}>
            <Button
                sx={{
                    width: "100%",
                    padding: "0 0 100% 0",
                }}
                onMouseEnter={(evt) => setAnchorEl(evt.currentTarget)}
                onMouseLeave={() => setAnchorEl(null)}
            />
            <Popover
                open={hoverOpen}
                anchorEl={anchorEl}
                anchorOrigin={{
                    vertical: "bottom",
                    horizontal: "center",
                }}
                transformOrigin={{
                    vertical: "top",
                    horizontal: "center",
                }}
                onClose={() => setAnchorEl(null)}
                sx={{ pointerEvents: "none" }}
            >
                <Stack alignItems="center">
                    <div>Antigen: {params.well?.antigen.name}</div>
                    <div>Nanobody: {params.well?.nanobody.name}</div>
                </Stack>
            </Popover>
        </Paper>
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