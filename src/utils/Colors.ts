export default {
    fromString(string: string): number {
        let hash = 0;
        for (let i = 0; i < string.length; i++) {
            hash = string.charCodeAt(i) + ((hash << 5) - hash);
        }
        return hash & 0xffffff;
    },
};
