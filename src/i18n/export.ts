import { readTranslationFromDisk } from 'typesafe-i18n/exporter';
import fs from 'fs/promises';
import path from 'path';

const exportTranslationsForLocale = async (locale = 'en') => {
    const mapping = await readTranslationFromDisk(locale);

    for await (const namespace of mapping.namespaces) {
        const exportsPath = path.resolve(__dirname, `./exports-${locale}`);
        fs.mkdir(exportsPath, { recursive: true });
        await fs.writeFile(
            path.resolve(exportsPath, `${namespace}.exported.json`),
            // eslint-disable-next-line @typescript-eslint/ban-ts-comment
            // @ts-ignore
            JSON.stringify(mapping.translations[namespace], null, 4)
        );
    }
};

exportTranslationsForLocale('en');
