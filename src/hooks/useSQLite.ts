import {useEffect, useState} from 'react';
import SQLite, {SQLiteDatabase} from 'react-native-sqlite-storage';
import {AreaDBProps} from '../types/database';

export function useSQLite() {
  const [db, setDb] = useState<SQLiteDatabase | null>(null);

  useEffect(() => {
    const initDB = async () => {
      const database = await SQLite.openDatabase({
        name: 'mydb.db',
        location: 'default',
      });
      setDb(database);

      await database.transaction(tx => {
        tx.executeSql(
          'CREATE TABLE IF NOT EXISTS area (id INTEGER PRIMARY KEY AUTOINCREMENT, name TEXT, description TEXT, inspectionId TEXT, regeneratorAddress TEXT, coordinates TEXT, size INTEGER);',
        );
      });
      await database.transaction(tx => {
        tx.executeSql(
          'CREATE TABLE IF NOT EXISTS inspection (id INTEGER PRIMARY KEY AUTOINCREMENT, inspectionId TEXT, regeneratorAddress TEXT);',
        );
      });
      await database.transaction(tx => {
        tx.executeSql(
          'CREATE TABLE IF NOT EXISTS sampling (id INTEGER PRIMARY KEY AUTOINCREMENT, areaId TEXT, number INTEGER, size INTEGER);',
        );
      });
      await database.transaction(tx => {
        tx.executeSql(
          'CREATE TABLE IF NOT EXISTS biodiversity (id INTEGER PRIMARY KEY AUTOINCREMENT, photo TEXT, areaId INTEGER, specieData TEXT, coordinate TEXT);',
        );
      });
      await database.transaction(tx => {
        tx.executeSql(
          'CREATE TABLE IF NOT EXISTS tree (id INTEGER PRIMARY KEY AUTOINCREMENT, photo TEXT, areaId INTEGER, specieData TEXT, coordinate TEXT, samplingNumber INTEGER);',
        );
      });
    };

    initDB();
  }, []);

  async function fetchAreas(): Promise<AreaDBProps[]> {
    if (!db) return [];
    
    let areas: AreaDBProps[] = []
    try {
      await db.transaction(tx => {
        tx.executeSql('SELECT * from area;', [], (_, results) => {
          const rows = results.rows;
          const list: AreaDBProps[] = [];
          for (let i = 0; i < rows.length; i++) {
            list.push(rows.item(i));
          }

          areas = list;
        });
      });
    } catch (e) {
      console.log(e);
    }

    return areas
  }

  return {fetchAreas};
}
