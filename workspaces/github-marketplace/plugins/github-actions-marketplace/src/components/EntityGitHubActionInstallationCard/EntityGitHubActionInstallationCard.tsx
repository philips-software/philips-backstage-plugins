import { CodeSnippet } from '@backstage/core-components';
import {
  Card,
  CardContent,
  CardHeader,
  Divider,
  Typography,
} from '@material-ui/core';
import React from 'react';
import { useProjectEntity } from '../../helper';

const actionText = (props: {
  owner: string | undefined;
  name: string | undefined;
}) => `      - name: ${props.name} Action
        uses: ${props.owner}/${props.name}@latest`;

export const EntityGitHubActionInstallationCard = () => {
  const { owner, repo } = useProjectEntity();

  return (
    <Card style={{ height: '100%' }}>
      <CardHeader title="Installation" />
      <Divider />
      <CardContent>
        <Typography variant="body2">
          Copy and paste the following snippet into your .yaml file.
        </Typography>
        <CodeSnippet
          text={actionText({ owner: owner, name: repo })}
          language="yaml"
          showCopyCodeButton
          customStyle={{
            border: '1px solid #2d3841',
            borderRadius: '.75rem',
            padding: '20px',
          }}
        />
      </CardContent>
    </Card>
  );
};
