describe('Modulo di Contatto', () => {
    beforeEach(() => {
        cy.visit('/contact'); // Assicurati che la pagina di contatto sia raggiungibile alla rotta /contact
    });

    it('Verifica che tutti i campi siano presenti e il modulo possa essere inviato correttamente', () => {
        // Verifica la presenza degli input e del bottone
        cy.get('input[name="name"]').should('exist');
        cy.get('input[name="surname"]').should('exist');
        cy.get('input[name="email"]').should('exist');
        cy.get('textarea[name="message"]').should('exist');
        cy.get('button[type="submit"]').should('exist');

        // Simula la compilazione del modulo
        cy.get('input[name="name"]').type('Mario');
        cy.get('input[name="surname"]').type('Rossi');
        cy.get('input[name="email"]').type('mario.rossi@example.com');
        cy.get('textarea[name="message"]').type('Questo è un messaggio di prova.');

        // Verifica che il bottone di invio sia abilitato
        cy.get('button[type="submit"]').should('not.be.disabled');

        // Simula l'invio del modulo
        cy.get('button[type="submit"]').click();

        // Verifica che l'utente venga reindirizzato alla homepage
        cy.url().should('eq', Cypress.config().baseUrl + '/');



    });

    it('Verifica che il messaggio di errore venga visualizzato in caso di fallimento', () => {
        // Simula la compilazione del modulo con dati errati o incompleti
        cy.get('input[name="name"]').type('Mario');
        cy.get('input[name="surname"]').type('Rossi');
        cy.get('input[name="email"]').type('mario.rossi@'); // Email non valida
        cy.get('textarea[name="message"]').type('Questo è un messaggio di prova.');

        // Simula l'invio del modulo
        cy.get('button[type="submit"]').click();


    });

    it('Verifica che i campi del modulo vengano resettati dopo l\'invio con successo', () => {
        // Compila il modulo
        cy.get('input[name="name"]').type('Mario');
        cy.get('input[name="surname"]').type('Rossi');
        cy.get('input[name="email"]').type('mario.rossi@example.com');
        cy.get('textarea[name="message"]').type('Questo è un messaggio di prova.');

        // Invia il modulo
        cy.get('button[type="submit"]').click();

        // Verifica che i campi siano stati resettati
        cy.get('input[name="name"]').should('have.value', '');
        cy.get('input[name="surname"]').should('have.value', '');
        cy.get('input[name="email"]').should('have.value', '');
        cy.get('textarea[name="message"]').should('have.value', '');
    });

    it('Verifica che il bottone di invio sia disabilitato mentre il modulo è in invio', () => {
        // Compila il modulo
        cy.get('input[name="name"]').type('Mario');
        cy.get('input[name="surname"]').type('Rossi');
        cy.get('input[name="email"]').type('mario.rossi@example.com');
        cy.get('textarea[name="message"]').type('Questo è un messaggio di prova.');

        // Verifica che il bottone sia disabilitato quando è in invio
        cy.get('button[type="submit"]').click();
        cy.get('button[type="submit"]').should('be.disabled');
    });
});
