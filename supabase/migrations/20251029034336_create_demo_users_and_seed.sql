/*
  # Create Demo Users and Seed Data

  1. Users Creation
    - Create demo users in the custom users table
    - One organizer, one client
    
  2. Data Insertion
    - Insert demo categories
    - Insert sample events with realistic details
    - Insert ticket types for each event
    
  3. Notes
    - All data is fictional for demonstration purposes
    - Event dates are set in the future
    - Prices are in EUR
*/

-- Insert demo users in custom users table
INSERT INTO users (id, email, nom, prenom, telephone, role) VALUES
  ('550e8400-e29b-41d4-a716-446655440001', 'demo.organisateur@onewayticket.fr', 'Dupont', 'Marie', '+33612345678', 'organisateur'),
  ('550e8400-e29b-41d4-a716-446655440002', 'demo.client@onewayticket.fr', 'Martin', 'Jean', '+33698765432', 'client')
ON CONFLICT (id) DO NOTHING;

-- Insert Categories
INSERT INTO categories (nom, description, icone, couleur) VALUES
  ('Musique', 'Concerts, festivals et événements musicaux', '🎵', '#FF6B6B'),
  ('Sport', 'Matchs, compétitions et événements sportifs', '⚽', '#4ECDC4'),
  ('Théâtre', 'Pièces de théâtre et spectacles', '🎭', '#95E1D3'),
  ('Conférences', 'Conférences professionnelles et académiques', '💼', '#F38181'),
  ('Festivals', 'Festivals culturels et artistiques', '🎪', '#AA96DA'),
  ('Comédie', 'Spectacles d''humour et one-man-shows', '😂', '#FCBAD3'),
  ('Cinéma', 'Projections et avant-premières', '🎬', '#A8D8EA'),
  ('Famille', 'Événements pour toute la famille', '👨‍👩‍👧‍👦', '#FFBF69')
ON CONFLICT DO NOTHING;

-- Insert Events and Ticket Types
DO $$
DECLARE
  demo_user_id uuid := '550e8400-e29b-41d4-a716-446655440001';
  cat_musique_id uuid;
  cat_sport_id uuid;
  cat_theatre_id uuid;
  cat_conferences_id uuid;
  cat_festivals_id uuid;
  cat_comedie_id uuid;
  cat_cinema_id uuid;
  cat_famille_id uuid;
  event_id_temp uuid;
BEGIN
  -- Get category IDs
  SELECT id INTO cat_musique_id FROM categories WHERE nom = 'Musique' LIMIT 1;
  SELECT id INTO cat_sport_id FROM categories WHERE nom = 'Sport' LIMIT 1;
  SELECT id INTO cat_theatre_id FROM categories WHERE nom = 'Théâtre' LIMIT 1;
  SELECT id INTO cat_conferences_id FROM categories WHERE nom = 'Conférences' LIMIT 1;
  SELECT id INTO cat_festivals_id FROM categories WHERE nom = 'Festivals' LIMIT 1;
  SELECT id INTO cat_comedie_id FROM categories WHERE nom = 'Comédie' LIMIT 1;
  SELECT id INTO cat_cinema_id FROM categories WHERE nom = 'Cinéma' LIMIT 1;
  SELECT id INTO cat_famille_id FROM categories WHERE nom = 'Famille' LIMIT 1;

  -- Event 1: Festival Jazz
  INSERT INTO events (
    titre, description, lieu, ville, date_debut, date_fin,
    category_id, image_urls, organisateur_id, capacite_totale, statut, tags
  ) VALUES (
    'Festival Jazz in Paris 2026',
    'Le plus grand festival de jazz d''Europe revient pour sa 25ème édition. Trois jours de concerts exceptionnels avec des artistes internationaux et des talents émergents. Une expérience musicale inoubliable au cœur de Paris.',
    'Parc de la Villette',
    'Paris',
    '2026-06-15 18:00:00+00',
    '2026-06-17 23:00:00+00',
    cat_musique_id,
    ARRAY['https://images.pexels.com/photos/1105666/pexels-photo-1105666.jpeg?auto=compress&cs=tinysrgb&w=1200'],
    demo_user_id,
    5000,
    'publie',
    ARRAY['jazz', 'festival', 'musique']
  ) RETURNING id INTO event_id_temp;
  
  INSERT INTO ticket_types (event_id, nom, prix, quantite_disponible, quantite_vendue, description, avantages)
  VALUES 
    (event_id_temp, 'Standard', 89.00, 3500, 0, 'Billet d''accès standard', ARRAY['Accès aux concerts', 'Espaces restauration']),
    (event_id_temp, 'VIP', 199.00, 100, 0, 'Accès VIP avec avantages', ARRAY['Zone VIP', 'Bar privé', 'Rencontre artistes']),
    (event_id_temp, 'Golden Circle', 299.00, 50, 0, 'Zone premium', ARRAY['Proximité scène', 'Champagne', 'Parking VIP']);

  -- Event 2: Football
  INSERT INTO events (
    titre, description, lieu, ville, date_debut, date_fin,
    category_id, image_urls, organisateur_id, capacite_totale, statut, tags
  ) VALUES (
    'Finale Championnat de France Football',
    'Assistez à la finale tant attendue du Championnat de France. Un match historique dans le plus grand stade de France.',
    'Stade de France',
    'Paris',
    '2026-05-20 21:00:00+00',
    '2026-05-20 23:00:00+00',
    cat_sport_id,
    ARRAY['https://images.pexels.com/photos/274506/pexels-photo-274506.jpeg?auto=compress&cs=tinysrgb&w=1200'],
    demo_user_id,
    80000,
    'publie',
    ARRAY['football', 'sport', 'finale']
  ) RETURNING id INTO event_id_temp;
  
  INSERT INTO ticket_types (event_id, nom, prix, quantite_disponible, quantite_vendue, description, avantages)
  VALUES 
    (event_id_temp, 'Tribune Populaire', 45.00, 50000, 0, 'Tribune haute', ARRAY['Vue panoramique']),
    (event_id_temp, 'Tribune Centrale', 120.00, 25000, 0, 'Places centrales', ARRAY['Vue centrale', 'Sièges confort']),
    (event_id_temp, 'Carré VIP', 350.00, 500, 0, 'Expérience VIP', ARRAY['Salon VIP', 'Restauration', 'Rencontre joueurs']);

  -- Event 3: Théâtre
  INSERT INTO events (
    titre, description, lieu, ville, date_debut, date_fin,
    category_id, image_urls, organisateur_id, capacite_totale, statut, tags
  ) VALUES (
    'Le Misanthrope - Molière',
    'Représentation exceptionnelle par la Comédie-Française. Mise en scène moderne d''un chef-d''œuvre.',
    'Comédie-Française',
    'Paris',
    '2026-04-10 20:00:00+00',
    '2026-04-10 22:30:00+00',
    cat_theatre_id,
    ARRAY['https://images.pexels.com/photos/713149/pexels-photo-713149.jpeg?auto=compress&cs=tinysrgb&w=1200'],
    demo_user_id,
    800,
    'publie',
    ARRAY['théâtre', 'molière', 'classique']
  ) RETURNING id INTO event_id_temp;
  
  INSERT INTO ticket_types (event_id, nom, prix, quantite_disponible, quantite_vendue, description, avantages)
  VALUES 
    (event_id_temp, 'Balcon', 25.00, 300, 0, 'Places en balcon', ARRAY['Bonne visibilité']),
    (event_id_temp, 'Orchestre', 45.00, 400, 0, 'Places orchestre', ARRAY['Vue optimale']),
    (event_id_temp, 'Première', 75.00, 100, 0, 'Meilleures places', ARRAY['Premiers rangs', 'Programme offert']);

  -- Event 4: TechSummit
  INSERT INTO events (
    titre, description, lieu, ville, date_debut, date_fin,
    category_id, image_urls, organisateur_id, capacite_totale, statut, tags
  ) VALUES (
    'TechSummit 2026',
    'La plus grande conférence tech de France. Leaders de l''industrie et innovations technologiques.',
    'Centre de Congrès',
    'Lyon',
    '2026-09-05 09:00:00+00',
    '2026-09-07 18:00:00+00',
    cat_conferences_id,
    ARRAY['https://images.pexels.com/photos/2774556/pexels-photo-2774556.jpeg?auto=compress&cs=tinysrgb&w=1200'],
    demo_user_id,
    2000,
    'publie',
    ARRAY['tech', 'innovation', 'conférence']
  ) RETURNING id INTO event_id_temp;
  
  INSERT INTO ticket_types (event_id, nom, prix, quantite_disponible, quantite_vendue, description, avantages)
  VALUES 
    (event_id_temp, 'Early Bird', 199.00, 500, 0, 'Tarif anticipé', ARRAY['3 jours', 'Support cours']),
    (event_id_temp, 'Standard', 299.00, 1200, 0, 'Billet standard', ARRAY['3 jours', 'Networking', 'Repas']),
    (event_id_temp, 'Premium', 599.00, 300, 0, 'Accès premium', ARRAY['VIP', 'Workshops', 'Dîner gala']);

  -- Event 5: Comédie
  INSERT INTO events (
    titre, description, lieu, ville, date_debut, date_fin,
    category_id, image_urls, organisateur_id, capacite_totale, statut, tags
  ) VALUES (
    'Gad Elmaleh - One Man Show',
    'Le retour de Gad Elmaleh avec son nouveau spectacle. Deux heures de rire garanties.',
    'Le Dôme',
    'Marseille',
    '2026-07-12 20:30:00+00',
    '2026-07-12 22:30:00+00',
    cat_comedie_id,
    ARRAY['https://images.pexels.com/photos/796602/pexels-photo-796602.jpeg?auto=compress&cs=tinysrgb&w=1200'],
    demo_user_id,
    3500,
    'publie',
    ARRAY['comédie', 'humour', 'spectacle']
  ) RETURNING id INTO event_id_temp;
  
  INSERT INTO ticket_types (event_id, nom, prix, quantite_disponible, quantite_vendue, description, avantages)
  VALUES 
    (event_id_temp, 'Catégorie 2', 35.00, 2000, 0, 'Places arrière', ARRAY['Bonne ambiance']),
    (event_id_temp, 'Catégorie 1', 55.00, 1200, 0, 'Places centrales', ARRAY['Vue excellente']),
    (event_id_temp, 'Fosse', 85.00, 300, 0, 'Premiers rangs', ARRAY['Vue imprenable']);

  -- Event 6: Cirque
  INSERT INTO events (
    titre, description, lieu, ville, date_debut, date_fin,
    category_id, image_urls, organisateur_id, capacite_totale, statut, tags
  ) VALUES (
    'Cirque du Soleil - Alegría',
    'Spectacle familial du Cirque du Soleil. Acrobaties et musique envoûtante.',
    'Patinoire Mériadeck',
    'Bordeaux',
    '2026-08-20 19:00:00+00',
    '2026-08-20 21:30:00+00',
    cat_famille_id,
    ARRAY['https://images.pexels.com/photos/163036/circus-performance-juggler-juggling-163036.jpeg?auto=compress&cs=tinysrgb&w=1200'],
    demo_user_id,
    4000,
    'publie',
    ARRAY['cirque', 'famille', 'spectacle']
  ) RETURNING id INTO event_id_temp;
  
  INSERT INTO ticket_types (event_id, nom, prix, quantite_disponible, quantite_vendue, description, avantages)
  VALUES 
    (event_id_temp, 'Standard', 55.00, 2500, 0, 'Places standard', ARRAY['Bonne visibilité']),
    (event_id_temp, 'Premium', 75.00, 1000, 0, 'Places privilégiées', ARRAY['Vue rapprochée']),
    (event_id_temp, 'Or', 120.00, 500, 0, 'Meilleures places', ARRAY['Premiers rangs', 'Programme']);

  -- Event 7: Rock Festival
  INSERT INTO events (
    titre, description, lieu, ville, date_debut, date_fin,
    category_id, image_urls, organisateur_id, capacite_totale, statut, tags
  ) VALUES (
    'Rock en Seine 2026',
    'Le festival rock de l''été. Trois jours avec les plus grands noms du rock international.',
    'Domaine de Saint-Cloud',
    'Paris',
    '2026-08-28 14:00:00+00',
    '2026-08-30 23:59:00+00',
    cat_festivals_id,
    ARRAY['https://images.pexels.com/photos/1190297/pexels-photo-1190297.jpeg?auto=compress&cs=tinysrgb&w=1200'],
    demo_user_id,
    15000,
    'publie',
    ARRAY['rock', 'festival', 'musique']
  ) RETURNING id INTO event_id_temp;
  
  INSERT INTO ticket_types (event_id, nom, prix, quantite_disponible, quantite_vendue, description, avantages)
  VALUES 
    (event_id_temp, 'Pass 3 Jours', 120.00, 10000, 0, 'Accès 3 jours', ARRAY['Tous concerts', 'Camping']),
    (event_id_temp, 'Pass 1 Jour', 65.00, 4000, 0, 'Accès journée', ARRAY['Concerts du jour']),
    (event_id_temp, 'VIP 3 Jours', 350.00, 1000, 0, 'VIP 3 jours', ARRAY['Zone VIP', 'Bar privé', 'Fast track']);

  -- Event 8: Cinéma
  INSERT INTO events (
    titre, description, lieu, ville, date_debut, date_fin,
    category_id, image_urls, organisateur_id, capacite_totale, statut, tags
  ) VALUES (
    'Avant-Première - Nouveau Film Nolan',
    'Découvrez le nouveau film de Christopher Nolan. Projection suivie d''une Q&A exclusive.',
    'Grand Rex',
    'Paris',
    '2026-05-15 20:00:00+00',
    '2026-05-15 23:00:00+00',
    cat_cinema_id,
    ARRAY['https://images.pexels.com/photos/7991579/pexels-photo-7991579.jpeg?auto=compress&cs=tinysrgb&w=1200'],
    demo_user_id,
    2700,
    'publie',
    ARRAY['cinéma', 'avant-première', 'nolan']
  ) RETURNING id INTO event_id_temp;
  
  INSERT INTO ticket_types (event_id, nom, prix, quantite_disponible, quantite_vendue, description, avantages)
  VALUES 
    (event_id_temp, 'Standard', 18.00, 2000, 0, 'Place standard', ARRAY['IMAX']),
    (event_id_temp, 'Privilège', 25.00, 500, 0, 'Places centrales', ARRAY['Vue optimale']),
    (event_id_temp, 'Prestige', 45.00, 200, 0, 'Avec Q&A', ARRAY['Premiers rangs', 'Q&A', 'Cocktail']);

END $$;
