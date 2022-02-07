import { Button, Link, Menu, MenuItem, MenuList } from "@mui/material";
import { GridRenderCellParams } from "@mui/x-data-grid";
import { useState } from "react";
import { useNavigate } from "react-router-dom";

export const LinkUUIDCellRenderer = (rootURI: string, params: GridRenderCellParams<string>) => {
    const navigate = useNavigate();

    return (
        <Link
            onClick={() => navigate(`${rootURI}${params.value}`)}
        >
            {params.value}
        </Link>
    )
}

export const WellCellRenderer = (params: GridRenderCellParams<string[]>) => {
    const navigate = useNavigate();

    const [anchorEl, setAnchorEl] = useState<HTMLElement | null>(null);

    return (
        <div>
            <Button

                variant="text"
                onClick={(evt) => setAnchorEl(evt.currentTarget)}
            >
                {params.value.length}
            </Button>
            <Menu
                open={Boolean(anchorEl) && Boolean(params.value.length)}
                anchorEl={anchorEl}
                onClose={() => setAnchorEl(null)}
            >
                <MenuList dense>
                    {
                        params.value.map((well, idx) => (
                            <MenuItem onClick={() => navigate(`/elisa_wells/${well}`)}>{well}</MenuItem>
                        ))
                    }
                </MenuList>
            </Menu>
        </div >

    )
}