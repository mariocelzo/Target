describe('Sell Page', () => {
    beforeEach(() => {
        cy.visit('/sell');
    });

    it('pubblica un nuovo articolo con dati validi', () => {
        // Compila i campi per pubblicare un nuovo articolo
        cy.get('input#name').type('Smartphone');
        cy.get('textarea#description').type('Uno smartphone usato in ottime condizioni');
        cy.get('input#price').type('150');
        cy.get('select#category').select('Elettronica');
        cy.get('select#condition').select('Usato');

        // Simula l'upload di un'immagine
        cy.get('input[type="file"]').selectFile('cypress/fixtures/Screenshot 2024-11-28 alle 18.31.03.png', { force: true });

        // Clicca sul pulsante per vendere l'oggetto
        cy.get('button[type="submit"]').click();
        // Controlla la presenza del popup di conferma
        cy.get('div.popup-confirmation', { timeout: 10000 }).should('be.visible');
        cy.contains('Oggetto inserito con successo!').should('be.visible');

        // Chiudi il popup, se applicabile
        cy.get('button').contains('OK').click();
        cy.get('div.popup-confirmation').should('not.exist');

        // Verifica che la pagina venga reindirizzata alla home o alla pagina successiva
        cy.url().should('include', '/');


    });
});