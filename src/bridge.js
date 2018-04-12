import logger from 'winston';
import Datastore from 'nedb';
import path from 'path';
import { Relayer } from './Relayer';
import { Verifyer } from './Verifyer';

import config from './configuration';

export default () => {
  const db = {};
  db.bridge = new Datastore(path.join(__dirname, '/data/bridge-data.db'))
  db.bridge.loadDatabase();
  db.txs = new Datastore(path.join(__dirname, '/data/bridge-txs.db'))
  db.txs.loadDatabase();

  const relayer = new Relayer(config, db);
  const verifyer = new Verifyer(relayer.homeWeb3, relayer.foreignWeb3, config, db);

  relayer.loadBridgeData()
    .then(bridgeData => {
      if (bridgeData.homeContractAddress !== config.homeBridge) {
        throw new Error("stored homeBridge address does not match config.homeBridge");
      }
      if (bridgeData.foreignContractAddress !== config.foreignBridge) {
        throw new Error("stored foreignBridge address does not match config.foreignBridge");
      }
      relayer.start();

      setTimeout(() => verifyer.start(), config.pollTime / 2)
    })
}