export type DeepPartial<T> = {
    [P in keyof T]?:
        | null
        | (T[P] extends Array<infer U>
              ? Array<DeepPartial<U>>
              : T[P] extends ReadonlyArray<infer U>
                ? ReadonlyArray<DeepPartial<U>>
                : DeepPartial<T[P]>);
};

export type Json = null | boolean | number | string | Array<Json> | { [key: string]: Json };

export type JSONCompatible<T> = {
    [Key in keyof T]: T[Key] extends Json
        ? T[Key]
        : Pick<T, Key> extends Required<Pick<T, Key>>
          ? never
          : JSONCompatible<T[Key]>;
};
