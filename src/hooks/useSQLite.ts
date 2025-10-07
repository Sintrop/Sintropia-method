import { useEffect, useState } from 'react';
import SQLite, { SQLiteDatabase } from 'react-native-sqlite-storage';
import { AreaDBProps, BiodiversityDBProps, InspectionDBProps, ProofPhotosDBProps, SamplingDBProps, TreeDBProps } from '../types/database';

export function useSQLite() {
  const [db, setDb] = useState<SQLiteDatabase | null>(null);
  const [areas, setAreas] = useState<AreaDBProps[]>([]);
  const [areasOpened, setAreasOpened] = useState<AreaDBProps[]>([]);

  useEffect(() => {
    initDB();
  }, []);

  useEffect(() => {
    fetchAreas();
    fetchOpenedAreas();
  }, [db]);

  const initDB = async () => {
    const database = await SQLite.openDatabase({
      name: 'mydb.db',
      location: 'default',
    });
    setDb(database);

    // await database.transaction(tx => {
    //   tx.executeSql('DROP TABLE tree;');
    // })
    await database.transaction(tx => {
      tx.executeSql(
        'CREATE TABLE IF NOT EXISTS area (id INTEGER PRIMARY KEY AUTOINCREMENT, name TEXT, description TEXT, inspectionId TEXT, regeneratorAddress TEXT, coordinates TEXT, size INTEGER, proofPhoto TEXT, status INTEGER, collectionMethod TEXT, inspectorReport TEXT);',
      );
    });
    await database.transaction(tx => {
      tx.executeSql(
        'CREATE TABLE IF NOT EXISTS inspection (id INTEGER PRIMARY KEY AUTOINCREMENT, inspectionId TEXT UNIQUE, regeneratorAddress TEXT);',
      );
    });
    await database.transaction(tx => {
      tx.executeSql(
        'CREATE TABLE IF NOT EXISTS sampling (id INTEGER PRIMARY KEY AUTOINCREMENT, areaId TEXT, number INTEGER, size INTEGER, coordinate TEXT);',
      );
    });
    await database.transaction(tx => {
      tx.executeSql(
        'CREATE TABLE IF NOT EXISTS biodiversity (id INTEGER PRIMARY KEY AUTOINCREMENT, photo TEXT, areaId INTEGER, specieData TEXT, coordinate TEXT);',
      );
    });
    await database.transaction(tx => {
      tx.executeSql(
        'CREATE TABLE IF NOT EXISTS tree (id INTEGER PRIMARY KEY AUTOINCREMENT, photo TEXT, areaId INTEGER, specieData TEXT, coordinate TEXT, samplingNumber INTEGER, samplingId INTEGER);',
      );
    });
    await database.transaction(tx => {
      tx.executeSql(
        'CREATE TABLE IF NOT EXISTS proofPhotos ( id INTEGER PRIMARY KEY AUTOINCREMENT, photo TEXT, areaId INTEGER );',
      );
    });
  };

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

    await db.transaction(tx => {
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

  async function fetchHistoryInspections(): Promise<AreaDBProps[]> {
    if (!db) return [];

    return new Promise((resolve, reject) => {
      db.transaction(tx => {
        tx.executeSql(
          'SELECT * from area WHERE status = 1;',
          [],
          (_, results) => {
            const rows = results.rows;
            const list: AreaDBProps[] = [];
            for (let i = 0; i < rows.length; i++) {
              list.push(rows.item(i));
            }
            resolve(list);
          },
          (_, error) => {
            console.error('Erro ao buscar histórico:', error);
            reject(error);
            return true;
          }
        );
      })
    });
  };

  async function addArea(data: Omit<AreaDBProps, 'id'>) {
    if (!db) return;

    await db.transaction(tx => {
      tx.executeSql(
        'INSERT INTO area (name, description, inspectionId, regeneratorAddress, coordinates, size, proofPhoto, status, collectionMethod, inspectorReport) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?);',
        [
          data?.name,
          data?.description,
          data?.inspectionId,
          data?.regeneratorAddress,
          data?.coordinates,
          data?.size,
          data?.proofPhoto,
          data?.status,
          data?.collectionMethod,
          data?.inspectorReport
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

  async function updateCollectionMethod(collectionMethod: string, areaId: number) {
    if (!db) return;

    await db.transaction(tx => {
      tx.executeSql(
        'UPDATE area SET collectionMethod = ? WHERE id = ?;',
        [collectionMethod, areaId],
        (_, result) => {
          console.log('Área atualizada com sucesso:', result);
          fetchOpenedAreas();
        },
        (_, error) => {
          console.error('Erro ao atualizar área:', error);
          return true; // impede continuar a transação
        }
      )
    })
  }

  async function updateProofPhoto(proofPhoto: string, areaId: number) {
    if (!db) return;

    await db.transaction(tx => {
      tx.executeSql(
        'UPDATE area SET proofPhoto = ? WHERE id = ?;',
        [proofPhoto, areaId],
        (_, result) => {
          console.log('Área atualizada com sucesso:', result);
          fetchOpenedAreas();
        },
        (_, error) => {
          console.error('Erro ao atualizar área:', error);
          return true; // impede continuar a transação
        }
      )
    })
  }

  async function updateInspectorReport(inspectorReport: string, areaId: number) {
    if (!db) return;

    await db.transaction(tx => {
      tx.executeSql(
        'UPDATE area SET inspectorReport = ? WHERE id = ?;',
        [inspectorReport, areaId],
        (_, result) => {
          console.log('Área atualizada com sucesso:', result);
          fetchOpenedAreas();
        },
        (_, error) => {
          console.error('Erro ao atualizar área:', error);
          return true; // impede continuar a transação
        }
      )
    })
  }

  async function updateAreaStatus(status: number, areaId: number) {
    if (!db) return;

    await db.transaction(tx => {
      tx.executeSql(
        'UPDATE area SET status = ? WHERE id = ?;',
        [status, areaId],
        (_, result) => {
          console.log('Área atualizada com sucesso:', result);
          fetchOpenedAreas();
        },
        (_, error) => {
          console.error('Erro ao atualizar área:', error);
          return true; // impede continuar a transação
        }
      )
    })
  }

  async function deleteArea(id: number) {
    if (!db) return;

    await db.transaction(tx => {
      tx.executeSql(
        'DELETE FROM biodiversity WHERE areaId = ?;',
        [id],
        (_, result) => {
          console.log('Biodiversidades excluidas com sucesso:', result);
        },
        (_, error) => {
          console.error('Erro ao excluir Biodiversidades:', error);
          return true; // impede continuar a transação
        }
      );
    });

    await db.transaction(tx => {
      tx.executeSql(
        'DELETE FROM tree WHERE areaId = ?;',
        [id],
        (_, result) => {
          console.log('Arvores excluidas com sucesso:', result);
        },
        (_, error) => {
          console.error('Erro ao excluir as Arvores:', error);
          return true; // impede continuar a transação
        }
      );
    });

    await db.transaction(tx => {
      tx.executeSql(
        'DELETE FROM sampling WHERE areaId = ?;',
        [id],
        (_, result) => {
          console.log('Amostragems excluida com sucesso:', result);
        },
        (_, error) => {
          console.error('Erro ao excluir as amostragems:', error);
          return true; // impede continuar a transação
        }
      );
    });

    await db.transaction(tx => {
      tx.executeSql(
        'DELETE FROM proofPhotos WHERE areaId = ?;',
        [id],
        (_, result) => {
          console.log('Fotos excluidas com sucesso:', result);
        },
        (_, error) => {
          console.error('Erro ao excluir as fotos de prova:', error);
          return true; // impede continuar a transação
        }
      );
    });

    await db.transaction(tx => {
      tx.executeSql(
        'DELETE FROM area WHERE id = ?;',
        [id],
        (_, result) => {
          console.log('Área excluida com sucesso:', result);
        },
        (_, error) => {
          console.error('Erro ao excluir a area:', error);
          return true; // impede continuar a transação
        }
      );
    });
  };

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

  async function deleteBiodiversity(id: number) {
    if (!db) return;

    await db.transaction(tx => {
      tx.executeSql(
        'DELETE FROM biodiversity WHERE id = ?;',
        [id],
        (_, result) => {
          console.log('Biodiversidade excluida com sucesso:', result);
        },
        (_, error) => {
          console.error('Erro ao excluir a biodiversidade:', error);
          return true; // impede continuar a transação
        }
      );
    });
  };

  async function fetchSampligsArea(areaId: number): Promise<SamplingDBProps[]> {
    if (!db) return [];

    return new Promise((resolve, reject) => {
      db.transaction(tx => {
        tx.executeSql(
          'SELECT * FROM sampling WHERE areaId = ?;',
          [areaId],
          (_, results) => {
            const rows = results.rows;
            const list: SamplingDBProps[] = [];
            for (let i = 0; i < rows.length; i++) {
              list.push(rows.item(i));
            }
            resolve(list);
          },
          (_, error) => {
            console.error('Erro ao buscar amostragens:', error);
            reject(error);
            return true;
          }
        );
      })
    });
  };

  async function addSampling(data: Omit<SamplingDBProps, 'id'>) {
    if (!db) return;

    await db.transaction(tx => {
      tx.executeSql(
        'INSERT INTO sampling (areaId, number, size, coordinate) VALUES (?, ?, ?, ?);',
        [data?.areaId, data.number, data.size, data?.coordinate],
        (_, result) => {
          console.log('Amostra inserida com sucesso:', result);
        },
        (_, error) => {
          console.error('Erro ao inserir a amostra:', error);
          return true; // impede continuar a transação
        }
      );
    });
  };

  async function deleteSampling(id: number) {
    if (!db) return;

    await db.transaction(tx => {
      tx.executeSql(
        'DELETE FROM tree WHERE samplingId = ?;',
        [id],
        (_, result) => {
          console.log('Arvores da amostragem excluidas com sucesso:', result);
        },
        (_, error) => {
          console.error('Erro ao excluir arvores da amostragem:', error);
          return true; // impede continuar a transação
        }
      );
    });

    await db.transaction(tx => {
      tx.executeSql(
        'DELETE FROM sampling WHERE id = ?;',
        [id],
        (_, result) => {
          console.log('Amostragem excluida com sucesso:', result);
        },
        (_, error) => {
          console.error('Erro ao excluir a amostragem:', error);
          return true; // impede continuar a transação
        }
      );
    });
  };

  async function fetchTreesSampling(samplingId: number): Promise<TreeDBProps[]> {
    if (!db) return [];

    return new Promise((resolve, reject) => {
      db.transaction(tx => {
        tx.executeSql(
          'SELECT * FROM tree WHERE samplingId = ?;',
          [samplingId],
          (_, results) => {
            const rows = results.rows;
            const list: TreeDBProps[] = [];
            for (let i = 0; i < rows.length; i++) {
              list.push(rows.item(i));
            }
            resolve(list);
          },
          (_, error) => {
            console.error('Erro ao buscar arvores:', error);
            reject(error);
            return true;
          }
        );
      })
    });
  };

  async function addTree(data: Omit<TreeDBProps, 'id'>) {
    if (!db) return;

    await db.transaction(tx => {
      tx.executeSql(
        'INSERT INTO tree (photo, areaId, specieData, coordinate, samplingNumber, samplingId) VALUES (?, ?, ?, ?, ?, ?);',
        [data?.photo, data.areaId, data.specieData, data?.coordinate, data?.samplingNumber, data?.samplingId],
        (_, result) => {
          console.log('Árvore inserida com sucesso:', result);
        },
        (_, error) => {
          console.error('Erro ao inserir a arvore:', error);
          return true; // impede continuar a transação
        }
      );
    });
  };

  async function deleteTree(id: number) {
    if (!db) return;

    await db.transaction(tx => {
      tx.executeSql(
        'DELETE FROM tree WHERE id = ?;',
        [id],
        (_, result) => {
          console.log('Árvore excluida com sucesso:', result);
        },
        (_, error) => {
          console.error('Erro ao excluir a arvore:', error);
          return true; // impede continuar a transação
        }
      );
    });
  };

  async function addProofPhoto(data: Omit<ProofPhotosDBProps, 'id'>) {
    if (!db) return;

    await db.transaction(tx => {
      tx.executeSql(
        'INSERT INTO proofPhotos (photo, areaId) VALUES (?, ?);',
        [data?.photo, data.areaId],
        (_, result) => {
          console.log('Foto inserida com sucesso:', result);
        },
        (_, error) => {
          console.error('Erro ao inserir a foto:', error);
          return true;
        }
      );
    });
  };

  async function deleteProofPhoto(id: number) {
    if (!db) return;

    await db.transaction(tx => {
      tx.executeSql(
        'DELETE FROM proofPhotos WHERE id = ?;',
        [id],
        (_, result) => {
          console.log('Foto excluida com sucesso:', result);
        },
        (_, error) => {
          console.error('Erro ao excluir a foto:', error);
          return true; // impede continuar a transação
        }
      );
    });
  };

  async function fetchProofPhotosArea(areaId: number): Promise<ProofPhotosDBProps[]> {
    if (!db) return [];

    return new Promise((resolve, reject) => {
      db.transaction(tx => {
        tx.executeSql(
          'SELECT * FROM proofPhotos WHERE areaId = ?;',
          [areaId],
          (_, results) => {
            const rows = results.rows;
            const list: ProofPhotosDBProps[] = [];
            for (let i = 0; i < rows.length; i++) {
              list.push(rows.item(i));
            }
            resolve(list);
          },
          (_, error) => {
            console.error('Erro ao buscar proof photos:', error);
            reject(error);
            return true;
          }
        );
      })
    });
  };

  return {
    initDB,
    db,
    fetchAreas,
    fetchOpenedAreas,
    addArea,
    addInspection,
    areas,
    areasOpened,
    fetchBiodiversityByAreaId,
    addBiodiversity,
    fetchSampligsArea,
    addSampling,
    fetchTreesSampling,
    addTree,
    updateCollectionMethod,
    updateProofPhoto,
    updateAreaStatus,
    deleteTree,
    deleteBiodiversity,
    deleteSampling,
    fetchHistoryInspections,
    deleteArea,
    addProofPhoto,
    deleteProofPhoto,
    fetchProofPhotosArea,
    updateInspectorReport
  };
}
