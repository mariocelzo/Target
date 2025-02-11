describe('Edit Ad Page', () => {
    beforeEach(() => {

        cy.visit('/edit/JSBAxjnATKim00ZaWpPd');
    });

    it('should load the ad data correctly and allow updating', () => {
        // Verifica che la pagina di caricamento iniziale sia visibile
        cy.get('div').contains('Caricamento...').should('be.visible');




        // Modifica i dati
        cy.get('input[name="name"]').clear().type('Nuovo Titolo');
        cy.get('textarea[name="description"]').clear().type('Nuova descrizione del prodotto');
        cy.get('input[name="price"]').clear().type('150');
        cy.get('input[name="category"]').clear().type('Moda');

        // Verifica che i campi siano stati aggiornati
        cy.get('input[name="title"]').should('have.value', 'Nuovo Titolo');
        cy.get('textarea[name="description"]').should('have.value', 'Nuova descrizione del prodotto');
        cy.get('input[name="price"]').should('have.value', '150');
        cy.get('input[name="category"]').should('have.value', 'Moda');

        // Invia il modulo
        cy.get('a').contains("Aggiorna Annuncio").click();

        // Verifica che l'utente venga reindirizzato alla pagina successiva
        cy.url().should('include', '/');
    });

    it('should show an error if required fields are missing', () => {
        // Prova a inviare il modulo senza completare i campi
        cy.get('a').contains('Aggiorna Annuncio').click();

        // Verifica che l'utente veda un messaggio di errore
        cy.get('div').contains('Tutti i campi sono obbligatori').should('be.visible');
    });



});
