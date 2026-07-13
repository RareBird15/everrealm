// src/engine/settlements/stacks.ts

import type { AgeId } from "../ages/types";
import type { SettlementStack, SettlementLevel } from "./types";

/** Finds the stack matching (age, level), or undefined. */
export function findStack(
  settlements: readonly SettlementStack[],
  age: AgeId,
  level: SettlementLevel,
): SettlementStack | undefined {
  return settlements.find((s) => s.age === age && s.level === level);
}

/**
 * Returns a new settlements array with `count` added to the (age, level) stack.
 * Creates a new stack if none exists; increments an existing one otherwise.
 * Does not mutate the input array.
 */
export function addToStack(
  settlements: readonly SettlementStack[],
  age: AgeId,
  level: SettlementLevel,
  count: number,
): SettlementStack[] {
  const existing = findStack(settlements, age, level);
  if (existing) {
    return settlements.map((s) =>
      s === existing ? { ...s, quantity: s.quantity + count } : s,
    );
  }
  return [...settlements, { age, level, quantity: count }];
}

/**
 * Returns a new settlements array with `count` removed from the (age, level) stack.
 * Removes the stack entirely if quantity reaches zero or below.
 * Does not mutate the input array.
 */
export function removeFromStack(
  settlements: readonly SettlementStack[],
  age: AgeId,
  level: SettlementLevel,
  count: number,
): SettlementStack[] {
  const existing = findStack(settlements, age, level);
  if (!existing) return [...settlements];
  const newQuantity = existing.quantity - count;
  if (newQuantity <= 0) {
    return settlements.filter((s) => s !== existing);
  }
  return settlements.map((s) =>
    s === existing ? { ...s, quantity: newQuantity } : s,
  );
}
