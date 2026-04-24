import { describe, it, expect, expectTypeOf } from "vitest";
import { query, where, groupBy, having, sort } from "../task4";

interface User { id: number; city: string; age: number; }

describe("Чекер типов", () => {
  it("Эта последовательность не вызыывает ошибок", () => {
    const q = query<User>(
      where("city", "Moscow"),
      groupBy("city"),
      having(g => g.items.length > 0),
      sort("age")
    );
    expect(q).toBeDefined();
  });

  it("Будет ошибка если сорт идет перед where", () => {
    query<User>(sort("age"), where("city", "Moscow"));
  });
});