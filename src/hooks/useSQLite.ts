import { useEffect, useState } from 'react';
import SQLite, { SQLiteDatabase } from 'react-native-sqlite-storage';
import { AreaDBProps, BiodiversityDBProps, InspectionDBProps } from '../types/database';

export function useSQLite() {
  const [db, setDb] = useState<SQLiteDatabase | null>(null);
  const [areas, setAreas] = useState<AreaDBProps[]>([]);
  const [areasOpened, setAreasOpened] = useState<AreaDBProps[]>([]);

  useEffect(() => {
    const initDB = async () => {
      const database = await SQLite.openDatabase({
        name: 'mydb.db',
        location: 'default',
      });
      setDb(database);

      // await database.transaction(tx => {
      //   tx.executeSql('DROP TABLE inspection;');
      // })
      await database.transaction(tx => {
        tx.executeSql(
          'CREATE TABLE IF NOT EXISTS area (id INTEGER PRIMARY KEY AUTOINCREMENT, name TEXT, description TEXT, inspectionId TEXT, regeneratorAddress TEXT, coordinates TEXT, size INTEGER, proofPhoto TEXT, status INTEGER);',
        );
      });
      await database.transaction(tx => {
        tx.executeSql(
          'CREATE TABLE IF NOT EXISTS inspection (id INTEGER PRIMARY KEY AUTOINCREMENT, inspectionId TEXT UNIQUE, regeneratorAddress TEXT);',
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

  useEffect(() => {
    fetchAreas();
    fetchOpenedAreas();
  }, [db])

  async function fetchAreas() {
    if (!db) return [];

    try {
      await db.transaction(tx => {
        tx.executeSql('SELECT * from area;', [], (_, results) => {
          const rows = results.rows;
          const list: AreaDBProps[] = [];
          for (let i = 0; i < rows.length; i++) {
            list.push(rows.item(i));
          }
          setAreas(list)
        });
      });
    } catch (e) {
      console.log(e);
    }
  }

  async function fetchOpenedAreas() {
    if (!db) return;

    await db.transaction (tx => {
      tx.executeSql(
        'SELECT * from area WHERE status = 0;',
        [],
        (_, results) => {
          const rows = results.rows;
          const list: AreaDBProps[] = [];
          for (let i = 0; i < rows.length; i++) {
            list.push(rows.item(i));
          }
          setAreasOpened(list)
        }
      )
    })
  }

  async function addArea(data: Omit<AreaDBProps, 'id'>) {
    if (!db) return;

    await db.transaction(tx => {
      tx.executeSql(
        'INSERT INTO area (name, description, inspectionId, regeneratorAddress, coordinates, size, proofPhoto, status) VALUES (?, ?, ?, ?, ?, ?, ?, ?);',
        [
          data?.name,
          data?.description,
          data?.inspectionId,
          data?.regeneratorAddress,
          data?.coordinates,
          data?.size,
          data?.proofPhoto,
          data?.status
        ],
        (_, result) => {
          console.log('Área inserida com sucesso:', result);
        },
        (_, error) => {
          console.error('Erro ao inserir área:', error);
          return true; // impede continuar a transação
        }
      )
    })
  }

  async function addInspection(data: Omit<InspectionDBProps, 'id'>) {
    if (!db) return;

    await db.transaction(tx => {
      tx.executeSql(
        'INSERT INTO inspection (inspectionId, regeneratorAddress) VALUES (?, ?);',
        [data?.inspectionId, data?.regeneratorAddress],
        () => { }
      );
    });
  };

  async function fetchBiodiversityByAreaId(id: number): Promise<BiodiversityDBProps[]> {
    if (!db) return [];

    return new Promise((resolve, reject) => {
      db.transaction(tx => {
        tx.executeSql(
          'SELECT * FROM biodiversity WHERE areaId = ?;',
          [id],
          (_, results) => {
            const rows = results.rows;
            const list: BiodiversityDBProps[] = [];
            for (let i = 0; i < rows.length; i++) {
              list.push(rows.item(i));
            }
            resolve(list);
          },
          (_, error) => {
            console.error('Erro ao buscar biodiversidade:', error);
            reject(error);
            return true;
          }
        );
      })
    });
  }

  async function addBiodiversity(data: Omit<BiodiversityDBProps, 'id'>) {
    if (!db) return;

    await db.transaction(tx => {
      tx.executeSql(
        'INSERT INTO biodiversity (photo, areaId, specieData, coordinate) VALUES (?, ?, ?, ?);',
        [data?.photo, data?.areaId, data.specieData, data.coordinate],
        () => { }
      );
    });
  };

  return { 
    fetchAreas,
    fetchOpenedAreas,
    addArea,
    addInspection,
    areas,
    areasOpened,
    fetchBiodiversityByAreaId,
    addBiodiversity
  };
}
