/**
 * @swagger
 * tags:
 *   name: Exchange
 *   description: API pour les opérations d'échange sur Hyperliquid
 */

const express = require('express');
const router = express.Router();
const ExchangeApi = require('../api/ExchangeApi');
const authMiddleware = require('../middleware/auth');

/**
 * @swagger
 * /exchange/order:
 *   post:
 *     summary: Placer un ou plusieurs ordres
 *     tags: [Exchange]
 *     security:
 *       - BearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               orders:
 *                 type: array
 *                 items:
 *                   type: object
 *                   properties:
 *                     coin:
 *                       type: string
 *                       description: Symbole de la paire de trading
 *                     isBuy:
 *                       type: boolean
 *                       description: true pour achat, false pour vente
 *                     limitPx:
 *                       type: number
 *                       description: Prix limite de l'ordre
 *                     sz:
 *                       type: number
 *                       description: Taille de l'ordre
 *               grouping:
 *                 type: string
 *                 enum: [na, normalTpsl, bracket]
 *                 description: Type de groupement des ordres
 *               builder:
 *                 type: string
 *                 description: Adresse du builder (optionnel)
 *     responses:
 *       200:
 *         description: Ordre(s) placé(s) avec succès
 *       500:
 *         description: Erreur serveur
 */
router.post('/order', authMiddleware, async (req, res) => {
  const exchange = new ExchangeApi(req.wallet);
  try {
    const result = await exchange.post('/exchange', {
      action: {
        type: 'order',
        orders: req.body.orders,
        grouping: req.body.grouping,
        builder: req.body.builder
      },
      nonce: Date.now(),
      signature: req.signature
    });
    res.json(result);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

/**
 * @swagger
 * /exchange/cancel:
 *   post:
 *     summary: Annuler un ou plusieurs ordres par ID
 *     tags: [Exchange]
 *     security:
 *       - BearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               cancels:
 *                 type: array
 *                 items:
 *                   type: object
 *                   properties:
 *                     coin:
 *                       type: string
 *                     oid:
 *                       type: string
 *     responses:
 *       200:
 *         description: Ordre(s) annulé(s) avec succès
 *       500:
 *         description: Erreur serveur
 */
router.post('/cancel', authMiddleware, async (req, res) => {
  const exchange = new ExchangeApi(req.wallet);
  try {
    const result = await exchange.post('/exchange', {
      action: {
        type: 'cancel',
        cancels: req.body.cancels
      },
      nonce: Date.now(),
      signature: req.signature
    });
    res.json(result);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

/**
 * @swagger
 * /exchange/cancel-by-cloid:
 *   post:
 *     summary: Annuler un ou plusieurs ordres par CLOID
 *     tags: [Exchange]
 *     security:
 *       - BearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               cancels:
 *                 type: array
 *                 items:
 *                   type: object
 *                   properties:
 *                     coin:
 *                       type: string
 *                     cloid:
 *                       type: string
 *     responses:
 *       200:
 *         description: Ordre(s) annulé(s) avec succès
 *       500:
 *         description: Erreur serveur
 */
router.post('/cancel-by-cloid', authMiddleware, async (req, res) => {
  const exchange = new ExchangeApi(req.wallet);
  try {
    const result = await exchange.post('/exchange', {
      action: {
        type: 'cancelByCloid',
        cancels: req.body.cancels
      },
      nonce: Date.now(),
      signature: req.signature
    });
    res.json(result);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

/**
 * @swagger
 * /exchange/modify:
 *   post:
 *     summary: Modifier un ordre existant
 *     tags: [Exchange]
 *     security:
 *       - BearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               oid:
 *                 type: string
 *               order:
 *                 type: object
 *                 properties:
 *                   limitPx:
 *                     type: number
 *                   sz:
 *                     type: number
 *     responses:
 *       200:
 *         description: Ordre modifié avec succès
 *       500:
 *         description: Erreur serveur
 */
router.post('/modify', authMiddleware, async (req, res) => {
  const exchange = new ExchangeApi(req.wallet);
  try {
    const result = await exchange.post('/exchange', {
      action: {
        type: 'modify',
        oid: req.body.oid,
        order: req.body.order
      },
      nonce: Date.now(),
      signature: req.signature
    });
    res.json(result);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

/**
 * @swagger
 * /exchange/leverage:
 *   post:
 *     summary: Mettre à jour le levier pour un actif
 *     tags: [Exchange]
 *     security:
 *       - BearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               asset:
 *                 type: number
 *               isCross:
 *                 type: boolean
 *               leverage:
 *                 type: number
 *     responses:
 *       200:
 *         description: Levier mis à jour avec succès
 *       500:
 *         description: Erreur serveur
 */
router.post('/leverage', authMiddleware, async (req, res) => {
  const exchange = new ExchangeApi(req.wallet);
  try {
    const result = await exchange.post('/exchange', {
      action: {
        type: 'updateLeverage',
        asset: req.body.asset,
        isCross: req.body.isCross,
        leverage: req.body.leverage
      },
      nonce: Date.now(),
      signature: req.signature
    });
    res.json(result);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

/**
 * @swagger
 * /exchange/withdraw:
 *   post:
 *     summary: Retirer des fonds
 *     tags: [Exchange]
 *     security:
 *       - BearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               chain:
 *                 type: string
 *               chainId:
 *                 type: number
 *               amount:
 *                 type: number
 *               destination:
 *                 type: string
 *     responses:
 *       200:
 *         description: Retrait effectué avec succès
 *       500:
 *         description: Erreur serveur
 */
router.post('/withdraw', authMiddleware, async (req, res) => {
  const exchange = new ExchangeApi(req.wallet);
  try {
    const result = await exchange.post('/exchange', {
      action: {
        type: 'withdraw3',
        hyperliquidChain: req.body.chain,
        signatureChainId: req.body.chainId,
        amount: req.body.amount,
        time: Date.now(),
        destination: req.body.destination
      },
      nonce: Date.now(),
      signature: req.signature
    });
    res.json(result);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

/**
 * @swagger
 * /exchange/twap/order:
 *   post:
 *     summary: Placer un ordre TWAP
 *     tags: [Exchange]
 *     security:
 *       - BearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               twap:
 *                 type: object
 *                 properties:
 *                   coin:
 *                     type: string
 *                   isBuy:
 *                     type: boolean
 *                   limitPx:
 *                     type: number
 *                   sz:
 *                     type: number
 *                   duration:
 *                     type: number
 *     responses:
 *       200:
 *         description: Ordre TWAP placé avec succès
 *       500:
 *         description: Erreur serveur
 */
router.post('/twap/order', authMiddleware, async (req, res) => {
  const exchange = new ExchangeApi(req.wallet);
  try {
    const result = await exchange.post('/exchange', {
      action: {
        type: 'twapOrder',
        twap: req.body.twap
      },
      nonce: Date.now(),
      signature: req.signature
    });
    res.json(result);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

/**
 * @swagger
 * /exchange/twap/cancel:
 *   post:
 *     summary: Annuler un ordre TWAP
 *     tags: [Exchange]
 *     security:
 *       - BearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               asset:
 *                 type: number
 *               twapId:
 *                 type: string
 *     responses:
 *       200:
 *         description: Ordre TWAP annulé avec succès
 *       500:
 *         description: Erreur serveur
 */
router.post('/twap/cancel', authMiddleware, async (req, res) => {
  const exchange = new ExchangeApi(req.wallet);
  try {
    const result = await exchange.post('/exchange', {
      action: {
        type: 'twapCancel',
        a: req.body.asset,
        t: req.body.twapId
      },
      nonce: Date.now(),
      signature: req.signature
    });
    res.json(result);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

/**
 * @swagger
 * /exchange/isolated-margin:
 *   post:
 *     summary: Mettre à jour la marge isolée
 *     tags: [Exchange]
 *     security:
 *       - BearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               coin:
 *                 type: string
 *               isBuy:
 *                 type: boolean
 *               amount:
 *                 type: number
 *     responses:
 *       200:
 *         description: Marge isolée mise à jour avec succès
 *       500:
 *         description: Erreur serveur
 */
router.post('/isolated-margin', authMiddleware, async (req, res) => {
  const exchange = new ExchangeApi(req.wallet);
  try {
    const result = await exchange.updateIsolatedMargin(req.body);
    res.json(result);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

/**
 * @swagger
 * /exchange/vault/transfer:
 *   post:
 *     summary: Effectuer un transfert vers/depuis un vault
 *     tags: [Exchange]
 *     security:
 *       - BearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               vaultAddress:
 *                 type: string
 *               amount:
 *                 type: number
 *               asset:
 *                 type: string
 *     responses:
 *       200:
 *         description: Transfert effectué avec succès
 *       500:
 *         description: Erreur serveur
 */
router.post('/vault/transfer', authMiddleware, async (req, res) => {
  const exchange = new ExchangeApi(req.wallet);
  try {
    const result = await exchange.post('/exchange', {
      action: {
        type: 'vaultTransfer',
        vault: req.body.vaultAddress,
        amount: req.body.amount,
        asset: req.body.asset
      },
      nonce: Date.now(),
      signature: req.signature
    });
    res.json(result);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

/**
 * @swagger
 * /exchange/builder/approve:
 *   post:
 *     summary: Approuver les frais d'un builder
 *     tags: [Exchange]
 *     security:
 *       - BearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               chain:
 *                 type: string
 *               maxFeeRate:
 *                 type: number
 *               builderAddress:
 *                 type: string
 *     responses:
 *       200:
 *         description: Frais du builder approuvés avec succès
 *       500:
 *         description: Erreur serveur
 */
router.post('/builder/approve', authMiddleware, async (req, res) => {
  const exchange = new ExchangeApi(req.wallet);
  try {
    const result = await exchange.post('/exchange', {
      action: {
        type: 'approveBuilderFee',
        hyperliquidChain: req.body.chain,
        maxFeeRate: req.body.maxFeeRate,
        builder: req.body.builderAddress,
        nonce: Date.now()
      },
      signature: req.signature
    });
    res.json(result);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

module.exports = router;