import { resolveSkoolSettings } from "./resolveSkoolSettings.js";

describe("resolveSkoolSettings", () => {
    it("reads flat providerSettings keys (CLI/API)", () => {
        expect(
            resolveSkoolSettings({
                providerSettings: {
                    title: "Launch day",
                    group: "grp-1",
                    label: "lbl-9",
                },
            })
        ).toEqual({
            title: "Launch day",
            groupId: "grp-1",
            labelId: "lbl-9",
        });
    });

    it("reads nested skool bucket from providerSettings (web composer)", () => {
        expect(
            resolveSkoolSettings({
                providerSettings: {
                    skool: {
                        title: "Web title",
                        group: { id: "g-42", name: "Community" },
                        label: { value: "none", label: "Default" },
                    },
                },
            })
        ).toEqual({
            title: "Web title",
            groupId: "g-42",
        });
    });

    it("treats label none as omitted", () => {
        expect(
            resolveSkoolSettings({
                providerSettings: { title: "T", group: "g1", label: "none" },
            })
        ).toEqual({
            title: "T",
            groupId: "g1",
        });
    });
});
