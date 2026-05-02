-- ATFR - Contenu editable pour les nouvelles sections de la home.
--
-- A executer dans le SQL Editor Supabase pour afficher ces champs dans
-- /admin/contenu. Les valeurs existantes ne sont pas ecrasees.

insert into public.site_content (key, value, kind, label) values
  ('hero_signal_1_label', 'Structure', 'text', 'Hero signal 1 - libelle'),
  ('hero_signal_1_value', 'Clan organisé', 'text', 'Hero signal 1 - valeur'),
  ('hero_signal_2_label', 'Académie', 'text', 'Hero signal 2 - libelle'),
  ('hero_signal_2_value', 'Outils & tests', 'text', 'Hero signal 2 - valeur'),
  ('hero_signal_3_label', 'Discord', 'text', 'Hero signal 3 - libelle'),
  ('hero_signal_3_value', 'Vie active', 'text', 'Hero signal 3 - valeur'),

  ('why_join_eyebrow', 'Pourquoi ATFR', 'text', 'Pourquoi ATFR - surtitre'),
  ('why_join_title', 'Un clan qui aide vraiment à jouer mieux', 'text', 'Pourquoi ATFR - titre'),
  ('why_join_text', 'La home doit montrer en quelques secondes que le clan est actif, organisé et utile aux joueurs qui veulent progresser.', 'longtext', 'Pourquoi ATFR - description'),
  ('why_join_1_title', 'Ambiance vocale', 'text', 'Pourquoi ATFR 1 - titre'),
  ('why_join_1_stat', 'Discord actif', 'text', 'Pourquoi ATFR 1 - badge'),
  ('why_join_1_text', 'Un Discord vivant pour lancer des pelotons, organiser les soirées et garder le contact hors bataille.', 'longtext', 'Pourquoi ATFR 1 - texte'),
  ('why_join_2_title', 'Progression utile', 'text', 'Pourquoi ATFR 2 - titre'),
  ('why_join_2_stat', 'Coaching clan', 'text', 'Pourquoi ATFR 2 - badge'),
  ('why_join_2_text', 'Des retours concrets, des modules d''académie et des outils pour travailler décision, map awareness et placement.', 'longtext', 'Pourquoi ATFR 2 - texte'),
  ('why_join_3_title', 'Jeu structuré', 'text', 'Pourquoi ATFR 3 - titre'),
  ('why_join_3_stat', 'Objectifs partagés', 'text', 'Pourquoi ATFR 3 - badge'),
  ('why_join_3_text', 'Escarmouches, événements et objectifs communs avec une organisation claire sans perdre le plaisir de jouer.', 'longtext', 'Pourquoi ATFR 3 - texte'),
  ('why_join_4_title', 'Culture performance', 'text', 'Pourquoi ATFR 4 - titre'),
  ('why_join_4_stat', 'Stats lisibles', 'text', 'Pourquoi ATFR 4 - badge'),
  ('why_join_4_text', 'Des stats suivies, des replays discutés et une envie simple : progresser ensemble sans casser l''ambiance.', 'longtext', 'Pourquoi ATFR 4 - texte'),
  ('why_join_path_eyebrow', 'Parcours joueur', 'text', 'Parcours joueur - surtitre'),
  ('why_join_path_title', 'De la candidature au vocal, le chemin est plus clair.', 'text', 'Parcours joueur - titre'),
  ('why_join_path_1_title', 'Postuler avec les infos utiles', 'text', 'Parcours 1 - titre'),
  ('why_join_path_1_text', 'Le formulaire donne une base propre aux officiers.', 'longtext', 'Parcours 1 - texte'),
  ('why_join_path_2_title', 'Passer en vocal et jouer quelques games', 'text', 'Parcours 2 - titre'),
  ('why_join_path_2_text', 'La vraie compatibilité se voit vite en jeu.', 'longtext', 'Parcours 2 - texte'),
  ('why_join_path_3_title', 'Trouver sa place dans les activités du clan', 'text', 'Parcours 3 - titre'),
  ('why_join_path_3_text', 'Le site devient le hub qui garde tout lisible.', 'longtext', 'Parcours 3 - texte'),
  ('why_join_cta', 'Postuler', 'text', 'Pourquoi ATFR - bouton'),

  ('next_operation_eyebrow', 'Agenda clan', 'text', 'Prochaine opération - surtitre'),
  ('next_operation_title', 'Prochaine opération', 'text', 'Prochaine opération - titre'),
  ('next_operation_text', 'Une home plus vivante montre immédiatement ce qui arrive : entraînement, tournoi, soirée clan ou rendez-vous vocal.', 'longtext', 'Prochaine opération - description'),
  ('next_operation_empty_title', 'Aucun événement public planifié', 'text', 'Prochaine opération - titre vide'),
  ('next_operation_empty_text', 'Ajoute le prochain entraînement ou tournoi depuis l''admin pour le faire apparaître ici automatiquement.', 'longtext', 'Prochaine opération - texte vide'),
  ('next_operation_queue_title', 'File d''attente', 'text', 'Prochaine opération - titre liste'),
  ('next_operation_queue_empty', 'Aucun autre événement public à venir. Le prochain ajout admin remontera automatiquement ici.', 'longtext', 'Prochaine opération - liste vide'),
  ('next_operation_default_location', 'Discord / World of Tanks', 'text', 'Prochaine opération - lieu par défaut'),
  ('next_operation_cta', 'Agenda', 'text', 'Prochaine opération - bouton'),
  ('next_operation_empty_cta', 'Voir l''agenda', 'text', 'Prochaine opération - bouton vide'),
  ('next_operation_date_label', 'Date', 'text', 'Prochaine opération - label date'),
  ('next_operation_time_label', 'Horaire', 'text', 'Prochaine opération - label horaire'),
  ('next_operation_location_label', 'Lieu', 'text', 'Prochaine opération - label lieu'),

  ('academy_preview_eyebrow', 'Académie ATFR', 'text', 'Académie home - surtitre'),
  ('academy_preview_title', 'Des outils qui rendent le site vivant', 'text', 'Académie home - titre'),
  ('academy_preview_text', 'La page principale peut aussi orienter les joueurs vers les modules, les défis et les contenus utiles du clan.', 'longtext', 'Académie home - description'),
  ('academy_preview_card_title', 'Un hub qui donne envie de revenir.', 'text', 'Académie home - carte titre'),
  ('academy_preview_card_text', 'Les modules transforment le site en espace communautaire : on joue, on apprend, on compare les scores et on garde une trace des défis.', 'longtext', 'Académie home - carte texte'),
  ('academy_preview_cta', 'Voir les modules', 'text', 'Académie home - bouton principal'),
  ('academy_preview_module_cta', 'Lancer', 'text', 'Académie home - bouton module')
on conflict (key) do update
set kind = excluded.kind,
    label = excluded.label;
