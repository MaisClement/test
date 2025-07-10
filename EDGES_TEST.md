# Test des Custom Edges

Le projet a été configuré avec succès ! Voici comment tester vos nouvelles edges personnalisés :

## 🚀 Serveur de développement lancé

Le serveur de développement fonctionne sur : **http://localhost:5174/**

## 📊 Edges personnalisés disponibles

1. **CFT Transfers** (`cft`) - Rouge, default, avec informations de transfert
2. **MQ** (`mq`) - Gris, defaultr, pour les messages de queue
3. **API Call/GRPC** (`api`) - Turquoise, default, avec marqueurs des deux côtés
4. **Kafka Publisher** (`kafka_pub`) - Violet, default
5. **Kafka Subscriber** (`kafka_sub`) - Jaune, default
6. **Manual Entry** (`manual`) - Rouge, default
7. **External Entry** (`external`) - Vert, default

## 🎯 Pour tester

### Option 1: Vue actuelle modifiée
- Ouvrez http://localhost:5174/ dans votre navigateur
- Vous verrez maintenant le flow avec les nouveaux edges personnalisés intégrés

### Option 2: Vue de démonstration dédiée
J'ai créé un composant `EdgesDemoFlow.tsx` qui montre tous les types d'edges.

Pour l'utiliser, vous pouvez temporairement modifier `src/main.tsx` :

```typescript
// Remplacer temporairement
import App from './App.tsx'

// Par
import App from './EdgesDemoFlow.tsx'
```

## 📁 Fichiers modifiés/créés

- ✅ `src/edges/index.ts` - Ajout d'exemples d'edges avec tous les types
- ✅ `src/nodes/index.ts` - Repositionnement des nœuds et ajout du nœud manquant 'b'
- ✅ `src/EdgesDemoFlow.tsx` - Composant de démonstration dédié

## 🎨 Caractéristiques visibles

- **Couleurs distinctes** pour chaque type d'edge
- **Épaisseurs différentes** (default, default, defaultr)
- **Flèches de début/fin** selon les spécifications
- **Labels centraux personnalisés** avec informations contextuelles
- **Données spécifiques** pour CFT (jobs, paths) et API (endpoints)

Vous devriez maintenant voir tous vos types d'edges personnalisés en action dans l'interface !
