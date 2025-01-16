describe('Login Page', () => {
    beforeEach(() => {
        // Visita la pagina di login prima di ogni test
        cy.visit('/login');
    });

    it('visualizza il Header, il form di login e il Footer', () => {
        // Verifica che l'header sia visibile
        cy.get('header').should('be.visible');

        // Verifica che il form di login sia presente e contenga input per email e password
        cy.get('form').within(() => {
            cy.get('input[type="email"]').should('be.visible');
            cy.get('input[type="password"]').should('be.visible');
            cy.get('button[type="submit"]').should('be.visible');
        });

        // Verifica che il footer sia visibile
        cy.get('footer').should('be.visible');
    });

    it('permette di navigare alla pagina di registrazione', () => {
        // Clicca sul link "Registrati"
        cy.contains('Registrati').click();

        // Verifica che l'URL contenga il percorso atteso, ad esempio '/register'
        cy.url().should('include', '/register');
    });

    it('mostra un errore con credenziali errate', () => {
        // Inserisce email e password errate
        cy.get('input[type="email"]').type('wrong@example.com');
        cy.get('input[type="password"]').type('wrongpassword');

        // Clicca sul pulsante di invio
        cy.get('button[type="submit"]').click();

        // Verifica che venga visualizzato un messaggio di errore
        // Modifica il testo atteso in base al messaggio reale della tua applicazione
        cy.contains('Credenziali non valide').should('be.visible');
    });

    it('effettua il login con credenziali corrette e redirige', () => {
        // Inserisce email e password corrette
        cy.get('input[type="email"]').type('target@gmail.com');
        cy.get('input[type="password"]').type('y]u5i:^$#QEATW7');

        // Clicca sul pulsante di invio
        cy.get('button[type="submit"]').click();

        // Verifica che l'URL cambi, ad esempio alla dashboard o altra pagina protetta
        // Modifica il percorso in base alla tua applicazione
        cy.url().should('include', '/');
    });
    it('mostra e interagisce con il pulsante di login con Google', () => {
        // Verifica che il pulsante "Accedi con Google" sia visibile
        cy.contains('Accedi con Google').should('be.visible');

        // Clicca sul pulsante e verifica che avvenga un reindirizzamento o l'apertura di una nuova finestra
        cy.contains('Accedi con Google').click();

    });
});