import KeyvSqlite from '@keyvhq/sqlite';
import Keyv from '@keyvhq/core';

const keyv = new Keyv({
    store: new KeyvSqlite({ uri: 'sqlite://./db/database.sqlite' }),
});

keyv.on('error', (err) => console.log('Connection Error', err));

export default keyv;
