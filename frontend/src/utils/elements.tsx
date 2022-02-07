import { Button, IconButton, Link, Menu, MenuItem, MenuList } from "@mui/material";
import { GridRenderCellParams, GridColDef } from "@mui/x-data-grid";
import { useState } from "react";
import { useNavigate } from "react-router-dom";
import LinkIcon from '@mui/icons-material/Link';

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

export const IconLinkUUID = (params: { rootURI: string, UUID: string }) => {
    const navigate = useNavigate();

    return (
        <IconButton
            onClick={() => navigate(`${params.rootURI}${params.UUID}`)}
        >
            <LinkIcon />
        </IconButton>
    )
}

export const IconLinkUUIDCellRenderer = (rootURI: string) => {
    return (params: GridRenderCellParams<string>) => <IconLinkUUID rootURI={rootURI} UUID={params.value} />
}

export const IconLinkUUIDGridColDef = (rootURI: string): GridColDef => {
    return {
        field: 'uuid',
        headerName: 'Link',
        renderCell: IconLinkUUIDCellRenderer(rootURI),
        width: 50
    }
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