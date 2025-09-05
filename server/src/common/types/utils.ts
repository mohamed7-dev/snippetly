export type ValueOrElement<T> = T extends (infer U)[] ? U | T : T;
