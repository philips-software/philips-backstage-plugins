import { CompoundEntityRef } from '@backstage/catalog-model';

export type UpptimeMetric = {
  schemaVersion: 1;
  label: string;
  message: string;
  color: string;
};

export type UpptimeSummary = {
  responseTime: UpptimeMetric;
  uptime: UpptimeMetric;
};

export type UpptimeApi = {
  getSummary(entity: CompoundEntityRef): Promise<UpptimeSummary | undefined>;

  getSummaryImageUrl(entity: CompoundEntityRef): Promise<string>;

  getCookie(): Promise<void>;
};
