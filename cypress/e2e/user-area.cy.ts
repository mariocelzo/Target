describe('Area Utente', () => {
    beforeEach(() => {
        cy.visit('/user-area'); // Assicurati che questa sia la rotta corretta
    });

    it('Visualizza i dati personali correttamente', () => {
        // Verifica la presenza dei dati personali
        cy.contains('Nome Completo').should('exist');
        cy.contains('Data di Nascita').should('exist');
        cy.contains('Numero di Telefono').should('exist');
    });

    it('Visualizza i dati dell\'indirizzo correttamente', () => {
        // Verifica la presenza dell'indirizzo

        cy.contains('Indirizzo').click()
        cy.contains('Indirizzo', { timeout: 10000 }).should('exist');
        cy.contains('Città').should('exist');
        cy.contains('CAP').should('exist');
    });

    it('Permette la modifica dei dati personali', () => {
        cy.contains('Modifica').click();

        // Modifica i campi
        cy.get('#fullName').clear().type('Luca Bianchi');
        cy.get('#dateOfBirth').clear().type('1990-01-01');
        cy.get('#phoneNumber').clear().type('1234567890');

        // Simula la pressione di Invio per salvare i dati
        cy.get('#phoneNumber').type('{enter}'); // Premere Invio dopo aver modificato un campo

        // Verifica il salvataggio
        cy.contains('Dati Aggiornati!').should('exist');
        cy.contains('Luca Bianchi').should('exist');
    });

    it('Permette la modifica dell\'indirizzo', () => {
        cy.contains('Indirizzo').click()
        cy.contains('Modifica').click()
        // Modifica i campi con i dati reali
        cy.get('#address').clear().type('682 Miller Extension');
        cy.get('#city').clear().type('Broderickburgh');
        cy.get('#zipCode').clear().type('41400');

        // Simula la pressione di Invio per salvare i dati
        cy.get('#zipCode').type('{enter}'); // Premere Invio dopo aver modificato un campo

        // Verifica il salvataggio
        cy.contains('Dati Aggiornati!').should('exist');
        cy.contains('682 Miller Extension').should('exist');
        cy.contains('Broderickburgh').should('exist');
        cy.contains('41400').should('exist');
    });




});
