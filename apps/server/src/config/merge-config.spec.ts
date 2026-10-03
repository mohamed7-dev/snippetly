import { describe, expect, it } from 'vitest';
import { mergeConfig } from './merge-config';

describe('mergeConfig()', () => {
    it('merges top level props', () => {
        const result = mergeConfig(
            {
                b: 3,
                c: 4,
            } as any,
            {
                a: 1,
                b: 2,
            } as any,
        );
        expect(result).toEqual({
            a: 1,
            b: 3,
            c: 4,
        });
    });

    it('merges deep props', () => {
        const result = mergeConfig(
            {
                a: 2,
                b: {
                    c: 5,
                },
            } as any,
            {
                a: 1,
                b: {
                    c: 4,
                },
            } as any,
        );
        expect(result).toEqual({
            a: 2,
            b: {
                c: 5,
            },
        });
    });

    it("doesn't mutate dest", () => {
        const dest: any = {
            a: 1,
            b: {
                c: {
                    d: 2,
                },
            },
        };

        const result = mergeConfig(
            {
                b: {
                    c: {
                        d: 3,
                    },
                },
            } as any,
            dest,
        );

        expect(result).toEqual({
            a: 1,
            b: {
                c: {
                    d: 3,
                },
            },
        });
        expect(dest).toEqual({
            a: 1,
            b: {
                c: {
                    d: 2,
                },
            },
        });
    });

    it("doesn't merge arrays", () => {
        const result = mergeConfig(
            {
                a: [2],
            } as any,
            {
                a: [1],
            } as any,
        );
        expect(result).toEqual({
            a: [2],
        });
    });

    it('replaces class instances rather than merging their props', () => {
        class Bar {
            name = 'bar';
        }
        class Foo {
            name = 'foo';
        }

        const result = mergeConfig(
            {
                class: new Foo(),
            } as any,
            {
                class: new Bar(),
            } as any,
        );

        expect(result.class instanceof Foo).toBe(true);
    });

    it('works when nested', () => {
        const input1: any = {
            a: 1,
            b: {
                c: {
                    d: 2,
                },
            },
        };
        const input2: any = {
            b: {
                c: {
                    d: 3,
                },
            },
        };

        const result = mergeConfig(
            mergeConfig(
                {
                    b: {
                        c: {
                            d: 4,
                        },
                    },
                } as any,
                input2,
            ),
            input1,
        );

        expect(result).toEqual({
            a: 1,
            b: {
                c: {
                    d: 4,
                },
            },
        });
        expect(input1).toEqual({
            a: 1,
            b: {
                c: {
                    d: 2,
                },
            },
        });
        expect(input2).toEqual({
            b: {
                c: {
                    d: 3,
                },
            },
        });
    });
});
