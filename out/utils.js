"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.daysBetween = daysBetween;
// Helper for future extensibility. Not strictly required for current logic, but useful for future features or testing.
function daysBetween(date1, date2) {
    const diff = Math.abs(date1.getTime() - date2.getTime());
    return Math.floor(diff / (1000 * 60 * 60 * 24));
}
