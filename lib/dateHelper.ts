export const parseDate = (date: any): Date => {
    if (!date) return new Date();

    // Firestore Timestamp
    if (typeof date === "object" && "toDate" in date) {
        return date.toDate();
    }

    // ISO string or Date
    return new Date(date);
};