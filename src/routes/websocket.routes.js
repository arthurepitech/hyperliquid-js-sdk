/**
 * @swagger
 * tags:
 *   name: WebSocket
 *   description: API pour gérer les connexions WebSocket et les souscriptions en temps réel
 */

const express = require('express');
const router = express.Router();
const WebsocketManager = require('../websocket/WebsocketManager');

/**
 * @swagger
 * /ws/subscribe:
 *   post:
 *     summary: Souscrire à un flux de données WebSocket
 *     tags: [WebSocket]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - baseUrl
 *               - subscription
 *               - callback
 *             properties:
 *               baseUrl:
 *                 type: string
 *                 description: URL de base du serveur WebSocket
 *               subscription:
 *                 type: object
 *                 description: Configuration de la souscription
 *               callback:
 *                 type: string
 *                 description: URL de callback pour recevoir les mises à jour
 *     responses:
 *       200:
 *         description: Souscription créée avec succès
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 subscriptionId:
 *                   type: string
 *       500:
 *         description: Erreur serveur
 */
router.post('/subscribe', async (req, res) => {
  try {
    const wsManager = new WebsocketManager(req.body.baseUrl);
    const subscriptionId = await wsManager.subscribe(
      req.body.subscription,
      req.body.callback
    );
    res.json({ subscriptionId });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

/**
 * @swagger
 * /ws/unsubscribe:
 *   post:
 *     summary: Se désabonner d'un flux de données WebSocket
 *     tags: [WebSocket]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - baseUrl
 *               - subscription
 *               - subscriptionId
 *             properties:
 *               baseUrl:
 *                 type: string
 *                 description: URL de base du serveur WebSocket
 *               subscription:
 *                 type: object
 *                 description: Configuration de la souscription
 *               subscriptionId:
 *                 type: string
 *                 description: ID de la souscription à annuler
 *     responses:
 *       200:
 *         description: Désabonnement réussi
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *       500:
 *         description: Erreur serveur
 */
router.post('/unsubscribe', async (req, res) => {
  try {
    const wsManager = new WebsocketManager(req.body.baseUrl);
    const result = await wsManager.unsubscribe(
      req.body.subscription,
      req.body.subscriptionId
    );
    res.json({ success: result });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

/**
 * @swagger
 * /ws/subscribe/l2book/{coin}:
 *   post:
 *     summary: Souscrire au carnet d'ordres L2 d'une paire de trading
 *     tags: [WebSocket]
 *     parameters:
 *       - in: path
 *         name: coin
 *         required: true
 *         schema:
 *           type: string
 *         description: Symbole de la paire de trading
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - baseUrl
 *               - callback
 *             properties:
 *               baseUrl:
 *                 type: string
 *                 description: URL de base du serveur WebSocket
 *               callback:
 *                 type: string
 *                 description: URL de callback pour recevoir les mises à jour du carnet d'ordres
 *     responses:
 *       200:
 *         description: Souscription au carnet d'ordres créée avec succès
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 subscriptionId:
 *                   type: string
 *       500:
 *         description: Erreur serveur
 */
router.post('/subscribe/l2book/:coin', async (req, res) => {
  try {
    const wsManager = new WebsocketManager(req.body.baseUrl);
    const subscription = {
      type: 'l2Book',
      coin: req.params.coin
    };
    const subscriptionId = await wsManager.subscribe(subscription, req.body.callback);
    res.json({ subscriptionId });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

/**
 * @swagger
 * /ws/subscribe/user-events:
 *   post:
 *     summary: Souscrire aux événements utilisateur
 *     tags: [WebSocket]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - baseUrl
 *               - callback
 *             properties:
 *               baseUrl:
 *                 type: string
 *                 description: URL de base du serveur WebSocket
 *               callback:
 *                 type: string
 *                 description: URL de callback pour recevoir les événements utilisateur
 *     responses:
 *       200:
 *         description: Souscription aux événements utilisateur créée avec succès
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 subscriptionId:
 *                   type: string
 *       500:
 *         description: Erreur serveur
 */
router.post('/subscribe/user-events', async (req, res) => {
  try {
    const wsManager = new WebsocketManager(req.body.baseUrl);
    const subscription = {
      type: 'userEvents'
    };
    const subscriptionId = await wsManager.subscribe(subscription, req.body.callback);
    res.json({ subscriptionId });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

module.exports = router;