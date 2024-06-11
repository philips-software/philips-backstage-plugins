import React from 'react';
import {
  useEntity,
  MissingAnnotationEmptyState,
} from '@backstage/plugin-catalog-react';
import {
  EmptyState,
  InfoCard,
  Progress,
  StatusError,
  StatusOK,
  StatusPending,
  WarningPanel,
} from '@backstage/core-components';
import { useApi } from '@backstage/core-plugin-api';
import { upptimeApiRef } from '../../api';
import { getCompoundEntityRef } from '@backstage/catalog-model';
import useAsync from 'react-use/lib/useAsync';
import {
  CardContent,
  CardMedia,
  Grid,
  Typography,
  makeStyles,
} from '@material-ui/core';
import { useUpptimeInfo } from '../../hooks/useUpptimeInfo';
import { UPPTIME_ANNOTATION } from '../../constants';

const useStyles = makeStyles(() => ({
  media: {
    objectFit: 'fill',
    width: '100%',
  },
}));

const getStatus = (color: string) => {
  switch (color) {
    case 'brightgreen':
    case 'green':
      return <StatusOK />;
    case 'red':
      return <StatusError />;
    default:
      return <StatusPending />;
  }
};

/**
 * Properties for the EntityUpptimeCard
 *
 * @public
 */
export interface EntityUpptimeCardProps {
  /**
   * Upptime frontend plugin
   * @public
   */
  showAnnotationHelp?: boolean;
}

/** @public */
export const EntityUpptimeCard = (props: EntityUpptimeCardProps) => {
  const { showAnnotationHelp } = props;
  const { entity } = useEntity();
  const upptimeApi = useApi(upptimeApiRef);
  const { key } = useUpptimeInfo(entity);

  const { value, loading, error } = useAsync(async () => {
    if (key) {
      return await upptimeApi.getSummary(getCompoundEntityRef(entity));
    }
    return undefined;
  }, [upptimeApiRef, entity, key]);

  const { value: imageUrl } = useAsync(async () => {
    if (key) {
      // we need to make sure we have a cookie before we request the image location
      // the cookie is used to retrieve the image from the API instead of a bearer token
      await upptimeApi.getCookie();
      return upptimeApi.getSummaryImageUrl(getCompoundEntityRef(entity));
    }
    return undefined;
  }, [upptimeApiRef, entity, key]);

  const classes = useStyles();

  if (!key && showAnnotationHelp === false) {
    return <></>;
  }

  return (
    <InfoCard
      title={`${entity.metadata.title ?? entity.metadata.name} - Status`}
    >
      {error && (
        <WarningPanel title="Oops! Something went wrong loading the Status Card">
          {error.message}
        </WarningPanel>
      )}

      {loading && <Progress />}

      {!error && !loading && !key && (
        <MissingAnnotationEmptyState annotation={UPPTIME_ANNOTATION} />
      )}

      {!error && !loading && key && !value && (
        <EmptyState
          missing="info"
          title="No information to display"
          description={`There is no Upptime monitoring with key '${key}'.`}
        />
      )}

      {!error && !loading && value && (
        <>
          <CardMedia
            component="img"
            alt="Response Time"
            height={100}
            image={imageUrl}
            className={classes.media}
          />
          <CardContent>
            <Grid container>
              <Grid item md={12} xs={12}>
                <Grid item md={12}>
                  <Typography variant="h6" component="h2">
                    {getStatus(value.uptime.color)} Overall Uptime:{' '}
                    {value.uptime.message}
                  </Typography>
                </Grid>

                <Grid item md={12}>
                  <Typography variant="h6" component="h2">
                    {getStatus(value.responseTime.color)} Average Response Time:{' '}
                    {value.responseTime.message}
                  </Typography>
                </Grid>
              </Grid>
            </Grid>
          </CardContent>
        </>
      )}
    </InfoCard>
  );
};
