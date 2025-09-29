import { PermitType } from '../../domain/enums/permit-type.enum';

type JsonValue = Record<string, unknown> | unknown[] | string | number | boolean | null;

type Nullable<T> = T | null | undefined;

export interface UpdatePermitProfileCommand {
  userId: string;
  permitType: PermitType;
  formData?: Nullable<JsonValue>;
  fieldChecklist?: Nullable<JsonValue>;
  isChecklistComplete?: boolean;
}
