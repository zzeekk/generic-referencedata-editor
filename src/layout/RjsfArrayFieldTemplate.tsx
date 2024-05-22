import { Accordion, AccordionDetails, AccordionSummary, Box, Tooltip } from '@mui/material';
import {
    ArrayFieldTemplateItemType,
    ArrayFieldTemplateProps,
    getTemplate,
    getUiOptions
} from '@rjsf/utils';
import ExpandMore from '@mui/icons-material/ExpandMore';
import { OptionalTooltip } from '../util/decorators';
import { InfoOutlined, InfoRounded, InfoTwoTone } from '@mui/icons-material';
  
export default function RjsfArrayFieldTemplate(props: ArrayFieldTemplateProps) {
    const { canAdd, className, disabled, idSchema, uiSchema, items, onAddClick, readonly, registry, required, schema, title,} = props;
    const uiOptions = getUiOptions(uiSchema);
    const ArrayFieldItemTemplate = getTemplate( 'ArrayFieldItemTemplate', registry, uiOptions );
    const ArrayFieldTitleTemplate = getTemplate( 'ArrayFieldTitleTemplate', registry, uiOptions );
    // Button templates are not overridden in the uiSchema
    const { ButtonTemplates: { AddButton }, } = registry.templates;
    return (
        <Accordion>
            <AccordionSummary expandIcon={<ExpandMore />} sx={{margin: '0px', minHeight: '40px'}}>
                <ArrayFieldTitleTemplate idSchema={idSchema} title={uiOptions.title || title} required={required} schema={schema} uiSchema={uiSchema} registry={registry}/>
                <OptionalTooltip description={uiOptions.description || schema.description} element={<InfoOutlined color="primary" sx={{height: "14px", alignSelf: "end", marginBottom: "3px"}}/>}/>
            </AccordionSummary>
            <AccordionDetails>
                {items &&
                    items.map(({ key, ...itemProps }: ArrayFieldTemplateItemType) => (
                    <ArrayFieldItemTemplate key={key} {...itemProps} />
                    ))}
                {canAdd && <AddButton className='array-item-add' onClick={onAddClick} disabled={disabled || readonly} uiSchema={uiSchema} registry={registry} />}
            </AccordionDetails>
        </Accordion>        
    );
  }
  