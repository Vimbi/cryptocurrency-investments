import { getSchemaPath } from '@nestjs/swagger';

// eslint-disable-next-line @typescript-eslint/ban-types
export const responsePaginationSchema = (model: string | Function) => ({
  schema: {
    type: 'object',
    properties: {
      entities: {
        type: 'array',
        items: {
          $ref: getSchemaPath(model),
        },
      },
      limit: { type: 'number' },
      page: { type: 'number' },
      itemCount: { type: 'number' },
    },
  },
});
