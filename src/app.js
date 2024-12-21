const express = require('express');
const cors = require('cors');
const helmet = require('helmet');
const morgan = require('morgan');
const swaggerUi = require('swagger-ui-express');
const swaggerJsDoc = require('swagger-jsdoc');

// Import des routes
const infoRoutes = require('./routes/info.routes');
const exchangeRoutes = require('./routes/exchange.routes');
const websocketRoutes = require('./routes/websocket.routes');

// Configuration Swagger
const swaggerOptions = {
  definition: {
    openapi: '3.0.0',
    info: {
      title: 'API Hyperliquid',
      version: '1.0.0',
      description: 'Documentation de l\'API Hyperliquid',
    },
    servers: [
      {
        url: process.env.API_URL || 'http://localhost:3000',
        description: 'Serveur de développement'
      }
    ],
    components: {
      securitySchemes: {
        BearerAuth: {
          type: 'http',
          scheme: 'bearer',
          bearerFormat: 'JWT'
        }
      }
    }
  },
  apis: ['./src/routes/*.js']
};

const swaggerDocs = swaggerJsDoc(swaggerOptions);

// Initialisation de l'application
const app = express();

// Middleware de sécurité et utilitaires
app.use(helmet());
app.use(cors());
app.use(morgan('dev'));
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Documentation Swagger
app.use('/api-docs', swaggerUi.serve, swaggerUi.setup(swaggerDocs));

// Middleware de gestion des erreurs
app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(500).json({
    error: 'Une erreur est survenue',
    message: err.message
  });
});

// Routes
app.use('/info', infoRoutes);
app.use('/exchange', exchangeRoutes);
app.use('/ws', websocketRoutes);

// Route par défaut
app.get('/', (req, res) => {
  res.redirect('/api-docs');
});

// Gestion des routes non trouvées
app.use((req, res) => {
  res.status(404).json({
    error: 'Route non trouvée'
  });
});

// Configuration du port
const PORT = process.env.PORT || 3000;

// Démarrage du serveur uniquement si le fichier est exécuté directement
if (require.main === module) {
  app.listen(PORT, () => {
    console.log(`Serveur démarré sur le port ${PORT}`);
    console.log(`Documentation disponible sur http://localhost:${PORT}/api-docs`);
  });
}

module.exports = app; 