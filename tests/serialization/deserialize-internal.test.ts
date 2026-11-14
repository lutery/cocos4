/**
 * Regression test for the fork-only runtime wiring of `deserialize.Internal`.
 *
 * `deserialize.Internal` is declared in deserialize.ts as a TypeScript
 * `declare namespace` (type-only — emits no JS), but cocos-cli's editor-extends
 * serialize code imports it as a *value* (`deserialize.Internal.DataTypeID_`,
 * `Refs_`, `File_`). Without the runtime assignment inside the
 * `if (EDITOR || TEST || NODEJS)` block, `deserialize.Internal` is undefined and
 * every cocos-cli build / preview / start-mcp-server command crashes during
 * engine init.
 *
 * This file lives under tests/ on purpose: the engine jest testRegex is
 * `/tests/.*\.(test|spec)?\.(ts|tsx)$`, so a spec anywhere else never runs
 * (the previous copy at cocos/serialization/deserialize.test.ts was dead code).
 */
import { deserialize } from '../../cocos/serialization/deserialize';

describe('deserialize.Internal runtime binding', () => {
    test('exposes the Internal tables as real runtime values', () => {
        expect(deserialize.Internal).toBeDefined();
        expect(deserialize.Internal).not.toBeNull();
        expect(typeof deserialize.Internal.DataTypeID_).toBe('object');
        expect(typeof deserialize.Internal.Refs_).toBe('object');
        expect(typeof deserialize.Internal.File_).toBe('object');
    });

    test('DataTypeID_ carries the members the editor serialize code reads', () => {
        expect(deserialize.Internal.DataTypeID_).toHaveProperty('SimpleType');
        expect(deserialize.Internal.DataTypeID_.SimpleType).toBe(0);
    });
});
