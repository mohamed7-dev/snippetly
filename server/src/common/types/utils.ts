export type ValueOrElement<T> = T extends (infer U)[] ? U | T : T;

export type NonNullableFields<T> = {
  [K in keyof T]-?: NonNullable<T[K]>;
};
