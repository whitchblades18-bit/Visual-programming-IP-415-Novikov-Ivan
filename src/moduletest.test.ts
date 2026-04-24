import { describe, it, expectTypeOf } from "vitest";
import { DeepReadonly, PickedByType, EventHandlers } from "../task6";

describe("Lab 6: Utility Types", () => {
  
  it("DeepReadonly должен делать вложенные поля неизменяемыми", () => {
    type Nested = {
      a: number;
      b: { c: string };
    };
    type Result = DeepReadonly<Nested>;

    // Проверяем, что теперь это readonly
    expectTypeOf<Result>().toEqualTypeOf<{
      readonly a: number;
      readonly b: { readonly c: string };
    }>();
  });

  it("PickedByType должен выбирать поля только указанного типа", () => {
    type User = {
      id: number;
      name: string;
      age: number;
      isAdmin: boolean;
    };
    
    type OnlyNumbers = PickedByType<User, number>;
    
    expectTypeOf<OnlyNumbers>().toEqualTypeOf<{
      id: number;
      age: number;
    }>();
  });

  it("EventHandlers должен корректно трансформировать ключи в onEventName", () => {
    type MyEvents = {
      click: { x: number; y: number };
      focus: { target: string };
    };

    type Handlers = EventHandlers<MyEvents>;

    expectTypeOf<Handlers>().toEqualTypeOf<{
      onClick: (event: { x: number; y: number }) => void;
      onFocus: (event: { target: string }) => void;
    }>();
  });
});