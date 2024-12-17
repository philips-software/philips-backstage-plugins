import {
  Entity,
  RELATION_OWNED_BY,
  parseEntityRef,
  stringifyEntityRef,
} from '@backstage/catalog-model';
import { TemplateEntityV1beta3 } from '@backstage/plugin-scaffolder-common';
import {
  ScmIntegrationIcon,
  scmIntegrationsApiRef,
} from '@backstage/integration-react';
import {
  EntityRefLinks,
  FavoriteEntity,
  getEntityRelations,
  getEntitySourceLocation,
} from '@backstage/plugin-catalog-react';
import {
  Box,
  Card,
  CardActions,
  CardContent,
  CardMedia,
  Chip,
  IconButton,
  makeStyles,
  Typography,
  useTheme,
  Theme,
} from '@material-ui/core';
import React from 'react';
import {
  LinkButton,
  ItemCardHeader,
  MarkdownContent,
} from '@backstage/core-components';
import { useApi } from '@backstage/core-plugin-api';

const useStyles = makeStyles(theme => ({
  cardHeader: {
    position: 'relative',
  },
  title: {
    backgroundImage: ({ backgroundImage }: any) => backgroundImage,
    color: ({ fontColor }: any) => fontColor,
  },
  box: {
    overflow: 'hidden',
    textOverflow: 'ellipsis',
    display: '-webkit-box',
    '-webkit-line-clamp': 10,
    '-webkit-box-orient': 'vertical',
    paddingBottom: '0.8em',
  },
  label: {
    color: theme.palette.text.secondary,
    textTransform: 'uppercase',
    fontSize: '0.65rem',
    fontWeight: 'bold',
    letterSpacing: 0.5,
    lineHeight: 1,
    paddingBottom: '0.2rem',
  },
  leftButton: {
    marginRight: 'auto',
  },
  starButton: {
    position: 'absolute',
    top: theme.spacing(0.5),
    right: theme.spacing(0.5),
    padding: '0.25rem',
    color: '#fff',
  },
}));

export type TemplateCardProps = {
  template: TemplateEntityV1beta3;
};

type TemplateProps = {
  description: string;
  tags: string[];
  title: string;
  type: string;
  name: string;
};

const getTemplateCardProps = (
  template: TemplateEntityV1beta3,
): TemplateProps & { key: string } => {
  return {
    key: template.metadata.uid!,
    name: template.metadata.name,
    title: `${template.metadata.title ?? template.metadata.name ?? ''}`,
    type: template.spec.type ?? '',
    description: template.metadata.description ?? '-',
    tags: (template.metadata?.tags as string[]) ?? [],
  };
};

export const TemplateCard = ({ template }: TemplateCardProps) => {
  const backstageTheme = useTheme<Theme>();
  const templateProps = getTemplateCardProps(template);
  const ownedByRelations = getEntityRelations(
    template as Entity,
    RELATION_OWNED_BY,
  );
  const themeId = backstageTheme.getPageTheme({ themeId: templateProps.type })
    ? templateProps.type
    : 'other';
  const theme = backstageTheme.getPageTheme({ themeId });
  const classes = useStyles({ backgroundImage: theme.backgroundImage });
  const { name, namespace } = parseEntityRef(stringifyEntityRef(template));

  const scmIntegrationsApi = useApi(scmIntegrationsApiRef);
  const sourceLocation = getEntitySourceLocation(template, scmIntegrationsApi);

  return (
    <Card>
      <CardMedia className={classes.cardHeader}>
        <FavoriteEntity className={classes.starButton} entity={template} />
        <ItemCardHeader
          title={templateProps.title}
          subtitle={templateProps.type}
          classes={{ root: classes.title }}
        />
      </CardMedia>
      <CardContent style={{ display: 'grid' }}>
        <Box className={classes.box}>
          <Typography variant="body2" className={classes.label}>
            Description
          </Typography>
          <MarkdownContent content={templateProps.description} />
        </Box>
        <Box className={classes.box}>
          <Typography variant="body2" className={classes.label}>
            Owner
          </Typography>
          <EntityRefLinks entityRefs={ownedByRelations} defaultKind="Group" />
        </Box>
        <Box>
          <Typography variant="body2" className={classes.label}>
            Tags
          </Typography>
          {templateProps.tags?.map(tag => (
            <Chip size="small" label={tag} key={tag} />
          ))}
        </Box>
      </CardContent>
      <CardActions>
        {sourceLocation && (
          <IconButton
            className={classes.leftButton}
            href={sourceLocation.locationTargetUrl}
          >
            <ScmIntegrationIcon type={sourceLocation.integrationType} />
          </IconButton>
        )}
        <LinkButton
          color="primary"
          aria-label={`Choose ${templateProps.title}`}
          to={`/catalog/${namespace}/component/${name}`}
        >
          Learn more
        </LinkButton>
      </CardActions>
    </Card>
  );
};
