export interface EquosBrowserAvatar {
  id: string;
  organizationId: string;
  identity: string;
  name: string;
  description: string;
  client?: string;
  thumbnailUrl: string;
  createdAt: Date;
  updatedAt: Date;
}
