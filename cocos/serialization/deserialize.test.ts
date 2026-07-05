/**
 * Regression test for the `cc.deserialize.Internal` runtime binding bug.
 *
 * `deserialize.Internal` is declared in deserialize.ts as a TypeScript
 * `declare namespace` (type-only, produces no JS). cocos-cli's editor-extends
 * serialize code (compiled/builder.ts, types.ts, etc.) imports it as a *value*
 * (`deserialize.Internal.DataTypeID_`, `Refs_`, `File_`). Before the fix,
 * `deserialize.Internal` was `undefined` at runtime, crashing the whole toolchain
 * (cocos build / preview / start-mcp-server) during engine init.
 *
 * This test pins the runtime contract: after the engine's serialization module
 * executes, `deserialize.Internal` must be a real object exposing the const-enums
 * that the editor serialize code needs.
 */
import { describe, it, expect } from '@test-utils/markers';

// We can't `import` the const enums directly without triggering the type-only path,
// so the test asserts on the public deserialize function after module side-effects run.
// In the engine's own unit-test harness this file is compiled under NODEJS=TEST=truthy,
// which is the same condition that gates the `deserialize.Internal` assignment.
declare const deserialize: {
    Internal?: { DataTypeID_: object; Refs_: object; File_: object };
    _macros?: object;
};

describe('deserialize.Internal runtime binding', () => {
    it('exposes Internal namespace on the deserialize function', () => {
        expect(deserialize.Internal).toBeDefined();
    });

    it('exposes the DataTypeID_ const enum used by editor serialize code', () => {
        expect(deserialize.Internal!.DataTypeID_).toBeDefined();
        // DataTypeID.SimpleType is the canonical value 0
        expect((deserialize.Internal!.DataTypeID_ as any).SimpleType).toBe(0);
    });

    it('exposes the Refs_ const enum used by compiled/builder.ts', () => {
        expect(deserialize.Internal!.Refs_).toBeDefined();
        expect((deserialize.Internal!.Refs_ as any).EACH_RECORD_LENGTH).toBe(3);
    });

    it('exposes the File_ const enum used by compiled/pack-jsons.ts', () => {
        expect(deserialize.Internal!.File_).toBeDefined();
        expect((deserialize.Internal!.File_ as any).Version).toBe(0);
    });
});
