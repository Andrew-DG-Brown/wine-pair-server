import LanguageDetect from 'languagedetect';

export class StringUtils {
    static capitalizeFirsts(str: string): string {
        return str.toLowerCase().split(' ').map((word) => {
            return word.charAt(0).toUpperCase() + word.substring(1);
        }).join(' ')
    }

    static validQuery(str: string) {
        if (str.length <= 2) return false;

        const languageDetect = new LanguageDetect()
        const results = languageDetect.detect(str) as Array<any>
        if (results[0] == null) {
            return false;
        }
        return results[0][1] > 0.2
    }
}