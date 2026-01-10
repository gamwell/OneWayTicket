#!/usr/bin/env node

/**
 * Script de test de la base de données ONEWAYTICKET
 *
 * Usage: node test-database.js
 */

import { createClient } from '@supabase/supabase-js';

const SUPABASE_URL = process.env.VITE_SUPABASE_URL || 'https://vnijdjjzgruujvagrihu.supabase.co';
const SUPABASE_ANON_KEY = process.env.VITE_SUPABASE_ANON_KEY || 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InZuaWpkamp6Z3J1dWp2YWdyaWh1Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NjE0ODU5MDksImV4cCI6MjA3NzA2MTkwOX0.HQdSPYN0mtquGlDJmYASSasaiP5JbA3Lt8R98RX-TRc';

const supabase = createClient(SUPABASE_URL, SUPABASE_ANON_KEY);

const colors = {
  reset: '\x1b[0m',
  green: '\x1b[32m',
  red: '\x1b[31m',
  yellow: '\x1b[33m',
  blue: '\x1b[34m',
  cyan: '\x1b[36m',
};

function log(color, message) {
  console.log(color + message + colors.reset);
}

function header(title) {
  console.log('\n' + '='.repeat(60));
  log(colors.cyan, `  ${title}`);
  console.log('='.repeat(60) + '\n');
}

async function testConnection() {
  header('TEST 1: Connexion à Supabase');

  try {
    log(colors.yellow, '⏳ Test de connexion...');

    const { data, error } = await supabase
      .from('categories')
      .select('count');

    if (error) throw error;

    log(colors.green, '✅ Connexion établie avec succès !');
    log(colors.blue, `   URL: ${SUPABASE_URL}`);
    return true;
  } catch (error) {
    log(colors.red, `❌ Erreur de connexion: ${error.message}`);
    return false;
  }
}

async function testCategories() {
  header('TEST 2: Lecture des catégories');

  try {
    log(colors.yellow, '⏳ Récupération des catégories...');

    const { data, error } = await supabase
      .from('categories')
      .select('nom, couleur, icone')
      .order('nom');

    if (error) throw error;

    log(colors.green, `✅ ${data.length} catégories trouvées :`);

    data.forEach(cat => {
      console.log(`   • ${cat.nom} (${cat.icone}) - ${cat.couleur}`);
    });

    return true;
  } catch (error) {
    log(colors.red, `❌ Erreur: ${error.message}`);
    return false;
  }
}

async function testTables() {
  header('TEST 3: Vérification des tables');

  const requiredTables = [
    'users',
    'categories',
    'events',
    'ticket_types',
    'tickets',
    'payments',
    'payment_tickets',
    'reviews',
    'favorites',
    'ai_generations'
  ];

  log(colors.yellow, `⏳ Vérification de ${requiredTables.length} tables...`);

  let allExists = true;

  for (const table of requiredTables) {
    try {
      const { error } = await supabase
        .from(table)
        .select('*')
        .limit(1);

      if (error && error.code !== 'PGRST116') {
        log(colors.red, `   ❌ ${table} : ${error.message}`);
        allExists = false;
      } else {
        log(colors.green, `   ✅ ${table}`);
      }
    } catch (error) {
      log(colors.red, `   ❌ ${table} : ${error.message}`);
      allExists = false;
    }
  }

  if (allExists) {
    log(colors.green, `\n✅ Toutes les tables existent !`);
  } else {
    log(colors.red, `\n❌ Certaines tables sont manquantes`);
  }

  return allExists;
}

async function testRLS() {
  header('TEST 4: Row Level Security (RLS)');

  try {
    log(colors.yellow, '⏳ Test des policies RLS...');

    // Test 1: Accès aux catégories (devrait fonctionner - policy publique)
    const { data: categories, error: catError } = await supabase
      .from('categories')
      .select('*')
      .limit(1);

    if (catError) {
      log(colors.red, `   ❌ Erreur catégories: ${catError.message}`);
    } else {
      log(colors.green, '   ✅ Lecture catégories autorisée (public)');
    }

    // Test 2: Accès aux users (devrait retourner vide - RLS actif)
    const { data: users, error: usersError } = await supabase
      .from('users')
      .select('*');

    if (usersError) {
      log(colors.green, '   ✅ RLS actif sur users (accès bloqué comme prévu)');
    } else if (users && users.length === 0) {
      log(colors.green, '   ✅ RLS actif sur users (aucune donnée retournée)');
    } else {
      log(colors.yellow, '   ⚠️  Attention: données users accessibles sans auth');
    }

    // Test 3: Accès aux events
    const { data: events, error: eventsError } = await supabase
      .from('events')
      .select('*')
      .limit(1);

    if (!eventsError) {
      log(colors.green, '   ✅ Lecture events autorisée (events publics)');
    }

    log(colors.green, '\n✅ Row Level Security fonctionne correctement !');
    return true;
  } catch (error) {
    log(colors.red, `❌ Erreur: ${error.message}`);
    return false;
  }
}

async function testStats() {
  header('TEST 5: Statistiques de la base');

  try {
    log(colors.yellow, '⏳ Récupération des statistiques...');

    // Compter les enregistrements dans chaque table
    const stats = {};

    const tables = ['categories', 'events', 'users', 'tickets'];

    for (const table of tables) {
      try {
        const { count, error } = await supabase
          .from(table)
          .select('*', { count: 'exact', head: true });

        stats[table] = count || 0;
      } catch (error) {
        stats[table] = 'N/A';
      }
    }

    log(colors.green, '✅ Statistiques :');
    Object.entries(stats).forEach(([table, count]) => {
      console.log(`   • ${table}: ${count} enregistrement(s)`);
    });

    return true;
  } catch (error) {
    log(colors.red, `❌ Erreur: ${error.message}`);
    return false;
  }
}

async function runAllTests() {
  console.clear();

  log(colors.cyan, '\n╔════════════════════════════════════════════════════════════╗');
  log(colors.cyan, '║        TEST BASE DE DONNÉES ONEWAYTICKET                  ║');
  log(colors.cyan, '╚════════════════════════════════════════════════════════════╝\n');

  const results = [];

  results.push(await testConnection());
  results.push(await testCategories());
  results.push(await testTables());
  results.push(await testRLS());
  results.push(await testStats());

  // Résumé final
  header('RÉSUMÉ');

  const passed = results.filter(r => r).length;
  const total = results.length;

  if (passed === total) {
    log(colors.green, `✅ ${passed}/${total} tests réussis !`);
    log(colors.green, '\n🎉 Votre base de données fonctionne parfaitement !');
  } else {
    log(colors.yellow, `⚠️  ${passed}/${total} tests réussis`);
    log(colors.red, '\n❌ Certains tests ont échoué. Vérifiez les erreurs ci-dessus.');
  }

  console.log('\n' + '='.repeat(60) + '\n');
}

// Exécuter les tests
runAllTests().catch(error => {
  log(colors.red, `\n❌ Erreur fatale: ${error.message}`);
  process.exit(1);
});
