1. Mettre à jour le comportement de la feature: "add activity".

    - Si "CREATED" ou "SALE" ajouté dans activité, mettre à jour le stock pour ce produit pour refléter exactement le stock

2. Base de donée: Les autres référentiels (matières premières, fournisseurs) ne sont pas encore représentés
   La base doit prévoir ce futur module :

-   materials
-   suppliers
-   purchases
-   material_stock_movements

3. Dark mode.
4. Avoir un endroit ou il y a une liste de to-do
5. list de choses à acheter
6. Taches du jours
7. Taches en attentes
8. Commandes en attentes
9. Nouvelles créations en attente
10. A recevoir (commandes), à envoyer (ventes)
11. Rajouter un status à l'activité ajouté vendue (envoyé, en attente de création...)

comments:

-   **Location**: `src/core/usecases/activity.ts:209-211,465-467`
-   **Issue**: Documentation mentions edge cases where rollback might fail, leaving data inconsistent.
-   **Recommendation**: As documented in the code comments, consider implementing a background job to detect and fix inconsistencies by comparing activities with product stock levels. This is a future enhancement, not a blocker.
