/* eslint-disable no-useless-escape */
import type { Form, FormResponse } from "../types";
import * as XLSX from "xlsx";

export const exportToExcel = (form: Form, responses: FormResponse[]): void => {
    const headers = [
        "Submission Time",
        "User ID",
        ...form.fields.map((f) => f.label),
    ];

    const data = responses.map((r) => [
        new Date(r.submittedAt).toLocaleString(),
        r.userIdentifier,
        ...form.fields.map((f) => {
            const value = r.responses[f.id];
            if (Array.isArray(value)) return value.join(", ");
            return value ?? "";
        }),
    ]);

    const aoa = [headers, ...data];

    const ws = XLSX.utils.aoa_to_sheet(aoa);
    const wb = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, ws, "Responses");

    // Write workbook to ArrayBuffer for browser download
    const wbout = XLSX.write(wb, { bookType: "xlsx", type: "array" });
    const blob = new Blob([wbout], {
        type: "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
    });

    const fileNameSafe = (form.title || "form").replace(/[\\\/:*?"<>|]/g, "_");
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `${fileNameSafe}_responses.xlsx`;
    a.click();
    URL.revokeObjectURL(url);
};
