import { describe, it, expect } from "vitest";
import {
  TECH_NODES,
  TECH_TIER1_COST,
  TECH_TIER2_COST,
  getTechNode,
  isBuildingUnlocked,
  getTechForBuilding,
  meetsPrerequisites,
} from "../../../engine/techtree/definitions";
import type { TechNodeId } from "../../../engine/techtree/types";

describe("techtree definitions", () => {
  describe("TECH_NODES", () => {
    it("has 3 Tier 1 nodes and 3 Tier 2 nodes", () => {
      const tier1 = TECH_NODES.filter((n) => n.tier === 1);
      const tier2 = TECH_NODES.filter((n) => n.tier === 2);
      expect(tier1.length).toBe(3);
      expect(tier2.length).toBe(3);
    });

    it("all Tier 1 nodes have the correct cost", () => {
      for (const node of TECH_NODES.filter((n) => n.tier === 1)) {
        expect(node.cost).toBe(TECH_TIER1_COST);
      }
    });

    it("all Tier 2 nodes have the correct cost", () => {
      for (const node of TECH_NODES.filter((n) => n.tier === 2)) {
        expect(node.cost).toBe(TECH_TIER2_COST);
      }
    });

    it("each node unlocks a different building", () => {
      const buildings = TECH_NODES.map((n) => n.unlocksBuilding);
      const unique = buildings.filter((b, i) => buildings.indexOf(b) === i);
      expect(unique.length).toBe(buildings.length);
    });

    it("Tier 1 buildings include Farm, Market, Workshop", () => {
      const tier1Buildings = TECH_NODES
        .filter((n) => n.tier === 1)
        .map((n) => n.unlocksBuilding);
      expect(tier1Buildings).toContain("Farm");
      expect(tier1Buildings).toContain("Market");
      expect(tier1Buildings).toContain("Workshop");
    });

    it("Tier 2 buildings include Library, TownHall, Aqueduct", () => {
      const tier2Buildings = TECH_NODES
        .filter((n) => n.tier === 2)
        .map((n) => n.unlocksBuilding);
      expect(tier2Buildings).toContain("Library");
      expect(tier2Buildings).toContain("TownHall");
      expect(tier2Buildings).toContain("Aqueduct");
    });

    it("each Tier 1 node has both passive and active effects", () => {
      for (const node of TECH_NODES.filter((n) => n.tier === 1)) {
        const hasPassive = node.buildingEffects.some((e) => e.kind === "PassivePerHour");
        const hasActive = node.buildingEffects.some(
          (e) =>
            e.kind === "DevelopBonusPer" ||
            e.kind === "EstablishBonusPer" ||
            e.kind === "EstablishCostReductionPer",
        );
        expect(hasPassive).toBe(true);
        expect(hasActive).toBe(true);
      }
    });

    it("each Tier 2 node has at least one building effect", () => {
      for (const node of TECH_NODES.filter((n) => n.tier === 2)) {
        expect(node.buildingEffects.length).toBeGreaterThan(0);
      }
    });

    it("Tier 2 nodes have prerequisites", () => {
      for (const node of TECH_NODES.filter((n) => n.tier === 2)) {
        expect(node.requires).toBeDefined();
        expect(node.requires!.length).toBeGreaterThan(0);
      }
    });
  });

  describe("getTechNode", () => {
    it("returns the node for a valid ID", () => {
      const node = getTechNode("agriculture" as TechNodeId);
      expect(node).toBeDefined();
      expect(node?.name).toBe("Agriculture");
    });

    it("returns undefined for an invalid ID", () => {
      expect(getTechNode("nonexistent" as TechNodeId)).toBeUndefined();
    });
  });

  describe("isBuildingUnlocked", () => {
    it("returns false when no techs are unlocked", () => {
      expect(isBuildingUnlocked("Farm", [])).toBe(false);
    });

    it("returns true when the corresponding tech is unlocked", () => {
      expect(isBuildingUnlocked("Farm", ["agriculture" as TechNodeId])).toBe(true);
    });

    it("returns false when a different tech is unlocked", () => {
      expect(isBuildingUnlocked("Farm", ["trade" as TechNodeId])).toBe(false);
    });
  });

  describe("getTechForBuilding", () => {
    it("returns the tech node that unlocks Farm", () => {
      const tech = getTechForBuilding("Farm");
      expect(tech).toBeDefined();
      expect(tech?.id).toBe("agriculture" as TechNodeId);
    });

    it("returns undefined for a standard settlement level", () => {
      expect(getTechForBuilding("Tent")).toBeUndefined();
    });
  });

  describe("meetsPrerequisites", () => {
    it("returns true for Tier 1 nodes (no prerequisites)", () => {
      const agriculture = getTechNode("agriculture" as TechNodeId)!;
      expect(meetsPrerequisites(agriculture, [])).toBe(true);
    });

    it("returns false for Tier 2 nodes with no Tier 1 unlocked", () => {
      const scholarship = getTechNode("scholarship" as TechNodeId)!;
      expect(meetsPrerequisites(scholarship, [])).toBe(false);
    });

    it("returns true for Tier 2 nodes when any Tier 1 is unlocked", () => {
      const scholarship = getTechNode("scholarship" as TechNodeId)!;
      expect(meetsPrerequisites(scholarship, ["agriculture" as TechNodeId])).toBe(true);
      expect(meetsPrerequisites(scholarship, ["trade" as TechNodeId])).toBe(true);
      expect(meetsPrerequisites(scholarship, ["crafts" as TechNodeId])).toBe(true);
    });
  });
});