document.addEventListener('DOMContentLoaded', () => {
            
const userCards = document.querySelectorAll('.users-column .card');

userCards.forEach(card => {
    card.addEventListener('click', function() {
        userCards.forEach(c => c.classList.remove('selected'));
        this.classList.add('selected');
    });
});

const roleCards = document.querySelectorAll('.role-card');

roleCards.forEach(roleCard => {
    roleCard.addEventListener('click', function() {
        roleCards.forEach(c => c.classList.remove('selected'));
        this.classList.add('selected');
    });
});
});