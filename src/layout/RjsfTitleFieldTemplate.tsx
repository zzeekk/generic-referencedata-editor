import { Typography } from '@mui/material';
import { TitleFieldProps } from '@rjsf/utils';

const REQUIRED_FIELD_SYMBOL = '*';

export default function RjsfTitleFieldTemplate(props: TitleFieldProps) {
  const { id, title, required } = props;
  return (title.match("-[0-9]+$")) ? (<></>) : (
    <Typography variant="h6" id={id} sx={{marginBottom: "-5px"}}>
      {title}
      {required && <span className='required'>{REQUIRED_FIELD_SYMBOL}</span>}
    </Typography>
  );
}
