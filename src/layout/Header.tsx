import { AppBar, Box, Toolbar, Typography } from "@mui/material";
import { ReactElement } from 'react';

export default function Header(props: {title: string, elements: ReactElement}) {
    return (
        <>
            <AppBar sx={{position: "relative"}}>
                <Toolbar variant="dense" sx={{pr: '5px !important'}}>
                    <Typography variant="h6" noWrap component="div" sx={{ mr: 2 }}>
                        {props.title}
                    </Typography>
                    <Box sx={{ flexGrow: 1 }} />
                    {props.elements}
                </Toolbar>                
            </AppBar>
        </>
    );
}