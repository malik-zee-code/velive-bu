
interface Setting {
    _id?: string;
    id?: string;  // Support both formats for compatibility
    title: string;
    value: string;
}

/**
 * Retrieves a setting value from an array of settings.
 * @param settings - The array of setting objects.
 * @param title - The title of the setting to retrieve.
 * @returns The value of the setting, or null if not found.
 */
export const getSetting = (settings: Setting[], title: string): string | null => {
    const setting = settings.find(s => s.title === title);
    return setting?.value || null;
};
