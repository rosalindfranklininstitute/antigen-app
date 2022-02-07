import { Button, Link, Menu, MenuItem, MenuList } from "@mui/material";
import { GridRenderCellParams } from "@mui/x-data-grid";
import { useState } from "react";
import { useNavigate } from "react-router-dom";

export const LinkUUID = (params: { rootURI: string, UUID: string }) => {
    const navigate = useNavigate();

    return (
        <Link
            onClick={() => navigate(`${params.rootURI}${params.UUID}`)}
        >
            {params.UUID}
        </Link>
    )
}
export const LinkUUIDCellRenderer = (rootURI: string) => {
    return (params: GridRenderCellParams<string>) => <LinkUUID rootURI={rootURI} UUID={params.value} />
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
                            <MenuItem onClick={() => navigate(`/elisa_well/${well}`)}>{well}</MenuItem>
                        ))
                    }
                </MenuList>
            </Menu>
        </div >

    )
}