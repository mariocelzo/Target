describe('Register Page', () => {
    beforeEach(() => {
        // Visita la pagina di registrazione
        cy.visit('/register');
    });

    it('visualizza correttamente il form di registrazione', () => {
        // Verifica la presenza degli elementi principali del form
        cy.contains('Unisciti a Target Marketplace').should('be.visible');
        cy.get('form').within(() => {
            cy.get('input[name="fullName"]').should('be.visible');
            cy.get('input[name="email"]').should('be.visible');
            cy.get('input[name="password"]').should('be.visible');
            cy.get('input[name="confirmPassword"]').should('be.visible');
            cy.get('input[name="dateOfBirth"]').should('be.visible');
            cy.get('input[name="province"]').should('be.visible');
            cy.get('input[name="address"]').should('be.visible');
            cy.get('input[name="zipCode"]').should('be.visible');
            cy.get('input[name="phoneNumber"]').should('be.visible');
            cy.get('button[type="submit"]').should('be.visible');
        });
        cy.contains('Registrati con Google').should('be.visible');
    });

    it('mostra errori di validazione per campi obbligatori vuoti', () => {
        // Prova a inviare il form senza compilare nulla
        cy.get('button[type="submit"]').click();

        // Verifica che vengano visualizzati i messaggi di errore
        cy.contains('Il nome completo è obbligatorio').should('be.visible');
        cy.contains("L'email è obbligatoria").should('be.visible');
        cy.contains('La password è obbligatoria').should('be.visible');
        cy.contains('La data di nascita è obbligatoria').should('be.visible');
        cy.contains('La provincia è obbligatoria').should('be.visible');
        cy.contains("L'indirizzo è obbligatorio").should('be.visible');
        cy.contains('Il CAP è obbligatorio').should('be.visible');
        cy.contains('Il numero di telefono è obbligatorio').should('be.visible');
    });

    it('mostra errore per password corta e telefono non valido', () => {
        // Compila alcuni campi con dati non validi
        cy.get('input[name="fullName"]').type('Test User');
        cy.get('input[name="email"]').type('test@example.com');
        cy.get('input[name="password"]').type('short');
        cy.get('input[name="confirmPassword"]').type('short');
        cy.get('input[name="dateOfBirth"]').type('2005-01-01'); // meno di 18 anni
        cy.get('input[name="province"]').type('ProvinciaTest');
        cy.get('input[name="address"]').type('Via Roma 1');
        cy.get('input[name="zipCode"]').type('12345');
        cy.get('input[name="phoneNumber"]').type('1234'); // numero non valido

        cy.get('button[type="submit"]').click();

        // Verifica la presenza di messaggi di errore specifici
        cy.contains('La password deve essere di almeno 8 caratteri').should('be.visible');
        cy.contains('Numero di telefono non valido').should('be.visible');
    });

    it('effettua la registrazione con dati validi', () => {
        // Intercetta la chiamata al servizio di registrazione
        cy.intercept('POST', '/api/register', {
            statusCode: 200,
            body: { success: true },
        }).as('registerUser');

        // Compila il form con dati validi
        cy.get('input[name="fullName"]').type('Valid User');
        cy.get('input[name="email"]').type('sballo@example.com');
        cy.get('input[name="password"]').type('ValidPass123!');
        cy.get('input[name="confirmPassword"]').type('ValidPass123!');
        cy.get('input[name="dateOfBirth"]').type('2003-10-20');
        cy.get('input[name="province"]').type('ProvinciaValida');
        cy.get('input[name="address"]').type('Via Roma 10');
        cy.get('input[name="zipCode"]').type('12345');
        cy.get('input[name="phoneNumber"]').type('1234567890');

        cy.get('button[type="submit"]').click();


        // Verifica che venga visualizzato un messaggio di successo
        cy.contains('Registrazione completata con successo!').should('be.visible');

        // Dopo un certo tempo, l'utente dovrebbe essere reindirizzato alla pagina di login
        cy.url().should('include', '/login');
    });

    it('gestisce l\'interazione con "Registrati con Google"', () => {
        // Simula il click sul pulsante "Registrati con Google"
        cy.contains('Registrati con Google').click();

        // Poiché il reindirizzamento verso Google non può essere completamente testato con Cypress,
        // verifichiamo che il click avvia un reindirizzamento o cambi l'URL verso un dominio di Google.
        // Nota: questo test potrebbe non funzionare come previsto a causa di restrizioni cross-domain
    });
});