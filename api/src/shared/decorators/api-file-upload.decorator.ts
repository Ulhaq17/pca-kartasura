import { applyDecorators, Type } from '@nestjs/common';
import {
  ApiBody,
  ApiConsumes,
  ApiExtraModels,
  getSchemaPath,
} from '@nestjs/swagger';

type UploadField = {
  name: string;
  required?: boolean;
  isArray?: boolean;
};

function createMultipartSchema(fields: UploadField[], dto?: Type<unknown>) {
  const fileSchema = {
    type: 'object',
    required: fields
      .filter((field) => field.required !== false)
      .map((field) => field.name),
    properties: Object.fromEntries(
      fields.map((field) => [
        field.name,
        field.isArray
          ? {
              type: 'array',
              items: { type: 'string', format: 'binary' },
            }
          : { type: 'string', format: 'binary' },
      ]),
    ),
  };

  if (!dto) {
    return fileSchema;
  }

  return {
    allOf: [{ $ref: getSchemaPath(dto) }, fileSchema],
  };
}

export function ApiFileUpload(field: UploadField, dto?: Type<unknown>) {
  return applyDecorators(
    ApiConsumes('multipart/form-data'),
    ...(dto ? [ApiExtraModels(dto)] : []),
    ApiBody({
      schema: createMultipartSchema([field], dto),
    }),
  );
}

export function ApiFileFieldsUpload(
  fields: UploadField[],
  dto?: Type<unknown>,
) {
  return applyDecorators(
    ApiConsumes('multipart/form-data'),
    ...(dto ? [ApiExtraModels(dto)] : []),
    ApiBody({
      schema: createMultipartSchema(fields, dto),
    }),
  );
}
