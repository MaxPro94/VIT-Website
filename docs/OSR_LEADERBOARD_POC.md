# POC — classement public Old School Rivals

Relevé du 25 novembre 2026. Lecture anonyme des pages publiques, sans compte et sans contournement.

## Source

- Joueurs : `https://oldschoolrivals.com/?p=ranking&tab=players&sort=fame&gear=all&nation=all`
- Brigades : `https://oldschoolrivals.com/?p=ranking&tab=brig&sort=total&gear=all&nation=all`
- `https://oldschoolrivals.com/robots.txt` renvoie le HTML de l'accueil, pas un fichier robots. Il n'y a donc pas de règle robots à lire.
- Le client public (`/assets/app.js`) charge le classement en HTML. Aucune API JSON de roster n'est exposée. `api/search.php` ne cherche que dans les guides du wiki.
- Aucun identifiant stable de personnage n'est présent dans le HTML. L'identité retenue est le pseudo exact.

## Pagination

Le lien public « Load 50 more » augmente le paramètre `limit` de 50. Sans `limit`, la page contient 50 lignes. `limit=100` en contient 100 et propose `limit=150`. `limit=250` et `limit=500` contiennent 250 lignes, sans lien pour aller plus loin. Le dernier rang observé est 250, Fame 637.

`page` et `offset` n'ont pas été utilisés : ils ne figurent pas dans les liens du site.

## Effectif VIT

Ligne officielle de brigade, même relevé : rang 10, VatallusInfusedTemplars, BCU, chef Kirbozz, niveau moyen 100, **39 membres**, Fame totale 33 922, Fame mensuelle 1 672.

Personnages dont la cellule brigade est exactement `VatallusInfusedTemplars` dans ces 250 lignes : **15**.

I-Gear : Roxama, BlackLight, Kirbozz, YeXiu, Erakis, Nocifer, Shurickk.  
B-Gear : gost, Hybris, ExotiK_B0mb3r, TreibeB, Z4X.  
A-Gear : Sylla, BloodSoul.  
M-Gear : _Sinek_ValeSi_.

15 n'est pas égal à 39. Les 24 autres membres ne sont pas dans le classement public lu jusqu'au bout. Leur absence n'est pas interprétée comme un départ. Le pseudo du lieutenant dans ce classement est `YeXiu` ; la page des responsables affiche `Yexiu`. Les deux graphies ne sont pas fusionnées.

## Win, Lose, Monthly

Les trois colonnes sont des entiers, y compris zéro. Le guide public « Monthly titles » décrit des titres de fin de mois (PK, monstres, expérience, boss, temps de jeu, arène). Il ne définit pas les colonnes Win, Lose et Monthly du classement. Aucun taux de victoire n'est calculé. Les libellés de la source sont conservés.

## Collecte élargie — 25 novembre 2026, 16h37–17h10 heure serveur

Le premier relevé ne lisait que le tableau Fame, tous Gears, toutes nations, `limit=250` : 15 personnages. Les pages publiques liées depuis ce tableau ont été lues ensuite, une requête à la fois, sans compte.

| Lecture | Lignes | Personnages VIT | Nouveaux |
| --- | --- | --- | --- |
| Fame, tous Gears, toutes nations | 250, sans page suivante | 15 | 15 |
| Niveau | page d'erreur publique : « Ranking data is temporarily unavailable » | 0 | 0 |
| Monthly, tous Gears | 250 | 15 | 6 |
| Win, tous Gears | 250 | 16 | 1 |
| Lose, tous Gears | 250 | 20 | 3 |
| Fame par Gear, toutes nations | A 226, B/I/M 250 | 6 / 8 / 11 / 8 | 8 au total |
| Fame par Gear, BCU | A 114, B 200, I 137, M 148, tous sous 250 | 6 / 8 / 11 / 8 | 0 |
| Fame par Gear, Monthly, Win et Lose | mêmes personnages | — | 0 |
| Fame, toutes nations ANI | 250 | 0 | 0 |
| Hall of Fame `/?p=hof` | pas de tableau de joueurs | 0 | 0 |

Union dédupliquée par pseudo exact : **33**. Le compteur officiel reste **39**. Les six absents ne figurent dans aucun de ces tableaux, y compris les listes BCU par Gear qui s'arrêtent avant 250 lignes. Aucun lien de profil ou de roster n'est présent sur les lignes. `api/search.php` reste le moteur du wiki. Aucune API publique de roster n'a été trouvée.

La synchronisation quotidienne lit désormais 12 tableaux : Fame, Monthly, Win et Lose toutes nations, puis Fame pour chaque Gear en BCU et en ANI. Le filtre de nation sert à lire plus profondément un tableau public. Il n'exclut aucun personnage de l'autre nation. Le tri par niveau est ignoré tant que la page publique renvoie l'erreur de base. Un tableau indisponible ne remplace pas le dernier relevé valide.

Les 33 pseudos : Alpha, Apash, Azmog, BlackLight, BloodSoul, DarkFlyer, Erakis, ExotiK_B0mb3r, gost, Hybris, Kirbozz, Leclerc, LittleShoot, MeowMeow, NightFox, Nocifer, OmegaForce, Roxama, Sanko, Saturn, Shurickk, Slimak, SupportErakis, Sylla, Taddy, TreibeA, TreibeB, Vengel, V_S0, xRaftorDx, YeXiu, Z4X, _Sinek_ValeSi_.

YeXiu et Yexiu ne sont pas fusionnés. SupportErakis, TreibeA et TreibeB restent des personnages distincts.

## Décision

33 n'est pas 39. La page indique « 33 personnages référencés sur 39 membres annoncés par OSR ». Le podium est calculé parmi ces 33. Les chiffres de brigade de l'accueil viennent toujours de la ligne officielle, pas de la somme des personnages.

La passe V1.5.2 n'a pas trouvé de source publique supplémentaire. Les listes par Gear déjà lues s'arrêtent avant 250 lignes pour la nation actuelle et ne contiennent pas les six membres restants. Le tri par niveau était indisponible. Aucun roster public n'est apparu.

Win est le total de duels gagnés, confirmé par la brigade. Ce n'est pas un taux. Lose et Monthly ne sont pas définis par une source OSR : aucun ratio Win/Lose n'est calculé. Duel Master est la plus forte hausse de Win sur le mois civil, parmi les personnages référencés. Avec un seul relevé, il reste non décerné. Ace of the Month est provisoire, sur la colonne Monthly. Rising Star demande aussi un second relevé dans le même mois civil. Les variations 24 h et 7 j n'apparaissent qu'avec un relevé de la veille ou d'il y a sept jours, et seulement si la couverture est comparable pour le rang.

## Collecte

`pnpm osr:sync` lit les 12 tableaux publics décrits ci-dessus, puis la ligne de brigade, et écrit `data/osr`, hors de `public/` et hors de git. Une exécution le même jour métier (Europe/Paris) ne crée pas un second fichier. `pnpm osr:sync:dry` n'écrit rien. Aucun cron n'est lancé par le site. Exemple de planification, à activer seulement sur le serveur de production :

```text
0 0 * * * cd /chemin/vit-website && /usr/bin/pnpm osr:sync
```

Fuseau : Europe/Paris.
