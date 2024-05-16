import { Tooltip } from "@mui/material";

export function OptionalTooltip(props: {description: string|undefined, element: React.ReactElement}) {
    return (!props.description ? <></> : <Tooltip title={props.description} arrow>{props.element}</Tooltip>);
}