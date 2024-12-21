/**
 * @swagger
 * tags:
 *   name: Info
 *   description: API pour récupérer les informations de la plateforme Hyperliquid
 */

const express = require('express');
const router = express.Router();
const InfoApi = require('../api/InfoApi');

/**
 * @swagger
 * /info/meta:
 *   get:
 *     summary: Récupérer les métadonnées générales
 *     tags: [Info]
 *     responses:
 *       200:
 *         description: Métadonnées récupérées avec succès
 *       500:
 *         description: Erreur serveur
 */
router.get('/meta', async (req, res) => {
  const info = new InfoApi();
  try {
    const meta = await info.meta();
    res.json(meta);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

/**
 * @swagger
 * /info/spot-meta:
 *   get:
 *     summary: Récupérer les métadonnées du spot trading
 *     tags: [Info]
 *     responses:
 *       200:
 *         description: Métadonnées spot récupérées avec succès
 *       500:
 *         description: Erreur serveur
 */
router.get('/spot-meta', async (req, res) => {
  const info = new InfoApi();
  try {
    const spotMeta = await info.spotMeta();
    res.json(spotMeta);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

/**
 * @swagger
 * /info/all-mids:
 *   post:
 *     summary: Récupérer tous les prix médians
 *     tags: [Info]
 *     responses:
 *       200:
 *         description: Prix médians récupérés avec succès
 *       500:
 *         description: Erreur serveur
 */
router.post('/all-mids', async (req, res) => {
  const info = new InfoApi();
  try {
    const mids = await info.post('/info', { type: 'allMids' });
    res.json(mids);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

/**
 * @swagger
 * /info/l2/{coin}:
 *   get:
 *     summary: Récupérer le carnet d'ordres niveau 2 pour une paire
 *     tags: [Info]
 *     parameters:
 *       - in: path
 *         name: coin
 *         required: true
 *         schema:
 *           type: string
 *         description: Symbole de la paire
 *       - in: query
 *         name: nSigFigs
 *         schema:
 *           type: integer
 *         description: Nombre de chiffres significatifs
 *       - in: query
 *         name: mantissa
 *         schema:
 *           type: integer
 *         description: Mantisse pour l'arrondi
 *     responses:
 *       200:
 *         description: Carnet d'ordres récupéré avec succès
 *       500:
 *         description: Erreur serveur
 */
router.get('/l2/:coin', async (req, res) => {
  const info = new InfoApi();
  try {
    const l2Data = await info.post('/info', { 
      type: 'l2Book', 
      coin: req.params.coin,
      nSigFigs: req.query.nSigFigs,
      mantissa: req.query.mantissa
    });
    res.json(l2Data);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

/**
 * @swagger
 * /info/candle-snapshot:
 *   post:
 *     summary: Récupérer un snapshot des bougies
 *     tags: [Info]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               coin:
 *                 type: string
 *               interval:
 *                 type: string
 *               startTime:
 *                 type: integer
 *               endTime:
 *                 type: integer
 *     responses:
 *       200:
 *         description: Snapshot des bougies récupéré avec succès
 *       500:
 *         description: Erreur serveur
 */
router.post('/candle-snapshot', async (req, res) => {
  const info = new InfoApi();
  try {
    const candles = await info.post('/info', {
      type: 'candleSnapshot',
      req: req.body
    });
    res.json(candles);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

/**
 * @swagger
 * /info/user/{address}/state:
 *   get:
 *     summary: Récupérer l'état d'un utilisateur
 *     tags: [Info]
 *     parameters:
 *       - in: path
 *         name: address
 *         required: true
 *         schema:
 *           type: string
 *         description: Adresse de l'utilisateur
 *     responses:
 *       200:
 *         description: État utilisateur récupéré avec succès
 *       500:
 *         description: Erreur serveur
 */
router.get('/user/:address/state', async (req, res) => {
  const info = new InfoApi();
  try {
    const state = await info.userState(req.params.address);
    res.json(state);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

/**
 * @swagger
 * /info/user/{address}/fills:
 *   get:
 *     summary: Récupérer les exécutions d'un utilisateur
 *     tags: [Info]
 *     parameters:
 *       - in: path
 *         name: address
 *         required: true
 *         schema:
 *           type: string
 *         description: Adresse de l'utilisateur
 *       - in: query
 *         name: aggregate
 *         schema:
 *           type: boolean
 *         description: Agréger les résultats par temps
 *     responses:
 *       200:
 *         description: Exécutions récupérées avec succès
 *       500:
 *         description: Erreur serveur
 */
router.get('/user/:address/fills', async (req, res) => {
  const info = new InfoApi();
  try {
    const fills = await info.post('/info', {
      type: 'userFills',
      user: req.params.address,
      aggregateByTime: req.query.aggregate === 'true'
    });
    res.json(fills);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

/**
 * @swagger
 * /info/user/{address}/fills/time:
 *   post:
 *     summary: Récupérer les exécutions d'un utilisateur sur une période
 *     tags: [Info]
 *     parameters:
 *       - in: path
 *         name: address
 *         required: true
 *         schema:
 *           type: string
 *         description: Adresse de l'utilisateur
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               startTime:
 *                 type: integer
 *               endTime:
 *                 type: integer
 *               aggregate:
 *                 type: boolean
 *     responses:
 *       200:
 *         description: Exécutions récupérées avec succès
 *       500:
 *         description: Erreur serveur
 */
router.post('/user/:address/fills/time', async (req, res) => {
  const info = new InfoApi();
  try {
    const fills = await info.post('/info', {
      type: 'userFillsByTime',
      user: req.params.address,
      startTime: req.body.startTime,
      endTime: req.body.endTime,
      aggregateByTime: req.body.aggregate
    });
    res.json(fills);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

/**
 * @swagger
 * /info/user/{address}/orders/open:
 *   get:
 *     summary: Récupérer les ordres ouverts d'un utilisateur
 *     tags: [Info]
 *     parameters:
 *       - in: path
 *         name: address
 *         required: true
 *         schema:
 *           type: string
 *         description: Adresse de l'utilisateur
 *     responses:
 *       200:
 *         description: Ordres ouverts récupérés avec succès
 *       500:
 *         description: Erreur serveur
 */
router.get('/user/:address/orders/open', async (req, res) => {
  const info = new InfoApi();
  try {
    const orders = await info.post('/info', {
      type: 'openOrders',
      user: req.params.address
    });
    res.json(orders);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

/**
 * @swagger
 * /info/user/{address}/orders/frontend:
 *   get:
 *     summary: Récupérer les ordres ouverts d'un utilisateur (format frontend)
 *     tags: [Info]
 *     parameters:
 *       - in: path
 *         name: address
 *         required: true
 *         schema:
 *           type: string
 *         description: Adresse de l'utilisateur
 *     responses:
 *       200:
 *         description: Ordres ouverts récupérés avec succès
 *       500:
 *         description: Erreur serveur
 */
router.get('/user/:address/orders/frontend', async (req, res) => {
  const info = new InfoApi();
  try {
    const orders = await info.post('/info', {
      type: 'frontendOpenOrders',
      user: req.params.address
    });
    res.json(orders);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

/**
 * @swagger
 * /info/order/status:
 *   post:
 *     summary: Vérifier le statut d'un ordre
 *     tags: [Info]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               user:
 *                 type: string
 *               oid:
 *                 type: string
 *     responses:
 *       200:
 *         description: Statut de l'ordre récupéré avec succès
 *       500:
 *         description: Erreur serveur
 */
router.post('/order/status', async (req, res) => {
  const info = new InfoApi();
  try {
    const status = await info.post('/info', {
      type: 'orderStatus',
      user: req.body.user,
      oid: req.body.oid
    });
    res.json(status);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

/**
 * @swagger
 * /info/user/{address}/rate-limit:
 *   get:
 *     summary: Récupérer les limites de taux d'un utilisateur
 *     tags: [Info]
 *     parameters:
 *       - in: path
 *         name: address
 *         required: true
 *         schema:
 *           type: string
 *         description: Adresse de l'utilisateur
 *     responses:
 *       200:
 *         description: Limites de taux récupérées avec succès
 *       500:
 *         description: Erreur serveur
 */
router.get('/user/:address/rate-limit', async (req, res) => {
  const info = new InfoApi();
  try {
    const limits = await info.post('/info', {
      type: 'userRateLimit',
      user: req.params.address
    });
    res.json(limits);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

/**
 * @swagger
 * /info/builder-fee/max:
 *   post:
 *     summary: Récupérer les frais maximum du builder
 *     tags: [Info]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               user:
 *                 type: string
 *               builder:
 *                 type: string
 *     responses:
 *       200:
 *         description: Frais maximum récupérés avec succès
 *       500:
 *         description: Erreur serveur
 */
router.post('/builder-fee/max', async (req, res) => {
  const info = new InfoApi();
  try {
    const maxFee = await info.post('/info', {
      type: 'maxBuilderFee',
      user: req.body.user,
      builder: req.body.builder
    });
    res.json(maxFee);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

/**
 * @swagger
 * /info/user/{address}/subaccounts:
 *   get:
 *     summary: Récupérer les sous-comptes d'un utilisateur
 *     tags: [Info]
 *     parameters:
 *       - in: path
 *         name: address
 *         required: true
 *         schema:
 *           type: string
 *         description: Adresse de l'utilisateur
 *     responses:
 *       200:
 *         description: Sous-comptes récupérés avec succès
 *       500:
 *         description: Erreur serveur
 */
router.get('/user/:address/subaccounts', async (req, res) => {
  const info = new InfoApi();
  try {
    const subaccounts = await info.post('/info', {
      type: 'subAccounts',
      user: req.params.address
    });
    res.json(subaccounts);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

/**
 * @swagger
 * /info/vault/{address}:
 *   get:
 *     summary: Récupérer les détails d'un vault
 *     tags: [Info]
 *     parameters:
 *       - in: path
 *         name: address
 *         required: true
 *         schema:
 *           type: string
 *         description: Adresse du vault
 *       - in: query
 *         name: user
 *         schema:
 *           type: string
 *         description: Adresse de l'utilisateur (optionnel)
 *     responses:
 *       200:
 *         description: Détails du vault récupérés avec succès
 *       500:
 *         description: Erreur serveur
 */
router.get('/vault/:address', async (req, res) => {
  const info = new InfoApi();
  try {
    const vault = await info.post('/info', {
      type: 'vaultDetails',
      vaultAddress: req.params.address,
      user: req.query.user
    });
    res.json(vault);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

/**
 * @swagger
 * /info/user/{address}/vault-equities:
 *   get:
 *     summary: Récupérer les équités de vault d'un utilisateur
 *     tags: [Info]
 *     parameters:
 *       - in: path
 *         name: address
 *         required: true
 *         schema:
 *           type: string
 *         description: Adresse de l'utilisateur
 *     responses:
 *       200:
 *         description: Équités récupérées avec succès
 *       500:
 *         description: Erreur serveur
 */
router.get('/user/:address/vault-equities', async (req, res) => {
  const info = new InfoApi();
  try {
    const equities = await info.post('/info', {
      type: 'userVaultEquities',
      user: req.params.address
    });
    res.json(equities);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

/**
 * @swagger
 * /info/perps/meta:
 *   post:
 *     summary: Récupérer les métadonnées des perpetuals
 *     tags: [Info]
 *     responses:
 *       200:
 *         description: Métadonnées récupérées avec succès
 *       500:
 *         description: Erreur serveur
 */
router.post('/perps/meta', async (req, res) => {
  const info = new InfoApi();
  try {
    const meta = await info.post('/info', { type: 'meta' });
    res.json(meta);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

/**
 * @swagger
 * /info/perps/meta-and-contexts:
 *   post:
 *     summary: Récupérer les métadonnées et contextes des perpetuals
 *     tags: [Info]
 *     responses:
 *       200:
 *         description: Métadonnées et contextes récupérés avec succès
 *       500:
 *         description: Erreur serveur
 */
router.post('/perps/meta-and-contexts', async (req, res) => {
  const info = new InfoApi();
  try {
    const contexts = await info.post('/info', { type: 'metaAndAssetCtxs' });
    res.json(contexts);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

/**
 * @swagger
 * /info/perps/user/{address}/state:
 *   get:
 *     summary: Récupérer l'état du clearinghouse d'un utilisateur
 *     tags: [Info]
 *     parameters:
 *       - in: path
 *         name: address
 *         required: true
 *         schema:
 *           type: string
 *         description: Adresse de l'utilisateur
 *     responses:
 *       200:
 *         description: État récupéré avec succès
 *       500:
 *         description: Erreur serveur
 */
router.get('/perps/user/:address/state', async (req, res) => {
  const info = new InfoApi();
  try {
    const state = await info.post('/info', {
      type: 'clearinghouseState',
      user: req.params.address
    });
    res.json(state);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

/**
 * @swagger
 * /info/perps/funding/history/{coin}:
 *   post:
 *     summary: Récupérer l'historique du funding pour une paire
 *     tags: [Info]
 *     parameters:
 *       - in: path
 *         name: coin
 *         required: true
 *         schema:
 *           type: string
 *         description: Symbole de la paire
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               startTime:
 *                 type: integer
 *               endTime:
 *                 type: integer
 *     responses:
 *       200:
 *         description: Historique récupéré avec succès
 *       500:
 *         description: Erreur serveur
 */
router.post('/perps/funding/history/:coin', async (req, res) => {
  const info = new InfoApi();
  try {
    const history = await info.post('/info', {
      type: 'fundingHistory',
      coin: req.params.coin,
      startTime: req.body.startTime,
      endTime: req.body.endTime
    });
    res.json(history);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

/**
 * @swagger
 * /info/spot/meta:
 *   post:
 *     summary: Récupérer les métadonnées du spot trading
 *     tags: [Info]
 *     responses:
 *       200:
 *         description: Métadonnées récupérées avec succès
 *       500:
 *         description: Erreur serveur
 */
router.post('/spot/meta', async (req, res) => {
  const info = new InfoApi();
  try {
    const meta = await info.post('/info', { type: 'spotMeta' });
    res.json(meta);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

/**
 * @swagger
 * /info/spot/meta-and-contexts:
 *   post:
 *     summary: Récupérer les métadonnées et contextes du spot trading
 *     tags: [Info]
 *     responses:
 *       200:
 *         description: Métadonnées et contextes récupérés avec succès
 *       500:
 *         description: Erreur serveur
 */
router.post('/spot/meta-and-contexts', async (req, res) => {
  const info = new InfoApi();
  try {
    const contexts = await info.post('/info', { type: 'spotMetaAndAssetCtxs' });
    res.json(contexts);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

/**
 * @swagger
 * /info/spot/user/{address}/balances:
 *   get:
 *     summary: Récupérer les balances spot d'un utilisateur
 *     tags: [Info]
 *     parameters:
 *       - in: path
 *         name: address
 *         required: true
 *         schema:
 *           type: string
 *         description: Adresse de l'utilisateur
 *     responses:
 *       200:
 *         description: Balances récupérées avec succès
 *       500:
 *         description: Erreur serveur
 */
router.get('/spot/user/:address/balances', async (req, res) => {
  const info = new InfoApi();
  try {
    const balances = await info.post('/info', {
      type: 'spotClearinghouseState',
      user: req.params.address
    });
    res.json(balances);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

/**
 * @swagger
 * /info/spot/deploy/{address}/auction:
 *   get:
 *     summary: Récupérer l'état du déploiement spot
 *     tags: [Info]
 *     parameters:
 *       - in: path
 *         name: address
 *         required: true
 *         schema:
 *           type: string
 *         description: Adresse de l'utilisateur
 *     responses:
 *       200:
 *         description: État récupéré avec succès
 *       500:
 *         description: Erreur serveur
 */
router.get('/spot/deploy/:address/auction', async (req, res) => {
  const info = new InfoApi();
  try {
    const auction = await info.post('/info', {
      type: 'spotDeployState',
      user: req.params.address
    });
    res.json(auction);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

/**
 * @swagger
 * /info/spot/token/{tokenId}:
 *   get:
 *     summary: Récupérer les détails d'un token
 *     tags: [Info]
 *     parameters:
 *       - in: path
 *         name: tokenId
 *         required: true
 *         schema:
 *           type: string
 *         description: ID du token
 *     responses:
 *       200:
 *         description: Détails du token récupérés avec succès
 *       500:
 *         description: Erreur serveur
 */
router.get('/spot/token/:tokenId', async (req, res) => {
  const info = new InfoApi();
  try {
    const token = await info.post('/info', {
      type: 'tokenDetails',
      tokenId: req.params.tokenId
    });
    res.json(token);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

/**
 * @swagger
 * /info/user/{address}/orders/historical:
 *   get:
 *     summary: Récupérer l'historique des ordres d'un utilisateur
 *     tags: [Info]
 *     parameters:
 *       - in: path
 *         name: address
 *         required: true
 *         schema:
 *           type: string
 *         description: Adresse de l'utilisateur
 *       - in: query
 *         name: startTime
 *         schema:
 *           type: integer
 *         description: Timestamp de début (optionnel)
 *       - in: query
 *         name: endTime
 *         schema:
 *           type: integer
 *         description: Timestamp de fin (optionnel)
 *     responses:
 *       200:
 *         description: Historique des ordres récupéré avec succès
 *       500:
 *         description: Erreur serveur
 */
router.get('/user/:address/orders/historical', async (req, res) => {
  const info = new InfoApi();
  try {
    const payload = {
      type: 'historicalOrders',
      user: req.params.address
    };

    // Ajout des paramètres optionnels de temps s'ils sont présents
    if (req.query.startTime) {
      payload.startTime = parseInt(req.query.startTime);
    }
    if (req.query.endTime) {
      payload.endTime = parseInt(req.query.endTime);
    }

    const orders = await info.post('/info', payload);
    res.json(orders);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

module.exports = router;