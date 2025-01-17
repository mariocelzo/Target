describe('OrderPage', () => {
    beforeEach(() => {
        // Simula l'autenticazione dell'utente


        // Vai alla pagina del prodotto
        cy.visit('/order/Aroz39uqhpga0BQ85C22');
    });



    it('should fill the form and submit the order', () => {
        // Compila il modulo con dati fittizi
        cy.get('input[name="fullName"]').type('Mario Rossi');
        cy.get('input[name="address"]').type('Via Roma 1, Milano');
        cy.get('input[name="phone"]').type('+39 123 456 7890');
        cy.get('input[name="cardNumber"]').type('1234 5678 9012 3456');
        cy.get('input[name="expiryDate"]').type('12/25');
        cy.get('input[name="cvv"]').type('123');

        // Verifica che il pulsante di invio sia visibile
        cy.get('button[type="submit"]').should('be.visible');

        // Clicca sul pulsante di invio
        cy.get('button[type="submit"]').click();

        // Verifica che la pagina di successo sia stata raggiunta
        cy.url().should('include', '/ordereffettuati');
    });


});
