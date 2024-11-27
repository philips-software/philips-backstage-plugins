import { LinkButton } from '@backstage/core-components';
import {
  Card,
  CardContent,
  CardHeader,
  Divider,
  Typography,
  makeStyles,
} from '@material-ui/core';
import React from 'react';
import { useProjectEntity } from '../../helper';

const useStyles = makeStyles(() => ({
  button: {
    bottom: '0',
    marginTop: '20px',
  },
}));
const link = (props: { owner: string | undefined; name: string | undefined }) =>
  `https://github.com/search?q=org%3A${props.owner}+${props.name}+path%3A.github%2Fworkflows%2F+language%3AYAML+org%3A${props.owner}&type=code&s=indexed&o=desc`;

export const EntityGitHubActionUsageCard = () => {
  const { owner, repo } = useProjectEntity();
  const classes = useStyles();
  return (
    <Card style={{ height: '100%' }}>
      <CardHeader title="Examples" />
      <Divider />
      <CardContent
        style={{
          height: '100%',
        }}
      >
        <Typography variant="body2">
          {`Learn more on how to use this GitHub Action by reviewing different
          implementations in ${owner}`}
        </Typography>
        <LinkButton
          color="primary"
          variant="contained"
          size="large"
          classes={{ root: classes.button }}
          to={link({ owner: owner, name: repo })}
        >
          {`Examples on ${owner}`}
        </LinkButton>
      </CardContent>
    </Card>
  );
};
