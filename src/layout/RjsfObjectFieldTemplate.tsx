import ExpandMore from '@mui/icons-material/ExpandMore';
import { Accordion, AccordionDetails, AccordionSummary, Box, Tooltip } from '@mui/material';
import { ObjectFieldTemplateProps, descriptionId, getTemplate, getUiOptions, titleId } from '@rjsf/utils';
import React from 'react';
import { OptionalTooltip } from '../util/decorators';
import { InfoOutlined } from '@mui/icons-material';

/** 
 * Override of RJSF Form ObjectFieldTemplate to reduce the spacing between fields, e.g. removing marginBottom: '10px'.
 */
export default function RjsfObjectFieldTemplate(props: ObjectFieldTemplateProps) {
  const {description,title,properties,required,disabled,readonly,uiSchema,idSchema,schema,formData,onAddClick,registry,} = props;
  const uiOptions = getUiOptions(uiSchema);
  const TitleFieldTemplate = getTemplate('TitleFieldTemplate', registry, uiOptions);
  const detail = (<>
    {properties.map((element, index) =>
      // Remove the <Grid> if the inner element is hidden as the <Grid> itself would otherwise still take up space.
      element.hidden ? element.content : (
        <Box key={index} style={{ paddingTop: '10px', marginBottom: '5px' }}>
          {element.content}
        </Box>
      )
    )}
  </>)

  if (title && !title.match("-[0-9]+$")) {
    return (
      <Accordion>
        <AccordionSummary expandIcon={<ExpandMore />} sx={{margin: '0px', minHeight: '40px'}}>
          <TitleFieldTemplate id={titleId(idSchema)} title={title} required={required} schema={schema} uiSchema={uiSchema} registry={registry} />
          <OptionalTooltip description={uiOptions.description || description} element={<InfoOutlined color="primary" sx={{height: "14px", alignSelf: "end", marginBottom: "3px"}}/>}/>
        </AccordionSummary>
        <AccordionDetails>
          {detail}
        </AccordionDetails>
      </Accordion>
  )} else return detail;
}
